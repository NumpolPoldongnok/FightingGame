<script lang="ts" setup>
import CharacterPictureFrame from '../components/CharacterPictureFrame.vue'
import CharacterStatus from '../components/CharacterStatus.vue'
import type { Character } from '../types/game'
import { useGameStore } from '../store/useGameStore'
import { storeToRefs } from 'pinia'
import { calcReward } from '../store/battleUtils'

import { ref, computed } from 'vue'
const props = defineProps<{
  character: Character,
  enemy: Character,
  show: boolean,
}>()
const game = useGameStore()
const { userProfile } = storeToRefs(game)
const emit = defineEmits(['start', 'close', 'retreat'])

// Use calcReward from battleUtils for fightReward
const fightReward = computed(() => calcReward(props.enemy))
const canRetreat = computed(() => (userProfile.value.money ?? 0) >= fightReward.value * 2)
const showRetreatConfirm = ref(false)
function tryRetreat() {
  showRetreatConfirm.value = true
}
function confirmRetreat() {
  userProfile.value.money -= fightReward.value * 2;
  showRetreatConfirm.value = false
  emit('retreat')
}
function cancelRetreat() {
  showRetreatConfirm.value = false
}
</script>

<template>
  <Teleport to="body">
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
        <div class="start-btns-row">
          <button class="start-btn-full" @click="$emit('start')">FIGHT!</button>
          <button v-if="canRetreat" class="retreat-btn-full" @click="tryRetreat">RETREAT</button>
        </div>
        <!-- Retreat Confirm Popup -->
        <Teleport to="body">
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
        </Teleport>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.start-btns-row {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2.5rem;
}
.retreat-btn-full {
  font-family: 'Cinzel', serif; font-weight: 900;
  font-size: 1.2rem; padding: 1.2rem 2.5rem;
  border-radius: 16px; border: 4px solid #ef4444;
  color: #fff; cursor: pointer; text-transform: uppercase;
  letter-spacing: 0.12em; transition: all 0.2s;
  background: linear-gradient(to bottom, #b71c1c, #8a1414);
  text-shadow: 0 1px 1px rgba(0,0,0,0.4);
  box-shadow: 0 5px 15px rgba(183, 28, 28, 0.2);
}
.retreat-btn-full:hover {
  background: #ef4444;
  border-color: #fff;
  color: #fff;
  transform: scale(1.05);
}
.retreat-confirm-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
}
.retreat-confirm-popup {
  background: #2a2a2a;
  border: 4px solid #ef4444;
  border-radius: 18px;
  padding: 2rem 2.5rem;
  color: #fdecc4;
  text-align: center;
  box-shadow: 0 8px 32px #000a;
  min-width: 300px;
}
.retreat-confirm-popup h3 {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  color: #ef4444;
  margin-bottom: 1rem;
}
.retreat-confirm-popup .gold {
  color: #ffd700;
  font-weight: bold;
}
.retreat-actions {
  display: flex; gap: 1.5rem; justify-content: center; margin-top: 2rem;
}
.confirm-btn {
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  border: 2px solid #f7d88b;
  color: #3a2e15;
  font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 1.1rem; padding: 0.7rem 2rem;
  border-radius: 8px; cursor: pointer;
  transition: all 0.2s;
}
.confirm-btn:hover {
  background: #f7d88b; color: #1a1a1a;
}
.cancel-btn {
  background: none; border: 2px solid #fdecc4;
  color: #fdecc4;
  font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 1.1rem; padding: 0.7rem 2rem;
  border-radius: 8px; cursor: pointer;
  transition: all 0.2s;
}
.cancel-btn:hover {
  background: #fdecc4; color: #2a2a2a;
}
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
  padding: 2rem 1rem;
  box-sizing: border-box;
  border: none; border-radius: 0; box-shadow: none;
}
.start-popup-content-full {
  width: 100%;
  max-width: 1200px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}
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
  align-items: stretch;
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
  margin-top: 2.5rem;
}
.start-btn-full:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(226, 193, 120, 0.4);
}
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
@media (max-width: 480px) {
  .start-popup-fullscreen { padding: 1rem 0.5rem; }
  .popup-title { font-size: 1.8rem; }
  .fighter-preview-full { padding: 1rem; gap: 0.8rem; }
  .fighter-name-full { font-size: 1.4rem; }
  .start-btn-full { font-size: 1.5rem; padding: 1rem 2.5rem; }
}
</style>
