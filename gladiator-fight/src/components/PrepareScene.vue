<template>
  <div>
    <h2>เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <p>ชื่อ: {{ character.name }} <span style="font-size:0.95em;color:#ffd700;">(Status รวม: {{ totalStatus(character) }})</span></p>
      <HPBar :value="character.hp" :max="character.maxHp" />
      <CharacterStatus :status="character.status" title="Status" />
      <div>
        <strong>Skill:</strong>
        <SkillList :skills="character.skills" />
      </div>
      <div v-if="character.hp <= 0" style="margin-top:1em;">
        <p style="color:#ff5252;font-weight:bold;">ตายแล้ว</p>
        <button @click="$emit('restart')">เกิดใหม่</button>
      </div>
      <template v-else>
        <button @click="$emit('start-fight')">เข้าสู่ฉากต่อสู้</button>
        <button @click="$emit('open-townhall')" style="margin-left:1rem">เข้า Townhall</button>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '../store/useGameStore'
import CharacterStatus from './CharacterStatus.vue';
import HPBar from './HPBar.vue';
import SkillList from './SkillList.vue';

const props = defineProps<{
  character: Character
}>()

function totalStatus(c: Character) {
  return c.status.str + c.status.agi + c.status.vit + c.status.dex + c.status.int + c.status.luk
}
</script>
