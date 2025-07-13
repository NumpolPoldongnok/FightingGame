<script lang="ts" setup>
import type { Status } from '../store/useGameStore'
const props = defineProps<{
  status: Status,
  title?: string
}>()
</script>

<template>
  <details class="status-fold" open="false">
    <summary class="status-summary">สถานะ</summary>
    <div class="status-container">
      <div class="player-status">
        <h3 v-if="title">{{ title }}</h3>
        <ul class="status-grid">
          <li><span class="stat-label">STR</span><span class="stat-value">{{ status.str }}</span></li>
          <li><span class="stat-label">AGI</span><span class="stat-value">{{ status.agi }}</span></li>
          <li><span class="stat-label">VIT</span><span class="stat-value">{{ status.vit }}</span></li>
          <li><span class="stat-label">DEX</span><span class="stat-value">{{ status.dex }}</span></li>
          <li><span class="stat-label">INT</span><span class="stat-value">{{ status.int }}</span></li>
          <li><span class="stat-label">LUK</span><span class="stat-value">{{ status.luk }}</span></li>
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
</style>