import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import * as battleUtils from './battleUtils'
import * as skillUtils from './skillUtils'
import type { Skill } from './skillUtils'

// --- TYPE DEFINITIONS ---
export type Status = {
  str: number; agi: number; vit: number;
  dex: number; int: number; luk: number;
}
export type UserProfile = { money: number }
export type Character = {
  id: string; // Unique ID for each character instance
  name: string;
  hp: number;
  maxHp: number;
  status: Status;
  skills: Skill[];
  winStreak: number;
  lastMoneyEarned: number;
  statusPoint: number;
}

const STORAGE_KEY = 'gladiator-save-v2'; // Bump version for new structure

// --- UTILITY FUNCTIONS ---
function getOrdinalSuffix(i: number): string {
  const j = i % 10, k = i % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
}

// --- PINIA STORE DEFINITION ---
export const useGameStore = defineStore('game', () => {
  // === STATE ===
  const scenes = {
    PREPARE: 'prepare', FIGHT: 'fight', RESULT: 'result',
    HISTORY: 'history', CREATE: 'create',
  }
  const userProfile = ref<UserProfile>({ money: 100 })
  const character = ref<Character | null>(null)
  const enemy = ref<Character | null>(null)
  const currentScene = ref(scenes.CREATE)
  const skillChoices = ref<Skill[]>([])
  const characterHistory = ref<Character[]>([])

  // === GETTERS ===
  const totalStatusPoints = computed(() => {
    if (!character.value) return 0;
    const basePoints = Object.keys(character.value.status).length;
    const allocatedPoints = Object.values(character.value.status).reduce((sum, val) => sum + val, 0);
    return allocatedPoints - basePoints;
  });

  // === ACTIONS ===

  // --- Character & Game Flow Management ---
  function _createNewCharacter(name: string, status: Status): Character {
    const maxHp = 100 + (status.vit * 10);
    return {
      id: `char_${Date.now()}`, // Simple unique ID
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

  function createCharacter({ name, status }: { name: string, status: Status }) {
    const newChar = _createNewCharacter(name, status);
    character.value = newChar;
    currentScene.value = scenes.PREPARE;
  }

  function startNewGame() {
    character.value = null; // Clear character to ensure create screen shows
    currentScene.value = scenes.CREATE;
  }

  function rebirthFromHistory() {
    if (characterHistory.value.length === 0) {
      console.warn("Rebirth called with no history. Starting new game.");
      startNewGame();
      return;
    }

    const template = characterHistory.value[Math.floor(Math.random() * characterHistory.value.length)];
    const generation = characterHistory.value.length + 1;
    const suffix = getOrdinalSuffix(generation);
    
    // Create the heir with pre-filled stats
    const heir = _createNewCharacter(`${template.name} ${generation}${suffix}`, { ...template.status });

    character.value = heir;
    currentScene.value = scenes.PREPARE;
    console.log(`Rebirthed as ${heir.name} from ${template.name}`);
  }

  function onBattleFinished(victoriousCharacter: Character) {
    if (!character.value) return;

    if (victoriousCharacter.hp > 0) { // Player won
      character.value.winStreak++;
      character.value.lastMoneyEarned = battleUtils.calcReward(character.value);
      character.value.statusPoint += 5;
      userProfile.value.money += character.value.lastMoneyEarned;
      skillChoices.value = skillUtils.randomSkillChoices(character.value.status.luk);
    } else { // Player lost
      character.value.lastMoneyEarned = 0;
      // Add the fallen gladiator to history
      characterHistory.value.push(JSON.parse(JSON.stringify(character.value)));
    }
    
    // Always go to result scene after a battle
    currentScene.value = scenes.RESULT;
  }
  
  // --- In-Game Actions ---
  function buyHeal() {
    if (!character.value) return;
    const cost = battleUtils.calcHealCost(character.value);
    if (userProfile.value.money >= cost && character.value.hp < character.value.maxHp) {
      userProfile.value.money -= cost;
      const healAmount = Math.floor(character.value.maxHp * 0.2);
      character.value.hp = Math.min(character.value.maxHp, character.value.hp + healAmount);
    }
  }

  function randomStatus(totalPoints: number, base = 1): Status {
    let remainingPoints = totalPoints - (Object.keys(skillUtils.BASE_STATUS).length * base);
    const keys = Object.keys(skillUtils.BASE_STATUS) as (keyof Status)[];
    const status: Status = { str: base, agi: base, vit: base, dex: base, int: base, luk: base };
    
    while (remainingPoints > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      status[randomKey]++;
      remainingPoints--;
    }
    return status;
  }

  // --- Persistence (Save/Load) ---
  function saveToLocal() {
    const saveData = {
      userProfile: userProfile.value,
      character: character.value,
      currentScene: currentScene.value,
      skillChoices: skillChoices.value,
      characterHistory: characterHistory.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }

  function loadFromLocal() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      console.log('No save data found. Starting fresh.');
      startNewGame();
      return;
    }
    try {
      const data = JSON.parse(rawData);
      if (data.userProfile) userProfile.value = data.userProfile;
      if (data.character) character.value = data.character;
      if (data.currentScene) currentScene.value = data.currentScene;
      if (data.skillChoices) skillChoices.value = data.skillChoices;
      if (data.characterHistory) characterHistory.value = data.characterHistory;

      // If loaded data is empty, start new game
      if (!character.value) {
        startNewGame();
      }
    } catch (e) {
      console.error('Failed to load save data:', e);
      localStorage.removeItem(STORAGE_KEY); // Corrupted data, clear it
      startNewGame();
    }
  }
  
  // Initialize and watch for changes
  onMounted(loadFromLocal);
  watch(
    () => [userProfile.value, character.value, currentScene.value, characterHistory.value],
    saveToLocal,
    { deep: true }
  );

  return {
    // State
    scenes, userProfile, character, enemy, currentScene,
    skillChoices, characterHistory,
    // Getters
    totalStatusPoints,
    // Actions
    startNewGame, createCharacter, rebirthFromHistory,
    onBattleFinished, buyHeal, randomStatus,
    // Utilities (forwarded for convenience)
    ...battleUtils,
    ...skillUtils,
  }
})