import type { Character } from './useGameStore'
import {
  BattleFighter,
  toBattleFighter,
  reduceCooldown,
  canAttack,
  resetCooldown,
  tryEvade,
  calcDamage
} from './battleUtils'

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
      let dmgTypeText = '';
      if (dmgResult.type === 'phy') dmgTypeText = 'กายภาพ';
      else if (dmgResult.type === 'magic') dmgTypeText = 'เวทย์มนต์';
      else if (dmgResult.type === 'mix') dmgTypeText = 'เวทย์ผสาน';
      battleLog.unshift(`คุณโจมตี ${enemy.name} ${dmgTypeText} ${dmgResult.value} dmg (HP เหลือ ${enemy.hp < 0 ? 0 : enemy.hp})`);
    } else {
      battleLog.unshift(`คุณโจมตี ${enemy.name} แต่ ${enemy.name} หลบได้!`);
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
      let dmgTypeText = '';
      if (dmgResult.type === 'phy') dmgTypeText = 'dmg';
      else if (dmgResult.type === 'magic') dmgTypeText = 'magic';
      else if (dmgResult.type === 'mix') dmgTypeText = 'mix';
      battleLog.unshift(`${enemy.name} โจมตีคุณ ${dmgResult.value} ${dmgTypeText} (HP เหลือ ${character.hp < 0 ? 0 : character.hp})`);
    } else {
      battleLog.unshift(`${enemy.name} โจมตีคุณ แต่คุณหลบได้!`);
    }
    resetCooldown(enemy as BattleFighter);
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
export function getLogClass (log: string): string {
  if (log.startsWith('คุณโจมตี') && log.includes('หลบได้')) return 'log-player log-evade';
  if (log.startsWith('คุณโจมตี')) return 'log-player';
  if (log.startsWith('คุณแพ้')) return 'log-lose';
  if (log.startsWith('---')) return 'log-end';
  if (log.startsWith('ศัตรู') || log.startsWith('Enemy') || log.startsWith('AI') || log.startsWith('โจมตีคุณ') || log.startsWith('คุณหลบได้')) return 'log-enemy';
  if (log.includes('โจมตีคุณ')) return 'log-enemy';
  if (log.includes('แพ้!')) return 'log-lose';
  return '';
}