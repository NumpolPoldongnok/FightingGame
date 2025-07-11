// --- Skill Logic ---
import type { Status } from './useGameStore'

export function randomSkillChoices(): string[][] {
  return [
    [`เพิ่ม status แบบสุ่ม 10`, 'random10'],
    [`เพิ่ม status ใดๆ 10`, 'choose10'],
    [`คูณ status ทั้งหมด x${(Math.random()*0.9+1.1).toFixed(2)}`, 'multiply'],
    [`เพิ่ม Max HP 10%`, 'maxhp10']
  ]
}

export function applySkill(idx: number, character: Character, skillChoices: string[][], characterHistory: Character[], showSkillSelectSetter?: (v: boolean) => void) {
  const skill = skillChoices[idx][1]
  if (skill === 'random10') {
    for (let i = 0; i < 10; i++) {
      const k = Object.keys(character.status) as (keyof Status)[]
      const key = k[Math.floor(Math.random() * k.length)]
      character.status[key]++
    }
  } else if (skill === 'choose10') {
    character.status.str += 10
  } else if (skill === 'multiply') {
    const mul = parseFloat(skillChoices[idx][0].split('x')[1])
    Object.keys(character.status).forEach(k => {
      character.status[k as keyof Status] = Math.floor(character.status[k as keyof Status] * mul)
    })
  } else if (skill === 'maxhp10') {
    const add = Math.floor(character.maxHp * 0.1)
    character.maxHp += add
    character.hp += add
    if (character.hp > character.maxHp) character.hp = character.maxHp
  }
  character.skill.push(skillChoices[idx][0])
  const idxHistory = characterHistory.findIndex(c => c.name === character.name && c.skill.join(',') === character.skill.join(','))
  if (idxHistory !== -1) {
    characterHistory[idxHistory] = { ...character }
  } else {
    characterHistory.push({ ...character })
  }
  if (showSkillSelectSetter) showSkillSelectSetter(false)
}
import type { Character } from './useGameStore'

export function calcPhysicalDamage(attacker: Character, defender: Character): number {
  let base = attacker.status.str * 2 + attacker.status.dex + Math.floor(attacker.status.int * 0.2)
  const critChance = Math.min(50, Math.floor((attacker.status.dex + attacker.status.luk) / 2))
  if (Math.random() * 100 < critChance) {
    base = Math.floor(base * 1.5)
  }
  base -= Math.floor(defender.status.vit * 0.7)
  if (base < 1) base = 1
  return base
}

export function calcEvasion(defender: Character): number {
  return Math.min(40, defender.status.agi * 0.7)
}

export function calcMagicDamage(attacker: Character, defender: Character): number {
  let base = attacker.status.int * 2 + Math.floor(attacker.status.str * 0.2)
  base -= Math.floor(defender.status.int * 0.7)
  if (base < 1) base = 1
  return base
}

export function calcReward(character: Character): number {
  let reward = 100 + character.winStreak * 10
  reward += Math.floor(character.status.cha * 2)
  return reward
}

export function calcHealCost(character: Character): number {
  return Math.max(50, 100 - character.status.cha * 2)
}

export function startFight(
  character: Character | null,
  deadCharacters: Character[],
  characterHistory: Character[],
  setEnemy: (enemy: Character) => void,
  setScene: (scene: string) => void,
  randomCharacter: (statusTotal: number, baseStatus?: any) => Character,
  scenes: any
) {
    console.log('startFight', character, deadCharacters, characterHistory)
  if (!character || character.hp <= 0) return
  const found = characterHistory.find(
    (c) => c.hp <= 0 && c.skill && c.skill.length && c.skill[c.skill.length - 1].includes(`win: ${character.winStreak ?? 0}`)
  )
  if (deadCharacters.length > 0) {
    const dead = deadCharacters.find((c) => c.hp <= 0 && c.skill && c.skill.length && c.skill[c.skill.length - 1].includes(`win: ${character.winStreak ?? 0}`))
    if (dead) {
      setEnemy({ ...dead, hp: dead.maxHp })
      setScene(scenes.FIGHT)
      return
    }
  }
  const total = 20 + (character.winStreak ?? 0) * 10
  const newEnemy = randomCharacter(total)
  setEnemy({ ...newEnemy, hp: newEnemy.maxHp })
  setScene(scenes.FIGHT)
}
