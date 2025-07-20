<script lang="ts" setup>
import CharacterPictureFrame from '../components/CharacterPictureFrame.vue'
import CharacterStatus from '../components/CharacterStatus.vue'
import type { Character } from '../types/game'
import { useGameStore } from '../store/useGameStore'
import { storeToRefs } from 'pinia'
import { calcReward, toBattleFighter } from '../store/battleUtils'
import { ref, computed } from 'vue'

const props = defineProps<{
  character: Character,
  enemy: Character,
  show: boolean,
}>()

const character = toBattleFighter(props.character)
const enemy = toBattleFighter(props.enemy)

const game = useGameStore()
const { userProfile } = storeToRefs(game)
const emit = defineEmits(['start', 'retreat'])

const fightReward = computed(() => calcReward(props.enemy))
const canRetreat = computed(() => (userProfile.value?.money ?? 0) >= fightReward.value * 2)
const showRetreatConfirm = ref(false)

function tryRetreat() {
  showRetreatConfirm.value = true
}

function confirmRetreat() {
  // The money deduction is better handled in the parent/store to keep this component purely presentational.
  // But for now, we emit the event. The parent should handle the logic.
  showRetreatConfirm.value = false
  emit('retreat')
}

function cancelRetreat() {
  showRetreatConfirm.value = false
}

</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="start-popup-fullscreen">
        <div class="start-popup-content-full">
          <h2 class="popup-title">The Battle is Set!</h2>

          <div class="faceoff-container-full">
            <div class="fighter-preview-full player-preview">
              <CharacterPictureFrame :character="character" :size="96" />
              <div class="fighter-name-full">{{ character.name }}</div>
              <CharacterStatus :character="character" :show-buttons="false" />
            </div>
            <div class="vs-text-full">VS</div>
            <div class="fighter-preview-full enemy-preview">
              <CharacterPictureFrame :character="enemy" :size="96" />
              <div class="fighter-name-full">{{ enemy.name }}</div>
              <CharacterStatus :character="enemy" :show-buttons="false" />
            </div>
          </div>

          <div class="action-buttons-container">
            <button class="start-btn-full" @click="$emit('start')">FIGHT!</button>
            <button v-if="canRetreat" class="retreat-btn" @click="tryRetreat">RETREAT</button>
          </div>

          <!-- Retreat Confirm Popup -->
          <Teleport to="body">
            <Transition name="modal">
              <div v-if="showRetreatConfirm" class="retreat-confirm-overlay">
                <div class="retreat-confirm-popup">
                  <h3>Retreat?</h3>
                  <p>Spend <span class="gold">{{ fightReward * 2 }}</span> gold to retreat from this battle?</p>
                  <div class="retreat-actions">
                    <button class="confirm-btn" @click="confirmRetreat">Yes, Retreat</button>
                    <button class="cancel-btn" @click="cancelRetreat">Cancel</button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* --- TRANSITIONS --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .retreat-confirm-popup,
.modal-leave-to .retreat-confirm-popup {
  transform: scale(0.9);
}


