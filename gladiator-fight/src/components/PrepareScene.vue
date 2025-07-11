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
          <li v-for="(s, i) in character.skill" :key="i">{{ s }}</li>
        </ul>
      </div>
      <button @click="$emit('start-fight')" :disabled="character.hp <= 0">เข้าสู่ฉากต่อสู้</button>
      <button @click="$emit('open-townhall')" style="margin-left:1rem">เข้า Townhall</button>
    </div>
    <div v-if="deadCharacters && deadCharacters.length">
      <h3>ตัวละครที่ตายไปแล้ว</h3>
      <ul>
        <li v-for="(dead, idx) in deadCharacters" :key="idx">
          <strong>{{ dead.name }}</strong> | HP: {{ dead.hp }} |
          <span>Status: [STR:{{ dead.status.str }}, AGI:{{ dead.status.agi }}, VIT:{{ dead.status.vit }}, DEX:{{ dead.status.dex }}, INT:{{ dead.status.int }}, LUK:{{ dead.status.luk }}, CHA:{{ dead.status.cha }}]</span>
          <span> | Skill: <span v-for="(s, i) in dead.skill" :key="i">{{ s }} </span></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '../store/useGameStore'
const props = defineProps<{
  character: Character,
  deadCharacters?: Character[]
}>()

function totalStatus(c: Character) {
  return Object.values(skillStatusAll(c)).reduce((a, b) => a + b, 0)
}

// Calculate status after skill effects (for display)
function skillStatus(type: keyof Character['status']): number {
  // For now, just return character.status[type] (since skill effects are already applied)
  // If you want to show the original value, you need to store base status separately
  return props.character.status[type]
}
function skillStatusAll(c: Character) {
  // For now, just return c.status (since skill effects are already applied)
  return c.status
}
</script>
