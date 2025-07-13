import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import * as battleUtils from './battleUtils'
import * as skillUtils from './skillUtils'
import type { Skill } from './skillUtils'

export type Status = {
  str: number
  agi: number
  vit: number
  dex: number
  int: number
  luk: number
}

export type UserProfile = {
  money: number
}

export type Character = {
  name: string
  hp: number
  maxHp: number
  status: Status
  skills: Skill[]
  winStreak: number
  lastMoneyEarned?: number
  totalMoneyEarned: number
  statusPoint: number
}

const STORAGE_KEY = 'gladiator-save-v1';

export const useGameStore = defineStore('game', () => {
  // State
  const scenes = {
    PREPARE: 'prepare',
    FIGHT: 'fight',
    RESULT: 'result',
    HISTORY: 'history',
  }
  const userProfile = ref<UserProfile>({ money: 0 })
  const character = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const currentScene = ref(scenes.PREPARE)
  const deadCharacters = ref<Character[]>([])
  const skillChoices = ref<Skill[]>([])
  const showSkillSelect = ref(false)
  const showResultButton = ref(false)
  const lastBattleWin = ref(false)
  const characterHistory = ref<Character[]>([])
  let statusTotal = 30

  // LocalStorage
  function saveToLocal() {
    console.log('saveToLocal')
    const data = {
      character: character.value,
      enemy: enemy.value,
      winStreak: character.value?.winStreak ?? 0,
      currentScene: currentScene.value,
      deadCharacters: deadCharacters.value,
      skillChoices: skillChoices.value,
      showSkillSelect: showSkillSelect.value,
      showResultButton: showResultButton.value,
      lastBattleWin: lastBattleWin.value,
      lastMoneyEarned: character.value?.lastMoneyEarned ?? 0,
      characterHistory: characterHistory.value,
      userProfile: userProfile.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
  function loadFromLocal() {
    console.log('loadFromLocal')
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.character) character.value = data.character
      if (data.userProfile) userProfile.value = data.userProfile
      if (data.enemy) enemy.value = data.enemy
      if (data.character && typeof data.character.winStreak === 'number' && character.value) character.value.winStreak = data.character.winStreak
      if (typeof data.currentScene === 'string') currentScene.value = data.currentScene
      if (Array.isArray(data.deadCharacters)) deadCharacters.value = data.deadCharacters
      if (Array.isArray(data.skillChoices)) skillChoices.value = data.skillChoices as Skill[]
      if (typeof data.showSkillSelect === 'boolean') showSkillSelect.value = data.showSkillSelect
      if (typeof data.showResultButton === 'boolean') showResultButton.value = data.showResultButton
      if (typeof data.lastBattleWin === 'boolean') lastBattleWin.value = data.lastBattleWin
      if (typeof data.lastMoneyEarned === 'number' && character.value) character.value.lastMoneyEarned = data.lastMoneyEarned
      if (Array.isArray(data.characterHistory)) characterHistory.value = data.characterHistory
    } catch (e) { /* ignore */ }
  }

  // Logic
  function randomStatus(total: number, base: Status = {str:1,agi:1,vit:1,dex:1,int:1,luk:1}): Status {
    console.log('randomStatus', total, base)
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
    console.log('randomCharacter', statusTotal, baseStatus)
    const names = ['Maximus', 'Spartacus', 'Crixus', 'Commodus', 'Tigris']
    const status = randomStatus(statusTotal, baseStatus)
    const maxHp = 100 + (status.vit * 10)
    return {
      name: names[Math.floor(Math.random() * names.length)],
      hp: maxHp,
      maxHp,
      status,
      skills: [],
      winStreak: 0,
      totalMoneyEarned: 0,
      statusPoint: 0,
    }
  }
  function startNewGame() {
    console.log('startNewGame')
    let base: Status | undefined = undefined
    if (character.value) {
      characterHistory.value.push({ ...character.value })
      base = { ...character.value.status }
      Object.keys(base).forEach(k => {
        base![k as keyof Status] = Math.floor(base![k as keyof Status] * 0.1)
      })
      statusTotal++
    } else {
      statusTotal = 30
    }
    character.value = randomCharacter(statusTotal, base)
    character.value.totalMoneyEarned = 0
    character.value.winStreak = 0
    deadCharacters.value = []
    currentScene.value = scenes.PREPARE
  }
  function calcMoneyEarned(win: boolean) {
    console.log('calcMoneyEarned', win)
    if (!character.value) return 0
    return win ? battleUtils.calcReward(character.value) : 0
  }
  function onBattleFinished(win = false) {
    console.log('onBattleFinished', win)
    showResultButton.value = true
    lastBattleWin.value = win
    if (character.value) {
      if (win) {
        character.value.winStreak++;
        // 1. randomSkillChoices
        skillChoices.value = skillUtils.randomSkillChoices(character.value.status.luk);
        // 2. Userprofile money += lastMoneyEarned
        character.value.lastMoneyEarned = calcMoneyEarned(true);
        userProfile.value.money += character.value.lastMoneyEarned ?? 0;
        console.log('Money earned:', character.value.lastMoneyEarned, 'Total money:', userProfile.value.money);
      } else {
        character.value.lastMoneyEarned = calcMoneyEarned(false);
      }
    }
    currentScene.value = scenes.RESULT
  }

  // Heal
  function buyHeal() {
    console.log('buyHeal')
    if (!character.value) return
    const cost = battleUtils.calcHealCost(character.value)
    if (userProfile.value.money >= cost && character.value.hp < character.value.maxHp) {
      userProfile.value.money -= cost
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
    character, enemy, currentScene, deadCharacters, skillChoices, showSkillSelect, showResultButton, lastBattleWin, characterHistory
  ], saveToLocal, { deep: true })

  return {
    scenes,
    userProfile,
    character,
    enemy,
    currentScene,
    deadCharacters,
    skillChoices,
    showSkillSelect,
    showResultButton,
    lastBattleWin,
    characterHistory,
    randomStatus,
    randomCharacter,
    startNewGame,
    onBattleFinished,
    buyHeal,
    calcMoneyEarned,
    ...battleUtils,
  }
})
