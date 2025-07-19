<script setup lang="ts">
import { Character, useGameStore } from './store/useGameStore'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScene from './components/ResultScene.vue'
import HistoryScene from './components/HistoryScene.vue'
import TownhallScene from './components/TownhallScene.vue'
import { storeToRefs } from 'pinia'
import UserLayout from './layouts/UserLayout.vue'
import CreateCharacterScene from './components/CreateCharacterScene.vue'

const game = useGameStore()
const {
  character,
  enemy,
  currentScene,
  skillChoices,
  characterHistory,
  userProfile,
} = storeToRefs(game)

const { scenes } = game
// Ensure all scenes exist
if (!scenes.HISTORY) scenes.HISTORY = 'history'
if (!scenes.CREATE) scenes.CREATE = 'create'
import { ref } from 'vue'
import { applySkill, randomSkillChoices, type Skill } from './store/skillUtils'
import { startFight } from './store/battleUtils'
const showTownhall = ref(false)

const {
  startNewGame,
  buyHeal,
  onBattleFinished,
} = game

// --- Fight with History Gladiator ---
function handleFightHistory(historyChar: Character) {
  if (!character.value) return;
  // Clone the history character as enemy (avoid mutating history)
  enemy.value = JSON.parse(JSON.stringify(historyChar));
  currentScene.value = scenes.FIGHT;
  // Mark that this is a history fight (for win streak transfer)
  (enemy.value as any)._fromHistory = true;
}

// Patch onBattleFinished to support win streak transfer
const origOnBattleFinished = onBattleFinished;
game.onBattleFinished = function() {
  // If fighting a history enemy and player wins, transfer win streak
  if (enemy.value && (enemy.value as any)._fromHistory && character.value && character.value.hp > 0) {
    character.value.winStreak = Math.max(character.value.winStreak, enemy.value.winStreak);
    // Optionally, add a bonus for defeating a Hall of Fame gladiator
  }
  origOnBattleFinished();
}

function handleChooseSkill(idx: number) {
  if (!character.value) return;
  // skillChoices is now Skill[]
  applySkill(
    idx,
    character.value,
    skillChoices.value as Skill[]
  )
  currentScene.value = scenes.PREPARE
}

function handleRandomSkillChoices() {
  if (!character.value) return;
  // skillChoices is now Skill[]
  const newChoices = randomSkillChoices(character.value.status.luk)
  console.log('New skill choices:', newChoices)
  skillChoices.value = newChoices
  // Update the scene to reflect the new skill choices
  currentScene.value = scenes.RESULT
}

function handleStartFight() {
  if (!character.value) return;
  startFight(
    character.value,
    (e: any) => { enemy.value = e },
    (scene: string) => { currentScene.value = scene },
    game.randomCharacter,
    scenes,
    game.characterHistory
  )
}

</script>

<template>
  <CreateCharacterScene
    v-if="currentScene === scenes.CREATE"
    @create="game.createCharacter"
    @cancel="currentScene = scenes.PREPARE"
  />
  <ResultScene v-else-if="currentScene === scenes.RESULT && character" :character="character" :skill-choices="skillChoices"
    @choose-skill="handleChooseSkill" @restart="startNewGame" @back="() => { currentScene = scenes.PREPARE }"
    @refresh-skill="handleRandomSkillChoices" />
  <FightScene v-else-if="currentScene === scenes.FIGHT && character && enemy" :character="character" :enemy="enemy"
    @battle-finished="onBattleFinished" @restart="startNewGame" />
  <UserLayout v-else @history="currentScene = scenes.HISTORY" @result="currentScene = scenes.RESULT"
    @townhall="showTownhall = true; currentScene = scenes.PREPARE" @prepare="currentScene = scenes.PREPARE"
    @fight="handleStartFight" @restart="startNewGame">
    <PrepareScene v-if="currentScene === scenes.PREPARE && character" :character="character"
      @start-fight="handleStartFight" @open-townhall="() => { showTownhall = true }" @restart="startNewGame" />
    <TownhallScene v-if="showTownhall && currentScene === scenes.PREPARE && character" :user-profile="userProfile"
      :character="character" :buy-heal="buyHeal" @close="showTownhall = false" />
    <HistoryScene v-if="currentScene === scenes.HISTORY" :character-history="characterHistory"
      @back="currentScene = scenes.PREPARE"
      @fightHistory="handleFightHistory" />
  </UserLayout>
</template>