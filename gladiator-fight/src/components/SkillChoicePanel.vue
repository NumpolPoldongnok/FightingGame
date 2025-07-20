<template>
  <div class="skill-choice-panel">
    <!-- Panel Header -->
    <header class="panel-header">
      <h3 class="panel-title">CHOOSE YOUR REWARD</h3>
      <button v-if="showRefresh" @click="showRefreshConfirm = true" class="refresh-btn" title="Refresh Skill Choices">
        🔄
      </button>
    </header>

    <!-- Skill Choices Grid -->
    <div class="choices-grid">
      <SkillChoiceButton
        v-for="(s, i) in skillChoices"
        :key="i"
        :skill="s"
        :index="i"
        @choose="$emit('choose-skill', i)"
      />
    </div>

    <!-- Panel Footer -->
    <footer class="panel-footer">
      <button @click="showConfirm = true" class="back-btn">Back to Prepare</button>
    </footer>

    <!-- Confirm Back Modal -->
    <transition name="fade">
      <div v-if="showConfirm" class="modal-overlay">
        <div class="modal-content">
          <h4>Confirm</h4>
          <p>You have not chosen a reward. Are you sure you want to go back?</p>
          <div class="modal-actions">
            <button @click="showConfirm = false" class="modal-btn btn-cancel">Cancel</button>
            <button @click="confirmBack" class="modal-btn btn-confirm">Confirm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Confirm Refresh Modal -->
    <transition name="fade">
      <div v-if="showRefreshConfirm" class="modal-overlay">
        <div class="modal-content">
          <h4>Refresh Skill Choices</h4>
          <p>This will cost <b>{{ refreshCost }}</b> Gold. Proceed?</p>
          <div class="modal-actions">
            <button @click="showRefreshConfirm = false" class="modal-btn btn-cancel">Cancel</button>
            <button @click="confirmRefresh" class="modal-btn btn-confirm">Confirm</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import type { Skill } from '../store/skillUtils'
import SkillChoiceButton from './SkillChoiceButton.vue'
import { useGameStore } from '../store/useGameStore'
import { calcHealCost } from '../store/battleUtils'


const props = defineProps<{
  skillChoices: Skill[],
  showRefresh?: boolean
}>()

const emit = defineEmits(['choose-skill', 'refresh-skill', 'back'])
const showConfirm = ref(false)
const showRefreshConfirm = ref(false)
const game = useGameStore()
const refreshCost = computed(() => {
  if (!game.character) return 0
  return calcHealCost(game.character, 30)
})

function confirmBack() {
  showConfirm.value = false
  emit('back')
}

function confirmRefresh() {
  if (game.userProfile.money < refreshCost.value) {
    alert('Not enough gold!')
    showRefreshConfirm.value = false
    return
  }
  game.userProfile.money -= refreshCost.value
  showRefreshConfirm.value = false
  emit('refresh-skill')
}
</script>

<style scoped>
/* === Gladiator Themed SkillChoicePanel === */

.skill-choice-panel {
  width: 100%;
  background: rgba(0,0,0,0.2);
  border: 2px solid #6b552d;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #6b552d;
}

.panel-title {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2c178;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.refresh-btn {
  background: #4a3c23;
  border: 2px solid #8a703d;
  color: #e2c178;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.refresh-btn:hover {
  background-color: #6b552d;
  border-color: #e2c178;
  transform: rotate(180deg);
}

.choices-grid {
  display: grid;
  /* << IMPORTANT >> This creates a responsive grid. */
  /* It creates as many columns as can fit, with each being at least 220px wide. */
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.panel-footer {
  text-align: center;
  margin-top: 2rem;
}

.back-btn {
  background: transparent;
  border: 2px solid #8a703d;
  color: #c8ab6b;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  background-color: #8a703d;
  color: #fff;
}

/* --- Confirmation Modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fdf6e7; /* Parchment background */
  color: #44341b;
  border-radius: 8px;
  border: 2px solid #8a703d;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.5);
}

.modal-content h4 {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}
.modal-content p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.modal-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border-width: 3px;
  border-style: solid;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel {
  background: linear-gradient(to bottom, #6b552d, #4a3c23);
  border-color: #c8ab6b;
  color: #fff;
}
.btn-cancel:hover {
  background: linear-gradient(to bottom, #8a703d, #6b552d);
}
.btn-confirm {
  background: linear-gradient(to bottom, #b71c1c, #8a1414);
  border-color: #ef4444;
  color: #fff;
}
.btn-confirm:hover {
  background: linear-gradient(to bottom, #c92c2c, #a02424);
}

/* Fade Transition for Modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>