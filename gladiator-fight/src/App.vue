

<script setup lang="ts">
import { useGameStore } from './store/useGameStore'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScene from './components/ResultScene.vue'
import HistoryScene from './components/HistoryScene.vue'
import TownhallScene from './components/TownhallScene.vue'
import { storeToRefs } from 'pinia'

const game = useGameStore()
const {
  character,
  enemy,
  currentScene,
  deadCharacters,
  skillChoices,
  lastBattleWin,
  lastMoneyEarned,
  characterHistory,
  userProfile,
} = storeToRefs(game)

const { scenes } = game
// เพิ่ม scenes.HISTORY
if (!scenes.HISTORY) scenes.HISTORY = 'history'
import { ref } from 'vue'
const showTownhall = ref(false)
const {
  startNewGame,
  startFight,
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
    <TownhallScene
      v-if="showTownhall && currentScene === scenes.PREPARE && character"
      :user-profile="userProfile"
      :character="character"
      :buy-heal="buyHeal"
      @close="showTownhall = false"
    />
    <FightScene
      v-if="currentScene === scenes.FIGHT && character && enemy"
      :character="character"
      :enemy="enemy"
      @battle-finished="onBattleFinished"
    />
    <ResultScene
      v-if="currentScene === scenes.RESULT"
      :win="lastBattleWin"
      :win-streak="character?.winStreak ?? 0"
      :money-earned="lastMoneyEarned"
      :skill-choices="lastBattleWin ? skillChoices : []"
      @choose-skill="applySkill"
      @restart="startNewGame"
      @back="() => { currentScene = scenes.PREPARE }"
    />
    <HistoryScene
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
