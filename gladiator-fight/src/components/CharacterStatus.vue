<script lang="ts" setup>
import type { Status } from '../types/game'
import type { Character } from '../types/game'
import { increaseStatus, canIncreaseStatus, canDecreaseStatus, putAllPointsToStatus, resetStatusKeyToOne } from '../store/statusUtils'
import { calcHealCost } from '../store/battleUtils'
import { useGameStore } from '../store/useGameStore'
import { onMounted, ref, watch } from 'vue'
import Popup from './Popup.vue'

const props = defineProps<{
  character: Character
  title?: string,
  showButtons?: boolean,
  foldOpen?: boolean
}>()


const statusKeys: (keyof Status)[] = ['str', 'agi', 'vit', 'dex', 'int', 'luk']
const store = useGameStore()

const showConfirm = ref(false)
const confirmAction = ref<'decrease'|'reset'|null>(null)
const confirmKey = ref<keyof Status|null>(null)
const confirmCost = ref(0)
const alwaysConfirm = ref(false)

function getDecreaseCost(character: Character, key: keyof Status) {
  // Cost is equal to heal 5% for this character
  return calcHealCost(character, 5)
}
function getResetCost(character: Character, key: keyof Status) {
  // Cost is status[key] * heal 5% for this character
  return character.status[key] * calcHealCost(character, 5)
}

function decreaseStatusWithCost(character: Character, key: keyof Status) {
  const cost = getDecreaseCost(character, key)
  if (alwaysConfirm.value) {
    doDecrease(character, key, cost)
  } else {
    confirmAction.value = 'decrease'
    confirmKey.value = key
    confirmCost.value = cost
    showConfirm.value = true
  }
}

function resetKeyToOneWithCost(key: keyof Status) {
  const cost = getResetCost(props.character, key)
  if (alwaysConfirm.value) {
    doReset(key, cost)
  } else {
    confirmAction.value = 'reset'
    confirmKey.value = key
    confirmCost.value = cost
    showConfirm.value = true
  }
}

function doDecrease(character: Character, key: keyof Status, cost: number) {
  if (store.userProfile.money >= cost) {
    store.userProfile.money -= cost
    // @ts-ignore
    import('../store/statusUtils').then(mod => mod.decreaseStatus(character, key))
  } else {
    alert('เงินไม่พอสำหรับลดค่าสถานะ ต้องใช้ ' + cost + ' Gold')
  }
}

function doReset(key: keyof Status, cost: number) {
  if (store.userProfile.money >= cost) {
    store.userProfile.money -= cost
    resetStatusKeyToOne(props.character, key)
  } else {
    alert('เงินไม่พอสำหรับรีเซ็ต ต้องใช้ ' + cost + ' Gold')
  }
}

function handleConfirm(ok: boolean) {
  if (ok && confirmAction.value && confirmKey.value !== null) {
    if (confirmAction.value === 'decrease') {
      doDecrease(props.character, confirmKey.value, confirmCost.value)
    } else if (confirmAction.value === 'reset') {
      doReset(confirmKey.value, confirmCost.value)
    }
  }
  showConfirm.value = false
  confirmAction.value = null
  confirmKey.value = null
  confirmCost.value = 0
}

function setAlwaysConfirm(val: boolean) {
  alwaysConfirm.value = val
}

function putAllPoints(key: keyof Status) {
  putAllPointsToStatus(props.character, key)
}

function resetKeyToOne(key: keyof Status) {
  resetKeyToOneWithCost(key)
}

// Fold open state controlled by prop, but can be toggled by user
const foldOpenState = ref(props.foldOpen !== false)
watch(() => props.foldOpen, (val) => {
  foldOpenState.value = val !== false
})
function toggleFold(e: Event) {
  // Only toggle if user clicks summary (not programmatically)
  foldOpenState.value = !foldOpenState.value
  // Prevent default summary toggle to keep it in sync
  e.preventDefault()
}

</script>

