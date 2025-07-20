<script setup lang="ts">
import { useGameStore } from './store/useGameStore'
import { storeToRefs } from 'pinia'

// Import Scenes
import CreateCharacterScene from './scenes/CreateCharacterScene.vue'
import PrepareScene from './scenes/PrepareScene.vue'
import FightScene from './scenes/FightScene.vue'
import StartBattleScene from './scenes/StartBattleScene.vue'
import ResultScene from './scenes/ResultScene.vue'
import StoreScene from './scenes/StoreScene.vue'
import HistoryScene from './scenes/HistoryScene.vue'

// Import Layout
import UserLayout from './layouts/UserLayout.vue'

// Import Types and Utils
import type { Character } from './types/game'
import { getEnemy } from './store/battleUtils'

const game = useGameStore()
const {
  character,
  enemy,
  currentScene,
  characterHistory,
} = storeToRefs(game)

const { scenes, startNewGame } = game

function handleStartCompare() {
  if (!character.value) return;
  enemy.value = getEnemy(character.value, game.characterHistory, game.randomCharacter);
  currentScene.value = scenes.COMPARE
}

function handleRetreat() {
  currentScene.value = scenes.PREPARE;
}

function handleStartFight() {
  currentScene.value = scenes.FIGHT
}

function handleFightHistory(historyChar: Character) {
  if (!character.value) return;
  // Clone the history character as enemy (avoid mutating history)
  enemy.value = JSON.parse(JSON.stringify(historyChar));
  currentScene.value = scenes.FIGHT;
}

function onBattleFinish(updatedCharacter: Character) {
  console.log("onBattleFinish called with updatedCharacter:", updatedCharacter);
  game.onBattleFinished(updatedCharacter);
  currentScene.value = scenes.RESULT;
}
</script>

<template>
  <!-- Main Scene Router: Only one of these can ever be active -->

  <CreateCharacterScene v-if="currentScene === scenes.CREATE" @create="game.createCharacter" />


  <ResultScene v-else-if="currentScene === scenes.RESULT" @restart="startNewGame"
    @back="currentScene = scenes.PREPARE" />

  <StoreScene v-else-if="currentScene === scenes.STORE" @close="currentScene = scenes.PREPARE" />

  <StartBattleScene v-else-if="currentScene === scenes.COMPARE && character && enemy" :character="character"
    :enemy="enemy" :show="true" @start="handleStartFight" @retreat="handleRetreat" />

  <FightScene v-else-if="currentScene === scenes.FIGHT && character && enemy" :character="character" :enemy="enemy"
    @battle-finished="onBattleFinish" @restart="startNewGame"/>

  <!-- Default Layout for other scenes -->
  <UserLayout v-else @history="currentScene = scenes.HISTORY" @result="currentScene = scenes.RESULT"
    @prepare="currentScene = scenes.PREPARE" @fight="handleStartCompare" @restart="startNewGame" @townhall="currentScene = scenes.STORE">
    <!-- Scene content within the layout -->
    <PrepareScene v-if="currentScene === scenes.PREPARE && character" :character="character"
      @start-fight="handleStartCompare" @restart="startNewGame" />

    <HistoryScene v-else-if="currentScene === scenes.HISTORY" :character-history="characterHistory"
      @back="currentScene = scenes.PREPARE" @fightHistory="handleFightHistory" />
  </UserLayout>
</template>