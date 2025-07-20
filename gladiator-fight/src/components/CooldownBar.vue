<template>
  <div class="cooldown-container">
    <!-- Bar visuals -->
    <div class="cooldown-bar" :class="{ attacking: isAttacking }">
      <div class="cooldown-fill" :style="{ width: fillWidth + '%' }"></div>
    </div>
    <!-- Text label that changes based on state -->
    <span class="cooldown-label" :class="{ 'attacking-text': isAttacking }">
      <template v-if="isAttacking">READY!</template>
      <template v-else>{{ value }} / {{ max }}</template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ value: number, max: number }>()

// Cooldown logic: bar fills up as value approaches max
const fillWidth = computed(() => {
  if (isAttacking.value) {
    // If attacking, show full bar
    return 100;
  }
  const percent = (1 - ((props.value ?? 0) / (props.max ?? 100))) * 100;
  return Math.max(0, Math.min(100, percent));
})

const isAttacking = computed(() => (props.value ?? 0) >= (props.max ?? 100))
</script>

<style scoped>
/* === Gladiator Themed CooldownBar === */

.cooldown-container {
  /* << CHANGED >> Use flexbox for responsive alignment */
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%; /* Fit the parent container */
}

.cooldown-bar {
  flex-grow: 1; /* Allow the bar to take up available space */
  height: 14px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  border: 1px solid #5c451b;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.3s ease;
}

.cooldown-fill {
  height: 100%;
  background: linear-gradient(to right, #d39e3f, #ffc966);
  transition: width 0.1s linear; /* Use linear for smooth cooldown ticking */
}

.cooldown-label {
  font-family: 'Cinzel', serif;
  font-size: 0.9em;
  font-weight: 600;
  color: #c8ab6b;
  flex-shrink: 0; /* Prevent text from wrapping */
}

/* --- Attacking State --- */
.cooldown-bar.attacking {
  animation: attack-glow 1s infinite alternate;
}

.attacking-text {
  font-weight: 700;
  color: #ffc966;
  text-shadow: 0 0 5px #ff9800, 0 0 2px #fff;
  animation: text-glow 1s infinite alternate;
}

@keyframes attack-glow {
  from {
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 0 5px #ff9800;
  }
  to {
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 0 15px 3px #ff9800;
  }
}
@keyframes text-glow {
  from {
    text-shadow: 0 0 5px #ff9800, 0 0 2px #fff;
  }
  to {
    text-shadow: 0 0 10px #ff9800, 0 0 5px #ffc966;
  }
}
</style>