/* --- MAIN LAYOUT --- */
/* Responsive fullscreen popup */
.start-popup-fullscreen {
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: linear-gradient(120deg, #1d1d1d 60%, #2b2b2b 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  padding: 1.2rem 0.2rem;
  box-sizing: border-box;
}

/* Responsive content container */
.start-popup-content-full {
  width: 100%;
  max-width: 1200px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 0.5rem;
}

/* Responsive title */
.popup-title {
  font-family: 'Cinzel', serif;
  font-size: 2.1rem;
  font-weight: 900;
  color: #e2c178;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-shadow: 0 2px 8px #000a;
}


/* --- FACE OFF CONTAINER (Always in a row) --- */

/* Responsive faceoff container */
.faceoff-container-full {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  flex-direction: row;
  min-height: 180px;
}



/* Responsive fighter preview */
.fighter-preview-full {
  flex: 1;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 14px;
  box-shadow: 0 4px 18px #0006, inset 0 1px 1px rgba(255,255,255,0.05);
  border: 2px solid #444;
  padding: 1rem;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@media (max-width: 700px) {
  .fighter-preview-full {
    max-width: 98vw;
    padding: 0.7rem;
    gap: 0.5rem;
  }
}

.fighter-preview-full:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px #0008, inset 0 1px 1px rgba(255,255,255,0.05);
}

.fighter-preview-full.player-preview { border-color: #e2c178; }
.fighter-preview-full.enemy-preview { border-color: #b71c1c; }

/* Responsive fighter name */
.fighter-name-full {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #e2c178;
  margin-bottom: 0.3rem;
  text-shadow: 0 1px 4px #000a;
}

/* Responsive VS text */
/* VS overlay at center */
.vs-text-full {
  position: absolute;
  left: 50%;
  top: 0%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-family: 'Cinzel', serif;
  font-size: 2.2rem;
  font-weight: 900;
  color: #e2c178;
  text-shadow: 0 2px 8px #000a, 0 0 16px #000c;

  padding: 0.7em 1.2em;

  pointer-events: none;
}
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

/* --- UI IMPROVEMENT: ACTION BUTTONS HIERARCHY --- */
/* Responsive action buttons */
.action-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  margin-top: 1.2rem;
}

/* Primary Action Button */
/* Responsive start button */
.start-btn-full {
  font-family: 'Cinzel', serif;
  font-weight: 900;
  font-size: 1.3rem;
  padding: 0.7rem 2.2rem;
  border-radius: 12px;
  border: 3px solid #f7d88b;
  color: #1a1a1a;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: all 0.2s;
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
  box-shadow: 0 5px 15px rgba(226, 193, 120, 0.2);
}
.start-btn-full:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 25px rgba(226, 193, 120, 0.4);
}

/* Secondary Action Button */
/* Responsive retreat button */
.retreat-btn {
  background: transparent;
  border: 2px solid #a89166;
  color: #a89166;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: all 0.2s ease;
}
.retreat-btn:hover {
  background-color: #a89166;
  color: #1a1a1a;
  border-color: #a89166;
  transform: translateY(-2px);
}


/* --- RETREAT CONFIRMATION POPUP --- */
/* Responsive retreat confirm popup */
.retreat-confirm-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 0.5rem;
}
.retreat-confirm-popup {
  background: #2a2a2a;
  border: 3px solid #ef4444;
  border-radius: 12px;
  padding: 1.1rem 0.7rem;
  color: #fdecc4;
  text-align: center;
  box-shadow: 0 8px 32px #000a;
  max-width: 95vw;
  width: 100%;
}
.retreat-confirm-popup h3 {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  color: #ef4444;
  margin-top: 0;
  margin-bottom: 0.7rem;
}
.retreat-confirm-popup p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}
.retreat-confirm-popup .gold {
  color: #ffd700;
  font-weight: bold;
}
.retreat-actions {
  display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.1rem;
}
.confirm-btn {
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  border: 2px solid #f7d88b;
  color: #3a2e15;
  font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 0.95rem; padding: 0.5rem 0.7rem;
  border-radius: 7px; cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}
.confirm-btn:hover {
  background: #f7d88b; color: #1a1a1a;
}
.cancel-btn {
  background: none; border: 2px solid #fdecc4;
  color: #fdecc4;
  font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 0.95rem; padding: 0.5rem 0.7rem;
  border-radius: 7px; cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}
.cancel-btn:hover {
    background: #fdecc4; color: #1a1a1a;
    border-color: #f7d88b;
}

@media (max-width: 700px) {
  .retreat-confirm-popup {
    max-width: 99vw;
    padding: 0.7rem 0.2rem;
  }
  .retreat-actions {
    gap: 0.3rem;
  }
}
</style>
