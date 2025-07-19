<script setup lang="ts">
import { useGameStore } from './store/useGameStore'
import { storeToRefs } from 'pinia'
import { ref } from 'vue' // ref is no longer needed here for scene management

// Import Scenes
import CreateCharacterScene from './scenes/CreateCharacterScene.vue'
import PrepareScene from './scenes/PrepareScene.vue'
import FightScene from './scenes/FightScene.vue'
import StartBattleScene from './scenes/StartBattleScene.vue'
import ResultScene from './scenes/ResultScene.vue'
import HistoryScene from './scenes/HistoryScene.vue'

// Import Layout
import UserLayout from './layouts/UserLayout.vue'

// Import Types and Utils
import type { Character, Scene } from './types/game'
import { calcReward, getEnemy } from './store/battleUtils'

const game = useGameStore()
const {
  character,
  enemy,
  currentScene,
  characterHistory,
  userProfile,
} = storeToRefs(game)


const { scenes, startNewGame, onBattleFinished: origOnBattleFinished } = game

// --- Start Battle Popup State ---
function handleStartBattle() {
  currentScene.value = scenes.FIGHT
}

// --- BATTLE & NAVIGATION LOGIC ---

function handleStartFight() {
    if (!character.value) return;
  enemy.value = getEnemy(character.value, game.characterHistory, game.randomCharacter);
  currentScene.value = scenes.COMPARE
}

function handleRetreat() {
  currentScene.value = scenes.PREPARE;
}

function handleFightHistory(historyChar: Character) {
  if (!character.value) return;
  // Clone the history character as enemy (avoid mutating history)
  enemy.value = JSON.parse(JSON.stringify(historyChar));
  currentScene.value = scenes.FIGHT;
  // Mark that this is a history fight (for win streak transfer)
  (enemy.value as any)._fromHistory = true;
}

</script>

<template>
  <!-- Main Scene Router: Only one of these can ever be active -->

  <CreateCharacterScene v-if="currentScene === scenes.CREATE" @create="game.createCharacter" />

  <ResultScene v-else-if="currentScene === scenes.RESULT && character" @restart="startNewGame"
    @back="currentScene = scenes.PREPARE" />

  <StartBattleScene v-else-if="currentScene === scenes.COMPARE && character && enemy" :character="character"
    :enemy="enemy" :show="true" @start="handleStartBattle" @retreat="handleRetreat" />

  <FightScene v-else-if="currentScene === scenes.FIGHT && character && enemy" :character="character" :enemy="enemy"
    @battle-finished="game.onBattleFinished" @restart="startNewGame" @retreat="handleRetreat" />

  <!-- Default Layout for other scenes -->
  <UserLayout v-else @history="currentScene = scenes.HISTORY" @result="currentScene = scenes.RESULT"
    @prepare="currentScene = scenes.PREPARE" @fight="handleStartFight" @restart="startNewGame">
    <!-- Scene content within the layout -->
    <PrepareScene v-if="currentScene === scenes.PREPARE && character" :character="character"
      @start-fight="handleStartFight" @restart="startNewGame" />

    <HistoryScene v-else-if="currentScene === scenes.HISTORY" :character-history="characterHistory"
      @back="currentScene = scenes.PREPARE" @fightHistory="handleFightHistory" />
  </UserLayout>
</template>