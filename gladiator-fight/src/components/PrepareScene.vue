<script lang="ts" setup>
import type { Character } from '../store/useGameStore'
import CharacterStatus from './CharacterStatus.vue';
import HPBar from './HPBar.vue';
import SkillList from './SkillList.vue';

const props = defineProps<{
  character: Character
}>()

function totalStatus(c: Character) {
  return c.status.str + c.status.agi + c.status.vit + c.status.dex + c.status.int + c.status.luk
}
</script>
<template>
  <div class="prepare-main-container">
    <h2>เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <div class="prepare-header-row">
        <span class="prepare-name">{{ character.name }}</span>
        <span class="prepare-status-sum">Status รวม: {{ totalStatus(character) }}</span>
      </div>
      <div class="prepare-streak-row">
        <span class="streak-label">ชนะติดต่อกัน</span>
        <span class="streak-value">{{ character.winStreak }}</span>
      </div>
      <HPBar :value="character.hp" :max="character.maxHp" />
      <CharacterStatus :status="character.status" title="Status" />
      <SkillList :skills="character.skills" />
      <div v-if="character.hp <= 0" class="prepare-btn-row">
        <p class="dead-label">ตายแล้ว</p>
        <button class="genshin-btn genshin-btn-restart" @click="$emit('restart')">เกิดใหม่</button>
      </div>
      <template v-else>
        <div class="prepare-btn-row">
          <button class="genshin-btn genshin-btn-fight" @click="$emit('start-fight')">เริ่มต่อสู้</button>
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
.prepare-main-container {
  padding: 1.2rem 0.7rem 1.5rem 0.7rem;
  box-sizing: border-box;
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
  border-radius: 18px;
  box-shadow: 0 4px 18px #b2c7e155, 0 1.5px 0 #fff8 inset;
  max-width: 420px;
  margin: 2.2rem auto 0 auto;
}

.prepare-header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  margin-bottom: 0.2em;
}

.prepare-name {
  font-size: 1.25em;
  font-weight: 700;
  color: #2d3142;
  letter-spacing: 0.03em;
}

.prepare-status-sum {
  font-size: 1em;
  color: #ffd700;
  font-weight: 500;
  background: #fffbe6;
  border-radius: 8px;
  padding: 0.1em 0.7em;
}

.prepare-streak-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.7em;
}

.streak-label {
  color: #2d3142;
  font-size: 1em;
  font-weight: 500;
}

.streak-value {
  color: #43e97b;
  font-size: 1.1em;
  font-weight: 700;
  background: #e3fcec;
  border-radius: 8px;
  padding: 0.1em 0.7em;
}
.prepare-btn-row {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 1.5rem;
}
.genshin-btn {
  background: linear-gradient(90deg, #e3eafc 60%, #f7fafd 100%);
  color: #2d3142;
  border-radius: 12px;
  border: 2.5px solid #b2c7e1;
  padding: 0.7em 2.2em;
  font-weight: 700;
  font-size: 1.18em;
  box-shadow: 0 2px 10px #b2c7e144, 0 1.5px 0 #fff8 inset;
  letter-spacing: 0.04em;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  outline: none;
  cursor: pointer;
}
.genshin-btn:active, .genshin-btn:focus {
  background: #c9e4ff;
  color: #1a233a;
  box-shadow: 0 2px 16px #43e97b33;
}
.genshin-btn-fight {
  border-color: #43e97b;
  background: linear-gradient(90deg, #43e97b 60%, #38f9d7 100%);
  color: #2d3142;
  box-shadow: 0 2px 12px #43e97b33, 0 1.5px 0 #fff8 inset;
}
.genshin-btn-fight:active, .genshin-btn-fight:focus {
  background: #43e97b;
  color: #fff;
}
.genshin-btn-restart {
  border-color: #e53935;
  background: linear-gradient(90deg, #e53935 60%, #f7baba 100%);
  color: #fff;
  box-shadow: 0 2px 12px #e5393533, 0 1.5px 0 #fff8 inset;
}
.genshin-btn-restart:active, .genshin-btn-restart:focus {
  background: #e53935;
  color: #fff;
}
.dead-label {
  color: #ff5252;
  font-weight: bold;
  font-size: 1.1em;
  margin-right: 0.7em;
  align-self: center;
}
</style>