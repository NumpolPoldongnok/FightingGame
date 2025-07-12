<template>
  <div>
    <h2>เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <p>ชื่อ: {{ character.name }} <span style="font-size:0.95em;color:#ffd700;">(Status รวม: {{ totalStatus(character) }})</span></p>
      <p>HP: {{ character.hp }} / {{ character.maxHp }}</p>
      <CharacterStatus :status="character.status" title="Status" />
      <div>
        <strong>Skill:</strong>
        <SkillList :skills="character.skills" />
      </div>
      <button @click="$emit('start-fight')" :disabled="character.hp <= 0">เข้าสู่ฉากต่อสู้</button>
      <button @click="$emit('open-townhall')" style="margin-left:1rem">เข้า Townhall</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '../store/useGameStore'
import CharacterStatus from './CharacterStatus.vue';

import SkillList from './SkillList.vue';

const props = defineProps<{
  character: Character
}>()

function totalStatus(c: Character) {
  return c.status.str + c.status.agi + c.status.vit + c.status.dex + c.status.int + c.status.luk
}
</script>
