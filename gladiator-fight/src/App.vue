<script setup lang="ts">
import { useGameStore } from './store/useGameStore'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScene from './components/ResultScene.vue'
import HistoryScene from './components/HistoryScene.vue'
import TownhallScene from './components/TownhallScene.vue'
import { storeToRefs } from 'pinia'
import UserLayout from './layouts/UserLayout.vue'

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
// เพิ่ม scenes.HISTORY
if (!scenes.HISTORY) scenes.HISTORY = 'history'
import { ref } from 'vue'
import { applySkill, randomSkillChoices, type Skill } from './store/skillUtils'
const showTownhall = ref(false)


const {
  startNewGame,
  startFight,
  buyHeal,
  onBattleFinished,
} = game

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
<div class="gladiator-app-bg min-h-screen w-full gladiator-app-root">
  <UserLayout
    @history="currentScene = scenes.HISTORY"
    @result="currentScene = scenes.RESULT"
    @townhall="showTownhall = true; currentScene = scenes.PREPARE"
    @prepare="currentScene = scenes.PREPARE"
    @fight="handleStartFight"
  >
      <PrepareScene v-if="currentScene === scenes.PREPARE && character" 
        :character="character"
        @start-fight="handleStartFight"
        @open-townhall="() => { showTownhall = true }"
        @restart="startNewGame" />
      <TownhallScene v-if="showTownhall && currentScene === scenes.PREPARE && character" :user-profile="userProfile"
        :character="character" :buy-heal="buyHeal" @close="showTownhall = false" />
      <FightScene v-if="currentScene === scenes.FIGHT && character && enemy" :character="character" :enemy="enemy"
        @battle-finished="onBattleFinished"
        @restart="startNewGame" />
      <ResultScene v-if="currentScene === scenes.RESULT && character"
        :character="character"
        :skill-choices= skillChoices
        @choose-skill="handleChooseSkill"
        @restart="startNewGame"
        @back="() => { currentScene = scenes.PREPARE }" 
        @refresh-skill="handleRandomSkillChoices" />
      <HistoryScene v-if="currentScene === scenes.HISTORY" :character-history="characterHistory"
        @back="currentScene = scenes.PREPARE" />
  </UserLayout>
</div>
</template>

<style scoped>
.gladiator-app-bg {
  background: repeating-linear-gradient(135deg, #3a2c1a 0 40px, #5a4322 40px 80px, #3a2c1a 80px 120px);
  min-height: 100vh;
  min-width: 100vw;
  box-shadow: 0 8px 32px #bfa10033, 0 1.5px 0 #fff8 inset;
}
.gladiator-app-root {
  font-family: 'Cinzel', 'Montserrat', 'Prompt', Arial, sans-serif;
  color: #f3e9d2;
}
</style>