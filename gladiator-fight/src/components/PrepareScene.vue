<script lang="ts" setup>
import type { Character } from '../store/useGameStore'
import CharacterStatus from './CharacterStatus.vue';
import HPBar from './HPBar.vue';
import SkillList from './SkillList.vue';


const props = defineProps<{
  character: Character
}>()

const emit = defineEmits(['start-fight', 'open-townhall', 'restart'])

function totalStatus(c: Character) {
  return c.status.str + c.status.agi + c.status.vit + c.status.dex + c.status.int + c.status.luk
}
</script>

<template>
    <h2>เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <div>
        <span>{{ character.name }}</span>
        <span> | Status รวม: {{ totalStatus(character) }}</span>
      </div>
      <div>
        <span>ชนะติดต่อกัน: {{ character.winStreak }}</span>
      </div>
      <HPBar :value="character.hp" :max="character.maxHp" />
      <CharacterStatus :character="character" title="Status" :showButtons="true"/>
      <SkillList :skills="character.skills" />
      <div v-if="character.hp <= 0">
        <p>ตายแล้ว</p>
        <button @click="$emit('restart')">เกิดใหม่</button>
      </div>
      <template v-else>
        <div>
          <button @click="$emit('start-fight')">เริ่มต่อสู้</button>
        </div>
      </template>
    </div>
</template>
