<script setup lang="ts">
import type { Character } from '../store/useGameStore'
import { computed } from 'vue'
import CharacterPictureFrame from './CharacterPictureFrame.vue'

const props = defineProps<{ characterHistory: Character[] }>()
const emit = defineEmits(['back', 'fightHistory'])

// Group by winStreak descending, as an array for easier rendering
const groupedHistoryArr = computed(() => {
  if (!props.characterHistory) return [];
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
  <div class="history-container">
    <h2 class="history-title">HALL OF FAME</h2>

    <div class="history-groups">
      <details v-for="(group, idx) in groupedHistoryArr" :key="group.winStreak" class="history-group" :open="idx === 0">
        <summary class="group-summary">
          <div class="summary-title">
            <span class="win-icon">🏆</span>
            <span>{{ group.winStreak }} WINS STREAK</span>
          </div>
          <span class="character-count">{{ group.characters.length }} Fighters</span>
        </summary>
        <div class="character-grid">
          <div v-for="(c, cidx) in group.characters" :key="cidx" class="character-card">
            <div class="card-row">
              <CharacterPictureFrame :character="c" :size="48" />
              <strong class="character-name">{{ c.name }}</strong>
            </div>
            <span class="character-stats">Total Stats: {{ statusSum(c) }}</span>
            <span class="character-hp">HP: {{ c.hp }}/{{ c.maxHp }}</span>
            <button class="fight-history-btn" @click="emit('fightHistory', c)">Fight This Gladiator</button>
          </div>
        </div>
      </details>
    </div>

    <button @click="$emit('back')" class="back-btn">BACK TO ARENA</button>
  </div>
</template>

<style scoped>
/* === Gladiator Themed History Scene === */

.history-container {
  width: 100%;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 12px;
  border: 4px solid #6b552d;
  padding: 0.5rem 0.5rem;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  margin-top: 0.5rem;
}

.history-title {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 900;
  text-align: center;
  color: #e2c178;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  margin: 0 0 2rem 0;
}

.history-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-group {
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #6b552d;
}

.group-summary {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  list-style: none; /* Hide default arrow */
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;
  color: #c8ab6b;
}
.group-summary:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Custom arrow */
.group-summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 1rem;
  font-size: 0.8em;
  transition: transform 0.2s ease-in-out;
}
.history-group[open] > .group-summary::before {
  transform: rotate(90deg);
}
.summary-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  color: #e2c178;
}
.win-icon {
  font-size: 1.2em;
}
.character-count {
  font-size: 0.9rem;
  opacity: 0.7;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(0,0,0,0.1);
}

.character-card {
  background-color: #fdf6e7;
  color: #44341b;
  border-radius: 6px;
  border: 2px solid #8a703d;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  transition: all 0.2s;
}
.card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}
.character-name {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #6b552d;
  border-bottom: none;
  padding-bottom: 0;
}
.character-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.character-name {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #6b552d;
  border-bottom: 1px solid rgba(138, 112, 61, 0.2);
  padding-bottom: 0.5rem;
}
.character-stats, .character-hp {
  font-size: 0.9rem;
  font-weight: 600;
}

.back-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 3px solid #8a703d;
  color: #e2c178;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  width: 100%;
  margin-top: 2rem;
  background: transparent;
}
.back-btn:hover {
  background-color: #8a703d;
  color: #fff;
}
/* ...existing styles... */
.fight-history-btn {
  margin-top: 0.5rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.4rem 1.2rem;
  border-radius: 6px;
  border: 2px solid #b71c1c;
  color: #fff;
  background: #b71c1c;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.fight-history-btn:hover {
  background: #e53935;
  border-color: #e53935;
}
</style>