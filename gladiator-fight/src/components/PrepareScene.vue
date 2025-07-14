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
  <div class="gladiator-prepare-bg max-w-2xl mx-auto rounded-xl shadow-xl border-4 border-yellow-900 p-4 mt-4">
    <h2 class="text-2xl font-extrabold mb-4 text-center text-yellow-900 tracking-widest gladiator-title">เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <div class="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2 gladiator-header">
        <span class="text-xl font-bold text-yellow-900 gladiator-name">{{ character.name }}</span>
        <span class="text-base text-yellow-800 gladiator-status-sum">Status รวม: <span class="font-bold text-yellow-900">{{ totalStatus(character) }}</span></span>
      </div>
      <div class="mb-2 text-yellow-800 gladiator-streak">ชนะติดต่อกัน: <span class="font-bold">{{ character.winStreak }}</span></div>
      <HPBar :value="character.hp" :max="character.maxHp" />
      <CharacterStatus :character="character" title="Status" :showButtons="true"/>
      <SkillList :skills="character.skills" />
      <div v-if="character.hp <= 0" class="mt-4 text-center">
        <p class="text-lg text-red-700 font-bold mb-2">ตายแล้ว</p>
        <button @click="$emit('restart')" class="gladiator-btn bg-gradient-to-r from-yellow-700 to-yellow-900 text-yellow-100 font-extrabold shadow-lg border-2 border-yellow-800 hover:from-yellow-800 hover:to-yellow-900 transition-colors px-6 py-2 rounded-lg">เกิดใหม่</button>
      </div>
      <template v-else>
        <div class="flex justify-center mt-4">
          <button @click="$emit('start-fight')" class="gladiator-btn bg-gradient-to-r from-yellow-700 to-yellow-900 text-yellow-100 font-extrabold shadow-lg border-2 border-yellow-800 hover:from-yellow-800 hover:to-yellow-900 transition-colors px-8 py-2 rounded-lg">เริ่มต่อสู้</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gladiator-prepare-bg {
  background: repeating-linear-gradient(135deg, #f9e7b3 0 40px, #f5d97c 40px 80px, #f9e7b3 80px 120px);
  box-shadow: 0 8px 32px #bfa10033, 0 1.5px 0 #fff8 inset;
}
.gladiator-title {
  text-shadow: 0 2px 0 #fff8, 0 4px 12px #bfa10044;
  letter-spacing: 0.15em;
  color: #181818 !important;
}
.gladiator-header {
  border-bottom: 2px solid #bfa100;
  padding-bottom: 0.3em;
}
.gladiator-name {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.04em;
  color: #181818 !important;
}
.gladiator-status-sum {
  font-family: 'Share Tech Mono', monospace;
  color: #181818 !important;
}
.gladiator-streak {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.1em;
  color: #181818 !important;
}
.gladiator-btn {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.08em;
  font-size: 1.13em;
  color: #181818 !important;
}
</style>
