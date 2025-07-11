
<script setup lang="ts">
import { Character, CharacterHistory, Status, useGameStore } from './store/useGameStore'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScreen from './components/ResultScreen.vue'
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
} = storeToRefs(game)
const { scenes } = game
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
    <button @click="currentScene = 'history'" style="margin-bottom:1rem">ดูประวัติตัวละครที่เคยใช้</button>
    <PrepareScene
      v-if="currentScene === scenes.PREPARE && character"
      :character="character"
      :dead-characters="deadCharacters"
      @start-fight="startFight"
      @buy-heal="() => { if (character && character.money >= 100 && character.hp < character.maxHp) { character.money -= 100; const heal = Math.floor(character.maxHp * 0.1); character.hp += heal; if (character.hp > character.maxHp) character.hp = character.maxHp; } }"
    />
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

    <div v-if="currentScene === scenes.FIGHT && showResultButton">
      <button @click="showResultButton = false; currentScene = scenes.PREPARE">ดูผลและกลับไปเตรียมตัว</button>
    </div>
    <div v-if="currentScene === 'history'">
      <h2>ประวัติตัวละครที่เคยใช้</h2>
      <ul>
        <li v-for="(c, idx) in characterHistory" :key="idx">
          <strong>{{ c.name }}</strong> | HP: {{ c.hp }} | เงิน: {{ c.money }} | <span>ชนะ: {{ c.winCount ?? 0 }}</span>
          <span>Status: [STR:{{ c.status.str }}, AGI:{{ c.status.agi }}, VIT:{{ c.status.vit }}, DEX:{{ c.status.dex }}, INT:{{ c.status.int }}, LUK:{{ c.status.luk }}, CHA:{{ c.status.cha }}]</span>
          <span> | Skill: <span v-for="(s, i) in c.skill" :key="i">{{ s }} </span></span>
        </li>
      </ul>
      <button @click="currentScene = scenes.PREPARE">กลับ</button>
    </div>
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
