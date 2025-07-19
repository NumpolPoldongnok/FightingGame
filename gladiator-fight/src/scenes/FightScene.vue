<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import CooldownBar from '../components/CooldownBar.vue'
import Popup from '../components/Popup.vue'
import CharacterPictureFrame from '../components/CharacterPictureFrame.vue'
import type { Character } from '../store/useGameStore'
import { doBattleTurn, getLogClass } from '../store/battleUtils'
import { toBattleFighter, setBattleMaxCooldown } from '../store/battleUtils'
import SkillList from '../components/SkillList.vue'
import CharacterStatus from '../components/CharacterStatus.vue'
import HPBar from '../components/HPBar.vue'

const props = defineProps<{ character: Character, enemy: Character }>()

const maxCooldown = setBattleMaxCooldown(props.character.status.agi, props.enemy.status.agi)
const character = toBattleFighter(props.character)
const enemy = toBattleFighter(props.enemy)

const emit = defineEmits(['battle-finished', 'restart'])

// --- STATE ---
const battleLog = ref<string[]>([])
const isBattleStarted = ref(false)
const battleResult = ref<'win' | 'lose' | null>(null)
const isResultPopupDismissed = ref(false) // Tracks if the result popup has been dismissed

// --- POPUP STATE ---
const showStartPopup = computed({
  get: () => !isBattleStarted.value,
  set: (val: boolean) => { if (val) isBattleStarted.value = false }
})
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

// --- BATTLE LOGIC ---
/** Called when the battle concludes. The result is based on the player's final HP. */
function onFinish(winnerCharacter: Character) { // winnerCharacter is passed from the util, but we use our player character
  clearInterval(intervalRef.value)
  battleResult.value = character.hp > 0 ? 'win' : 'lose'
}

function doBattleTurnWrapper() {
  doBattleTurn(character, enemy, battleLog.value, onFinish, intervalRef)
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

// --- LIFECYCLE ---

onUnmounted(() => {
  clearInterval(intervalRef.value)
})
</script>

<template>
  <div class="fight-container">
    <!-- Start Battle Popup -->
    <Popup v-model="showStartPopup" customClass="start-popup-content" :showClose="false">
      <h2 class="popup-title">The Battle is Set!</h2>
      <div class="faceoff-container">
        <div class="fighter-preview player-preview">
          <CharacterPictureFrame :character="character" :size="48" />
          <div>{{ character.name }}</div>
        </div>
        <div class="vs-text">VS</div>
        <div class="fighter-preview enemy-preview">
          <CharacterPictureFrame :character="enemy" :size="48" />
          <div>{{ enemy.name }}</div>
        </div>
      </div>
      <button class="start-btn" @click="handleStartBattle">FIGHT!</button>
    </Popup>

    <!-- Battle Controls -->
    <div class="battle-controls">
      <!-- Speed Controls (shown during battle) -->
      <div v-if="isBattleStarted && !battleResult" class="speed-controls">
        <span class="speed-label">SPEED:</span>
        <button :class="['control-btn', { active: speed === 1 }]" @click="setSpeed(1)">1x</button>
        <button :class="['control-btn', { active: speed === 2 }]" @click="setSpeed(2)">2x</button>
        <button :class="['control-btn', { active: speed === 4 }]" @click="setSpeed(4)">4x</button>
        <button :class="['control-btn', { active: speed === 8 }]" @click="setSpeed(8)">8x</button>
      </div>

      <!-- Post-battle actions (shown after dismissing popup) -->
      <div v-if="battleResult && isResultPopupDismissed" class="action-buttons">
        <button v-if="battleResult === 'win'" class="modal-btn"
          @click="emit('battle-finished', character)">PROCEED</button>
        <button v-if="battleResult === 'lose'" class="modal-btn" @click="emit('restart')">RESTART</button>
      </div>
    </div>

    <!-- Battle Arena -->
    <div v-if="character && enemy" class="battle-arena">
      <div class="fighter-card player">
        <h3 class="fighter-name">{{ character.name }}</h3>
        <div class="fighter-content">
          <HPBar :value="character.hp" :max="character.maxHp" type="player" />
          <CharacterStatus :character="character" />
          <CooldownBar :value="character.cooldown ?? 0" :max="maxCooldown" />
          <SkillList :skills="character.skills.filter(s => s.active === true)" />
        </div>
      </div>
      <div class="vs-separator">VS</div>
      <div class="fighter-card enemy">
        <h3 class="fighter-name">{{ enemy.name }}</h3>
        <div class="fighter-content">
          <HPBar :value="enemy.hp" :max="enemy.maxHp" type="enemy" />
          <CharacterStatus :character="enemy" />
          <CooldownBar :value="enemy.cooldown ?? 0" :max="maxCooldown" />
          <SkillList :skills="enemy.skills.filter(s => s.active === true)" />
        </div>
      </div>
    </div>

    <!-- Battle Log -->
    <div class="log-scroll-area">
      <div v-for="(log, idx) in battleLog" :key="idx" :class="['log-entry', getLogClass(log)]">
        {{ log }}
      </div>
    </div>

    <!-- Battle Result Popup -->
    <Popup v-model="showResultPopup" :customClass="resultPopupClass" :showClose="false">
      <h2 class="result-title">{{ battleResult === 'win' ? 'VICTORY' : 'DEFEAT' }}</h2>
      <div class="modal-actions">
        <button v-if="battleResult === 'win'" class="modal-btn"
          @click="emit('battle-finished', character)">PROCEED</button>
        <button v-if="battleResult === 'lose'" class="modal-btn" @click="emit('restart')">RESTART</button>
        <button class="dismiss-btn" @click="isResultPopupDismissed = true">Inspect Battle</button>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
/* (Most existing styles remain the same) */
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
}

