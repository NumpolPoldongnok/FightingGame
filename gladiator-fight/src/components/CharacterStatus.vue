<template>
  <div class="player-status">
    <h3 v-if="title">{{ title }}</h3>
    <ul class="status-grid">
      <li><span class="stat-label">STR</span><span class="stat-value">{{ status.str }}</span></li>
      <li><span class="stat-label">AGI</span><span class="stat-value">{{ status.agi }}</span></li>
      <li><span class="stat-label">VIT</span><span class="stat-value">{{ status.vit }}</span></li>
      <li><span class="stat-label">DEX</span><span class="stat-value">{{ status.dex }}</span></li>
      <li><span class="stat-label">INT</span><span class="stat-value">{{ status.int }}</span></li>
      <li><span class="stat-label">LUK</span><span class="stat-value">{{ status.luk }}</span></li>
      <li><span class="stat-label">CHA</span><span class="stat-value">{{ status.cha }}</span></li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { Status } from '../store/useGameStore'
const props = defineProps<{
  status: Status,
  title?: string
}>()
</script>

<style scoped>
.player-status {
  background: #232323;
  color: #fff;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  min-width: 180px;
  margin-bottom: 0.5rem;
}
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 1.2rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.status-grid li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #292929;
  border-radius: 6px;
  padding: 0.18em 0.7em;
  margin-bottom: 0.1em;
  font-size: 1.08em;
  box-shadow: 0 1px 4px #0002;
}
.stat-label {
  font-weight: bold;
  color: #ffd700;
  letter-spacing: 1px;
}
.stat-value {
  color: #4caf50;
  font-weight: bold;
  margin-left: 0.7em;
}
.player-status h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1em;
  color: #ffd700;
}
</style>
