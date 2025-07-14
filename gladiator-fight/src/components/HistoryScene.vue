<script setup lang="ts">
import type { Character } from '../store/useGameStore'
import SkillList from './SkillList.vue'
import CharacterStatus from './CharacterStatus.vue'
const props = defineProps<{ characterHistory: Character[] }>()
defineEmits(['back'])

import { computed } from 'vue'
// Group by winStreak descending, as array for easier rendering
const groupedHistoryArr = computed(() => {
  const groups: Record<number, Character[]> = {}
  for (const c of props.characterHistory) {
    const ws = c.winStreak ?? 0
    if (!groups[ws]) groups[ws] = []
    groups[ws].push(c)
  }
  // Convert to array and sort by winStreak descending
  return Object.entries(groups)
    .map(([winStreak, characters]) => ({ winStreak: Number(winStreak), characters }))
    .sort((a, b) => b.winStreak - a.winStreak)
})

const statusSum = (c: Character) => {
  const s = c.status
  return s.str + s.agi + s.vit + s.dex + s.int + s.luk
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto gladiator-bg min-h-screen rounded-2xl shadow-2xl border-8 border-yellow-800 mt-8 mb-8">
    <h2 class="text-2xl font-extrabold mb-6 text-center text-yellow-900 tracking-widest gladiator-title">ประวัตินักสู้ผู้กล้า</h2>
    <div v-for="(group, idx) in groupedHistoryArr" :key="group.winStreak" class="mb-8">
      <div class="flex items-center gap-3 mb-4 bg-yellow-900/90 rounded-t-2xl px-6 py-3 gladiator-group-header border-b-8 border-yellow-700 shadow-lg gladiator-border">
        <span class="text-xl font-bold text-yellow-300 drop-shadow gladiator-crown">&#9876; {{ group.winStreak }}</span>
        <span class="text-base text-yellow-100 font-semibold">ชัยชนะต่อเนื่อง</span>
        <span class="ml-auto text-xs text-yellow-200 italic">{{ group.characters.length }} นักสู้</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-yellow-50/80 p-6 rounded-b-2xl gladiator-group-body border-2 border-yellow-200">
        <div v-for="(c, cidx) in group.characters" :key="cidx" class="history-card gladiator-card bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-50 border-4 border-yellow-700 rounded-2xl shadow-xl p-6 relative overflow-hidden hover:scale-105 transition-transform mt-2 mb-2">
          <div class="flex items-center justify-between mb-2">
            <strong class="truncate text-lg text-yellow-900 gladiator-name">{{ c.name }}</strong>
            <span class="text-xs text-yellow-800 gladiator-hp">HP: {{ c.hp }} / {{ c.maxHp }}</span>
          </div>
          <div class="text-xs text-yellow-700 mb-2 gladiator-status-sum">STATUS รวม: <span class="font-bold text-yellow-900">{{ statusSum(c) }}</span></div>
          <div class="absolute right-2 top-2 text-xs text-yellow-600 opacity-60 gladiator-badge">GLADIATOR</div>
        </div>
      </div>
    </div>
    <button @click="$emit('back')" class="mt-6 w-full py-2 rounded-lg bg-gradient-to-r from-yellow-700 to-yellow-900 text-yellow-100 font-extrabold shadow-lg border-2 border-yellow-800 hover:from-yellow-800 hover:to-yellow-900 transition-colors gladiator-btn">กลับสู่สนาม</button>
  </div>
</template>

<style scoped>
.gladiator-bg {
  background: repeating-linear-gradient(135deg, #f9e7b3 0 40px, #f5d97c 40px 80px, #f9e7b3 80px 120px);
  box-shadow: 0 8px 32px #bfa10033, 0 1.5px 0 #fff8 inset;
}
.gladiator-title {
  text-shadow: 0 2px 0 #fff8, 0 4px 12px #bfa10044;
  letter-spacing: 0.15em;
  color: #181818 !important;
}
.gladiator-group-header {
  background: linear-gradient(90deg, #a97c2f 0%, #7c5a1a 100%);
  border-radius: 1rem 1rem 0 0;
  border-bottom: 4px solid #bfa100;
  box-shadow: 0 2px 8px #bfa10033;
  color: #181818 !important;
}
.gladiator-crown {
  font-size: 1.5em;
  filter: drop-shadow(0 1px 0 #fff8);
  color: #181818 !important;
}
.gladiator-group-body {
  border-radius: 0 0 1rem 1rem;
  border-top: none;
  color: #181818 !important;
}
.gladiator-card {
  border: 2.5px solid #bfa100;
  box-shadow: 0 4px 16px #bfa10022, 0 1.5px 0 #fff8 inset;
  position: relative;
  color: #181818 !important;
}
.gladiator-name {
  letter-spacing: 0.04em;
  font-family: 'Cinzel', serif;
  color: #181818 !important;
}
.gladiator-hp {
  font-family: 'Share Tech Mono', monospace;
  color: #181818 !important;
}
.gladiator-status-sum {
  font-family: 'Share Tech Mono', monospace;
  color: #181818 !important;
}
.gladiator-badge {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.1em;
  pointer-events: none;
  color: #181818 !important;
}
.gladiator-btn {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.08em;
  color: #181818 !important;
}
</style>