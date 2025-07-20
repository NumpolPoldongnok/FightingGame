import type { Character } from '../types/game'
import { applySkills } from './skillUtils';
import { MAX_STATUS } from './statusUtils';

// --- Cooldown-based Battle Logic ---
export type BattleFighter = Character & { cooldown: number };

// Initialize a fighter with cooldown
// This will be set by setBattleMaxCooldown before battle starts
export let BATTLE_MAX_COOLDOWN = 100;

export function doBattleTurn(
  character: BattleFighter,
  enemy: BattleFighter,
  battleLog: string[],
  onFinish: (character: BattleFighter) => void,
  intervalRef: { value: any }
) {
  // Convert to BattleFighter with cooldown if not already
  // @ts-ignore
  if (character.cooldown === undefined) Object.assign(character, toBattleFighter(character));
  // @ts-ignore
  if (enemy.cooldown === undefined) Object.assign(enemy, toBattleFighter(enemy));

  if (character.hp <= 0) {
    onFinish(character);
    return;
  }
  if (enemy.hp <= 0) {
    onFinish(character);
    return;
  }

  // Reduce cooldowns
  reduceCooldown(character, enemy);
  reduceCooldown(enemy, character);

  // Player's turn
  if (canAttack(character)) {
    if (!tryEvade(enemy, character)) {
      const dmgResult = calcDamage(character, enemy);
      enemy.hp -= dmgResult.value;
      battleLog.unshift(
        createBattleLog({
          attacker: character,
          defender: enemy,
          value: dmgResult.value,
          type: dmgResult.type,
          crit: dmgResult.crit,
          isPlayer: true,
          isEvade: false
        })
      );
    } else {
      battleLog.unshift(
        createBattleLog({
          attacker: character,
          defender: enemy,
          isPlayer: true,
          isEvade: true
        })
      );
    }
    resetCooldown(character);
  }

  if (enemy.hp <= 0) {
    battleLog.unshift(`${enemy.name} แพ้!`);
    clearInterval(intervalRef.value);
    setTimeout(() => {
      battleLog.unshift('--- จบการต่อสู้ ---');
      onFinish(character);
    }, 200);
    return;
  }

  // Enemy's turn
  if (canAttack(enemy)) {
    if (!tryEvade(character, enemy)) {
      const dmgResult = calcDamage(enemy, character);
      character.hp -= dmgResult.value;
      battleLog.unshift(
        createBattleLog({
          attacker: enemy,
          defender: character,
          value: dmgResult.value,
          type: dmgResult.type,
          crit: dmgResult.crit,
          isPlayer: false,
          isEvade: false
        })
      );
    } else {
      battleLog.unshift(
        createBattleLog({
          attacker: enemy,
          defender: character,
          isPlayer: false,
          isEvade: true
        })
      );
    }
    resetCooldown(enemy);
  }
  // สร้างข้อความ log การต่อสู้ ใช้ร่วมกันทั้ง player และ enemy
  interface BattleLogParams {
    attacker: Character;
    defender: Character;
    value?: number;
    type?: string;
    crit?: boolean;
    isPlayer: boolean;
    isEvade: boolean;
  }

  function createBattleLog(params: BattleLogParams): string {
    const { attacker, defender, value, type, crit, isPlayer, isEvade } = params;
    if (isEvade) {
      if (isPlayer) {
        return `คุณโจมตี ${defender.name} แต่ ${defender.name} หลบได้!`;
      } else {
        return `${attacker.name} โจมตีคุณ แต่คุณหลบได้!`;
      }
    } else {
      let dmgTypeText = '';
      if (type === 'phy') dmgTypeText = 'กายภาพ';
      else if (type === 'magic') dmgTypeText = 'เวทย์มนต์';
      else if (type === 'mix') dmgTypeText = 'เวทย์ผสาน';
      const critText = crit ? ' (คริติคอล!)' : '';
      if (isPlayer) {
        return `คุณโจมตี ${defender.name} ${dmgTypeText} ${value} dmg${critText} (HP เหลือ ${defender.hp < 0 ? 0 : defender.hp})`;
      } else {
        return `${attacker.name} โจมตีคุณ ${dmgTypeText} ${value} dmg${critText} (HP เหลือ ${defender.hp < 0 ? 0 : defender.hp})`;
      }
    }
  }

  if (character.hp <= 0) {
    battleLog.unshift(`คุณแพ้!`);
    clearInterval(intervalRef.value);
    setTimeout(() => {
      battleLog.unshift('--- จบการต่อสู้ ---');
      onFinish(character);
    }, 200);
  }
}

