// store/useGameStore.ts

import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import * as battleUtils from './battleUtils'
import * as skillUtils from './skillUtils'
import { imageStore } from './imageStore' // << NEW: Import the image store

import { Character, Scene, scenes, Status, UserProfile } from '../types/game'
import type { Skill } from './skillUtils'
import { HP_PER_VIT, randomCharacterStatus } from './statusUtils'


const STORAGE_KEY = 'gladiator-save-v4'; // Bump version for new structure

// ... (getOrdinalSuffix utility function can remain here)

export const useGameStore = defineStore('game', () => {
  // === STATE ===
  const userProfile = ref<UserProfile>({ money: 100 })
  const character = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const currentScene = ref<Scene>(scenes.CREATE)
  const skillChoices = ref<Skill[]>([])
  const characterHistory = ref<Character[]>([]) // History will NOT contain images

  // === ACTIONS ===

  function _createNewCharacter(name: string, status: Status): Character {
    const maxHp = 100 + (status.vit * HP_PER_VIT);
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

  function chooseSkill(idx: number, character: Character, choices: Skill[]) {
    const skill = choices[idx];
    character.skills.push(skill);
    skillChoices.value = [];
  }

  function randomCharacter(points: number): Character {
    // Define character types and name pools
    const typeKeys = ['str', 'agi', 'vit', 'dex', 'int', 'luk'] as (keyof Status)[];
    // Name pools for each type (no duplicates per session)
    const namePools: Record<keyof Status, string[]> = {
      str: ['Maximus', 'Brutus', 'Gaius', 'Titus', 'Drusus'],
      agi: ['Aurelia', 'Felix', 'Nero', 'Crispus', 'Sabina'],
      vit: ['Cassia', 'Marcellus', 'Severus', 'Flavia', 'Publius'],
      dex: ['Lucilla', 'Quintus', 'Vibia', 'Paulus', 'Agrippa'],
      int: ['Octavia', 'Cornelia', 'Julius', 'Livia', 'Antonia'],
      luk: ['Valeria', 'Fabia', 'Sextus', 'Claudia', 'Decimus'],
    };
    // Track used names in a Set (in-memory, resets on reload)
    if (!(window as any)._usedCharNames) (window as any)._usedCharNames = new Set();
    const usedNames: Set<string> = (window as any)._usedCharNames;
    // Randomly pick a type
    const type: keyof Status = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    // Pick a name from the pool for that type
    // Filter out used names for this session
    const pool = namePools[type].filter(n => !usedNames.has(n + type));
    let name: string;
    if (pool.length > 0) {
      name = pool[Math.floor(Math.random() * pool.length)];
      usedNames.add(name + type);
    } else {
      // If all names used, allow reuse
      name = namePools[type][Math.floor(Math.random() * namePools[type].length)];
    }
    // Append the status type as a title for >50, and a legendary title for >100
    const typeTitle: Record<keyof Status, string> = {
      str: 'the Strength',
      agi: 'the Agility',
      vit: 'the Vitality',
      dex: 'the Dexterity',
      int: 'the Intellect',
      luk: 'the Fortune',
    };
    const legendaryTitle: Record<keyof Status, string> = {
      str: 'the Legendary Strength',
      agi: 'the Legendary Agility',
      vit: 'the Legendary Vitality',
      dex: 'the Legendary Dexterity',
      int: 'the Legendary Intellect',
      luk: 'the Legendary Fortune',
    };
    // Generate status with the chosen type as the highest
    const status: Status = randomCharacterStatus(points, type);
    if (status[type] > 100) {
      name = `${name} ${legendaryTitle[type]}`;
    } else if (status[type] > 50) {
      name = `${name} ${typeTitle[type]}`;
    }
    const maxHp = 100 + status.vit * HP_PER_VIT;
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

  function onBattleFinished(updatedCharacter: Character) {
    if (!character.value) return;
    if (!enemy.value) return;
    character.value.hp = updatedCharacter.hp; // Update the character with the latest hp
    if (character.value.hp > 0) { // Player won
      character.value.winStreak++;
      if (enemy.value.winStreak > character.value.winStreak) {
        character.value.winStreak = enemy.value.winStreak + 1;
      }
      character.value.lastMoneyEarned = battleUtils.calcReward(character.value);
      character.value.statusPoint += 5;
      userProfile.value.money += character.value.lastMoneyEarned;
      skillChoices.value = skillUtils.randomSkillChoices(character.value.status.luk);
      console.log('Battle won! New skill choices:', skillChoices.value);
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
    createCharacter, updateCharacterImage, startNewGame, onBattleFinished, buyHeal, randomCharacter,
    chooseSkill
  };
})
