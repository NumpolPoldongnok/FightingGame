<template>
  <div class="cooldown-bar" :class="{ attacking: isAttacking }">
    <div class="cooldown-fill" :style="{ width: fillWidth + '%' }"></div>
    <transition name="attack-effect">
      <div v-if="isAttacking" class="attack-effect">Attacking!</div>
    </transition>
  </div>
  <span v-if="!isAttacking">Cooldown: {{ value }}/{{ max }}</span>
  <span v-else class="attacking-text">Attacking!</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ value: number, max: number }>()
const fillWidth = computed(() => {
  const percent = 100 - ((props.value ?? 0) / (props.max ?? 100)) * 100;
  return Math.max(0, Math.min(100, percent));
})
const isAttacking = computed(() => (props.value ?? 0) >= (props.max ?? 100))
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
  position: relative;
}
.cooldown-bar.attacking {
  box-shadow: 0 0 8px 2px #ffeb3b, 0 0 16px 4px #ff9800;
  animation: attack-glow 0.5s alternate infinite;
}
.cooldown-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.2s;
}
.attack-effect {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-weight: bold;
  font-size: 0.95rem;
  text-shadow: 0 0 6px #ff9800, 0 0 2px #fff;
  pointer-events: none;
  z-index: 2;
}
.attacking-text {
  color: #ff9800;
  font-weight: bold;
  margin-left: 0.5em;
}
@keyframes attack-glow {
  from { box-shadow: 0 0 8px 2px #ffeb3b, 0 0 16px 4px #ff9800; }
  to { box-shadow: 0 0 16px 6px #fff176, 0 0 32px 8px #ff9800; }
}
.attack-effect-enter-active, .attack-effect-leave-active {
  transition: opacity 0.3s;
}
.attack-effect-enter-from, .attack-effect-leave-to {
  opacity: 0;
}
.attack-effect-enter-to, .attack-effect-leave-from {
  opacity: 1;
}
</style>
