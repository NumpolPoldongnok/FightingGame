<template>
  <button @click="$emit('choose', index)" class="skill-choice-btn">
    <!-- Header Section -->
    <div class="skill-header">
      <span class="skill-title">SKILL OFFERED</span>
      <span class="skill-index">#{{ index + 1 }}</span>
    </div>

    <!-- Effects Section -->
    <div class="skill-effects">
      <div v-if="skill.buff" class="effect-item">
        <span class="effect-label buff-label">BUFF</span>
        <span class="effect-type">{{ skill.buff.statusType.toUpperCase() }}</span>
        <div class="value-group">
          <span v-if="skill.buff.value && Number(skill.buff.value) > 0" class="effect-value buff-value">+{{ skill.buff.value }}</span>
          <span v-if="skill.buff.multiply && skill.buff.multiply !== '0%'" class="effect-value buff-value">+{{ skill.buff.multiply }}</span>
        </div>
      </div>
      <div v-if="skill.debuff" class="effect-item">
        <span class="effect-label debuff-label">DEBUFF</span>
        <span class="effect-type">{{ skill.debuff.statusType.toUpperCase() }}</span>
        <div class="value-group">
          <span v-if="skill.debuff.value && Number(skill.debuff.value) > 0" class="effect-value debuff-value">-{{ skill.debuff.value }}</span>
          <span v-if="skill.debuff.multiply && skill.debuff.multiply !== '0%'" class="effect-value debuff-value">-{{ skill.debuff.multiply }}</span>
        </div>
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
/* === Gladiator Themed SkillChoiceButton === */

.skill-choice-btn {
  /* << IMPORTANT >> Responsive and layout settings */
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* Fill the grid cell */
  text-align: left;
  
  /* Thematic styling */
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border: 2px solid #8a703d;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.skill-choice-btn:hover {
  transform: translateY(-5px);
  border-color: #e2c178;
  box-shadow: 0 8px 20px rgba(226, 193, 120, 0.2);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #6b552d;
}

.skill-title {
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #c8ab6b;
  letter-spacing: 0.1em;
}

.skill-index {
  font-size: 0.9rem;
  color: #8a703d;
  font-weight: 600;
}

.skill-effects {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1; /* Allow this part to fill remaining space */
}

.effect-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #fdf6e7;
  border-radius: 6px;
  padding: 0.5rem;
  color: #44341b;
}

.effect-label {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #fff;
}
.buff-label { background-color: #2b6b3e; }
.debuff-label { background-color: #b71c1c; }

.effect-type {
  font-weight: 600;
  font-size: 0.9rem;
}

.value-group {
  margin-left: auto; /* << IMPORTANT >> Pushes values to the right */
  display: flex;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.buff-value { color: #1b5e20; }
.debuff-value { color: #b71c1c; }
</style>