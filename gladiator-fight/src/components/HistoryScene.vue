<template>
  <div>
    <h2>ประวัติตัวละครที่เคยใช้</h2>
    <div class="history-list">
      <div class="history-card" v-for="(c, idx) in characterHistory" :key="idx">
        <div class="history-header">
          <strong>{{ c.name }}</strong>
          <span class="win">🏆 {{ c.winStreak ?? 0 }}</span>
        </div>
        <div class="hp">HP: <span>{{ c.hp }}</span> / <span>{{ c.maxHp }}</span></div>
        <CharacterStatus :status="c.status" />
        <div class="skill-row">
          <span class="skill-label">Skill:</span>
          <SkillList :skills="c.skills" />
        </div>
      </div>
    </div>
    <button @click="$emit('back')">กลับ</button>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../store/useGameStore'
import SkillList from './SkillList.vue'
import CharacterStatus from './CharacterStatus.vue'
const props = defineProps<{ characterHistory: Character[] }>()
defineEmits(['back'])
</script>

<style scoped>
/* Modern card style for history */
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 1.5rem 0;
}
.history-card {
  background: #232323;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #000a;
  padding: 1.2rem 1.5rem 1rem 1.5rem;
  min-width: 260px;
  max-width: 320px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 2px solid #4caf50;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  margin-bottom: 0.2rem;
}
.win {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.1rem;
}
.hp {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}
.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.97rem;
}
.stat b {
  color: #4caf50;
  font-weight: bold;
}
.skill-row {
  margin-top: 0.2rem;
  font-size: 0.97rem;
}
.skill-label {
  font-weight: bold;
  margin-right: 0.3rem;
}
.skill-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.skill-item {
  background: #333;
  color: #fff;
  border-radius: 6px;
  padding: 0.1rem 0.5rem;
  font-size: 0.95em;
  border: 1px solid #555;
}
button {
  margin-top: 1.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: #4caf50;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #388e3c;
}
</style>
