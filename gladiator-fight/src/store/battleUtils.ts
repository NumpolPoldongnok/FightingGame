import type { Character } from '../types/game'

export function doBattleTurn(
  character: Character,
  enemy: Character,
  battleLog: string[],
  onFinish: (character: Character) => void,
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
  reduceCooldown(character as BattleFighter);
  reduceCooldown(enemy as BattleFighter);

  // Player's turn
  if (canAttack(character as BattleFighter)) {
    if (!tryEvade(enemy as BattleFighter, character as BattleFighter)) {
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
    resetCooldown(character as BattleFighter);
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
  if (canAttack(enemy as BattleFighter)) {
    if (!tryEvade(character as BattleFighter, enemy as BattleFighter)) {
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
    resetCooldown(enemy as BattleFighter);
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
  if (intA > intD) {
    if (intA >= intD * 1.5 && intA >= 50) {
      // int มากกว่า 50% ขึ้นไป รวม damage ทั้งสอง
      return { type: 'mix', value: phy.value + magic.value, crit: phy.crit || magic.crit };
    } else {
      // int มากกว่า enemy ใช้ damage ที่มากกว่า
      if (magic.value >= phy.value) {
        return { type: 'magic', value: magic.value, crit: magic.crit };
      } else {
        return { type: 'phy', value: phy.value, crit: phy.crit };
      }
    }
  } else {
    // int ไม่มากกว่า enemy ใช้ physical
    return { type: 'phy', value: phy.value, crit: phy.crit };
  }
}

// --- Cooldown-based Battle Logic ---
export type BattleFighter = Character & { cooldown: number };

// Initialize a fighter with cooldown
// This will be set by setBattleMaxCooldown before battle starts
let BATTLE_MAX_COOLDOWN = 100;

export function setBattleMaxCooldown(charAgi: number, enemyAgi: number): number {
  BATTLE_MAX_COOLDOWN = Math.max(1, (charAgi + enemyAgi) * 2);
  return BATTLE_MAX_COOLDOWN;
}

export function toBattleFighter(character: Character): BattleFighter {
  return { ...character, cooldown: BATTLE_MAX_COOLDOWN };
}

// Reduce cooldown by agi per turn, with luk chance to instantly reset cooldown to 0
export function reduceCooldown(fighter: BattleFighter) {
  fighter.cooldown -= fighter.status.agi;
  if (fighter.cooldown < 0) fighter.cooldown = 0;
}

// Check if fighter can attack
export function canAttack(fighter: BattleFighter): boolean {
  return fighter.cooldown <= 0;
}

// Reset cooldown after attack
export function resetCooldown(fighter: BattleFighter) {
  fighter.cooldown = BATTLE_MAX_COOLDOWN;
}

// Calculate evasion: agi of defender vs dex of attacker
export function calcEvasionChance(defender: BattleFighter, attacker: BattleFighter): number {
  let base = 10 + (defender.status.agi - attacker.status.dex) * 0.3 + (defender.status.luk - attacker.status.luk) * 0.7;
  console.log('calcEvasionChance ', defender.name, attacker.name, base);
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

export function calcHealCost(character: Character): number {
  // luk ใกล้ MAX_STATUS ยิ่งลดราคาใกล้ 99%
  const base = 100;
  const result = base - Math.floor((character.status.luk / 99) * base)
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