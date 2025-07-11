<template>
  <div>
    <h2>ประวัติตัวละครที่เคยใช้</h2>
    <ul>
      <li v-for="(c, idx) in characterHistory" :key="idx">
        <strong>{{ c.name }}</strong> | HP: {{ c.hp }} / {{ c.maxHp }} | <span>ชนะ: {{ c.winStreak ?? 0 }}</span>
        <span>Status: [STR:{{ c.status.str }}, AGI:{{ c.status.agi }}, VIT:{{ c.status.vit }}, DEX:{{ c.status.dex }}, INT:{{ c.status.int }}, LUK:{{ c.status.luk }}, CHA:{{ c.status.cha }}]</span>
        <span> | Skill: <span v-for="(s, i) in c.skill" :key="i">{{ s }} </span></span>
      </li>
    </ul>
    <button @click="$emit('back')">กลับ</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ characterHistory: any[] }>()
defineEmits(['back'])
</script>

<style scoped>
ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}
li {
  margin-bottom: 0.5rem;
}
</style>