// Helper to classify log type for styling (must be defined as const for template usage)
// Helper to classify log type for styling (must be top-level const in <script setup> for template access)
export function getLogClass(log: string): string {
  if (log.startsWith('คุณโจมตี') && log.includes('หลบได้')) return 'log-player log-evade';
  if (log.startsWith('คุณโจมตี')) return 'log-player';
  if (log.startsWith('คุณแพ้')) return 'log-lose';
  if (log.startsWith('---')) return 'log-end';
  if (log.startsWith('ศัตรู') || log.startsWith('Enemy') || log.startsWith('AI') || log.startsWith('โจมตีคุณ') || log.startsWith('คุณหลบได้')) return 'log-enemy';
  if (log.includes('โจมตีคุณ')) return 'log-enemy';
  if (log.includes('แพ้!')) return 'log-lose';
  return '';
}

// Calculate best damage type based on int comparison
// Returns: { type: 'phy' | 'magic' | 'mix', value: number }
export function calcDamage(attacker: Character, defender: Character): { type: 'phy' | 'magic' | 'mix', value: number, crit: boolean } {
  const phy = calcPhysicalDamage(attacker, defender);
  const magic = calcMagicDamage(attacker, defender);
  const intA = attacker.status.int;
  const intD = defender.status.int;
  if (magic >= phy) {
    if (intA >= intD * 1.2 && intA >= 50) {
      // int มากกว่า 20% ขึ้นไป และมากกว่า 50 รวม damage ทั้งสอง
      return { type: 'mix', value: phy.value + magic.value, crit: phy.crit || magic.crit };
    } else {
      return { type: 'magic', value: magic.value, crit: magic.crit };
    }
  } else {
    // phy มากกว่า magic
    return { type: 'phy', value: phy.value, crit: phy.crit };
  }
}

export function toBattleFighter(character: Character): BattleFighter {
  const buffedCharacter = applySkills(character); // Ensure skills are applied before converting
  return { ...buffedCharacter, cooldown: 0 };
}

// Reduce cooldown by agi ratio: (agi / (agi + opponentAgi)) * 20, min 1, max 20
export function reduceCooldown(fighter: BattleFighter, opponent: BattleFighter) {
  const agi = Math.max(0, fighter.status.agi);
  const oppAgi = Math.max(0, opponent.status.agi);
  let ratio = agi + oppAgi > 0 ? agi / (agi + oppAgi) : 0.5;
  let reduce = Math.round(ratio * 20);
  reduce = Math.max(1, Math.min(20, reduce));
  fighter.cooldown += reduce;
  if (fighter.cooldown < 0) fighter.cooldown = 0;
  if (fighter.cooldown > BATTLE_MAX_COOLDOWN) fighter.cooldown = BATTLE_MAX_COOLDOWN;
  console.log(`reduceCooldown: ${fighter.name} cooldown increased by ${reduce}, now ${fighter.cooldown}`);
}

// Check if fighter can attack
export function canAttack(fighter: BattleFighter): boolean {
  return fighter.cooldown >= BATTLE_MAX_COOLDOWN;
}

// Reset cooldown after attack
export function resetCooldown(fighter: BattleFighter) {
  fighter.cooldown = 0;
}

