<script lang="ts" setup>


import { ref, onMounted, onUnmounted, computed } from 'vue'
import { doBattleTurn, getLogClass } from '../store/battleUtilsFight'
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
const emit = defineEmits(['battle-finished', 'restart'])
const battleLog = ref<string[]>([])
const showFinishButton = ref(false)
const showRestartButton = ref(false)
const intervalRef = { value: undefined as any }
const speed = ref(1)
const baseInterval = 200

function onFinish(character: Character) {
  showFinishButton.value = character.hp > 0
  showRestartButton.value = character.hp <= 0
}


function doBattleTurnWrapper() {
  doBattleTurn(
    character,
    enemy,
    battleLog.value,
    onFinish,
    intervalRef
  )
}

function setSpeed(mult: number) {
  speed.value = mult
  if (intervalRef.value) {
    clearInterval(intervalRef.value)
    intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
  }
}


onMounted(() => {
  battleLog.value = []
  showFinishButton.value = false
  showRestartButton.value = false
  intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
})

onUnmounted(() => {
  clearInterval(intervalRef.value)
})
</script>


<template>
  <div class="fight-main-container">
    <h2>ฉากต่อสู้</h2>
    <div class="battle-btn-row">
      <div style="display:flex;align-items:center;gap:0.7em;">
        <span style="font-size:0.98em;">ความเร็ว:</span>
        <button :class="['genshin-btn', speed === 1 && 'genshin-btn-finish']" @click="setSpeed(1)">1x</button>
        <button :class="['genshin-btn', speed === 2 && 'genshin-btn-finish']" @click="setSpeed(2)">2x</button>
        <button :class="['genshin-btn', speed === 4 && 'genshin-btn-finish']" @click="setSpeed(4)">4x</button>
        <button :class="['genshin-btn', speed === 8 && 'genshin-btn-finish']" @click="setSpeed(8)">8x</button>
      </div>
      <button v-if="showFinishButton" class="genshin-btn genshin-btn-finish"
        @click="emit('battle-finished', character)">จบการต่อสู้</button>
      <button v-if="showRestartButton" class="genshin-btn genshin-btn-restart"
        @click="emit('restart')">เกิดใหม่</button>
    </div>
    <div v-if="character && enemy">
      <div class="status-row">
        <div class="status-block player">
          <h3>คุณ: {{ character.name }}</h3>
          <HPBar :value="character.hp" :max="character.maxHp" />
          <CharacterStatus :character="character" />
          <CooldownBar :value="character.cooldown ?? 0" :max="maxCooldown" />
          <div>
            <SkillList :skills="character.skills.filter(s => s.active === true)" />
          </div>
        </div>
        <div class="status-block enemy">
          <h3>ศัตรู: {{ enemy.name }}</h3>
          <HPBar :value="enemy.hp" :max="enemy.maxHp" />
          <CharacterStatus :character="enemy" />
          <CooldownBar :value="enemy.cooldown ?? 0" :max="maxCooldown" />
          <div>
            <SkillList :skills="character.skills.filter(s => s.active === true)" />
          </div>
        </div>
      </div>
      <div class="battle-log-container">
        <div v-for="(log, idx) in battleLog" :key="idx" :class="['battle-log-row', getLogClass(log)]">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Genshin-style Battle UI */
.status-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1.2rem;
  margin-bottom: 1.3rem;
  width: 100%;
}

.status-block {
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  border-radius: 18px;
  padding: 1.1rem 1.1rem 1.2rem 1.1rem;
  min-width: 0;
  width: 100%;
  max-width: 420px;
  flex: 1 1 0;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  border: 2.5px solid #b2c7e1;
  margin-bottom: 0.2em;
  box-sizing: border-box;
  overflow: hidden;
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

@media (max-width: 900px) {
  .status-row {
    gap: 0.7rem;
  }

  .status-block {
    padding: 0.7rem 0.5rem 0.8rem 0.5rem;
    max-width: 99vw;
    font-size: 0.97em;
  }
}

@media (max-width: 700px) {
  .status-row {
    gap: 0.3rem;
  }

  .status-block {
    padding: 0.5rem 0.2rem 0.6rem 0.2rem;
    max-width: 100vw;
    font-size: 0.93em;
  }

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

.battle-btn-row {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.genshin-btn {
  background: linear-gradient(90deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  border-radius: 12px;
  border: 2.5px solid #b2c7e1;
  padding: 0.7em 2.2em;
  font-weight: 700;
  font-size: 1.18em;
  box-shadow: 0 2px 10px #b2c7e144, 0 1.5px 0 #fff8 inset;
  letter-spacing: 0.04em;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  outline: none;
  cursor: pointer;
}

.genshin-btn:active,
.genshin-btn:focus {
  background: #c9e4ff;
  color: #1a233a;
  box-shadow: 0 2px 16px #43e97b33;
}

.genshin-btn-finish {
  border-color: #43e97b;
  background: linear-gradient(90deg, #43e97b 60%, #38f9d7 100%);
  color: #2d3142;
  box-shadow: 0 2px 12px #43e97b33, 0 1.5px 0 #fff8 inset;
}

.genshin-btn-finish:active,
.genshin-btn-finish:focus {
  background: #43e97b;
  color: #fff;
}

.genshin-btn-restart {
  border-color: #e53935;
  background: linear-gradient(90deg, #e53935 60%, #f7baba 100%);
  color: #fff;
  box-shadow: 0 2px 12px #e5393533, 0 1.5px 0 #fff8 inset;
}

.genshin-btn-restart:active,
.genshin-btn-restart:focus {
  background: #e53935;
  color: #fff;
}


.fight-main-container {
  padding: 1.2rem 0.7rem 1.5rem 0.7rem;
  box-sizing: border-box;
}
</style>
