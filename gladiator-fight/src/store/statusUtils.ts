import type { Character } from '../types/game'
import type { Status } from '../types/game'

/**
 * Generate a random Status object with the specified stat type being the highest.
 * @param points - Total points to distribute (minimum 6)
 * @param type - The key of the stat that should be the highest
 * @returns Status object (caller must set maxHp and hp using vit)
 * Note: If you use this for character creation, set maxHp = 100 + status.vit * HP_PER_VIT
 */
export function randomCharacterStatus(points: number, type: keyof Status): Status {
  // Start with all stats at 1
  const keys: (keyof Status)[] = ['str', 'agi', 'vit', 'dex', 'int', 'luk'];
  const stats = { str: 1, agi: 1, vit: 1, dex: 1, int: 1, luk: 1 };
  let remaining = points - 6;
  // Distribute points randomly
  while (remaining > 0) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    stats[key]++;
    remaining--;
  }
  // Find the stat with the highest value
  let maxKey: keyof Status = type;
  for (const k of keys) {
    if (stats[k] > stats[maxKey]) maxKey = k;
  }
  // If the specified type is not already the highest, swap values
  if (maxKey !== type) {
    const temp = stats[type];
    stats[type] = stats[maxKey];
    stats[maxKey] = temp;
  }
  // The caller must set maxHp = 100 + stats.vit * HP_PER_VIT
  return stats;
}

// --- Constants ---
/** ค่าพลังสถานะสูงสุดที่ตัวละครสามารถมีได้ */
export const MAX_STATUS = 999;

/** จำนวน HP สูงสุดที่ได้รับต่อค่า VIT 1 หน่วย */
export const HP_PER_VIT = 10;


// --- Helper Functions ---

/**
 * ตรวจสอบว่าสามารถเพิ่มค่าสถานะได้หรือไม่
 * @param character - อ็อบเจกต์ตัวละคร
 * @param key - ชื่อของค่าสถานะที่ต้องการตรวจสอบ (เช่น 'str', 'vit')
 * @returns `true` ถ้าสามารถเพิ่มได้, มิฉะนั้น `false`
 */
export function canIncreaseStatus(character: Character, key: keyof Status): boolean {
  return character.statusPoint > 0 && character.status[key] < MAX_STATUS;
}

/**
 * ตรวจสอบว่าสามารถลดค่าสถานะได้หรือไม่
 * @param character - อ็อบเจกต์ตัวละคร
 * @param key - ชื่อของค่าสถานะที่ต้องการตรวจสอบ (เช่น 'str', 'vit')
 * @returns `true` ถ้าสามารถลดได้, มิฉะนั้น `false`
 */
export function canDecreaseStatus(character: Character, key: keyof Status): boolean {
  // ป้องกันไม่ให้ค่าสถานะต่ำกว่า 1
  return character.status[key] > 1;
}


// --- Core Mutating Functions ---
// Design Note: These functions directly mutate the character object,
// which is the intended pattern for this state management (e.g., with Pinia).

/**
 * เพิ่มค่าสถานะที่ระบุ 1 หน่วย และลด Status Point ลง 1
 * @param character - อ็อบเจกต์ตัวละคร (จะถูกเปลี่ยนแปลงโดยตรง)
 * @param key - ชื่อของค่าสถานะที่ต้องการเพิ่ม
 * @returns `true` ถ้าเพิ่มสำเร็จ, มิฉะนั้น `false`
 */
export function increaseStatus(character: Character, key: keyof Status): boolean {
  if (!canIncreaseStatus(character, key)) {
    return false;
  }

  character.status[key]++;
  character.statusPoint--;

  // Special case for VIT affecting HP
  if (key === 'vit') {
    character.maxHp += HP_PER_VIT;
    character.hp += HP_PER_VIT;
  }
  
  return true;
}

/**
 * ลดค่าสถานะที่ระบุ 1 หน่วย และเพิ่ม Status Point ขึ้น 1
 * @param character - อ็อบเจกต์ตัวละคร (จะถูกเปลี่ยนแปลงโดยตรง)
 * @param key - ชื่อของค่าสถานะที่ต้องการลด
 * @returns `true` ถ้าลดสำเร็จ, มิฉะนั้น `false`
 */
export function decreaseStatus(character: Character, key: keyof Status): boolean {
  if (!canDecreaseStatus(character, key)) {
    return false;
  }

  character.status[key]--;
  character.statusPoint++;

  // Special case for VIT affecting HP
  if (key === 'vit') {
    character.maxHp = Math.max(1, character.maxHp - HP_PER_VIT);
    // Clamp current HP to the new max HP
    character.hp = Math.min(character.hp, character.maxHp);
  }

  return true;
}


// --- Bulk Operation Functions (Optimized) ---

/**
 * (Optimized) ใส่ Status Point ที่มีทั้งหมดลงในค่าสถานะเดียวจนกว่าจะเต็ม
 * @param character - อ็อบเจกต์ตัวละคร (จะถูกเปลี่ยนแปลงโดยตรง)
 * @param key - ชื่อของค่าสถานะที่ต้องการเพิ่ม
 */
export function putAllPointsToStatus(character: Character, key: keyof Status): void {
  const pointsAvailable = character.statusPoint;
  if (pointsAvailable <= 0) {
    return; // ไม่มีแต้มให้อัป
  }

  const roomForPoints = MAX_STATUS - character.status[key];
  const pointsToAdd = Math.min(pointsAvailable, roomForPoints);

  if (pointsToAdd <= 0) {
    return; // สถานะเต็มแล้ว
  }
  
  character.status[key] += pointsToAdd;
  character.statusPoint -= pointsToAdd;

  // Special case for VIT affecting HP
  if (key === 'vit') {
    const hpGained = pointsToAdd * HP_PER_VIT;
    character.maxHp += hpGained;
    character.hp += hpGained;
  }
}

/**
 * (Optimized) รีเซ็ตค่าสถานะเดียวให้เหลือ 1 และคืน Status Point ทั้งหมดกลับมา
 * @param character - อ็อบเจกต์ตัวละคร (จะถูกเปลี่ยนแปลงโดยตรง)
 * @param key - ชื่อของค่าสถานะที่ต้องการรีเซ็ต
 */
export function resetStatusKeyToOne(character: Character, key: keyof Status): void {
  const currentStatusValue = character.status[key];
  if (currentStatusValue <= 1) {
    return; // ไม่สามารถลดได้อีก
  }

  const pointsToReturn = currentStatusValue - 1;

  character.status[key] = 1;
  character.statusPoint += pointsToReturn;

  // Special case for VIT affecting HP
  if (key === 'vit') {
    const hpLost = pointsToReturn * HP_PER_VIT;
    character.maxHp = Math.max(1, character.maxHp - hpLost);
    // Clamp current HP to the new max HP
    character.hp = Math.min(character.hp, character.maxHp);
  }
}