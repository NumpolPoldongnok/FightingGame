<template>
  <div>
    <h2>เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <p>ชื่อ: {{ character.name }} <span style="font-size:0.95em;color:#ffd700;">(Status รวม: {{ totalStatus(character) }})</span></p>
      <p>HP: {{ character.hp }} / {{ character.maxHp }}</p>
      <div>
        <strong>Status:</strong>
        <ul>
          <li>
            STR: {{ character.status.str }}
            <span v-if="skillStatus('str') !== character.status.str" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('str') }})</span>
          </li>
          <li>
            AGI: {{ character.status.agi }}
            <span v-if="skillStatus('agi') !== character.status.agi" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('agi') }})</span>
          </li>
          <li>
            VIT: {{ character.status.vit }}
            <span v-if="skillStatus('vit') !== character.status.vit" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('vit') }})</span>
          </li>
          <li>
            DEX: {{ character.status.dex }}
            <span v-if="skillStatus('dex') !== character.status.dex" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('dex') }})</span>
          </li>
          <li>
            INT: {{ character.status.int }}
            <span v-if="skillStatus('int') !== character.status.int" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('int') }})</span>
          </li>
          <li>
            LUK: {{ character.status.luk }}
            <span v-if="skillStatus('luk') !== character.status.luk" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('luk') }})</span>
          </li>
          <li>
            CHA: {{ character.status.cha }}
            <span v-if="skillStatus('cha') !== character.status.cha" style="color:#ffd700; font-size:0.95em;"> ({{ skillStatus('cha') }})</span>
          </li>
        </ul>
      </div>
      <div>
        <strong>Skill:</strong>
        <ul>
          <li v-for="(s, i) in character.skills" :key="i">{{ s }}</li>
        </ul>
      </div>
      <button @click="$emit('start-fight')" :disabled="character.hp <= 0">เข้าสู่ฉากต่อสู้</button>
      <button @click="$emit('open-townhall')" style="margin-left:1rem">เข้า Townhall</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character, Status } from '../store/useGameStore'

const props = defineProps<{
  character: Character
}>()

function totalStatus(c: Character) {
  return Object.values(skillStatusAll(c)).reduce((a, b) => a + b, 0)
}

// Calculate status after skill effects (for display)
function skillStatus(type: keyof Character['status']): number {
  // Defensive: Only process if character.skill is an array of Skill objects
  let val = props.character.status[type]
  if (Array.isArray(props.character.skills)) {
    for (const skill of props.character.skills) {
      // Defensive: skip if not a Skill object
      if (!skill || typeof skill !== 'object' || !('buff' in skill)) continue;
      // Buff
      if (skill.buff && skill.buff.statusType === type) {
        if (skill.buff.value && !skill.buff.multiply) {
          val += parseInt(skill.buff.value)
        }
        if (skill.buff.multiply && skill.buff.multiply !== '0%' && skill.buff.multiply !== '0.00%') {
          val = Math.floor(val * (1 + parseFloat(skill.buff.multiply.replace('%',''))/100))
        }
      }
      // Debuff
      if (skill.debuff && skill.debuff.statusType === type) {
        if (skill.debuff.value && !skill.debuff.multiply) {
          val -= parseInt(skill.debuff.value)
        }
        if (skill.debuff.multiply && skill.debuff.multiply !== '0%' && skill.debuff.multiply !== '0.00%') {
          val = Math.floor(val * (1 - parseFloat(skill.debuff.multiply.replace('%',''))/100))
        }
        if (val < 0) val = 0
      }
    }
  }
  return val
}

function skillStatusAll(c: Character) {
  if (props.character.status && Array.isArray(props.character.skills)) {
    const result: Record<string, number> = { ...props.character.status }
    for (const type of Object.keys(result)) {
      result[type] = skillStatus(type as keyof Character['status'])
    }
    return result as Status
  }
  return c.status
}
</script>
