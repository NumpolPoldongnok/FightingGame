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
  <div>

    <div>
      <table>
        <tbody>
            <tr style="vertical-align: top; text-align: center;">
            <td>
              <h2>ผลการต่อสู้</h2>
              <div>
              <span>ชนะติดต่อกัน: {{ character.winStreak }}</span>
              <span v-if="win">ได้เงิน: <strong>{{ character.lastMoneyEarned }}</strong></span>
              </div>
              <HPBar v-if="character" :value="character.hp" :max="character.maxHp" />
              <CharacterStatus :character="character" title="Status หลังชนะ" />
            </td>
            <td>
              <div>
              <h2 v-if="win">คุณชนะ!</h2>
              <h2 v-else>คุณแพ้</h2>
              </div>
              <SkillChoicePanel :skill-choices="skillChoices" @choose-skill="$emit('choose-skill', $event)"
              @refresh-skill="$emit('refresh-skill')" @back="$emit('back')" />
            </td>
            </tr>
        </tbody>
      </table>
    </div>
    <div v-if="character.hp <= 0">
      <p>ตายแล้ว</p>
      <button @click="$emit('restart')">เกิดใหม่</button>
      <button @click="$emit('back')">กลับหน้าเตรียมตัว</button>
    </div>
  </div>
</template>