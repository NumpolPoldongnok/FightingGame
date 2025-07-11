// --- Skill Logic ---
import type { Status } from './useGameStore'
export function randomSkillChoices(luk: number = 0): string[][] {
  // Helper for random int in range, luck increases chance to get max
  function randIntLuck(min: number, max: number, luk: number) {
    // luck 0 = uniform, luck 9999 = always max
    if (Math.random() < Math.min(luk, 9999) / 9999) return max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // Helper for random percent (1-5), luck increases chance to get 5
  function randPercentLuck(luk: number) {
    if (Math.random() < Math.min(luk, 9999) / 9999) return '5.00';
    return (Math.random() * 4 + 1).toFixed(2);
  }
  const statusTypes = ['str', 'agi', 'vit', 'dex', 'int', 'luk', 'cha'];
  const choices: string[][] = [];
  // 1. เพิ่ม status แบบสุ่ม 1-10
  choices.push([
    `เพิ่ม status แบบสุ่ม ${randIntLuck(1, 10, luk)}`,
    'randomN'
  ]);
  // 2. เพิ่ม status [status type] 1-10 (สุ่ม type)
  const typeIdx = randIntLuck(0, statusTypes.length - 1, luk);
  choices.push([
    `เพิ่ม status ${statusTypes[typeIdx]} ${randIntLuck(1, 10, luk)}`,
    `addTypeN:${statusTypes[typeIdx]}`
  ]);
  // 3. เพิ่ม status แบบสุ่ม % 1-5%
  choices.push([
    `เพิ่ม status แบบสุ่ม ${randPercentLuck(luk)}%`,
    'randomPercent'
  ]);
  // 4. เพิ่ม status [status type] % 1-5% (สุ่ม type)
  const typeIdx2 = randIntLuck(0, statusTypes.length - 1, luk);
  choices.push([
    `เพิ่ม status ${statusTypes[typeIdx2]} ${randPercentLuck(luk)}%`,
    `addTypePercent:${statusTypes[typeIdx2]}`
  ]);
  // 5. เพิ่ม max hp 1-10%
  choices.push([
    `เพิ่ม Max HP ${randIntLuck(1, 10, luk)}%`,
    'maxhpPercent'
  ]);
  // จำนวน choices 3-5 ขึ้นอยู่กับ luck
  let minChoices = 3;
  let maxChoices = 5;
  let numChoices = minChoices + Math.floor((Math.min(luk, 9999) / 9999) * (maxChoices - minChoices + 1));
  numChoices = Math.max(minChoices, Math.min(maxChoices, numChoices));
  // Shuffle and pick numChoices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices.slice(0, numChoices);
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
