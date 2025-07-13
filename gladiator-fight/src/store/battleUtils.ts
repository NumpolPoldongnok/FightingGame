import { MAX_STATUS } from './statusUtils'
// Calculate best damage type based on int comparison
// Returns: { type: 'phy' | 'magic' | 'mix', value: number }
export function calcDamage(attacker: Character, defender: Character): { type: 'phy' | 'magic' | 'mix', value: number } {
  const phy = calcPhysicalDamage(attacker, defender);
  const magic = calcMagicDamage(attacker, defender);
  const intA = attacker.status.int;
  const intD = defender.status.int;
  if (intA > intD) {
    if (intA >= intD * 1.5 && intA >= 50) {
      // int มากกว่า 50% ขึ้นไป รวม damage ทั้งสอง
      return { type: 'mix', value: phy + magic };
    } else {
      // int มากกว่า enemy ใช้ damage ที่มากกว่า
      if (magic >= phy) {
        return { type: 'magic', value: magic };
      } else {
        return { type: 'phy', value: phy };
      }
    }
  } else {
    // int ไม่มากกว่า enemy ใช้ physical
    return { type: 'phy', value: phy };
  }
}
import type { Character } from './useGameStore'

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
  // Chance: luk * 0.5% per turn to instantly set cooldown to 0
  const lukChance = fighter.status.luk * 0.5;
  if (Math.random() * 100 < lukChance) {
    fighter.cooldown = 0;
    return;
  }
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
  // Base 10% + (defender agi - attacker dex) * 0.5% + defender luk * 0.5%, min 0%, max 90%
  let base = 10 + (defender.status.agi - attacker.status.dex) * 0.5 + defender.status.luk * 0.5;
  return Math.max(0, Math.min(90, base));
}

// Try to evade
export function tryEvade(defender: BattleFighter, attacker: BattleFighter): boolean {
  return Math.random() * 100 < calcEvasionChance(defender, attacker);
}

export function calcPhysicalDamage(attacker: Character, defender: Character): number {
  let base = attacker.status.str * 2 + attacker.status.dex + Math.floor(attacker.status.int * 0.2)
  const critChance = Math.min(50, Math.floor((attacker.status.dex + attacker.status.luk) / 2))
  // Critical damage multiplier: 1.5 + (dex * 0.1)
  let critMultiplier = 1.5 + attacker.status.dex * 0.1;
  if (Math.random() * 100 < critChance) {
    base = Math.floor(base * critMultiplier);
  }
  base -= Math.floor(defender.status.vit * 0.7)
  base -= Math.floor(defender.status.str * 0.3)
  // Minimum base damage is 1 + (dex * 0.1)
  const minBase = 1 + attacker.status.dex * 0.1;
  if (base < minBase) base = minBase;
  return Math.ceil(base)
}

export function calcMagicDamage(attacker: Character, defender: Character): number {
  let base = attacker.status.int * 2 + Math.floor(attacker.status.str * 0.2)
  base -= Math.floor(defender.status.int * 0.7)
  if (base < 1) base = 1
  return Math.ceil(base)
}

export function calcReward(character: Character): number {
  let reward = 100 + character.winStreak * 10
  reward += Math.floor(character.status.luk * 2)
  return reward
}

export function calcHealCost(character: Character): number {
  // ลดได้สูงสุด 99% แบบสุ่มตาม luk
  const base = 100;
  const maxDiscount = 0.99; // 99%
  // โอกาสลด: luk/MAX_STATUS (ถ้า luk=MAX_STATUS มีโอกาส 99.9%)
  const luckRoll = Math.random();
  const luckChance = Math.min(character.status.luk, MAX_STATUS) / 1000;
  let discount = 0;
  if (luckRoll < luckChance) {
    // ได้ลดแบบสุ่ม 0-99%
    discount = Math.random() * maxDiscount;
  } else {
    // ลดปกติ luk*2
    discount = Math.min(character.status.luk * 2 / base, maxDiscount);
  }
  const cost = Math.round(base * (1 - discount));
  return Math.max(1, cost);
}

export function startFight(
  character: Character,
  setEnemy: (enemy: Character) => void,
  setScene: (scene: string) => void,
  randomCharacter: (statusTotal: number, baseStatus?: any) => Character,
  scenes: any
) {
  console.log('startFight', character)
  console.log('character status', character.hp, character.winStreak)
  const total = 20 + (character.winStreak ?? 0) * 10
  const newEnemy = randomCharacter(total)
  setEnemy({ ...newEnemy, hp: newEnemy.maxHp })
  setScene(scenes.FIGHT)
}
