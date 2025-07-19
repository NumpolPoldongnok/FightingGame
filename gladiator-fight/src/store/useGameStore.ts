// store/useGameStore.ts

import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import * as battleUtils from './battleUtils'
import * as skillUtils from './skillUtils'
import { imageStore } from './imageStore' // << NEW: Import the image store
import type { Skill } from './skillUtils'

// --- TYPE DEFINITIONS ---
export type Status = {
  str: number; agi: number; vit: number;
  dex: number; int: number; luk: number;
}
export type UserProfile = { money: number }
export type Character = {
  id: string; // Unique ID is now essential
  name: string;
  hp: number;
  maxHp: number;
  status: Status;
  skills: Skill[];
  winStreak: number;
  lastMoneyEarned: number;
  statusPoint: number;
}

const STORAGE_KEY = 'gladiator-save-v4'; // Bump version for new structure

// ... (getOrdinalSuffix utility function can remain here)

export const useGameStore = defineStore('game', () => {
  // === STATE ===
  const scenes = {
    PREPARE: 'prepare',
    FIGHT: 'fight',
    RESULT: 'result',
    HISTORY: 'history',
    CREATE: 'create',
  }
  type Scene = typeof scenes[keyof typeof scenes];
  const userProfile = ref<UserProfile>({ money: 100 })
  const character = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const currentScene = ref<Scene>(scenes.CREATE)
  const skillChoices = ref<Skill[]>([])
  const characterHistory = ref<Character[]>([]) // History will NOT contain images

  // === ACTIONS ===

  function _createNewCharacter(name: string, status: Status): Character {
    const maxHp = 100 + (status.vit * 10);
    return {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // More robust ID
      name, hp: maxHp, maxHp, status, skills: [],
      winStreak: 0, lastMoneyEarned: 0, statusPoint: 0,
    };
  }

  async function createCharacter({ name, status, image }: { name: string, status: Status, image?: string }) {
    const newChar = _createNewCharacter(name, status);
    if (image) {
      // << CHANGED >> Save the image to IndexedDB
      await imageStore.saveImage(newChar.id, image);
    }
    character.value = newChar;
    currentScene.value = scenes.PREPARE;
  }

  async function updateCharacterImage(image: string) {
    if (character.value) {
      // << CHANGED >> Update the image in IndexedDB
      await imageStore.saveImage(character.value.id, image);
    }
  }

  function startNewGame() {
    if (character.value) {
      // History only stores data, not the live image property.
      // The image is already safe in IndexedDB.
      characterHistory.value.push({ ...character.value });
    }
    character.value = null;
    currentScene.value = scenes.CREATE;
  }

  function randomCharacter(): Character {
    const names = ['Maximus', 'Aurelius', 'Cassius', 'Valeria', 'Octavia', 'Livia', 'Tiberius', 'Lucius'];
    const name = names[Math.floor(Math.random() * names.length)];
    const status: Status = {
      str: Math.floor(Math.random() * 10) + 5,
      agi: Math.floor(Math.random() * 10) + 5,
      vit: Math.floor(Math.random() * 10) + 5,
      dex: Math.floor(Math.random() * 10) + 5,
      int: Math.floor(Math.random() * 10) + 5,
      luk: Math.floor(Math.random() * 10) + 5,
    };
    const maxHp = 100 + status.vit * 10;
    return {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      hp: maxHp,
      maxHp,
      status,
      skills: [],
      winStreak: 0,
      lastMoneyEarned: 0,
      statusPoint: 0,
    };
  }
  function onBattleFinished() {
    if (!character.value) return;

    if (character.value.hp > 0) { // Player won
      character.value.winStreak++;
      character.value.lastMoneyEarned = battleUtils.calcReward(character.value);
      character.value.statusPoint += 5;
      userProfile.value.money += character.value.lastMoneyEarned;
      skillChoices.value = skillUtils.randomSkillChoices(character.value.status.luk);
    } else { // Player lost
      character.value.lastMoneyEarned = 0;
      // Add the fallen gladiator to history. Image is already in IndexedDB.
      characterHistory.value.push({ ...character.value });
      character.value = null;
    }
    currentScene.value = scenes.RESULT;
  }

  // ... (buyHeal action remains the same) ...
  function buyHeal() { /* ... */ }

  // --- Persistence (Save/Load) ---
  function saveToLocal() {
    console.log('Saving game state to localStorage...');
    if (!character.value) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    // Create a version of the character WITHOUT the image property for saving
    const { ...characterToSave } = character.value;
    const trimmedHistory = characterHistory.value.slice(-20);

    const saveData = {
      userProfile: userProfile.value,
      character: characterToSave,
      currentScene: currentScene.value,
      skillChoices: skillChoices.value,
      characterHistory: trimmedHistory, // History is already image-free
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }

  async function loadFromLocal() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      currentScene.value = scenes.CREATE;
      return;
    }
    try {
      const data = JSON.parse(rawData);
      if (data.userProfile) userProfile.value = data.userProfile;
      if (data.character) {
        character.value = data.character;
      }
      if (data.currentScene) currentScene.value = data.currentScene;
      if (data.skillChoices) skillChoices.value = data.skillChoices;
      if (data.characterHistory) characterHistory.value = data.characterHistory;

      if (!character.value) {
        currentScene.value = scenes.CREATE;
      }
    } catch (e) {
      console.error('Failed to load save data, clearing:', e);
      localStorage.removeItem(STORAGE_KEY);
      currentScene.value = scenes.CREATE;
    }
  }

  onMounted(loadFromLocal);
  watch(
    () => [userProfile.value, character.value, currentScene.value, characterHistory.value],
    saveToLocal,
    { deep: true }
  );

  return {
    // ... return all your state and actions
    scenes, userProfile, character, enemy, currentScene,
    skillChoices, characterHistory,
    createCharacter, updateCharacterImage, startNewGame, onBattleFinished, buyHeal, randomCharacter
  };
})