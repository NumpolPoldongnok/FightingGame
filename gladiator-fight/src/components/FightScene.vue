<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { doBattleTurn, getLogClass } from '../store/battleUtilsFight'
import CooldownBar from './CooldownBar.vue'
import type { Character } from '../store/useGameStore'
import { toBattleFighter, setBattleMaxCooldown } from '../store/battleUtils'
import SkillList from './SkillList.vue'
import CharacterStatus from './CharacterStatus.vue'
import HPBar from './HPBar.vue'

const props = defineProps<{ character: Character, enemy: Character }>()

const maxCooldown = setBattleMaxCooldown(props.character.status.agi, props.enemy.status.agi)
const character = toBattleFighter(props.character)
const enemy = toBattleFighter(props.enemy)

const emit = defineEmits(['battle-finished', 'restart'])

const battleLog = ref<string[]>([])
const showFinishButton = ref(false)
const showRestartButton = ref(false)
const intervalRef = { value: undefined as any }
const speed = ref(1)
const baseInterval = 200

function onFinish(character: Character) {
  // Check if the player is the winner
  showFinishButton.value = character.hp > 0;
  // Show restart if the player lost
  showRestartButton.value = character.hp <= 0;
}

function doBattleTurnWrapper() {
  doBattleTurn(character, enemy, battleLog.value, onFinish, intervalRef)
}

function setSpeed(mult: number) {
  speed.value = mult
  if (intervalRef.value) {
    clearInterval(intervalRef.value)
    intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
  }
}

onMounted(() => {
  battleLog.value = ['### การต่อสู้เริ่มขึ้นแล้ว! ###']
  showFinishButton.value = false
  showRestartButton.value = false
  intervalRef.value = setInterval(doBattleTurnWrapper, baseInterval / speed.value)
})

onUnmounted(() => {
  clearInterval(intervalRef.value)
})
</script>

<template>
  <div class="fight-container">
    <!-- Battle Controls -->
    <div class="battle-controls">
      <div class="speed-controls">
        <span class="speed-label">SPEED:</span>
        <button :class="['control-btn', { active: speed === 1 }]" @click="setSpeed(1)">1x</button>
        <button :class="['control-btn', { active: speed === 2 }]" @click="setSpeed(2)">2x</button>
        <button :class="['control-btn', { active: speed === 4 }]" @click="setSpeed(4)">4x</button>
        <button :class="['control-btn', { active: speed === 8 }]" @click="setSpeed(8)">8x</button>
      </div>
      <div class="action-buttons">
        <button v-if="showFinishButton" class="control-btn finish-btn" @click="emit('battle-finished', character)">
          VICTORY
        </button>
        <button v-if="showRestartButton" class="control-btn restart-btn" @click="emit('restart')">
          DEFEAT
        </button>
      </div>
    </div>

    <!-- Battle Arena -->
    <div v-if="character && enemy" class="battle-arena">
      <!-- Player Card -->
      <div class="fighter-card player">
        <h3 class="fighter-name">{{ character.name }}</h3>
        <div class="fighter-content">
          <HPBar :value="character.hp" :max="character.maxHp" />
          <CharacterStatus :character="character" />
          <CooldownBar :value="character.cooldown ?? 0" :max="maxCooldown" />
          <SkillList :skills="character.skills.filter(s => s.active === true)" />
        </div>
      </div>

      <!-- VS Separator -->
      <div class="vs-separator">VS</div>

      <!-- Enemy Card -->
      <div class="fighter-card enemy">
        <h3 class="fighter-name">{{ enemy.name }}</h3>
        <div class="fighter-content">
          <HPBar :value="enemy.hp" :max="enemy.maxHp" />
          <CharacterStatus :character="enemy" />
          <CooldownBar :value="enemy.cooldown ?? 0" :max="maxCooldown" />
          <!-- BUG FIX: Display enemy's skills, not character's skills -->
          <SkillList :skills="enemy.skills.filter(s => s.active === true)" />
        </div>
      </div>
    </div>

    <!-- Battle Log -->
    <div class="log-scroll-area">
      <div v-for="(log, idx) in battleLog" :key="idx" :class="['log-entry', getLogClass(log)]">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gladiator Theme Battle UI */
.fight-container {
  color: #fdecc4;
  padding: 1rem 0;
}

/* Battle Controls */
.battle-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid #6b552d;
  border-radius: 12px;
}
.speed-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.speed-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #c8ab6b;
}
.control-btn {
  background-color: #4a3c23;
  color: #fdecc4;
  border: 2px solid #8a703d;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
}
.control-btn.active {
  background-color: #e2c178;
  color: #44341b;
  border-color: #fff;
  box-shadow: 0 0 10px #e2c178;
}
.control-btn:hover:not(.active) {
  background-color: #6b552d;
  border-color: #e2c178;
}
.finish-btn { background-color: #2b6b3e; border-color: #4caf50; }
.finish-btn:hover { background-color: #388e3c; }
.restart-btn { background-color: #b71c1c; border-color: #f44336; }
.restart-btn:hover { background-color: #d32f2f; }

/* Main combatants' display */
.battle-arena {
  display: flex;
  gap: 1rem; /* Reduced default gap slightly */
  justify-content: center;
  align-items: stretch; /* Make cards same height */
}
.vs-separator {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #c8ab6b;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: flex;
  align-items: center; /* Vertically center the text */
  padding: 0 0.5rem;
}
.fighter-card {
  flex: 1;
  min-width: 0; /* Important for flexbox to allow shrinking */
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 12px;
  border-width: 4px;
  border-style: solid;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4), inset 0 2px 5px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex; /* Added for flex-direction */
  flex-direction: column; /* To make content fill height */
}
.fighter-card.player { border-color: #e2c178; }
.fighter-card.enemy { border-color: #b71c1c; }

.fighter-name {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  text-transform: uppercase;
  padding: 0.75rem 1rem;
  margin: 0;
  text-align: center;
  font-weight: 700;
  flex-shrink: 0; /* Prevent name from shrinking */
}
.player .fighter-name { background: linear-gradient(to right, #e2c178, #b48d39); color: #3a2e15; text-shadow: 0 1px 0 rgba(255,255,255,0.2); }
.enemy .fighter-name { background: linear-gradient(to right, #b71c1c, #8a1414); color: #fdecc4; }

.fighter-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1; /* Allow content to take up remaining space */
}

/* Parchment-style battle log */
.log-scroll-area {
  margin-top: 2rem;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fdf6e7;
  color: #44341b;
  border: 4px solid #8a703d;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.2);
  font-size: 0.95rem;
}
.log-entry {
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
}
.log-player { color: #1b5e20; font-weight: bold; }
.log-enemy { color: #b71c1c; font-weight: bold; }
.log-evade { opacity: 0.7; font-style: italic; }
.log-lose, .log-end {
  text-align: center;
  font-weight: bold;
  background: rgba(138, 112, 61, 0.1);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

/* == UPDATED RESPONSIVE SECTION == */
@media (max-width: 768px) {
  /* Keep cards in a row, but reduce gaps and padding */
  .battle-arena {
    gap: 0.5rem;
  }
  .fighter-content {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .fighter-name {
    font-size: 1.1rem;
  }
}

@media (max-width: 640px) {
  /* On very small screens, hide the VS separator to save space */
  .vs-separator {
    display: none;
  }
  .battle-controls {
    flex-direction: column;
  }
}
</style>