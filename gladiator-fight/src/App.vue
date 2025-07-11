

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
  characterHistory,
  userProfile,
} = storeToRefs(game)

const { scenes } = game
// เพิ่ม scenes.HISTORY
if (!scenes.HISTORY) scenes.HISTORY = 'history'
import { ref } from 'vue'
import { applySkill } from './store/skillUtils'
const showTownhall = ref(false)


const {
  startNewGame,
  startFight,
  buyHeal,
  onBattleFinished,
} = game

function handleChooseSkill(idx: number) {
  if (!character.value) return;
  applySkill(
    idx,
    character.value,
    skillChoices.value,
    characterHistory.value
  )
  currentScene.value = scenes.PREPARE
}

function handleStartFight() {
  startFight(
    character.value,
    deadCharacters.value,
    characterHistory.value,
    (e: any) => { enemy.value = e },
    (scene: string) => { currentScene.value = scene },
    game.randomCharacter,
    scenes
  )
}

</script>


<template>
  <header class="main-header">
    <div class="logo-title-row">
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="90" height="90" />
      <div class="game-title-block">
        <h1 class="game-title">Gladiator Fight</h1>
        <div class="profile-money">💰 เงิน: <b>{{ userProfile.money }}</b></div>
      </div>
    </div>
    <div class="wrapper">
      <button v-if="character && character.hp <= 0" @click="startNewGame">เกิดใหม่</button>
    </div>
  </header>
  <main>
    <button @click="currentScene = scenes.HISTORY" style="margin-bottom:1rem">ดูประวัติตัวละครที่เคยใช้</button>
    <PrepareScene
      v-if="currentScene === scenes.PREPARE && character"
      :character="character"
      :dead-characters="deadCharacters"
      @start-fight="handleStartFight"
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
      :money-earned="character?.lastMoneyEarned ?? 0"
      :skill-choices="lastBattleWin ? skillChoices : []"
      @choose-skill="handleChooseSkill"
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

.main-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 0.5rem;
}
.logo-title-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.logo {
  margin: 0 0.5rem 0 0;
}
.game-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.game-title {
  margin: 0;
  font-size: 2.1rem;
  font-weight: bold;
  letter-spacing: 1px;
}
.profile-money {
  font-size: 1.1rem;
  color: #ffd700;
  margin-top: 0.2rem;
}
@media (min-width: 1024px) {
  .main-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-right: calc(var(--section-gap) / 2);
  }
  .logo-title-row {
    flex-direction: row;
    align-items: center;
  }
  .logo {
    margin: 0 2rem 0 0;
  }
  .main-header .wrapper {
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
