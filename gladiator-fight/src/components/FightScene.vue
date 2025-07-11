<template>
  <div>
    <h2>ฉากต่อสู้</h2>
    <div v-if="character && enemy">
      <div class="status-row">
        <div class="status-block player">
          <h3>คุณ: {{ character.name }}</h3>
          <p>HP: {{ character.hp }} / {{ character.maxHp }}</p>
          <div class="status-list">
            <span>STR: {{ character.status.str }}</span>
            <span>AGI: {{ character.status.agi }}</span>
            <span>VIT: {{ character.status.vit }}</span>
            <span>DEX: {{ character.status.dex }}</span>
            <span>INT: {{ character.status.int }}</span>
            <span>LUK: {{ character.status.luk }}</span>
            <span>CHA: {{ character.status.cha }}</span>
          </div>
          <div>
            <strong>Skill:</strong>
            <ul>
              <li v-for="(s, i) in character.skill" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
        <div class="status-block enemy">
          <h3>ศัตรู: {{ enemy.name }}<span v-if="isPastSelf"> (อดีตตัวเรา)</span></h3>
          <p>HP: {{ enemy.hp }} / {{ enemy.maxHp }}</p>
          <div class="status-list">
            <span>STR: {{ enemy.status.str }}</span>
            <span>AGI: {{ enemy.status.agi }}</span>
            <span>VIT: {{ enemy.status.vit }}</span>
            <span>DEX: {{ enemy.status.dex }}</span>
            <span>INT: {{ enemy.status.int }}</span>
            <span>LUK: {{ enemy.status.luk }}</span>
            <span>CHA: {{ enemy.status.cha }}</span>
          </div>
          <div>
            <strong>Skill:</strong>
            <ul>
              <li v-for="(s, i) in enemy.skill" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="battle-log-container">
        <div class="battle-log-row" v-for="(log, idx) in battleLog" :key="idx">{{ log }}</div>
      </div>
      <button v-if="showFinishButton" @click="emit('battle-finished', character.hp > 0)">จบการต่อสู้</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { doBattleTurn } from '../store/battleUtilsFight'
const isPastSelf = computed(() => {
  return Array.isArray(enemy.skill) && enemy.skill.some(s => typeof s === 'string' && s.startsWith('win:'))
})

import type { Character } from '../store/useGameStore'
const props = defineProps<{ character: Character, enemy: Character }>()

const character = props.character
const enemy = props.enemy
const emit = defineEmits(['battle-finished'])
const battleLog = ref<string[]>([])
const showFinishButton = ref(false)
const intervalRef = { value: undefined as any }

function setShowFinishButton(show: boolean) {
  showFinishButton.value = show
}

function onFinish(win: boolean) {
  // emit event if needed, or just set button
  // emit('battle-finished', win) // (optional, if you want auto emit)
}

function doBattleTurnWrapper() {
  doBattleTurn(
    character,
    enemy,
    battleLog.value,
    onFinish,
    setShowFinishButton,
    intervalRef
  )
}

onMounted(() => {
  battleLog.value = []
  showFinishButton.value = false
  intervalRef.value = setInterval(doBattleTurnWrapper, 200)
})

onUnmounted(() => {
  clearInterval(intervalRef.value)
})
</script>

<style scoped>
.status-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1rem;
}
.status-block {
  background: #232323;
  color: #fff;
  border-radius: 8px;
  padding: 1rem;
  min-width: 220px;
  flex: 1;
}
.status-block.player {
  border: 2px solid #4caf50;
}
.status-block.enemy {
  border: 2px solid #f44336;
}
.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}
.battle-log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #222;
  color: #fff;
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
}
.battle-log-row {
  margin-bottom: 0.2rem;
  white-space: pre-line;
}
</style>
