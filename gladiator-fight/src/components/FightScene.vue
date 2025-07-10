<template>
  <div>
    <h2>ฉากต่อสู้</h2>
    <div v-if="character && enemy">
      <div class="status-row">
        <div class="status-block player">
          <h3>คุณ: {{ character.name }}</h3>
          <p>HP: {{ character.hp }} / {{ character.maxHp }}</p>
          <div class="status-list">
            <span>STR: {{ character.status.str }}</span>
            <span>AGI: {{ character.status.agi }}</span>
            <span>VIT: {{ character.status.vit }}</span>
            <span>DEX: {{ character.status.dex }}</span>
            <span>INT: {{ character.status.int }}</span>
            <span>LUK: {{ character.status.luk }}</span>
            <span>CHA: {{ character.status.cha }}</span>
          </div>
          <div>
            <strong>Skill:</strong>
            <ul>
              <li v-for="(s, i) in character.skill" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
        <div class="status-block enemy">
          <h3>ศัตรู: {{ enemy.name }}<span v-if="isPastSelf"> (อดีตตัวเรา)</span></h3>
          <p>HP: {{ enemy.hp }} / {{ enemy.maxHp }}</p>
          <div class="status-list">
            <span>STR: {{ enemy.status.str }}</span>
            <span>AGI: {{ enemy.status.agi }}</span>
            <span>VIT: {{ enemy.status.vit }}</span>
            <span>DEX: {{ enemy.status.dex }}</span>
            <span>INT: {{ enemy.status.int }}</span>
            <span>LUK: {{ enemy.status.luk }}</span>
            <span>CHA: {{ enemy.status.cha }}</span>
          </div>
          <div>
            <strong>Skill:</strong>
            <ul>
              <li v-for="(s, i) in enemy.skill" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="battle-log-container">
        <div class="battle-log-row" v-for="(log, idx) in battleLog" :key="idx">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

defineProps<{
<script lang="ts" setup>
import { defineProps, ref, onMounted, onUnmounted, defineEmits, computed } from 'vue'
const isPastSelf = computed(() => {
  return Array.isArray(enemy.skill) && enemy.skill.some(s => typeof s === 'string' && s.startsWith('win:'))
})

const props = defineProps<{
  character: {
    name: string
    hp: number
    maxHp: number
    status: {
      str: number
      agi: number
      vit: number
      dex: number
      int: number
      luk: number
      cha: number
    }
    skill: string[]
  },
  enemy: {
    name: string
    hp: number
    maxHp: number
    status: {
      str: number
      agi: number
      vit: number
      dex: number
      int: number
      luk: number
      cha: number
    }
    skill: string[]
  }
}>()

const character = props.character
const enemy = props.enemy
const emit = defineEmits(['battle-finished'])
const battleLog = ref<string[]>([])
let interval: number | undefined

function doBattleTurn() {
  if (character.hp <= 0 || enemy.hp <= 0) return
  // โจมตีอิง STR AGI
  const playerAttack = Math.floor(Math.random() * character.status.str) + character.status.agi
  const enemyAttack = Math.floor(Math.random() * enemy.status.str) + enemy.status.agi
  enemy.hp -= playerAttack
  battleLog.value.unshift(`คุณโจมตี ${enemy.name} ${playerAttack} dmg (HP เหลือ ${enemy.hp < 0 ? 0 : enemy.hp})`)
  if (enemy.hp <= 0) {
    battleLog.value.unshift(`${enemy.name} แพ้!`)
    clearInterval(interval)
    setTimeout(() => {
      battleLog.value.unshift('--- จบการต่อสู้ ---')
      emit('battle-finished')
    }, 200)
    return
  }
  character.hp -= enemyAttack
  battleLog.value.unshift(`${enemy.name} โจมตีคุณ ${enemyAttack} dmg (HP เหลือ ${character.hp < 0 ? 0 : character.hp})`)
  if (character.hp <= 0) {
    battleLog.value.unshift(`คุณแพ้!`)
    clearInterval(interval)
    setTimeout(() => {
      battleLog.value.unshift('--- จบการต่อสู้ ---')
      emit('battle-finished')
    }, 200)
  }
}

onMounted(() => {
  battleLog.value = []
  interval = setInterval(doBattleTurn, 200)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
.status-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1rem;
}
.status-block {
  background: #232323;
  color: #fff;
  border-radius: 8px;
  padding: 1rem;
  min-width: 220px;
  flex: 1;
}
.status-block.player {
  border: 2px solid #4caf50;
}
.status-block.enemy {
  border: 2px solid #f44336;
}
.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}
.battle-log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #222;
  color: #fff;
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
}
.battle-log-row {
  margin-bottom: 0.2rem;
  white-space: pre-line;
}
</style>
