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

const maxPerRow = 6

</script>

<template>
  <details class="skill-list-fold genshin-skill-list-outer" :open="false">
    <summary class="skill-list-summary genshin-skill-list-summary">
      <span class="genshin-skill-list-title">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:0.4em;"><circle cx="11" cy="11" r="10" fill="#e3eafc" stroke="#b2c7e1" stroke-width="2"/><path d="M11 6v5l3 3" stroke="#5b7bb2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Skill ทั้งหมด ({{ skills.length }})
      </span>
    </summary>
    <div class="skill-list genshin-skill-list">
      <template v-for="(skill, i) in skills" :key="i">
        <span
          class="skill-icon genshin-skill genshin-skill-btn"
          @mouseenter="showDetail(i)"
          @mouseleave="hideDetail"
          tabindex="0"
          @focus="showDetail(i)"
          @blur="hideDetail"
        >
          <span class="genshin-labels">
            <span v-if="skill.buff" class="stat-label buff genshin-buff">[+{{ skill.buff.statusType.toUpperCase() }}]</span>
            <span v-if="skill.debuff" class="stat-label debuff genshin-debuff">[-{{ skill.debuff.statusType.toUpperCase() }}]</span>
          </span>
          <div v-if="hovered === i" class="skill-popup genshin-popup genshin-skill-popup">
            <div class="genshin-popup-header">
              <span class="genshin-popup-title">{{ skill.name }}</span>
            </div>
            <div class="genshin-popup-desc">{{ skill.description }}</div>
            <div v-if="skill.buff" class="genshin-popup-buff">
              <span>Buff: <b class="genshin-buff">{{ skill.buff.statusType.toUpperCase() }}</b>
                <span v-if="skill.buff.value">+{{ skill.buff.value }}</span>
                <span v-if="skill.buff.multiply"> ×{{ skill.buff.multiply }}</span>
              </span>
            </div>
            <div v-if="skill.debuff" class="genshin-popup-debuff">
              <span>Debuff: <b class="genshin-debuff">{{ skill.debuff.statusType.toUpperCase() }}</b>
                <span v-if="skill.debuff.value">-{{ skill.debuff.value }}</span>
                <span v-if="skill.debuff.multiply"> ×{{ skill.debuff.multiply }}</span>
              </span>
            </div>
          </div>
        </span>
        <template v-if="(i + 1) % maxPerRow === 0">
          <br />
        </template>
      </template>
    </div>
  </details>
</template>

<style scoped>
 .skill-list {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
 }
.genshin-skill {
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-size: 1.5em;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  border: 2px solid #b2c7e1;
  border-radius: 12px;
  box-shadow: 0 2px 10px #b2c7e133, 0 1px 0 #fff8 inset;
  padding: 0.18em 0.7em 0.18em 0.7em;
  margin: 0.1em 0.1em;
  min-width: 48px;
  transition: border 0.2s, box-shadow 0.2s;
}
.genshin-skill:focus, .genshin-skill:hover {
  border: 2px solid #7ec6f5;
  box-shadow: 0 4px 16px #7ec6f577, 0 2px 0 #fff8 inset;
  background: linear-gradient(135deg, #e3f6fd 60%, #f7fafd 100%);
  outline: none;
}
.genshin-labels {
  display: flex;
  gap: 0.2em;
  align-items: center;
  justify-content: center;
}
.stat-label.genshin-buff {
  color: #43a047;
  font-weight: 700;
  letter-spacing: 1px;
  background: rgba(67,160,71,0.08);
  border-radius: 6px;
  padding: 0.05em 0.4em;
}
.stat-label.genshin-debuff {
  color: #e53935;
  font-weight: 700;
  letter-spacing: 1px;
  background: rgba(229,57,53,0.08);
  border-radius: 6px;
  padding: 0.05em 0.4em;
}
.genshin-popup {
  position: absolute;
  left: 50%;
  top: 110%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  border-radius: 12px;
  padding: 1em 1.3em 1.1em 1.3em;
  min-width: 210px;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  z-index: 10;
  font-size: 1.08em;
  white-space: pre-line;
  border: 1.5px solid #b2c7e1;
}
.genshin-popup-header {
  font-family: 'Montserrat', 'Prompt', Arial, sans-serif;
  font-size: 1.13em;
  font-weight: 700;
  color: #5b7bb2;
  margin-bottom: 0.2em;
  letter-spacing: 1.2px;
}
.genshin-popup-title {
  font-weight: 700;
  color: #5b7bb2;
}
.genshin-popup-desc {
  color: #3a3a3a;
  margin-bottom: 0.4em;
  font-size: 0.98em;
}
.genshin-popup-buff {
  color: #43a047;
  font-weight: 600;
  margin-bottom: 0.1em;
}
.genshin-popup-debuff {
  color: #e53935;
  font-weight: 600;
}
.genshin-skill-list-outer {
  margin-bottom: 0.7em;
  border-radius: 14px;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  box-shadow: 0 2px 12px #b2c7e122, 0 1.5px 0 #fff8 inset;
  border: 2px solid #b2c7e1;
  padding: 0.2em 0.7em 0.5em 0.7em;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.genshin-skill-list-summary {
  font-weight: 700;
  font-size: 1.13em;
  color: #5b7bb2;
  cursor: pointer;
  outline: none;
  padding: 0.2em 0;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
}
.genshin-skill-list-title {
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.genshin-skill-list {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 0.7em;
}
.genshin-skill-btn {
  font-size: 1.18em;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  border: 2.5px solid #b2c7e1;
  border-radius: 10px;
  box-shadow: 0 2px 10px #b2c7e133, 0 1px 0 #fff8 inset;
  padding: 0.18em 0.9em 0.18em 0.9em;
  margin: 0.1em 0.1em;
  min-width: 54px;
  transition: border 0.2s, box-shadow 0.2s, background 0.18s;
  font-weight: 600;
  color: #2d3142;
}
.genshin-skill-btn:focus, .genshin-skill-btn:hover {
  border: 2.5px solid #7ec6f5;
  box-shadow: 0 4px 16px #7ec6f577, 0 2px 0 #fff8 inset;
  background: linear-gradient(135deg, #e3f6fd 60%, #f7fafd 100%);
  outline: none;
}
.genshin-skill-popup {
  border-radius: 14px;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  border: 2px solid #b2c7e1;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  padding: 1em 1.3em 1.1em 1.3em;
  min-width: 220px;
  font-size: 1.08em;
}
</style>
