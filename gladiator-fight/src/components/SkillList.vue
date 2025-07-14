<script lang="ts" setup>
import { ref } from 'vue'
import type { Skill } from '../store/skillUtils'

const props = defineProps<{
  skills: Skill[]
}>()

const hovered = ref<number | null>(null)

function showDetail(i: number) {
  hovered.value = i
}
function hideDetail() {
  hovered.value = null
}
</script>

<template>
  <details class="skill-list-fold" open>
    <summary class="skill-list-summary">
      สกิลทั้งหมด ({{ skills.length }})
    </summary>
    <div class="skill-grid">
      <div
        v-for="(skill, i) in skills"
        :key="i"
        class="skill-item"
        @mouseenter="showDetail(i)"
        @mouseleave="hideDetail"
        tabindex="0"
        @focus="showDetail(i)"
        @blur="hideDetail"
      >
        <!-- Skill Label (Buff/Debuff) -->
        <span v-if="skill.buff" class="skill-label buff-label">[+{{ skill.buff.statusType.toUpperCase() }}]</span>
        <span v-if="skill.debuff" class="skill-label debuff-label">[-{{ skill.debuff.statusType.toUpperCase() }}]</span>
        
        <!-- Skill Details Popup -->
        <div v-if="hovered === i" class="skill-popup">
          <h4 class="popup-title">{{ skill.name }}</h4>
          <p class="popup-desc">{{ skill.description }}</p>
          <div v-if="skill.buff" class="popup-effect buff-effect">
            Buff: <b>{{ skill.buff.statusType.toUpperCase() }}</b>
            <span v-if="skill.buff.value"> +{{ skill.buff.value }}</span>
            <span v-if="skill.buff.multiply"> ×{{ skill.buff.multiply }}</span>
          </div>
          <div v-if="skill.debuff" class="popup-effect debuff-effect">
            Debuff: <b>{{ skill.debuff.statusType.toUpperCase() }}</b>
            <span v-if="skill.debuff.value"> -{{ skill.debuff.value }}</span>
            <span v-if="skill.debuff.multiply"> ×{{ skill.debuff.multiply }}</span>
          </div>
        </div>
      </div>
    </div>
  </details>
</template>

<style scoped>
/* === Gladiator Themed SkillList === */

.skill-list-fold {
  width: 100%; /* << CHANGED >> Fit container */
}

.skill-list-summary {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  color: #c8ab6b;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #6b552d;
  cursor: pointer;
  list-style: none; /* Hide default arrow */
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}
.skill-list-summary:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Custom arrow */
.skill-list-summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.75rem;
  font-size: 0.8em;
  transition: transform 0.2s ease-in-out;
}
.skill-list-fold[open] > .skill-list-summary::before {
  transform: rotate(90deg);
}

.skill-grid {
  display: flex;
  flex-wrap: wrap; /* << IMPORTANT >> Allows skills to wrap to the next line */
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(0,0,0,0.1);
  border-radius: 0 0 8px 8px;
  border: 2px solid #6b552d;
  border-top: none;
}

.skill-item {
  position: relative;
  background-color: #4a3c23;
  border: 2px solid #8a703d;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
  text-align: center;
}
.skill-item:hover, .skill-item:focus {
  border-color: #e2c178;
  box-shadow: 0 0 10px #e2c17880;
  background-color: #6b552d;
  outline: none;
}

.skill-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.9em;
}
.buff-label { color: #4caf50; }
.debuff-label { color: #f44336; }

/* Parchment-style popup */
.skill-popup {
  position: absolute;
  bottom: 115%; /* Position above the skill item */
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  z-index: 10;
  
  background-color: #fdf6e7;
  color: #44341b;
  border: 2px solid #8a703d;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
  text-align: left;
}
.popup-title {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #6b552d;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(138, 112, 61, 0.2);
}
.popup-desc {
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
  white-space: pre-wrap;
}
.popup-effect {
  font-size: 0.9rem;
  font-weight: 600;
}
.buff-effect { color: #1b5e20; }
.debuff-effect { color: #b71c1c; }
</style>