// --- Status Point Logic ---
// Assumes Character has: status: {str, agi, vit, dex, int, luk}, and statusPoint: number

export function canIncreaseStatus(character: Character, key: keyof Character['status']): boolean {
  return character.statusPoint > 0;
}

export function canDecreaseStatus(character: Character, key: keyof Character['status']): boolean {
  // Prevent stat < 1
  return character.status[key] > 1;
}

export function increaseStatus(character: Character, key: keyof Character['status']): boolean {
  if (character.statusPoint > 0) {
    character.status[key]++;
    character.statusPoint--;
    return true;
  }
  return false;
}

export function decreaseStatus(character: Character, key: keyof Character['status']): boolean {
  if (character.status[key] > 1) {
    character.status[key]--;
    character.statusPoint++;
    return true;
  }
  return false;
}
// --- Skill Logic ---
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

// Reduce cooldown by agi per turn
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
  // Example: base 10% + (defender agi - attacker dex) * 0.5%, min 0%, max 90%
  let base = 10 + (defender.status.agi - attacker.status.dex) * 0.5;
  return Math.max(0, Math.min(90, base));
}

// Try to evade
export function tryEvade(defender: BattleFighter, attacker: BattleFighter): boolean {
  return Math.random() * 100 < calcEvasionChance(defender, attacker);
}

export function calcPhysicalDamage(attacker: Character, defender: Character): number {
  let base = attacker.status.str * 2 + attacker.status.dex + Math.floor(attacker.status.int * 0.2)
  const critChance = Math.min(50, Math.floor((attacker.status.dex + attacker.status.luk) / 2))
  if (Math.random() * 100 < critChance) {
    base = Math.floor(base * 1.5)
  }
  base -= Math.floor(defender.status.vit * 0.7)
  base -= Math.floor(defender.status.str * 0.3)
  if (base < 1) base = 1
  return base
}

export function calcMagicDamage(attacker: Character, defender: Character): number {
  let base = attacker.status.int * 2 + Math.floor(attacker.status.str * 0.2)
  base -= Math.floor(defender.status.int * 0.7)
  if (base < 1) base = 1
  return base
}

export function calcReward(character: Character): number {
  let reward = 100 + character.winStreak * 10
  reward += Math.floor(character.status.luk * 2)
  return reward
}

export function calcHealCost(character: Character): number {
  return Math.max(50, 100 - character.status.luk * 2)
}

export function startFight(
  character: Character | null,
  setEnemy: (enemy: Character) => void,
  setScene: (scene: string) => void,
  randomCharacter: (statusTotal: number, baseStatus?: any) => Character,
  scenes: any
) {
  console.log('startFight', character)
  console.log('character status', character?.hp, character?.winStreak)
  const total = 20 + (character?.winStreak ?? 0) * 2
  const newEnemy = randomCharacter(total)
  setEnemy({ ...newEnemy, hp: newEnemy.maxHp })
  setScene(scenes.FIGHT)
}