.speed-controls,
.action-buttons {
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

.battle-arena {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: stretch;
}

.vs-separator {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #c8ab6b;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
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
  margin-top: 2rem;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fdf6e7;
  color: #44341b;
  border: 4px solid #8a703d;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
  font-size: 0.95rem;
}

.log-entry {
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
}

.log-player {
  color: #1b5e20;
  font-weight: bold;
}

.log-enemy {
  color: #b71c1c;
  font-weight: bold;
}

.log-evade {
  opacity: 0.7;
  font-style: italic;
}

.log-lose,
.log-end {
  text-align: center;
  font-weight: bold;
  background: rgba(138, 112, 61, 0.1);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .battle-arena {
    gap: 0.5rem;
  }

  .fighter-content {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .fighter-name {
    font-size: 1.1rem;
  }
}

@media (max-width: 640px) {
  .vs-separator {
    display: none;
  }

  .battle-controls {
    flex-direction: column;
  }
}

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


.result-message {
  display: inline-block;
  font-family: 'Cinzel', serif;
  font-weight: 900;
  font-size: 2.2rem;
  padding: 0.7rem 2.5rem;
  border-radius: 12px;
  margin: 0.5rem 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18), 0 1.5px 0 #fff2;
  background: linear-gradient(90deg, #f7d88b 0%, #e2c178 100%);
  color: #44341b;
  text-shadow: 0 2px 8px #fff8, 0 1px 0 #fff4;
  pointer-events: none;
  border: none;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
}
.result-lose {
  background: linear-gradient(90deg, #ef4444 0%, #b71c1c 100%);
  color: #fff;
  text-shadow: 0 2px 8px #b71c1c88, 0 1px 0 #fff4;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.start-popup-content {
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border: 4px solid #6b552d;
  border-radius: 12px;
  padding: 2rem 3rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 95vw;
  max-height: 90vh;
  overflow: auto;
  box-sizing: border-box;
}

.popup-title {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #c8ab6b;
  margin-bottom: 2rem;
  text-transform: uppercase;
}

.faceoff-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.fighter-preview {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 700;
  padding: 1rem 1.5rem;
  border-width: 3px;
  border-style: solid;
  border-radius: 8px;
  min-width: 200px;
}

.player-preview {
  color: #f7d88b;
  border-color: #e2c178;
}

.enemy-preview {
  color: #ef9a9a;
  border-color: #b71c1c;
}

.vs-text {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 900;
  color: #8a703d;
}

.start-btn {
  font-family: 'Cinzel', serif;
  font-weight: 900;
  font-size: 2rem;
  padding: 1rem 3rem;
  border-radius: 12px;
  border: 4px solid #f7d88b;
  color: #1a1a1a;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.2s;
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
  box-shadow: 0 5px 15px rgba(226, 193, 120, 0.2);
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(226, 193, 120, 0.4);
}

/* --- NEW/UPDATED STYLES --- */
.modal-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.dismiss-btn {
  background: none;
  border: none;
  color: #c8ab6b;
  opacity: 0.8;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.dismiss-btn:hover {
  opacity: 1;
  color: #fff;
}


</style>