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
  <div class="skill-list">
    <template v-for="(skill, i) in skills" :key="i">
      <span
        class="skill-icon"
        @mouseenter="showDetail(i)"
        @mouseleave="hideDetail"
        tabindex="0"
        @focus="showDetail(i)"
        @blur="hideDetail"
      >
        <span>
          <span v-if="skill.buff" class="stat-label buff">[+{{ skill.buff.statusType }}]</span>
          <span v-if="skill.debuff" class="stat-label debuff">[-{{ skill.debuff.statusType }}]</span>
        </span>
        <div v-if="hovered === i" class="skill-popup">
          <strong>{{ skill.name }}</strong><br />
          <span>{{ skill.description }}</span>
          <div v-if="skill.buff">
            <span style="color: #4caf50;">Buff: {{ skill.buff }}</span>
          </div>
          <div v-if="skill.debuff">
            <span style="color: #e53935;">Debuff: {{ skill.debuff }}</span>
          </div>
          <div v-if="skill.value">
            <span>Value: {{ skill.value }}</span>
          </div>
          <div v-if="skill.multiply">
            <span>Multiply: ×{{ skill.multiply }}</span>
          </div>
        </div>
      </span>
      <template v-if="(i + 1) % maxPerRow === 0">
        <br />
      </template>
    </template>
  </div>
</template>

<style scoped>
 .skill-list {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
 }
 .stat-label {
  display: inline-block;
  font-weight: bold;
  font-size: 1.1em;
  margin: 0 2px;
 }
 .buff {
  color: #4caf50;
 }
 .debuff {
  color: #e53935;
 }
.skill-icon {
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-size: 1.6em;
}
.icon-img {
  width: 32px;
  height: 32px;
  vertical-align: middle;
}
.skill-popup {
  position: absolute;
  left: 50%;
  top: 110%;
  transform: translateX(-50%);
  background: #232323;
  color: #fff;
  border-radius: 8px;
  padding: 0.7em 1.1em;
  min-width: 180px;
  box-shadow: 0 2px 12px #000a;
  z-index: 10;
  font-size: 1em;
  white-space: pre-line;
}
</style>
