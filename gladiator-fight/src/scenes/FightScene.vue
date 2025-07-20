<script lang="ts" setup>
import { ref, onUnmounted, computed, onMounted } from 'vue'
import CooldownBar from '../components/CooldownBar.vue'
import Popup from '../components/Popup.vue'
import type { Character } from '../types/game'
import { doBattleTurn, battleAction, BATTLE_MAX_COOLDOWN, randomEnemyAttackType, randomEnemyDefenseType } from '../store/battleUtils'
import { toBattleFighter } from '../store/battleUtils'
import HPBar from '../components/HPBar.vue'
import CharacterStatus from '../components/CharacterStatus.vue'
import BattleActionPopup from '../components/BattleActionPopup.vue'
import BattleLogBubble from '../components/BattleLogBubble.vue'
import { BattleLogParams } from 'src/store/battleLogUtils'
import { createBattleLogText } from '../store/battleLogUtils'
const props = defineProps<{ character: Character, enemy: Character }>()

const character = toBattleFighter(props.character)
const enemy = toBattleFighter(props.enemy)

const emit = defineEmits(['battle-finished', 'restart'])

// --- STATE ---
const battleLog = ref<BattleLogParams[]>([])
const isBattleStarted = ref(false)
const battleResult = ref<'win' | 'lose' | null>(null)
const isResultPopupDismissed = ref(false) // Tracks if the result popup has been dismissed

// --- POPUP STATE ---
const showResultPopup = computed({
  get: () => Boolean(battleResult.value && !isResultPopupDismissed.value),
  set: (val: boolean) => { if (!val) isResultPopupDismissed.value = true }
})
const resultPopupClass = computed(() =>
  `modal-content ${battleResult.value === 'win' ? 'win-popup' : 'lose-popup'}`
)
const intervalRef = { value: undefined as any }
const speed = ref(1)
const baseInterval = 200

// --- ATTACK/DEFENSE POPUP STATE ---
const showAttackTypePopup = ref(false)
const showDefenseTypePopup = ref(false)
const alwaysAttackType = ref<'phy' | 'magic' | 'mix' | null>(null)
const alwaysDefendType = ref<'phy' | 'magic' | 'mix' | null>(null)
const alwaysAttackChecked = ref(false)
const alwaysDefendChecked = ref(false)
const attackTypePopupDismissed = ref(false)
const defenseTypePopupDismissed = ref(false)

function onFinish(winner: Character) {
  battleResult.value = (winner === character) ? 'win' : 'lose'
  if (intervalRef.value) {
    clearInterval(intervalRef.value)
    intervalRef.value = undefined
  }
  isBattleStarted.value = false
}

function doBattleTurnWrapper() {
  doBattleTurn(
    character,
    enemy,
    // onPlayerAction
    ({ character, enemy }) => {
      if (alwaysAttackChecked.value && alwaysAttackType.value) {
        handleAttackTypeSelect(alwaysAttackType.value)
        return
      }
      if (intervalRef.value) {
        clearInterval(intervalRef.value)
        intervalRef.value = undefined
      }
      showAttackTypePopup.value = true
      attackTypePopupDismissed.value = false // Reset dismissal state
    },
    // onEnemyAction
    ({ character, enemy }) => {
      if (alwaysDefendChecked.value && alwaysDefendType.value) {
        handleDefenseTypeSelect(alwaysDefendType.value)
        return
      }
      if (intervalRef.value) {
        clearInterval(intervalRef.value)
        intervalRef.value = undefined
      }
      showDefenseTypePopup.value = true
      defenseTypePopupDismissed.value = false // Reset dismissal state
    }
  )
}

