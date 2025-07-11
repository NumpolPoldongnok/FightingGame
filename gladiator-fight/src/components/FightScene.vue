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
          <CooldownBar :value="character.cooldown ?? 0" :key="character.cooldown" />
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
          <CooldownBar :value="enemy.cooldown ?? 0" :key="enemy.cooldown" />
          <div>
            <strong>Skill:</strong>
            <ul>
              <li v-for="(s, i) in enemy.skill" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="battle-log-container">
        <div
          v-for="(log, idx) in battleLog"
          :key="idx"
          :class="['battle-log-row', getLogClass(log)]"
        >
          {{ log }}
        </div>
      </div>
      <button v-if="showFinishButton" @click="emit('battle-finished', character.hp > 0)">จบการต่อสู้</button>
    </div>
  </div>
</template>


<script lang="ts" setup>
// Helper to classify log type for styling (must be defined as const for template usage)
// Helper to classify log type for styling (must be top-level const in <script setup> for template access)
const getLogClass = (log: string) => {
  if (log.startsWith('คุณโจมตี') && log.includes('หลบได้')) return 'log-player log-evade';
  if (log.startsWith('คุณโจมตี')) return 'log-player';
  if (log.startsWith('คุณแพ้')) return 'log-lose';
  if (log.startsWith('---')) return 'log-end';
  if (log.startsWith('ศัตรู') || log.startsWith('Enemy') || log.startsWith('AI') || log.startsWith('โจมตีคุณ') || log.startsWith('คุณหลบได้')) return 'log-enemy';
  if (log.includes('โจมตีคุณ')) return 'log-enemy';
  if (log.includes('แพ้!')) return 'log-lose';
  return '';
}

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { doBattleTurn } from '../store/battleUtilsFight'
import CooldownBar from './CooldownBar.vue'
const isPastSelf = computed(() => {
  return Array.isArray(enemy.skill) && enemy.skill.some(s => typeof s === 'string' && s.startsWith('win:'))
})

import type { Character } from '../store/useGameStore'
import { toBattleFighter } from '../store/battleUtils'
const props = defineProps<{ character: Character, enemy: Character }>()
const character = toBattleFighter(props.character)
const enemy = toBattleFighter(props.enemy)
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
  intervalRef.value = setInterval(doBattleTurnWrapper, 20)
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
  max-height: 220px;
  overflow-y: auto;
  background: #181818;
  color: #fff;
  margin-top: 1rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 12px;
  font-size: 1.05rem;
  box-shadow: 0 2px 12px #000a;
}
.battle-log-row {
  margin-bottom: 0.3rem;
  white-space: pre-line;
  padding: 0.4em 1em;
  border-radius: 8px;
  max-width: 70%;
  word-break: break-word;
  display: block;
}
.log-player {
  background: linear-gradient(90deg, #263238 60%, #4caf50 100%);
  color: #b2ff59;
  text-align: left;
  margin-right: auto;
  border-left: 4px solid #4caf50;
  box-shadow: 0 1px 6px #4caf5022;
}
.log-enemy {
  background: linear-gradient(270deg, #263238 60%, #f44336 100%);
  color: #ffbdbd;
  text-align: right;
  margin-left: auto;
  border-right: 4px solid #f44336;
  box-shadow: 0 1px 6px #f4433622;
}
.log-evade {
  font-style: italic;
  opacity: 0.85;
}
.log-lose {
  background: #333;
  color: #ff9800;
  text-align: center;
  margin: 0 auto;
  border: none;
  font-weight: bold;
}
.log-end {
  background: none;
  color: #aaa;
  text-align: center;
  margin: 0 auto;
  border: none;
  font-size: 0.95em;
}


</style>

