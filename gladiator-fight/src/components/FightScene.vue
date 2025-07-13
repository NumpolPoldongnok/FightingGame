<template>
  <div>
    <h2>ฉากต่อสู้</h2>
    <div v-if="character && enemy">
      <div class="status-row">
        <div class="status-block player">
          <h3>คุณ: {{ character.name }}</h3>
          <HPBar :value="character.hp" :max="character.maxHp" />
          <CharacterStatus :status="character.status" />
          <CooldownBar :value="character.cooldown ?? 0" :max="maxCooldown"/>
      <div>
        <strong>Skill:</strong>
        <SkillList :skills="character.skills.filter(s => s.active === true)" />
      </div>
        </div>
        <div class="status-block enemy">
          <h3>ศัตรู: {{ enemy.name }}</h3>
          <HPBar :value="enemy.hp" :max="enemy.maxHp" />
          <CharacterStatus :status="enemy.status" />
          <CooldownBar :value="enemy.cooldown ?? 0" :max="maxCooldown"/>
      <div>
        <strong>Skill:</strong>
        <SkillList :skills="character.skills.filter(s => s.active === true)" />
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
import type { Character } from '../store/useGameStore'
import { toBattleFighter, setBattleMaxCooldown } from '../store/battleUtils'
import SkillList from './SkillList.vue'
import CharacterStatus from './CharacterStatus.vue'
import HPBar from './HPBar.vue'
const props = defineProps<{ character: Character, enemy: Character }>()
const maxCooldown = setBattleMaxCooldown(props.character.status.agi, props.enemy.status.agi)
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
  intervalRef.value = setInterval(doBattleTurnWrapper, 200)
})

onUnmounted(() => {
  clearInterval(intervalRef.value)
})
</script>

<style scoped>

/* Genshin-style Battle UI */
.status-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2.2rem;
  margin-bottom: 1.3rem;
}
@media (max-width: 700px) {
  .status-row {
    flex-direction: column;
    gap: 1.1rem;
    margin-bottom: 0.7rem;
  }
  .status-block {
    min-width: 0;
    padding: 1rem 0.7rem 1.1rem 0.7rem;
  }
}
.status-block {
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  border-radius: 18px;
  padding: 1.3rem 2.1rem 1.5rem 2.1rem;
  min-width: 260px;
  flex: 1;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  border: 2.5px solid #b2c7e1;
  margin-bottom: 0.2em;
}
.status-block.player {
  border: 2.5px solid #43e97b;
  box-shadow: 0 4px 18px #43e97b33, 0 1.5px 0 #fff8 inset;
}
.status-block.enemy {
  border: 2.5px solid #e53935;
  box-shadow: 0 4px 18px #e5393533, 0 1.5px 0 #fff8 inset;
}
.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

.battle-log-container {
  max-height: 240px;
  overflow-y: auto;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  margin-top: 1.2rem;
  padding: 0.7rem 1.1rem 0.7rem 1.1rem;
  border-radius: 16px;
  font-size: 1.09rem;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  border: 2px solid #b2c7e1;
}
@media (max-width: 700px) {
  .battle-log-container {
    font-size: 0.97rem;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  }
}
.battle-log-row {
  margin-bottom: 0.38rem;
  white-space: pre-line;
  padding: 0.5em 1.2em;
  border-radius: 10px;
  max-width: 70%;
  word-break: break-word;
  display: block;
  font-family: 'Montserrat', 'Prompt', Arial, sans-serif;
}
@media (max-width: 700px) {
  .battle-log-row {
    padding: 0.4em 0.5em;
    font-size: 0.98em;
    max-width: 100%;
  }
}
.log-player {
  background: linear-gradient(90deg, #43e97b 60%, #38f9d7 100%);
  color: #2d3142;
  text-align: left;
  margin-right: auto;
  border-left: 4px solid #43e97b;
  box-shadow: 0 1px 6px #43e97b22;
  font-weight: 700;
}
.log-enemy {
  background: linear-gradient(270deg, #e53935 60%, #f7baba 100%);
  color: #2d3142;
  text-align: right;
  margin-left: auto;
  border-right: 4px solid #e53935;
  box-shadow: 0 1px 6px #e5393522;
  font-weight: 700;
}
.log-evade {
  font-style: italic;
  opacity: 0.85;
}
.log-lose {
  background: #fff3e0;
  color: #ff9800;
  text-align: center;
  margin: 0 auto;
  border: none;
  font-weight: bold;
  border-radius: 10px;
}
.log-end {
  background: none;
  color: #aaa;
  text-align: center;
  margin: 0 auto;
  border: none;
  font-size: 0.98em;
}


</style>

