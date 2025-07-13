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
        <CharacterStatus :character="c" />
        <SkillList :skills="c.skills" />
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