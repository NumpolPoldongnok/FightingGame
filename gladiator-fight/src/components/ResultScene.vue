<script lang="ts" setup>
import { Character } from 'src/store/useGameStore';
import type { Skill } from '../store/skillUtils'
import CharacterStatus from './CharacterStatus.vue'
import HPBar from './HPBar.vue'
import SkillChoiceButton from './SkillChoiceButton.vue'
import { computed, onMounted } from 'vue';
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
  <div>
    <h2>ผลการต่อสู้</h2>
    <p v-if="win">คุณชนะ!</p>
    <p v-else>คุณแพ้</p>
    <div>
      <span>ชนะติดต่อกัน: {{ character.winStreak }}</span>
    </div>
    <p v-if="win">ได้เงิน: <strong>{{ character.lastMoneyEarned }}</strong></p>
    <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
      <HPBar v-if="character" :value="character.hp" :max="character.maxHp" />
      <CharacterStatus :character="character" title="Status หลังชนะ" />
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
      <button @click="$emit('back')">กลับไปเตรียมตัว</button>
    </div>
  </div>
</template>


