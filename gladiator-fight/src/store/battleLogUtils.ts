// Helper to classify log type for styling (must be defined as const for template usage)

import { Character } from "src/types/game";
import { AttackType } from "./battleUtils";

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

// สร้างข้อความ log การต่อสู้ ใช้ร่วมกันทั้ง player และ enemy
export interface BattleLogParams {
  attacker: Character;
  defender: Character;
  value?: number;
  crit?: boolean;
  isPlayer: boolean;
  isEvade: boolean;
  attackerType: AttackType;
  defenderType: AttackType;
}

export function createBattleLogText(params: BattleLogParams): string {
  const { attacker, defender, value, crit, isPlayer, isEvade, attackerType, defenderType } = params;
  // แปลงประเภทการโจมตี/ป้องกันเป็นข้อความ
  const typeText = (t?: AttackType) => {
    if (t === 'phy') return 'กายภาพ';
    if (t === 'magic') return 'เวทย์';
    if (t === 'mix') return 'ผสาน';
    return '';
  };
  const critText = crit ? ' (Critical!)' : '';
  if (isEvade) {
    if (isPlayer) {
      return `คุณโจมตี (${typeText(attackerType)}) แต่ ${defender.name} หลบได้!`;
    } else {
      return `${attacker.name} โจมตี (${typeText(attackerType)}) คุณหลบได้ ๕๕๕`;
    }
  } else {
    // value = net damage, type = attack type
    // 1. คุณโจมตี(attack type) x dmg (enemy) รับด้วย (defend type) สุทธิ z dmg
    // 2. (enemy)โจมตี(attack type) x dmg คุณรับด้วย (defend type) สุทธิ z dmg
    // 3. หากเกิด critical แสดงผลด้วย
    if (isPlayer) {
      if (attackerType === defenderType)
        return `You attack (${typeText(attackerType)}) ${defender.name} defends perfectly, only ${value} dmg${critText}`;
      else
        return `You attack (${typeText(attackerType)}) ${defender.name} defends with (${typeText(defenderType)}), deals ${value} dmg${critText}`;
    } else {
      if (attackerType === defenderType)
        return `${attacker.name} attacks (${typeText(attackerType)}) you defend perfectly, only ${value} dmg${critText}`;
      return `${attacker.name} attacks (${typeText(attackerType)}) you defend with (${typeText(defenderType)}), deals ${value} dmg${critText}`;
    }
  }
}