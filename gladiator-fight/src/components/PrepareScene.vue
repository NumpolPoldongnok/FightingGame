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
          </li>
          <li>
            AGI: {{ character.status.agi }}
          </li>
          <li>
            VIT: {{ character.status.vit }}
          </li>
          <li>
            DEX: {{ character.status.dex }}
          </li>
          <li>
            INT: {{ character.status.int }}
          </li>
          <li>
            LUK: {{ character.status.luk }}
          </li>
          <li>
            CHA: {{ character.status.cha }}
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

import type { Character } from '../store/useGameStore'

const props = defineProps<{
  character: Character
}>()

function totalStatus(c: Character) {
  c.status.str + c.status.agi + c.status.vit + c.status.dex + c.status.int + c.status.luk + c.status.cha
}
</script>
