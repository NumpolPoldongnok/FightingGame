<template>
  <div class="cooldown-bar">
    <div class="cooldown-fill" :style="{ width: fillWidth + '%' }"></div>
  </div>
  <span>Cooldown: {{ value }}/100</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ value: number }>()
const fillWidth = computed(() => 100 - (props.value ?? 0))
</script>

<style scoped>
.cooldown-bar {
  width: 100px;
  height: 12px;
  background: #333;
  border-radius: 6px;
  margin: 4px 0;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
}
.cooldown-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.2s;
}
</style>
