
<script lang="ts" setup>
import { Character } from 'src/store/useGameStore';
import type { Skill } from '../store/skillUtils'
import CharacterStatus from './CharacterStatus.vue'
import HPBar from './HPBar.vue'
const props = defineProps<{
  win: boolean,
  character: Character,
  skillChoices: Skill[]
}>()
defineEmits(['choose-skill', 'restart', 'back', 'refresh-skill'])
</script>

<template>
  <div class="result-screen">
    <h2>ผลการต่อสู้</h2>
    <p v-if="win">คุณชนะ!</p>
    <p v-else>คุณแพ้</p>
    <p>ชนะติดต่อกัน: <strong>{{ character.winStreak }}</strong></p>
    <p v-if="win">ได้เงิน: <strong>{{ character.lastMoneyEarned }}</strong></p>
    <div v-if="win && skillChoices.length">
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
        <HPBar v-if="character" :value="character.hp" :max="character.maxHp" />
        <CharacterStatus :status="character.status" title="Status หลังชนะ" />
      </div>
      <div style="display:flex;align-items:center;gap:1rem;justify-content:center;">
        <h3 style="margin:0;">เลือก Skill หลังชนะ</h3>
        <button @click="$emit('refresh-skill')" style="font-size:1.1em;padding:0.2em 0.7em;">🔄</button>
      </div>
      <ul>
        <li v-for="(s, i) in skillChoices" :key="i">
          <button @click="$emit('choose-skill', i)">
            Buff: {{ s.buff.statusType }} +{{ s.buff.value }}<span v-if="s.buff.multiply && s.buff.multiply !== '0%'"> x{{ s.buff.multiply }}</span>
            <span v-if="s.debuff"> | Debuff: {{ s.debuff.statusType }} -{{ s.debuff.value }}<span v-if="s.debuff.multiply && s.debuff.multiply !== '0%'"> x{{ s.debuff.multiply }}</span></span>
          </button>
        </li>
      </ul>
      <button class="back-btn" @click="$emit('back')">กลับไปเตรียมตัว</button>
    </div>
    <div v-else>
      <button @click="$emit('restart')">เกิดใหม่</button>
      <button @click="$emit('back')">กลับหน้าเตรียมตัว</button>
    </div>
  </div>
</template>


<style scoped>
.result-screen {
  background: #232323;
  color: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  box-shadow: 0 2px 16px #000a;
  text-align: center;
  margin: 2rem auto;
}
.result-screen button {
  margin: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  border: none;
  background: #4caf50;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
.result-screen button:hover {
  background: #388e3c;
}
</style>
