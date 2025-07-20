<template>
  <div :class="bubbleClass">
    <div class="bubble-content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
const props = defineProps<{
  type: 'player' | 'enemy' | 'neutral'
}>()
const bubbleClass = computed(() => {
  if (props.type === 'player') return 'bubble bubble-player'
  if (props.type === 'enemy') return 'bubble bubble-enemy'
  return 'bubble bubble-neutral'
})
</script>

<style scoped>
.bubble {
  max-width: 70%;
  margin: 0.2rem 0;
  padding: 0.5rem 1rem;
  border-radius: 18px;
  font-size: 1rem;
  word-break: break-word;
  display: inline-block;
  box-shadow: 0 2px 8px #0002;
  position: relative;
}
.bubble-player {
  background: linear-gradient(90deg, #e2fbe2 80%, #b7e4c7 100%);
  color: #1b5e20;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  margin-right: auto;
}
.bubble-enemy {
  background: linear-gradient(90deg, #fde2e2 80%, #fbb6b6 100%);
  color: #b71c1c;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}
.bubble-neutral {
  background: #fdf6e7;
  color: #44341b;
  align-self: center;
  border-radius: 18px;
  margin-left: auto;
  margin-right: auto;
}
.bubble-content {
  white-space: pre-line;
}
</style>
