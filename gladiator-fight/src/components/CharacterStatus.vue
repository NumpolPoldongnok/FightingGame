<script lang="ts" setup>
import type { Status, Character } from '../store/useGameStore'
import { increaseStatus, decreaseStatus, canIncreaseStatus, canDecreaseStatus } from '../store/battleUtils'
import { computed } from 'vue'
const props = defineProps<{
  character: Character
  title?: string,
}>()

const showButtons = computed(() => !!props.character)
const statusKeys: (keyof Status)[] = ['str','agi','vit','dex','int','luk']
</script>

<template>
  <details class="status-fold" open="false">
    <summary class="status-summary">สถานะ</summary>
    <div class="status-container">
      <div class="player-status">
        <h3 v-if="title">{{ title }}</h3>
        <div class="status-point-row" v-if="showButtons">
          <span class="status-point-label">Status Point</span>
          <span class="status-point-value">{{ props.character?.statusPoint ?? 0 }}</span>
        </div>
        <ul class="status-grid">
          <li v-for="key in statusKeys" :key="key">
            <span class="stat-label">{{ key.toUpperCase() }}</span>
            <span class="stat-value">{{ character.status[key] }}</span>
            <template v-if="showButtons">
              <button class="stat-btn stat-btn-plus" :disabled="!canIncreaseStatus(props.character!, key)" @click="increaseStatus(props.character!, key)">+</button>
              <button class="stat-btn stat-btn-minus" :disabled="!canDecreaseStatus(props.character!, key)" @click="decreaseStatus(props.character!, key)">-</button>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </details>
</template>

<style scoped>
.status-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Allow the status card to shrink/grow as needed */
  min-width: 0;
  min-height: 0;
}
.player-status {
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  border-radius: 16px;
  padding: 1.1rem 1.7rem 1.2rem 1.7rem;
  min-width: 180px;
  max-width: 100%;
  width: 100%;
  margin-bottom: 0.7rem;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  border: 2px solid #b2c7e1;
  box-sizing: border-box;
  overflow-x: auto;
}
.status-grid {
  display: flex;
  flex-direction: column;
  gap: 0.3rem 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.status-grid li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.7);
  border-radius: 10px;
  padding: 0.22em 1em;
  margin-bottom: 0.13em;
  font-size: 1.13em;
  box-shadow: 0 1px 6px #b2c7e122;
  border: 1.5px solid #e3eafc;
}
.stat-label {
  font-weight: 700;
  color: #5b7bb2;
  letter-spacing: 1.2px;
  font-family: 'Montserrat', 'Prompt', Arial, sans-serif;
  font-size: 1.08em;
}
.stat-value {
  color: #43a047;
  font-weight: 700;
  margin-left: 0.7em;
  font-size: 1.08em;
  text-shadow: 0 1px 0 #fff8;
}
.player-status h3 {
  margin: 0 0 0.7rem 0;
  font-size: 1.18em;
  color: #5b7bb2;
  font-family: 'Montserrat', 'Prompt', Arial, sans-serif;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 0 #fff8;
}
/* Foldable status block (copied from FightScene.vue for reuse) */
.status-fold {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border-radius: 8px;
  background: #f7fafd;
  box-shadow: 0 1px 4px #b2c7e122;
  border: 1.5px solid #b2c7e1;
  padding: 0.2em 0.7em 0.5em 0.7em;
}
.status-summary {
  font-weight: 600;
  font-size: 1em;
  color: #2d3142;
  cursor: pointer;
  outline: none;
  padding: 0.2em 0;
}
.status-fold[open] .status-summary {
  color: #43e97b;
}

.status-point-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5em;
  margin-bottom: 0.5em;
}
.status-point-label {
  color: #5b7bb2;
  font-weight: 600;
  font-size: 1.08em;
}
.status-point-value {
  color: #ffd700;
  font-weight: 700;
  font-size: 1.13em;
  background: #fffbe6;
  border-radius: 8px;
  padding: 0.1em 0.7em;
}
.stat-btn {
  margin-left: 0.4em;
  margin-right: 0.1em;
  font-size: 1.1em;
  font-weight: 700;
  border-radius: 6px;
  border: 1.5px solid #b2c7e1;
  background: #e3eafc;
  color: #5b7bb2;
  padding: 0.1em 0.5em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.stat-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.stat-btn-plus {
  background: linear-gradient(90deg, #43e97b 60%, #38f9d7 100%);
  color: #fff;
  border-color: #43e97b;
}
.stat-btn-plus:active, .stat-btn-plus:focus {
  background: #43e97b;
  color: #fff;
}
.stat-btn-minus {
  background: linear-gradient(90deg, #e53935 60%, #f7baba 100%);
  color: #fff;
  border-color: #e53935;
}
.stat-btn-minus:active, .stat-btn-minus:focus {
  background: #e53935;
  color: #fff;
}
</style>