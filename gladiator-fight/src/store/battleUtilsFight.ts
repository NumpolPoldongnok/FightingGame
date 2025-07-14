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