function handleAttackTypeSelect(type: 'phy' | 'magic' | 'mix') {
  showAttackTypePopup.value = false
  if (alwaysAttackChecked.value) alwaysAttackType.value = type
  // After player selects, resolve the action
  const result = battleAction(
    character,
    enemy,
    battleLog.value,
    onFinish,
    type,
    randomEnemyDefenseType(),
    true
  )
  // Resume interval if battle not finished
  if (!result && !intervalRef.value && isBattleStarted.value && !battleResult.value) {
    intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
  }
}
function handleDefenseTypeSelect(type: 'phy' | 'magic' | 'mix') {
  showDefenseTypePopup.value = false
  if (alwaysDefendChecked.value) alwaysDefendType.value = type
  // After player selects, resolve the action (enemy attacks)
  const result = battleAction(
    enemy,
    character,
    battleLog.value,
    onFinish,
    randomEnemyAttackType(),
    type,
    false
  )
  // Resume interval if battle not finished
  if (!result && !intervalRef.value && isBattleStarted.value && !battleResult.value) {
    intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
  }
}

function handleStartBattle() {
  if (isBattleStarted.value) return
  isBattleStarted.value = true
  intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
}

function setSpeed(mult: number) {
  speed.value = mult
  if (intervalRef.value) {
    clearInterval(intervalRef.value)
    intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
  }
}

// These functions now control the BattleActionPopup component's v-model and dismissal
function dismissAttackTypePopup() {
  showAttackTypePopup.value = false
  attackTypePopupDismissed.value = true
}
function continueAttackTypePopup() {
  showAttackTypePopup.value = true
  attackTypePopupDismissed.value = false
}
function dismissDefenseTypePopup() {
  showDefenseTypePopup.value = false
  defenseTypePopupDismissed.value = true
}
function continueDefenseTypePopup() {
  showDefenseTypePopup.value = true
  defenseTypePopupDismissed.value = false
}

// --- LIFECYCLE ---
onMounted(() => {
  handleStartBattle()
})
onUnmounted(() => {
  clearInterval(intervalRef.value)
  // Dismiss all popups and stop battle to avoid Vue errors on unmount
  isResultPopupDismissed.value = true;
  isBattleStarted.value = false;
})
</script>

