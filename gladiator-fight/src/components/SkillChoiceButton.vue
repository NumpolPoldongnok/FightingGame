<template>
  <button @click="$emit('choose', index)" class="skill-choice-btn genshin">
    <div class="skill-header">
      <span class="skill-title">SKILL</span>
      <span class="skill-index">#{{ index + 1 }}</span>
    </div>
    <div class="skill-effects">
      <div v-if="skill.buff" class="buff-item genshin-effect">
        <span class="buff-label genshin-label">Buff</span>
        <span class="buff-type genshin-type">{{ skill.buff.statusType.toUpperCase() }}</span>
        <span v-if="Number(skill.buff.value) > 0" class="buff-value genshin-value">+{{ skill.buff.value }}</span>
        <span v-if="skill.buff.multiply && skill.buff.multiply !== '0%'" class="buff-mult genshin-mult">+{{ skill.buff.multiply }}</span>
      </div>
      <div v-if="skill.debuff" class="debuff-item genshin-effect">
        <span class="debuff-label genshin-label">Debuff</span>
        <span class="debuff-type genshin-type">{{ skill.debuff.statusType.toUpperCase() }}</span>
        <span v-if="Number(skill.debuff.value) > 0" class="debuff-value genshin-value">-{{ skill.debuff.value }}</span>
        <span v-if="skill.debuff.multiply && skill.debuff.multiply !== '0%'" class="debuff-mult genshin-mult">-{{ skill.debuff.multiply }}</span>
      </div>
    </div>
  </button>
</template>

<script lang="ts" setup>
import type { Skill } from '../store/skillUtils';
const props = defineProps<{
  skill: Skill,
  index: number
}>()
defineEmits(['choose'])
</script>

<style scoped>
.skill-choice-btn.genshin {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5em;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  border: 2.5px solid #b2c7e1;
  border-radius: 18px;
  box-shadow: 0 4px 18px 0 #b2c7e155, 0 1.5px 0 #fff8 inset;
  padding: 1.1em 1.6em 1.2em 1.6em;
  margin: 0.5em 0;
  min-width: 220px;
  transition: border 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.skill-choice-btn.genshin:hover {
  border: 2.5px solid #7ec6f5;
  box-shadow: 0 6px 24px 0 #7ec6f577, 0 2px 0 #fff8 inset;
  background: linear-gradient(135deg, #e3f6fd 60%, #f7fafd 100%);
}
.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2em;
}
.skill-title {
  font-family: 'Montserrat', 'Prompt', Arial, sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  color: #5b7bb2;
  letter-spacing: 2px;
  text-shadow: 0 1px 0 #fff8;
}
.skill-index {
  font-size: 0.95em;
  color: #b2c7e1;
  font-weight: 600;
}
.skill-effects {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}
.genshin-effect {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1.08em;
  border-radius: 8px;
  padding: 0.18em 0.7em 0.18em 0.4em;
  margin-bottom: 0.1em;
  background: rgba(255,255,255,0.7);
  box-shadow: 0 1px 4px #b2c7e122;
}
.buff-label.genshin-label {
  color: #43a047;
  font-weight: bold;
  margin-right: 0.2em;
  font-size: 1em;
}
.buff-type.genshin-type {
  color: #43a047;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 1.05em;
}
.buff-value.genshin-value, .buff-mult.genshin-mult {
  color: #66bb6a;
  font-weight: 600;
  font-size: 1.05em;
}
.debuff-label.genshin-label {
  color: #e53935;
  font-weight: bold;
  margin-right: 0.2em;
  font-size: 1em;
}
.debuff-type.genshin-type {
  color: #e53935;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 1.05em;
}
.debuff-value.genshin-value, .debuff-mult.genshin-mult {
  color: #ef9a9a;
  font-weight: 600;
  font-size: 1.05em;
}
</style>
