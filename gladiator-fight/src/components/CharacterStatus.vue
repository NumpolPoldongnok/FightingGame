<template>
  <div class="player-status">
    <h3 v-if="title">{{ title }}</h3>
    <ul>
      <li>STR: {{ status.str }}</li>
      <li>AGI: {{ status.agi }}</li>
      <li>VIT: {{ status.vit }}</li>
      <li>DEX: {{ status.dex }}</li>
      <li>INT: {{ status.int }}</li>
      <li>LUK: {{ status.luk }}</li>
      <li>CHA: {{ status.cha }}</li>
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
.player-status ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.player-status li {
  margin-bottom: 0.2rem;
  font-size: 1.08em;
}
.player-status h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1em;
  color: #ffd700;
}
</style>
