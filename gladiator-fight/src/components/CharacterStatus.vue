<script lang="ts" setup>
import type { Status } from '../types/game'
import type { Character } from '../types/game'
import { increaseStatus, canIncreaseStatus, canDecreaseStatus, putAllPointsToStatus, resetStatusKeyToOne } from '../store/statusUtils'
import { useGameStore } from '../store/useGameStore'

const props = defineProps<{
  character: Character
  title?: string,
  showButtons?: boolean,
}>()

const statusKeys: (keyof Status)[] = ['str', 'agi', 'vit', 'dex', 'int', 'luk']

const store = useGameStore()

function decreaseStatusWithCost(character: Character, key: keyof Status) {
  const cost = 1
  if (store.userProfile.money >= cost) {
    store.userProfile.money -= cost
    // @ts-ignore
    import('../store/statusUtils').then(mod => mod.decreaseStatus(character, key))
  } else {
    alert('เงินไม่พอสำหรับลดค่าสถานะ ต้องใช้ ' + cost + ' Gold')
  }
}

function putAllPoints(key: keyof Status) {
  putAllPointsToStatus(props.character, key)
}

function resetKeyToOne(key: keyof Status) {
  resetStatusKeyToOne(props.character, key)
}
</script>

<template>
  <details class="status-fold" open>
    <summary class="status-summary">
      <span v-if="title">{{ title }}</span>
      <span v-else>สถานะตัวละคร</span>
    </summary>
    <div class="status-card">
      <div v-if="showButtons && props.character?.statusPoint > 0" class="status-point-row">
        <span class="status-point-label">Status Point</span>
        <span class="status-point-value">{{ props.character?.statusPoint ?? 0 }}</span>
      </div>
      <ul class="status-grid">
        <li v-for="key in statusKeys" :key="key">
          <span class="stat-label">{{ key.toUpperCase() }}</span>
          <span class="stat-value">{{ character.status[key] }}</span>
          <div v-if="showButtons" class="stat-buttons">
            <button class="stat-btn stat-btn-minus" :disabled="!canDecreaseStatus(props.character!, key)" @click="decreaseStatusWithCost(props.character!, key)">-</button>
            <button class="stat-btn stat-btn-plus" :disabled="!canIncreaseStatus(props.character!, key)" @click="increaseStatus(props.character!, key)">+</button>
            <button class="stat-btn stat-btn-reset" :disabled="character.status[key] <= 1" @click="resetKeyToOne(key)">--</button>
            <button class="stat-btn stat-btn-all" :disabled="!(props.character.statusPoint > 0 && character.status[key] < 999)" @click="putAllPoints(key)">++</button>
          </div>
        </li>
      </ul>
    </div>
  </details>
</template>

<style scoped>
/* === Gladiator Themed Status Component === */

.status-fold {
  width: 100%;
}

.status-summary {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  color: #c8ab6b;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #6b552d;
  cursor: pointer;
  list-style: none; /* Hide default arrow */
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}
.status-summary:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Custom arrow */
.status-summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.75rem;
  font-size: 0.8em;
  transition: transform 0.2s ease-in-out;
}
.status-fold[open] > .status-summary::before {
  transform: rotate(90deg);
}

.status-card {
  /* << CHANGED >> width: 100% makes it responsive */
  width: 100%;
  background-color: #fdf6e7; /* Parchment background */
  color: #44341b; /* Dark text for readability */
  border-radius: 0 0 8px 8px;
  border: 2px solid #8a703d;
  border-top: none;
  padding: 1rem;
  box-sizing: border-box;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.status-point-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(138, 112, 61, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.status-point-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
}
.status-point-value {
  font-weight: 700;
  font-size: 1.2em;
  color: #c08d2c;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-grid li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(138, 112, 61, 0.2);
}
.status-grid li:last-child {
  border-bottom: none;
}

.stat-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #6b552d;
  flex-shrink: 0; /* Prevent label from shrinking */
}

.stat-value {
  font-weight: 700;
  font-size: 1.1em;
  margin-left: auto; /* Push value and buttons to the right */
}

.stat-buttons {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.stat-btn {
  font-family: sans-serif;
  font-weight: 900;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 24px;
  font-size: 1rem;
  line-height: 1;
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.stat-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.stat-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.stat-btn-plus, .stat-btn-all {
  background-color: #2b6b3e;
  border: 1px solid #4caf50;
}
.stat-btn-minus, .stat-btn-reset {
  background-color: #b71c1c;
  border: 1px solid #f44336;
}
/* Smaller font for multi-point buttons */
.stat-btn-all, .stat-btn-reset {
  font-size: 0.8rem;
}
</style>