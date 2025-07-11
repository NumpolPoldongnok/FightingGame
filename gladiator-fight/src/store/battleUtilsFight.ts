import type { Character } from './useGameStore'

export function doBattleTurn(
  character: Character,
  enemy: Character,
  battleLog: string[],
  onFinish: (win: boolean) => void,
  setShowFinishButton: (show: boolean) => void,
  intervalRef: { value: any }
) {
  if (character.hp <= 0 || enemy.hp <= 0) return
  // โจมตีอิง STR AGI (logic เดิม)
  const playerAttack = Math.floor(Math.random() * character.status.str) + character.status.agi
  const enemyAttack = Math.floor(Math.random() * enemy.status.str) + enemy.status.agi
  enemy.hp -= playerAttack
  battleLog.unshift(`คุณโจมตี ${enemy.name} ${playerAttack} dmg (HP เหลือ ${enemy.hp < 0 ? 0 : enemy.hp})`)
  if (enemy.hp <= 0) {
    battleLog.unshift(`${enemy.name} แพ้!`)
    clearInterval(intervalRef.value)
    setTimeout(() => {
      battleLog.unshift('--- จบการต่อสู้ ---')
      setShowFinishButton(true)
      onFinish(true)
    }, 200)
    return
  }
  character.hp -= enemyAttack
  battleLog.unshift(`${enemy.name} โจมตีคุณ ${enemyAttack} dmg (HP เหลือ ${character.hp < 0 ? 0 : character.hp})`)
  if (character.hp <= 0) {
    battleLog.unshift(`คุณแพ้!`)
    clearInterval(intervalRef.value)
    setTimeout(() => {
      battleLog.unshift('--- จบการต่อสู้ ---')
      setShowFinishButton(true)
      onFinish(false)
    }, 200)
  }
}
