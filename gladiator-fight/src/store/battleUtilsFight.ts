import type { Character } from './useGameStore'
import { useGameStore } from './useGameStore'
import {
  BattleFighter,
  toBattleFighter,
  reduceCooldown,
  canAttack,
  resetCooldown,
  tryEvade,
  calcPhysicalDamage,
  calcMagicDamage
} from './battleUtils'

export function doBattleTurn(
  character: Character,
  enemy: Character,
  battleLog: string[],
  onFinish: (win: boolean) => void,
  intervalRef: { value: any }
) {
  // Convert to BattleFighter with cooldown if not already
  // @ts-ignore
  if (character.cooldown === undefined) Object.assign(character, toBattleFighter(character));
  // @ts-ignore
  if (enemy.cooldown === undefined) Object.assign(enemy, toBattleFighter(enemy));

  if (character.hp <= 0) {
    onFinish(false);
    return;
  }
  if (enemy.hp <= 0) {
    onFinish(true);
    return;
  }

  // Reduce cooldowns
  reduceCooldown(character as BattleFighter);
  reduceCooldown(enemy as BattleFighter);

  // Player's turn
  if (canAttack(character as BattleFighter)) {
    if (!tryEvade(enemy as BattleFighter, character as BattleFighter)) {
      let dmg: number;
      let isMagic = false;
      if (character.status.int > character.status.str) {
        dmg = calcMagicDamage(character, enemy);
        isMagic = true;
      } else {
        dmg = calcPhysicalDamage(character, enemy);
      }
      enemy.hp -= dmg;
      battleLog.unshift(`คุณโจมตี ${enemy.name} ${dmg} ${isMagic ? 'magic' : 'dmg'} (HP เหลือ ${enemy.hp < 0 ? 0 : enemy.hp})`);
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
      // Update character HP in gameStore (keep current hp)
      const gameStore = useGameStore();
      if (gameStore.character && typeof character.hp === 'number') {
        gameStore.character.hp = character.hp;
      }
      onFinish(true);
    }, 200);
    return;
  }

  // Enemy's turn
  if (canAttack(enemy as BattleFighter)) {
    if (!tryEvade(character as BattleFighter, enemy as BattleFighter)) {
      let dmg: number;
      let isMagic = false;
      if (enemy.status.int > enemy.status.str) {
        dmg = calcMagicDamage(enemy, character);
        isMagic = true;
      } else {
        dmg = calcPhysicalDamage(enemy, character);
      }
      character.hp -= dmg;
      battleLog.unshift(`${enemy.name} โจมตีคุณ ${dmg} ${isMagic ? 'magic' : 'dmg'} (HP เหลือ ${character.hp < 0 ? 0 : character.hp})`);
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
      onFinish(false);
    }, 200);
  }
}
