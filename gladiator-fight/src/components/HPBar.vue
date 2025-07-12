<template>
  <div class="hp-bar-outer">
    <div class="hp-bar-inner" :style="{ width: percent + '%' }"></div>
    <span class="hp-bar-label">{{ value }} / {{ max }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
const props = defineProps<{ value: number, max: number }>()
const percent = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)))
</script>

<style scoped>
.hp-bar-outer {
  position: relative;
  width: 120px;
  height: 18px;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.3em;
  border: 1.5px solid #4caf50;
}
.hp-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 70%, #81c784 100%);
  transition: width 0.3s;
}
.hp-bar-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 0.98em;
  font-weight: bold;
  text-shadow: 0 0 3px #222;
  pointer-events: none;
}
</style>
