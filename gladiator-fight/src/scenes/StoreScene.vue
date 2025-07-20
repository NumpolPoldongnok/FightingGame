<script setup lang="ts">
const emit = defineEmits(['close'])

import { useGameStore } from '../store/useGameStore'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import * as battleUtils from '../store/battleUtils'

const game = useGameStore()
const { character, userProfile } = storeToRefs(game)

const heal20Cost = computed(() => character.value ? battleUtils.calcHealCost(character.value, 20) : 20)
const heal100Cost = computed(() => character.value ? battleUtils.calcHealCost(character.value, 100) : 80)
const healError = ref('')

const canHeal20 = computed(() => character.value && character.value.hp < character.value.maxHp && (userProfile.value.money >= heal20Cost.value))
const canHeal100 = computed(() => character.value && character.value.hp < character.value.maxHp && (userProfile.value.money >= heal100Cost.value))

function buyHeal(percent: number) {
  if (!character.value) return
  const cost = percent === 100 ? heal100Cost.value : heal20Cost.value
  if (userProfile.value.money < cost) {
    healError.value = 'Not enough gold.'
    return
  }
  if (character.value.hp >= character.value.maxHp) {
    healError.value = 'Already at full HP.'
    return
  }
  userProfile.value.money -= cost
  const healAmount = percent === 100 ? character.value.maxHp : Math.floor(character.value.maxHp * 0.2)
  character.value.hp = Math.min(character.value.hp + healAmount, character.value.maxHp)
  healError.value = ''
}
</script>

<template>
  <div class="store-container">
    <button class="close-btn" @click="emit('close')">&times;</button>
    <h2 class="store-title">Townhall: Healing Services</h2>
    <div v-if="character" class="heal-options">
      <div class="heal-option">
        <span>Heal 20% HP</span>
        <button :disabled="!canHeal20" @click="buyHeal(20)">Buy ({{ heal20Cost }})</button>
      </div>
      <div class="heal-option">
        <span>Heal 100% HP</span>
        <button :disabled="!canHeal100" @click="buyHeal(100)">Buy ({{ heal100Cost }})</button>
      </div>
      <div class="current-hp">Current HP: {{ character.hp }} / {{ character.maxHp }}</div>
      <div class="current-gold">Gold: {{ userProfile.money }}</div>
      <div v-if="healError" class="heal-error">{{ healError }}</div>
    </div>
    <div v-else class="no-character">No character available.</div>
  </div>
</template>

<style scoped>
.store-container {
  max-width: 400px;
  margin: 2rem auto;
  background: #2a2a2a;
  border: 3px solid #e2c178;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  color: #fdecc4;
  box-shadow: 0 4px 24px #000a;
  text-align: center;
  position: relative;
}
.store-title {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 900;
  color: #e2c178;
  margin-bottom: 2rem;
}
.heal-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.heal-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #3a3a3a;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
}
.heal-option button {
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  border: 2px solid #f7d88b;
  color: #3a2e15;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.heal-option button:disabled {
  background: #888;
  color: #ccc;
  border-color: #aaa;
  cursor: not-allowed;
}
.current-hp, .current-gold {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #e2c178;
}
.heal-error {
  color: #ef4444;
  margin-top: 0.5rem;
  font-weight: bold;
}
.no-character {
  color: #ef4444;
  font-weight: bold;
  margin-top: 2rem;
}
.close-btn {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: #fdecc4;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #e2c178;
}
</style>
