<template>
  <div class="hp-bar-outer">
    <!-- บายด์คลาสสีแบบไดนามิก และกำหนดความกว้างเป็น % -->
    <div class="hp-bar-inner" :class="barClass" :style="{ width: percent + '%' }"></div>
    <span class="hp-bar-label">{{ value }} / {{ max }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// >> ADDED <<: เพิ่ม prop 'type' เพื่อรับค่าว่าเป็นของผู้เล่นหรือศัตรู
const props = withDefaults(defineProps<{
  value: number,
  max: number,
  type?: 'player' | 'enemy'
}>(), {
  type: 'player' // กำหนดค่าเริ่มต้นเป็น 'player'
})

const percent = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)))

// >> ADDED <<: Computed property สำหรับกำหนดคลาสสีของแถบ HP
const barClass = computed(() => {
  if (props.type === 'enemy') return 'hp-bar-enemy';
  if (percent.value > 60) return 'hp-bar-green';
  if (percent.value > 30) return 'hp-bar-yellow';
  return 'hp-bar-red';
})
</script>

<style scoped>
/* === Gladiator Themed HP Bar === */
.hp-bar-outer {
  position: relative;
  width: 100%; /* << CHANGED >> ทำให้ responsive กว้างเต็ม container */
  height: 22px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  border: 2px solid #5c451b;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); /* เงาด้านในสร้างมิติ */
  overflow: hidden;
}

.hp-bar-inner {
  height: 100%;
  border-radius: 4px 0 0 4px;
  transition: width 0.3s ease-out;
}


/* HP bar color stages for player */
.hp-bar-green {
  background: linear-gradient(to right, #4ade80, #22c55e);
  box-shadow: 0 0 8px #22c55e80;
}
.hp-bar-yellow {
  background: linear-gradient(to right, #fde68a, #facc15);
  box-shadow: 0 0 8px #facc1580;
}
.hp-bar-red {
  background: linear-gradient(to right, #ef4444, #b91c1c);
  box-shadow: 0 0 8px #b91c1c80;
}
.hp-bar-enemy {
  background: linear-gradient(to right, #ef4444, #b91c1c);
  box-shadow: 0 0 8px #b71c1c80;
}

.hp-bar-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 0.7em;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); /* เงาเข้มขึ้นเพื่อให้อ่านง่าย */
  pointer-events: none;
  letter-spacing: 0.25px;
  font-family: 'Cinzel', serif; /* << CHANGED >> ใช้ font หลักของธีม */
}
</style>