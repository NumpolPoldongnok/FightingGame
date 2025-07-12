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
/* Genshin-style HP Bar */
.hp-bar-outer {
  position: relative;
  width: 140px;
  height: 20px;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.4em;
  border: 2.2px solid #b2c7e1;
  box-shadow: 0 2px 10px #b2c7e133, 0 1px 0 #fff8 inset;
}
.hp-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  box-shadow: 0 1px 8px #43e97b44;
  border-radius: 12px 0 0 12px;
  transition: width 0.3s cubic-bezier(.4,2,.6,1);
}
.hp-bar-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #2d3142;
  font-size: 0.92em;
  font-weight: 700;
  text-shadow: 0 1px 0 #fff8, 0 0 6px #b2c7e1aa;
  pointer-events: none;
  letter-spacing: 0.5px;
  font-family: 'Montserrat', 'Prompt', Arial, sans-serif;
}
</style>
