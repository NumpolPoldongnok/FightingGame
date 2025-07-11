

<script setup lang="ts">
import { Character, CharacterHistory, Status, useGameStore } from './store/useGameStore'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScreen from './components/ResultScreen.vue'
import HistoryScreen from './components/HistoryScreen.vue'
import { storeToRefs } from 'pinia'

const game = useGameStore()
const {
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
  userProfile,
} = storeToRefs(game)

import { watch } from 'vue'
function fetchSceneData() {
  // Fetch or initialize any data needed for the current scene
  //startNewGame()
}
watch(currentScene, (scene) => {
  fetchSceneData()
})
const { scenes } = game
// เพิ่ม scenes.HISTORY
if (!scenes.HISTORY) scenes.HISTORY = 'history'
import { ref } from 'vue'
const showTownhall = ref(false)
const {
  startNewGame,
  startFight,
  fight,
  applySkill,
  buyHeal,
  onBattleFinished,
} = game

</script>


<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    <div class="wrapper">
      <h1>Gladiator Fight</h1>
      <p>ชนะติดต่อกัน: {{ winStreak }}</p>
      <button v-if="character && character.hp <= 0" @click="startNewGame">เกิดใหม่</button>
    </div>
  </header>
  <main>
    <button @click="currentScene = scenes.HISTORY" style="margin-bottom:1rem">ดูประวัติตัวละครที่เคยใช้</button>
    <PrepareScene
      v-if="currentScene === scenes.PREPARE && character"
      :character="character"
      :dead-characters="deadCharacters"
      @start-fight="startFight"
      @open-townhall="() => { showTownhall = true }"
    >
      <template #money>
        {{ userProfile.money }}
      </template>
    </PrepareScene>
    <div v-if="showTownhall && currentScene === scenes.PREPARE && character">
      <div class="modal-overlay">
        <div class="modal-box">
          <h2>Townhall</h2>
          <p>เงินของคุณ: {{ userProfile.money }}</p>
          <button @click="buyHeal" :disabled="userProfile.money < 100 || character!.hp >= character!.maxHp">ซื้อยา (+10% max HP, 100 เงิน)</button>
          <button @click="showTownhall = false" style="margin-left:1rem">ออก</button>
        </div>
      </div>
    </div>
    <FightScene
      v-if="currentScene === scenes.FIGHT && character && enemy"
      :character="character"
      :enemy="enemy"
      @battle-finished="onBattleFinished"
    />
    <ResultScreen
      v-if="currentScene === scenes.RESULT"
      :win="lastBattleWin"
      :win-streak="winStreak"
      :money-earned="lastMoneyEarned"
      :skill-choices="lastBattleWin ? skillChoices : []"
      @choose-skill="applySkill"
      @restart="startNewGame"
      @back="() => { currentScene = scenes.PREPARE }"
    />

    <HistoryScreen
      v-if="currentScene === scenes.HISTORY"
      :character-history="characterHistory"
      @back="currentScene = scenes.PREPARE"
    />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #232323;
  color: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  min-width: 300px;
  box-shadow: 0 2px 16px #000a;
  text-align: center;
}
</style>
