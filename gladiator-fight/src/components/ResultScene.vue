<script lang="ts" setup>
import { Character } from '../store/useGameStore';
import type { Skill } from '../store/skillUtils'
import CharacterStatus from './CharacterStatus.vue'
import HPBar from './HPBar.vue'
import { computed, onMounted } from 'vue';
import SkillChoicePanel from './SkillChoicePanel.vue'

const props = defineProps<{
  character: Character,
  skillChoices: Skill[]
}>()

defineEmits(['choose-skill', 'restart', 'back', 'refresh-skill'])

const win = computed(() => props.character.hp > 0)

onMounted(() => {
  console.log('Mounting ResultScene with skill choices:', props.skillChoices)
})
</script>

<template>
  <!-- Main container with dynamic class for win/lose state -->
  <div class="result-container" :class="win ? 'result-win' : 'result-lose'">

    <!-- Header showing the main result -->
    <header class="result-header">
      <h2 class="result-title">{{ win ? 'VICTORY' : 'DEFEAT' }}</h2>
      <p class="result-subtitle">{{ win ? 'You are triumphant in the arena!' : 'You have fallen...' }}</p>
    </header>

    <!-- Summary of earnings and streaks -->
    <div class="result-summary">
      <div class="summary-item">
        <span>Win Streak</span>
        <strong>{{ character.winStreak }}</strong>
      </div>
      <div v-if="win" class="summary-item">
        <span>Gold Earned</span>
        <strong class="gold-earned">+{{ character.lastMoneyEarned }}</strong>
      </div>
    </div>

    <!-- Character's final status -->
    <div class="character-final-status">
      <HPBar :value="character.hp" :max="character.maxHp" :type="win ? 'player' : 'enemy'" />
      <CharacterStatus :character="character" title="Final Status" :show-buttons="true" />
    </div>

    <!-- Main action panel based on result -->
    <template v-if="win">
      <SkillChoicePanel
        :skill-choices="skillChoices"
        @choose-skill="$emit('choose-skill', $event)"
        @refresh-skill="$emit('refresh-skill')"
        @back="$emit('back')"
      />
    </template>
    <template v-else>
      <div class="death-actions">
        <p>Your journey ends here... for now.</p>
        <button class="action-btn btn-restart" @click="$emit('restart')">RESTART</button>
        <button class="action-btn btn-back" @click="$emit('back')">BACK TO PREPARE</button>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* === Gladiator Themed Result Scene === */

.result-container {
  width: 100%;
  border-radius: 12px;
  border-width: 4px;
  border-style: solid;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  margin-top: 1rem;
  transition: all 0.3s ease-in-out;
}

/* --- THEMES --- */
.result-win {
  border-color: #e2c178;
  background: radial-gradient(circle, #4a3c1a 0%, #2a2a2a 70%);
  box-shadow: 0 5px 30px #e2c17844;
}
.result-lose {
  border-color: #8a1414;
  background: radial-gradient(circle, #4a1a1a 0%, #2a2a2a 70%);
  box-shadow: 0 5px 30px #b71c1c44;
}
/* -------------- */

.result-header {
  text-align: center;
  margin-bottom: 2rem;
}
.result-title {
  font-family: 'Cinzel', serif;
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.result-win .result-title {
  color: #f7d88b;
  text-shadow: 0 0 15px #f7d88b, 0 0 5px #fff;
}
.result-lose .result-title {
  color: #ef4444;
  text-shadow: 0 0 15px #ef4444;
}

.result-subtitle {
  font-size: 1.1rem;
  color: #c8ab6b;
  margin-top: 0.5rem;
  opacity: 0.8;
}

.result-summary {
  display: flex;
  justify-content: center;
  gap: 1rem;
  background-color: #fdf6e7;
  color: #44341b;
  border-radius: 8px;
  border: 2px solid #8a703d;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
  text-align: center;
}
.summary-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.summary-item span {
  font-size: 0.9rem;
  color: #6b552d;
  margin-bottom: 0.25rem;
}
.summary-item strong {
  font-size: 1.5rem;
  font-weight: 700;
}
.gold-earned {
  color: #b48d39;
}

.character-final-status {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.death-actions {
  text-align: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
}
.death-actions p {
  margin-bottom: 1.5rem;
  color: #c8ab6b;
}
.death-actions .action-btn {
  margin: 0 0.5rem;
}
.action-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border-width: 3px;
  border-style: solid;
  color: #fff;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.btn-restart {
  background: linear-gradient(to bottom, #b71c1c, #8a1414);
  border-color: #ef4444;
}
.btn-restart:hover {
  background: linear-gradient(to bottom, #c92c2c, #a02424);
}
.btn-back {
  background: linear-gradient(to bottom, #6b552d, #4a3c23);
  border-color: #c8ab6b;
}
.btn-back:hover {
  background: linear-gradient(to bottom, #8a703d, #6b552d);
}

@media (max-width: 640px) {
  .result-title {
    font-size: 2.5rem;
  }
  .result-container {
    padding: 1rem;
  }
}
</style>