<template>
  <div class="fight-container">
    <div class="battle-controls">
      <div v-if="!battleResult" class="speed-controls">
        <span class="speed-label">SPEED:</span>
        <button :class="['control-btn', { active: speed === 1 }]" @click="setSpeed(1)">1x</button>
        <button :class="['control-btn', { active: speed === 2 }]" @click="setSpeed(2)">2x</button>
        <button :class="['control-btn', { active: speed === 4 }]" @click="setSpeed(4)">4x</button>
        <button :class="['control-btn', { active: speed === 8 }]" @click="setSpeed(8)">8x</button>
      </div>

      <Transition name="fade">
        <div v-if="battleResult && isResultPopupDismissed" class="post-battle-actions">
           <h2 class="post-battle-result" :class="battleResult === 'win' ? 'result-win' : 'result-lose'">
            {{ battleResult === 'win' ? 'Victory!' : 'Defeat!' }}
          </h2>
          <div class="action-buttons">
             <button v-if="battleResult === 'win'" class="action-btn proceed-btn" @click="emit('battle-finished', character)">PROCEED</button>
             <button v-if="battleResult === 'lose'" class="action-btn restart-btn" @click="emit('restart')">RESTART</button>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="character && enemy" class="battle-arena">
      <div class="fighter-card player">
        <h3 class="fighter-name">{{ character.name }}</h3>
        <div class="fighter-content">
          <HPBar :value="character.hp" :max="character.maxHp" type="player" />
          <CooldownBar :value="character.cooldown ?? 0" :max="BATTLE_MAX_COOLDOWN" />
          <CharacterStatus :character="character" title="Your Status" :show-buttons="false" />
        </div>
      </div>
      <div class="vs-separator vs-overlay">VS</div>
      <div class="fighter-card enemy">
        <h3 class="fighter-name">{{ enemy.name }}</h3>
        <div class="fighter-content">
          <HPBar :value="enemy.hp" :max="enemy.maxHp" type="enemy" />
          <CooldownBar :value="enemy.cooldown ?? 0" :max="BATTLE_MAX_COOLDOWN" />
          <CharacterStatus :character="enemy" title="Enemy Status" :show-buttons="false" />
        </div>
      </div>
    </div>
    <!-- Inline BattleActionPopup below the speed bar -->
    <div v-if="showAttackTypePopup || showDefenseTypePopup" class="inline-battle-action-popup">
      <BattleActionPopup
        v-if="showAttackTypePopup"
        :modelValue="showAttackTypePopup"
        @update:modelValue="val => showAttackTypePopup = val"
        :character="character"
        :character2="enemy"
        :isAttack="true"
        :alwaysChecked="alwaysAttackChecked"
        :actionType="alwaysAttackType"
        @select-type="handleAttackTypeSelect"
        @update:alwaysChecked="(val: boolean) => alwaysAttackChecked = val"
        @dismiss="dismissAttackTypePopup"
      />
      <BattleActionPopup
        v-if="showDefenseTypePopup"
        :modelValue="showDefenseTypePopup"
        @update:modelValue="val => showDefenseTypePopup = val"
        :character="enemy"
        :character2="character"
        :isAttack="false"
        :alwaysChecked="alwaysDefendChecked"
        :actionType="alwaysDefendType"
        @select-type="handleDefenseTypeSelect"
        @update:alwaysChecked="(val: boolean) => alwaysDefendChecked = val"
        @dismiss="dismissDefenseTypePopup"
      />
    </div>
    <div class="log-scroll-area">
      <div class="log-bubble-list">
        <BattleLogBubble
          v-for="(log, idx) in battleLog"
          :key="idx"
          :type="log.attacker === character? 'player' : log.attacker === enemy ? 'enemy' : 'neutral'"
        >
          {{ createBattleLogText(log) }}
        </BattleLogBubble>
      </div>
    </div>

    <Popup v-model="showResultPopup" :customClass="resultPopupClass" :showClose="false">
      <h2 class="result-title">{{ battleResult === 'win' ? 'VICTORY' : 'DEFEAT' }}</h2>
      <div class="modal-actions">
        <button v-if="battleResult === 'win'" class="modal-btn proceed-btn"
          @click="emit('battle-finished', character)">PROCEED</button>
        <button v-if="battleResult === 'lose'" class="modal-btn restart-btn" @click="emit('restart')">RESTART</button>
        <button class="dismiss-btn" @click="isResultPopupDismissed = true">Inspect Battle</button>
      </div>
    </Popup>


    <template v-if="attackTypePopupDismissed">
      <div class="popup-inspect-continue">
        <button class="continue-btn" @click="continueAttackTypePopup">Continue</button>
      </div>
    </template>
    <template v-if="defenseTypePopupDismissed">
      <div class="popup-inspect-continue">
        <button class="continue-btn" @click="continueDefenseTypePopup">Continue</button>
      </div>
    </template>
  </div>
</template>

<style scoped>

.fight-container {
  color: #fdecc4;
  padding: 1rem 0;
}

.battle-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid #6b552d;
  border-radius: 12px;
  min-height: 64px;
  transition: all 0.3s ease-in-out;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.speed-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #c8ab6b;
}

.control-btn {
  background-color: #4a3c23;
  color: #fdecc4;
  border: 2px solid #8a703d;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
}

.control-btn.active {
  background-color: #e2c178;
  color: #44341b;
  border-color: #fff;
  box-shadow: 0 0 10px #e2c178;
}

.control-btn:hover:not(.active) {
  background-color: #6b552d;
  border-color: #e2c178;
}

/* Overlay VS in battle arena */
.battle-arena {
  position: relative;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: stretch;
  margin-bottom: 2rem;
  min-height: 220px;
}