// Calculate evasion: agi of defender vs dex of attacker
export function calcEvasionChance(defender: BattleFighter, attacker: BattleFighter): number {
  let base = 1 + (defender.status.agi - attacker.status.dex) * 0.3 + (defender.status.luk - attacker.status.luk) * 0.7;
  //console.log('calcEvasionChance ', defender.name, attacker.name, base);
  return Math.max(0, Math.min(99, base));
}

// Try to evade
export function tryEvade(defender: BattleFighter, attacker: BattleFighter): boolean {
  return Math.random() * 100 < calcEvasionChance(defender, attacker);
}

// Calculate critical chance based on attacker and defender stats (luk is main factor)
export function calcCritChance(attacker: Character, defender: Character, type: 'phy' | 'magic' = 'phy'): number {
  var baseLuk = (attacker.status.luk - defender.status.luk) * 0.8
  if (type === 'phy') {
    const base = baseLuk + (attacker.status.dex - defender.status.agi) * 0.2;
    return Math.min(90, Math.max(0, base));
  } else {
    const base = baseLuk + (attacker.status.int - defender.status.int) * 0.2;
    return Math.min(90, Math.max(0, base));
  }
}

export function calcPhysicalDamage(attacker: Character, defender: Character): { value: number, crit: boolean } {
  let base = attacker.status.str * 2 + attacker.status.dex + Math.floor(attacker.status.int * 0.2)
  const critChance = calcCritChance(attacker, defender, 'phy');
  // Critical damage multiplier: 1.1 + (dex * 0.1)
  let critMultiplier = 1.1 + attacker.status.dex * 0.1;
  let isCrit = false;
  if (Math.random() * 100 < critChance) {
    base = Math.floor(base * critMultiplier);
    isCrit = true;
  }
  base -= Math.floor(defender.status.vit * 0.7)
  base -= Math.floor(defender.status.str * 0.3)
  // Minimum base damage is 1 + (dex * 0.1)
  const minBase = 1 + attacker.status.dex * 0.1;
  if (base < minBase) base = minBase;
  return { value: Math.ceil(base), crit: isCrit };
}

export function calcMagicDamage(attacker: Character, defender: Character): { value: number, crit: boolean } {
  let base = attacker.status.int * 2 + Math.floor(attacker.status.str * 0.2)
  const critChance = calcCritChance(attacker, defender, 'magic');
  let critMultiplier = 1.5 + attacker.status.int * 0.05;
  let isCrit = false;
  if (Math.random() * 100 < critChance) {
    base = Math.floor(base * critMultiplier);
    isCrit = true;
  }
  base -= Math.floor(defender.status.int * 0.7)
  if (base < 1) base = 1
  return { value: Math.ceil(base), crit: isCrit };
}

export function calcReward(character: Character): number {
  let reward = 100 + character.winStreak * 10
  reward += Math.floor(character.status.luk * 2)
  return reward
}

export function calcHealCost(character: Character, percent: number): number {
  // luk ใกล้ MAX_STATUS ยิ่งลดราคาใกล้ 99%
  let base = 500;
  if (percent === 100) {
    base = Math.floor(base * 0.8); // 20% discount for full heal
  }
  base = base * percent / 100; // Adjust base cost by percent
  const result = base - Math.floor((character.status.luk / MAX_STATUS) * base);
  return Math.max(1, result);
}

export function getEnemy(
  character: Character,
  characterHistory: Character[],
  randomCharacter: (points: number) => Character
): Character {
  let newEnemy: Character | undefined;
  if (characterHistory.length > 0) {
    // shuffle array ก่อนหา match
    const shuffled = [...characterHistory];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const match = shuffled.find(c => c.winStreak === character.winStreak);
    if (match) {
      newEnemy = { ...match, name: match.name + ' (Rival)', hp: match.maxHp };
    }
  }
  if (!newEnemy) {
    const power = character.winStreak * character.winStreak
    const easy = character.winStreak * 10
    const total = 20 + Math.max(easy, power);

    console.log('total power for enemy:', total);
    newEnemy = randomCharacter(total);
  }
  return newEnemy
}