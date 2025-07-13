<script lang="ts" setup>
import { Character } from 'src/store/useGameStore';
import type { Skill } from '../store/skillUtils'
import CharacterStatus from './CharacterStatus.vue'
import HPBar from './HPBar.vue'
import SkillChoiceButton from './SkillChoiceButton.vue'
import { onMounted } from 'vue';
const props = defineProps<{
  win: boolean,
  character: Character,
  skillChoices: Skill[]
}>()
defineEmits(['choose-skill', 'restart', 'back', 'refresh-skill'])

onMounted(() => {
  console.log('Mounting ResultScene with skill choices:', props.skillChoices)
})

</script>

<template>
  <div class="result-screen">
    <h2>ผลการต่อสู้</h2>
    <p v-if="win">คุณชนะ!</p>
    <p v-else>คุณแพ้</p>
    <p>ชนะติดต่อกัน: <strong>{{ character.winStreak }}</strong></p>
    <p v-if="win">ได้เงิน: <strong>{{ character.lastMoneyEarned }}</strong></p>

    <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
      <HPBar v-if="character" :value="character.hp" :max="character.maxHp" />
      <CharacterStatus :status="character.status" title="Status หลังชนะ" />
    </div>

    <div style="display:flex;align-items:center;gap:1rem;justify-content:center;">
      <h3 style="margin:0;">เลือก Skill หลังชนะ</h3>
      <button @click="$emit('refresh-skill')" style="font-size:1.1em;padding:0.2em 0.7em;">🔄</button>
    </div>

    <div v-if="character.hp <= 0">
      <p style="color:#ff5252;font-weight:bold;">ตายแล้ว</p>
      <button @click="$emit('restart')">เกิดใหม่</button>
      <button @click="$emit('back')">กลับหน้าเตรียมตัว</button>
    </div>
    <div v-else>
      <ul>
        <li v-for="(s, i) in skillChoices" :key="i">
          <SkillChoiceButton :skill="s" :index="i" @choose="$emit('choose-skill', i)" />
        </li>
      </ul>
      <button class="back-btn" @click="$emit('back')">กลับไปเตรียมตัว</button>
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

.skill-choice-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2em;
  background: #f5f7fa;
  border: 2px solid #bdbdbd;
  padding: 0.7em 1.2em;
  margin: 0.3em 0;
  min-width: 180px;
  transition: border 0.2s;
}

.skill-choice-btn:hover {
  border: 2px solid #90caf9;
}

.skill-effects {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1em;
}

.buff-item {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 1em;
}

.buff-label {
  color: #43a047;
  font-weight: bold;
  margin-right: 0.2em;
}

.buff-type {
  color: #43a047;
  font-weight: 700;
  letter-spacing: 1px;
}

.buff-value,
.buff-mult {
  color: #66bb6a;
  font-weight: 500;
}

.debuff-item {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 1em;
}

.debuff-label {
  color: #e53935;
  font-weight: bold;
  margin-right: 0.2em;
}

.debuff-type {
  color: #e53935;
  font-weight: 700;
  letter-spacing: 1px;
}

.debuff-value,
.debuff-mult {
  color: #ef9a9a;
  font-weight: 500;
}
</style>
