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
    <h2 class="prepare-title">{{ character.name }}</h2>
    <div v-if="character">
      <!-- Character Info Header -->
      <header class="character-header">
        <div class="header-main">
          <span class="status-sum">Total Stats: {{ totalStatus(character) }}</span>
        </div>
        <div class="win-streak">Win Streak: {{ character.winStreak }}</div>
      </header>

      <!-- Main Content Body -->
      <div class="prepare-body">
        <HPBar :value="character.hp" :max="character.maxHp" type="player" />
        <CharacterStatus :character="character" :showButtons="true"/>
        <SkillList :skills="character.skills" />
      </div>

      <!-- Action Footer -->
      <footer class="prepare-footer">
        <div v-if="character.hp <= 0" class="text-center">
          <p class="death-message">YOU HAVE FALLEN</p>
          <button @click="$emit('restart')" class="action-btn btn-restart">
            RESTART
          </button>
        </div>
      </footer>
    </div>
</template>

<style scoped>
/* === Gladiator Themed Prepare Scene === */

.prepare-title {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: 900;
  text-align: center;
  color: #e2c178;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  margin: 0 0 1.5rem 0;
}

.character-header {
  background-color: #fdf6e7;
  color: #44341b;
  border-radius: 8px;
  border: 2px solid #8a703d;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(138, 112, 61, 0.2);
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

.character-name {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
}

.status-sum, .win-streak {
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(138, 112, 61, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.prepare-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.prepare-footer {
  margin-top: 2rem;
}

.death-message {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #b71c1c;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.action-btn {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  border-width: 3px;
  border-style: solid;
  color: #fff;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}

.btn-fight {
  background: linear-gradient(to bottom, #c08d2c, #8a621c);
  border-color: #f7d88b;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.btn-fight:hover {
  background: linear-gradient(to bottom, #d89e31, #a07421);
  box-shadow: 0 0 15px #e2c17880;
}

.btn-restart {
  background: linear-gradient(to bottom, #b71c1c, #8a1414);
  border-color: #ef4444;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.btn-restart:hover {
  background: linear-gradient(to bottom, #c92c2c, #a02424);
  box-shadow: 0 0 15px #b71c1c80;
}
</style>