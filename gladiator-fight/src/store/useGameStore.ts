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
  image?: string // base64 or data URL
}

const STORAGE_KEY = 'gladiator-save-v1';

export const useGameStore = defineStore('game', () => {
  // State
  const scenes = {
    PREPARE: 'prepare',
    FIGHT: 'fight',
    RESULT: 'result',
    HISTORY: 'history',
    CREATE: 'create',
  }
  const userProfile = ref<UserProfile>({ money: 0 })
  const character = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const currentScene = ref(scenes.PREPARE)
  const skillChoices = ref<Skill[]>([])
  const characterHistory = ref<Character[]>([])

  // LocalStorage
  function saveToLocal() {
    console.log('saveToLocal')
    // Limit characterHistory to last 20 entries to avoid quota exceeded
    const trimmedHistory = characterHistory.value.slice(-20)
    const data = {
      character: character.value,
      enemy: enemy.value,
      winStreak: character.value?.winStreak ?? 0,
      currentScene: currentScene.value,
      skillChoices: skillChoices.value,
      lastMoneyEarned: character.value?.lastMoneyEarned ?? 0,
      characterHistory: trimmedHistory,
      userProfile: userProfile.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    // Also update in-memory history to match trimmed version
    if (characterHistory.value.length > 20) {
      characterHistory.value.splice(0, characterHistory.value.length - 20)
    }
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
      if (Array.isArray(data.skillChoices)) skillChoices.value = data.skillChoices as Skill[]
      if (typeof data.lastMoneyEarned === 'number' && character.value) character.value.lastMoneyEarned = data.lastMoneyEarned
      if (Array.isArray(data.characterHistory)) characterHistory.value = data.characterHistory
    } catch (e) { /* ignore */ }
  }

  // Logic
  function randomStatus(total: number, base: Status = { str: 1, agi: 1, vit: 1, dex: 1, int: 1, luk: 1 }): Status {
    console.log('randomStatus', total, base)
    let remain = total - 6
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
    if (character.value) {
      console.log('Saving current character to history before starting new game')
      // Remove image before saving to history to avoid quota exceeded
      const { image, ...charNoImage } = character.value;
      characterHistory.value.push({ ...charNoImage });
    }
    character.value = null;
    enemy.value = null;
    skillChoices.value = [];
    // Show create character scene instead of random
    currentScene.value = scenes.CREATE;
  }
  function createCharacter({ name, status, image }: { name: string, status: Status, image?: string }) {
    console.log('createCharacter', name, status, image)
    const maxHp = 100 + (status.vit * 10)
    character.value = {
      name,
      hp: maxHp,
      maxHp,
      status: { ...status },
      skills: [],
      winStreak: 0,
      totalMoneyEarned: 0,
      statusPoint: 0,
      image: image || undefined,
    }
    currentScene.value = scenes.PREPARE;
  }

  // Update character image and persist to localStorage
  function updateCharacterImage(image: string) {
    if (character.value) {
      character.value.image = image;
      saveToLocal();
    }
  }
  function calcMoneyEarned(c: Character) {
    return battleUtils.calcReward(c)
  }
  function onBattleFinished(c: Character) {
    if (c.hp > 0) {
      c.winStreak++;
      c.lastMoneyEarned = calcMoneyEarned(c);
      c.statusPoint += 5;
      skillChoices.value = skillUtils.randomSkillChoices(c.status.luk);
    }
    // Update to store
    userProfile.value.money += c.lastMoneyEarned ?? 0;
    character.value = c
    // Set scene to result
    currentScene.value = scenes.RESULT
  }

  // Heal
  function buyHeal() {
    console.log('buyHeal')
    if (!character.value) return
    const cost = battleUtils.calcHealCost(character.value)
    if (userProfile.value.money >= cost && character.value.hp < character.value.maxHp) {
      userProfile.value.money -= cost
      const heal = Math.floor(character.value.maxHp * 0.2)
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
    character, enemy, currentScene, skillChoices, characterHistory
  ], saveToLocal, { deep: true })

  return {
    scenes,
    userProfile,
    character,
    enemy,
    currentScene,
    skillChoices,
    characterHistory,
    randomStatus,
    randomCharacter,
    startNewGame,
    createCharacter,
    updateCharacterImage,
    onBattleFinished,
    buyHeal,
    ...battleUtils,
  }
})