<template>
  <details class="status-fold" :open="foldOpenState">
    <summary class="status-summary" @click="toggleFold">
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

    <Popup v-model="showConfirm" customClass="status-confirm-popup">
      <div class="popup-content-wrapper">
        <h3 class="popup-confirm-title">ยืนยันการใช้ Gold</h3>
        <div class="popup-confirm-body">
          <p class="confirm-message" v-if="confirmAction === 'decrease'">
            คุณต้องการลดค่าสถานะ **{{ confirmKey && confirmKey.toUpperCase() }}** หรือไม่?
            <br>
            การดำเนินการนี้จะใช้ **{{ confirmCost }}** Gold
          </p>
          <p class="confirm-message" v-else-if="confirmAction === 'reset'">
            คุณต้องการรีเซ็ตค่าสถานะ **{{ confirmKey && confirmKey.toUpperCase() }}** กลับเป็น 1 หรือไม่?
            <br>
            การดำเนินการนี้จะใช้ **{{ confirmCost }}** Gold
          </p>
          <label class="popup-confirm-checkbox">
            <input type="checkbox" v-model="alwaysConfirm">
            <span>ไม่ต้องถามอีกในเซสชันนี้</span>
          </label>
        </div>
        <div class="popup-confirm-footer">
          <button class="popup-btn confirm-btn" @click="handleConfirm(true)">ยืนยัน</button>
          <button class="popup-btn cancel-btn" @click="handleConfirm(false)">ยกเลิก</button>
        </div>
      </div>
    </Popup>
  </details>
</template>

<style scoped>

/* === Gladiator Themed Status Component === */

/* Overall Popup Styling */
.status-confirm-popup :deep(.modal-content) {
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%); /* Darker, metallic background */
  border: 4px solid #b48d39; /* Gold border */
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem; /* Increased padding */
  max-width: 450px; /* Max width for better readability */
  color: #fdecc4; /* Light text for contrast */
}

.popup-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem; /* Spacing between sections */
}

/* Title */
.popup-confirm-title {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem; /* Larger title */
  font-weight: 800;
  color: #e2c178; /* Gold color for title */
  text-shadow: 0 0 8px rgba(226, 193, 120, 0.5); /* Subtle glow */
  margin: 0; /* Remove default margin */
  text-align: center;
}

/* Body */
.popup-confirm-body {
  text-align: center;
  font-size: 1rem;
  color: #fdecc4; /* Light text color */
  margin-bottom: 0.5rem; /* Space before checkbox */
}

.confirm-message {
  line-height: 1.5;
  margin-bottom: 1rem;
}

.confirm-message b {
  color: #e2c178; /* Highlight important details */
  font-weight: 700;
}

.cost-detail {
  display: block; /* New line for cost detail */
  font-size: 0.85em;
  color: #c8ab6b; /* Slightly muted color */
  margin-top: 0.4rem;
}

/* Checkbox */
.popup-confirm-checkbox {
  display: flex;
  align-items: center;
  justify-content: center; /* Center the checkbox and text */
  gap: 0.6rem;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #c8ab6b; /* Muted gold for checkbox text */
  cursor: pointer;
}

.popup-confirm-checkbox input[type="checkbox"] {
  accent-color: #e2c178; /* Gold accent for checkbox */
  width: 1.1em;
  height: 1.1em;
  cursor: pointer;
}

/* Footer and Buttons */
.popup-confirm-footer {
  display: flex;
  justify-content: center;
  gap: 1.5rem; /* Space between buttons */
  width: 100%; /* Ensure footer takes full width */
  margin-top: 1.5rem; /* Space above buttons */
}

.popup-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.7rem 2rem; /* Larger padding for buttons */
  border-radius: 8px; /* Slightly more rounded */
  border-width: 3px; /* Thicker border */
  border-style: solid;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
  text-transform: uppercase; /* Uppercase button text */
  letter-spacing: 0.05em; /* Slight letter spacing */
}

.confirm-btn {
  background: linear-gradient(to bottom, #4CAF50, #2E7D32); /* Green gradient */
  border-color: #81C784; /* Lighter green border */
  color: #fff;
  text-shadow: 0 1px 1px rgba(0,0,0,0.4);
}
.confirm-btn:hover {
  background: linear-gradient(to bottom, #66BB6A, #4CAF50);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.cancel-btn {
  background: linear-gradient(to bottom, #EF5350, #D32F2F); /* Red gradient */
  border-color: #FF8A80; /* Lighter red border */
  color: #fff;
  text-shadow: 0 1px 1px rgba(0,0,0,0.4);
}
.cancel-btn:hover {
  background: linear-gradient(to bottom, #E57373, #EF5350);
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.4);
}


/* === Original Status Component Styles (mostly unchanged) === */
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