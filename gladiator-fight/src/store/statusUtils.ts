export const MAX_STATUS = 999;
import type { Character, Status } from './useGameStore'

export function canIncreaseStatus(character: Character, key: keyof Status): boolean {
  return character.statusPoint > 0 && character.status[key] < MAX_STATUS;
}

export function canDecreaseStatus(character: Character, key: keyof Status): boolean {
  // Prevent stat < 1
  return character.status[key] > 1;
}

export function increaseStatus(character: Character, key: keyof Status): boolean {
  if (character.statusPoint > 0 && character.status[key] < MAX_STATUS) {
    character.status[key]++;
    character.statusPoint--;
    console.log(`Increased ${key} to ${character.status[key]}`);
    if (key === 'vit') {
      character.maxHp += 10;
      character.hp += 10;
    }
    return true;
  }
  return false;
}

export function decreaseStatus(character: Character, key: keyof Status): boolean {
  if (character.status[key] > 1) {
    character.status[key]--;
    character.statusPoint++;
    if (key === 'vit') {
      character.maxHp = Math.max(1, character.maxHp - 10);
      character.hp = Math.min(character.hp, character.maxHp);
    }
    return true;
  }
  return false;
}