/* VS overlay at center of battle arena */
.vs-separator.vs-overlay {
  position: absolute;
  left: 50%;
  top: 0%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-family: 'Cinzel', serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: #e2c178;
  text-shadow: 0 2px 8px #000a, 0 0 16px #000c;
  border-radius: 50%;
  padding: 0.7em 1.2em;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fighter-card {
  flex: 1;
  min-width: 0;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 12px;
  border-width: 4px;
  border-style: solid;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fighter-card.player {
  border-color: #e2c178;
}

.fighter-card.enemy {
  border-color: #b71c1c;
}

.fighter-name {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  text-transform: uppercase;
  padding: 0.75rem 1rem;
  margin: 0;
  text-align: center;
  font-weight: 700;
  flex-shrink: 0;
}

.player .fighter-name {
  background: linear-gradient(to right, #e2c178, #b48d39);
  color: #3a2e15;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
}

.enemy .fighter-name {
  background: linear-gradient(to right, #b71c1c, #8a1414);
  color: #fdecc4;
}

.fighter-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}

.log-scroll-area {
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fdf6e7;
  background-image: radial-gradient(rgba(138, 112, 61, 0.1) 1px, transparent 1px);
  background-size: 4px 4px;
  color: #44341b;
  border: 4px solid #8a703d;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
  font-size: 0.95rem;
}

.log-entry {
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
}

.log-player { color: #1b5e20; font-weight: bold; }
.log-enemy { color: #b71c1c; font-weight: bold; }
.log-evade { opacity: 0.7; font-style: italic; }
.log-lose, .log-end {
  text-align: center; font-weight: bold;
  background: rgba(138, 112, 61, 0.1);
  margin-top: 0.5rem; margin-bottom: 0.5rem;
}
.log-bubble-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* --- Result Popups --- */
.win-popup {
  border-color: #e2c178;
  background: radial-gradient(circle, #4a3c1a 0%, #2a2a2a 70%);
  box-shadow: 0 0 30px #e2c17880;
}
.lose-popup {
  border-color: #8a1414;
  background: radial-gradient(circle, #4a1a1a 0%, #2a2a2a 70%);
  box-shadow: 0 0 30px #b71c1c80;
}
/* Re-applying general popup-title for the result popup, as it's not in the new component */
.result-title {
  font-family: 'Cinzel', serif;
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
}
.win-popup .result-title {
  color: #f7d88b;
  text-shadow: 0 0 15px #f7d88b, 0 0 5px #fff;
}
.lose-popup .result-title {
  color: #ef4444;
  text-shadow: 0 0 15px #ef4444;
}

/* --- Transitions --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- IMPROVED FULLSCREEN START POPUP --- */
.start-popup-fullscreen {
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: linear-gradient(120deg, #1d1d1d 60%, #2b2b2b 100%);
  display: flex;
  align-items: flex-start; /* Aligns content to the top */
  justify-content: center;
  height: 100vh; /* Fallback for older browsers */
  height: 100dvh; /* Dynamic viewport height for mobile */
  overflow-y: auto; /* Allows scrolling if content is too tall */
  padding: 2rem 1rem;
  box-sizing: border-box;
  border: none; border-radius: 0; box-shadow: none;
}
/* Keep .popup-title for the start popup as it's distinct */
.popup-title {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #e2c178;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-shadow: 0 2px 8px #000a;
}
.faceoff-container-full {
  display: flex;
  align-items: stretch; /* Makes cards the same height */
  justify-content: center;
  gap: 2rem;
  width: 100%;
}
.fighter-preview-full {
  flex: 1;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px #0006, inset 0 1px 1px rgba(255,255,255,0.05);
  border: 2px solid #444;
  padding: 1.5rem;
  min-width: 260px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fighter-preview-full:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px #0008, inset 0 1px 1px rgba(255,255,255,0.05);
}
.fighter-preview-full.player-preview { border-color: #e2c178; }
.fighter-preview-full.enemy-preview { border-color: #b71c1c; }
.fighter-name-full {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #e2c178;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 4px #000a;
}
.vs-text-full {
  font-family: 'Cinzel', serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: #e2c178;
  text-shadow: 0 2px 8px #000a;
  align-self: center;
  margin: 0 1rem;
}
.start-btn-full {
  font-family: 'Cinzel', serif; font-weight: 900;
  font-size: 2.2rem; padding: 1.2rem 4rem;
  border-radius: 16px; border: 4px solid #f7d88b;
  color: #1a1a1a; cursor: pointer; text-transform: uppercase;
  letter-spacing: 0.12em; transition: all 0.2s;
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
  box-shadow: 0 5px 15px rgba(226, 193, 120, 0.2);
}
.start-btn-full:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(226, 193, 120, 0.4);
}

/* --- Buttons & Modal Actions --- */
.modal-actions {
  display: flex; flex-direction: column;
  align-items: center; gap: 1rem;
}
.modal-btn, .action-btn {
  font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 1.2rem; padding: 0.8rem 2.5rem;
  border-radius: 8px; border-width: 3px; border-style: solid;
  cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.proceed-btn {
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  border-color: #f7d88b; color: #3a2e15;
  text-shadow: 0 1px 0 rgba(255,255,255,0.3);
}
.proceed-btn:hover {
  transform: translateY(-2px); box-shadow: 0 6px 15px rgba(226, 193, 120, 0.4);
}
.restart-btn {
  background: linear-gradient(to bottom, #b71c1c, #8a1414);
  border-color: #ef4444; color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.restart-btn:hover {
  transform: translateY(-2px); box-shadow: 0 6px 15px rgba(183, 28, 28, 0.4);
}
.dismiss-btn {
  background: none; border: none; color: #c8ab6b;
  opacity: 0.8; cursor: pointer; text-decoration: underline;
  font-size: 0.9rem; padding: 0.5rem;
}
.dismiss-btn:hover { opacity: 1; color: #fff; }

/* --- Post Battle UI --- */
.post-battle-actions {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  width: 100%; gap: 1rem;
}
.post-battle-result {
  font-family: 'Cinzel', serif; font-size: 2.2rem;
  font-weight: 900; letter-spacing: 0.1em; margin: 0;
}
.post-battle-result.result-win {
  color: #f7d88b; text-shadow: 0 0 10px #f7d88b, 0 0 3px #fff;
}
.post-battle-result.result-lose {
  color: #ef4444; text-shadow: 0 0 10px #ef4444;
}
.action-buttons {
  display: flex; align-items: center; gap: 1rem;
}


/* --- Responsiveness --- */
@media (max-width: 820px) {
  .faceoff-container-full {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  .fighter-preview-full {
    width: 100%;
    max-width: 400px;
    min-width: 280px;
  }
  .vs-text-full {
    margin: 0.5rem 0;
    transform: rotate(90deg);
  }
}

@media (max-width: 768px) {
  .fighter-content { padding: 0.75rem; gap: 0.75rem; }
  .fighter-name { font-size: 1.1rem; }
}

@media (max-width: 480px) {
  .start-popup-fullscreen { padding: 1rem 0.5rem; }
  .popup-title { font-size: 1.8rem; }
  .fighter-preview-full { padding: 1rem; gap: 0.8rem; }
  .fighter-name-full { font-size: 1.4rem; }
  .start-btn-full { font-size: 1.5rem; padding: 1rem 2.5rem; }
}

/*
  Keep these general modal content styles as they apply to other popups
  or ensure they are globally defined if Popup.vue handles them.
*/
.modal-content {
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.popup-inspect-continue {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}
.continue-btn {
  font-family: 'Cinzel', serif;
  font-size: clamp(1rem, 3vw, 1.1rem);
  font-weight: 700;
  padding: 0.6rem 2rem;
  border-radius: 10px;
  border: 3px solid #e2c178;
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  color: #3a2e15;
  box-shadow: 0 2px 8px #0006;
  transition: all 0.18s;
  cursor: pointer;
}
.continue-btn:hover {
  background: linear-gradient(to bottom, #b48d39, #e2c178);
  color: #44341b;
  border-color: #fff;
  box-shadow: 0 0 10px #e2c178;
}
</style>