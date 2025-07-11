import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'

export type Status = {
  str: number
  agi: number
  vit: number
  dex: number
  int: number
  luk: number
  cha: number
}

export type Character = {
  name: string
  hp: number
  maxHp: number
  money: number
  status: Status
  skill: string[]
}

export type CharacterHistory = Character & { winCount: number }

const STORAGE_KEY = 'gladiator-save-v1';

export const useGameStore = defineStore('game', () => {
  // State
  const scenes = {
    PREPARE: 'prepare',
    FIGHT: 'fight',
    RESULT: 'result',
  }
  const character = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const winStreak = ref(0)
  const currentScene = ref(scenes.PREPARE)
  const deadCharacters = ref<Character[]>([])
  const skillChoices = ref<string[][]>([])
  const showSkillSelect = ref(false)
  const showResultButton = ref(false)
  const lastBattleWin = ref(false)
  const lastMoneyEarned = ref(0)
  const characterHistory = ref<CharacterHistory[]>([])
  let statusTotal = 30

  // LocalStorage
  function saveToLocal() {
    const data = {
      character: character.value,
      enemy: enemy.value,
      winStreak: winStreak.value,
      currentScene: currentScene.value,
      deadCharacters: deadCharacters.value,
      skillChoices: skillChoices.value,
      showSkillSelect: showSkillSelect.value,
      showResultButton: showResultButton.value,
      lastBattleWin: lastBattleWin.value,
      lastMoneyEarned: lastMoneyEarned.value,
      characterHistory: characterHistory.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
  function loadFromLocal() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.character) character.value = data.character
      if (data.enemy) enemy.value = data.enemy
      if (typeof data.winStreak === 'number') winStreak.value = data.winStreak
      if (typeof data.currentScene === 'string') currentScene.value = data.currentScene
      if (Array.isArray(data.deadCharacters)) deadCharacters.value = data.deadCharacters
      if (Array.isArray(data.skillChoices)) skillChoices.value = data.skillChoices
      if (typeof data.showSkillSelect === 'boolean') showSkillSelect.value = data.showSkillSelect
      if (typeof data.showResultButton === 'boolean') showResultButton.value = data.showResultButton
      if (typeof data.lastBattleWin === 'boolean') lastBattleWin.value = data.lastBattleWin
      if (typeof data.lastMoneyEarned === 'number') lastMoneyEarned.value = data.lastMoneyEarned
      if (Array.isArray(data.characterHistory)) characterHistory.value = data.characterHistory
    } catch (e) { /* ignore */ }
  }

  // Logic
  function randomStatus(total: number, base: Status = {str:1,agi:1,vit:1,dex:1,int:1,luk:1,cha:1}): Status {
    let remain = total - 7
    const keys = Object.keys(base) as (keyof Status)[]
    const status: Status = { ...base }
    while (remain > 0) {
      const k = keys[Math.floor(Math.random() * keys.length)]
      status[k]++
      remain--
    }
    return status
  }
  function randomCharacter(statusTotal = 30, baseStatus?: Status): Character {
    const names = ['Maximus', 'Spartacus', 'Crixus', 'Commodus', 'Tigris']
    const status = randomStatus(statusTotal, baseStatus)
    const maxHp = Math.floor(Math.random() * statusTotal) + 100
    return {
      name: names[Math.floor(Math.random() * names.length)],
      hp: maxHp,
      maxHp,
      money: 0,
      status,
      skill: [],
    }
  }
  function startNewGame() {
    let base: Status | undefined = undefined
    if (character.value) {
      characterHistory.value.push({ ...character.value, winCount: winStreak.value })
      base = { ...character.value.status }
      Object.keys(base).forEach(k => {
        base![k as keyof Status] = Math.floor(base![k as keyof Status] * 0.1)
      })
      statusTotal++
    } else {
      statusTotal = 30
    }
    character.value = randomCharacter(statusTotal, base)
    winStreak.value = 0
    deadCharacters.value = []
    currentScene.value = scenes.PREPARE
  }
  function startFight() {
    if (!character.value || character.value.hp <= 0) return
    const found = characterHistory.value.find(
      (c) => c.hp <= 0 && c.skill && c.skill.length && c.skill[c.skill.length - 1].includes(`win: ${winStreak.value}`)
    )
    if (deadCharacters.value.length > 0) {
      const dead = deadCharacters.value.find((c) => c.hp <= 0 && c.skill && c.skill.length && c.skill[c.skill.length - 1].includes(`win: ${winStreak.value}`))
      if (dead) {
        enemy.value = { ...dead, hp: dead.maxHp }
        currentScene.value = scenes.FIGHT
        return
      }
    }
    const total = 20 + winStreak.value * 10
    const newEnemy = randomCharacter(total)
    enemy.value = { ...newEnemy, hp: newEnemy.maxHp }
    currentScene.value = scenes.FIGHT
  }
  function fight() {
    if (!character.value || !enemy.value) return
    const playerAttack = Math.floor(Math.random() * character.value.status.str) + character.value.status.agi
    const enemyAttack = Math.floor(Math.random() * enemy.value.status.str) + enemy.value.status.agi
    enemy.value.hp -= playerAttack
    if (enemy.value.hp <= 0) {
      winStreak.value++
      character.value.money += 10 * winStreak.value
      skillChoices.value = randomSkillChoices()
      showSkillSelect.value = true
      onBattleFinished(true)
      return
    }
    character.value.hp -= enemyAttack
    if (character.value.hp <= 0) {
      const charCopy = { ...character.value, skill: [...character.value.skill, `win: ${winStreak.value}`] }
      deadCharacters.value.push(charCopy)
      characterHistory.value.push({ ...charCopy, winCount: winStreak.value })
      onBattleFinished(false)
    }
  }
  function randomSkillChoices(): string[][] {
    return [
      [`เพิ่ม status แบบสุ่ม 10`, 'random10'],
      [`เพิ่ม status ใดๆ 10`, 'choose10'],
      [`คูณ status ทั้งหมด x${(Math.random()*0.9+1.1).toFixed(2)}`, 'multiply'],
      [`เพิ่ม Max HP 10%`, 'maxhp10']
    ]
  }
  function applySkill(idx: number) {
    if (!character.value) return
    const skill = skillChoices.value[idx][1]
    if (skill === 'random10') {
      for (let i = 0; i < 10; i++) {
        const k = Object.keys(character.value.status) as (keyof Status)[]
        const key = k[Math.floor(Math.random() * k.length)]
        character.value.status[key]++
      }
    } else if (skill === 'choose10') {
      character.value.status.str += 10
    } else if (skill === 'multiply') {
      const mul = parseFloat(skillChoices.value[idx][0].split('x')[1])
      Object.keys(character.value.status).forEach(k => {
        character.value!.status[k as keyof Status] = Math.floor(character.value!.status[k as keyof Status] * mul)
      })
    } else if (skill === 'maxhp10') {
      const add = Math.floor(character.value.maxHp * 0.1)
      character.value.maxHp += add
      character.value.hp += add
      if (character.value.hp > character.value.maxHp) character.value.hp = character.value.maxHp
    }
    character.value.skill.push(skillChoices.value[idx][0])
    const idxHistory = characterHistory.value.findIndex(c => c.name === character.value!.name && c.skill.join(',') === character.value!.skill.join(','))
    if (idxHistory !== -1) {
      characterHistory.value[idxHistory].winCount = winStreak.value
    } else {
      characterHistory.value.push({ ...character.value, winCount: winStreak.value })
    }
    showSkillSelect.value = false
  }
  function onBattleFinished(win = false) {
    showResultButton.value = true
    lastBattleWin.value = win
    lastMoneyEarned.value = win ? 10 * winStreak.value : 0
    currentScene.value = scenes.RESULT
  }

  // Heal
  function buyHeal() {
    if (character.value && character.value.money >= 100 && character.value.hp < character.value.maxHp) {
      character.value.money -= 100
      const heal = Math.floor(character.value.maxHp * 0.1)
      character.value.hp += heal
      if (character.value.hp > character.value.maxHp) character.value.hp = character.value.maxHp
    }
  }

  // Load on mount
  onMounted(() => {
    loadFromLocal()
    if (!character.value) startNewGame()
  })
  watch([
    character, enemy, winStreak, currentScene, deadCharacters, skillChoices, showSkillSelect, showResultButton, lastBattleWin, lastMoneyEarned, characterHistory
  ], saveToLocal, { deep: true })

  return {
    scenes,
    character,
    enemy,
    winStreak,
    currentScene,
    deadCharacters,
    skillChoices,
    showSkillSelect,
    showResultButton,
    lastBattleWin,
    lastMoneyEarned,
    characterHistory,
    randomStatus,
    randomCharacter,
    startNewGame,
    startFight,
    fight,
    randomSkillChoices,
    applySkill,
    onBattleFinished,
    buyHeal,
  }
})
