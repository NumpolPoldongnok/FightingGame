<template>
  <div class="create-container">
    <h2 class="create-title">FORGE A NEW GLADIATOR</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Name Input Section -->
      <div class="form-section">
        <label for="gladiator-name" class="section-label">Gladiator's Name</label>
        <input
          id="gladiator-name"
          v-model="name"
          maxlength="16"
          required
          class="name-input"
          placeholder="Enter name..."
        />
      </div>

      <!-- Status Allocation Section -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-label">Allocate Status Points</label>
          <span class="status-points-display">{{ statusUsed }} / {{ statusTotal }}</span>
        </div>
        <!-- Status Point Bar -->
        <div class="status-bar-outer">
          <div class="status-bar-inner" :style="{ width: statusBarWidth }"></div>
        </div>
        <!-- Status Grid -->
        <div class="status-grid">
          <div v-for="key in statusKeys" :key="key" class="status-row">
            <span class="status-key">{{ key.toUpperCase() }}</span>
            <div class="status-controls">
              <button type="button" @click="decrease(key)" :disabled="status[key] <= 1" class="stat-btn minus-btn">-</button>
              <span class="status-value">{{ status[key] }}</span>
              <button type="button" @click="increase(key)" :disabled="statusLeft <= 0" class="stat-btn plus-btn">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button type="submit" class="action-btn create-btn" :disabled="!isFormValid">
          Create
        </button>
        <button type="button" @click="$emit('cancel')" class="action-btn cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Status } from '../store/useGameStore'

const emit = defineEmits(['create', 'cancel'])
const name = ref('')
const statusTotal = 30
const status = ref<Status>({ str: 1, agi: 1, vit: 1, dex: 1, int: 1, luk: 1 })
const statusKeys = ['str', 'agi', 'vit', 'dex', 'int', 'luk'] as const

const statusUsed = computed(() => statusKeys.reduce((sum, k) => sum + (status.value[k] - 1), 0))
const statusLeft = computed(() => statusTotal - statusUsed.value)
const statusBarWidth = computed(() => `${(statusUsed.value / statusTotal) * 100}%`)

const isFormValid = computed(() => {
  return name.value.trim().length > 0 && statusLeft.value === 0
})

function increase(key: keyof typeof status.value) {
  if (statusLeft.value > 0) status.value[key]++
}
function decrease(key: keyof typeof status.value) {
  if (status.value[key] > 1) status.value[key]--
}

function handleSubmit() {
  if (isFormValid.value) {
    emit('create', { name: name.value.trim(), status: { ...status.value } })
  }
}
</script>

<style scoped>
/* === Gladiator Themed Create Character Scene === */
.create-container {
  width: 100%;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 12px;
  border: 4px solid #6b552d;
  padding: 2rem;
  box-sizing: border-box;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
  margin-top: 1rem;
}

.create-title {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 900;
  text-align: center;
  color: #e2c178;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  margin: 0 0 2rem 0;
}

.form-section {
  margin-bottom: 2rem;
}

.section-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #c8ab6b;
  margin-bottom: 0.75rem;
}

.name-input {
  width: 100%;
  background-color: #fdf6e7;
  border: 2px solid #8a703d;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: #44341b;
  font-size: 1.1rem;
  font-weight: 600;
  box-sizing: border-box;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
.name-input:focus {
  outline: none;
  border-color: #e2c178;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 10px #e2c17880;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.status-points-display {
  font-weight: 600;
  color: #fdecc4;
}

.status-bar-outer {
  width: 100%;
  height: 10px;
  background: rgba(0,0,0,0.3);
  border-radius: 5px;
  margin: 0.5rem 0 1rem 0;
  border: 1px solid #6b552d;
}
.status-bar-inner {
  height: 100%;
  background: linear-gradient(to right, #f7d88b, #c08d2c);
  border-radius: 5px;
  transition: width 0.2s ease-out;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  background-color: #fdf6e7;
  border: 2px solid #8a703d;
  border-radius: 6px;
  padding: 1rem;
}
.status-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.status-key {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #6b552d;
  width: 50px;
}
.status-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.stat-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.15s;
}
.stat-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.minus-btn { background-color: #b71c1c; border-color: #ef4444; }
.plus-btn { background-color: #2b6b3e; border-color: #4caf50; }
.status-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #44341b;
  width: 30px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2.5rem;
}
.action-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  border-width: 3px;
  border-style: solid;
  color: #fff;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.action-btn:disabled {
  background: #555;
  border-color: #777;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}
.create-btn {
  background: linear-gradient(to bottom, #c08d2c, #8a621c);
  border-color: #f7d88b;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.cancel-btn {
  background: linear-gradient(to bottom, #6b552d, #4a3c23);
  border-color: #c8ab6b;
}
</style>