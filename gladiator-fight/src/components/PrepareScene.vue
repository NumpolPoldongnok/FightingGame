<template>
  <div>
    <h2>เตรียมตัวก่อนต่อสู้</h2>
    <div v-if="character">
      <p>ชื่อ: {{ character.name }}</p>
      <p>HP: {{ character.hp }} / {{ character.maxHp }}</p>
      <p>เงิน: {{ character.money }}</p>
      <div>
        <strong>Status:</strong>
        <ul>
          <li>STR: {{ character.status.str }}</li>
          <li>AGI: {{ character.status.agi }}</li>
          <li>VIT: {{ character.status.vit }}</li>
          <li>DEX: {{ character.status.dex }}</li>
          <li>INT: {{ character.status.int }}</li>
          <li>LUK: {{ character.status.luk }}</li>
          <li>CHA: {{ character.status.cha }}</li>
        </ul>
      </div>
      <div>
        <strong>Skill:</strong>
        <ul>
          <li v-for="(s, i) in character.skill" :key="i">{{ s }}</li>
        </ul>
      </div>
      <button @click="$emit('start-fight')" :disabled="character.hp <= 0">เข้าสู่ฉากต่อสู้</button>
      <button @click="$emit('buy-heal')" :disabled="character.money < 100 || character.hp >= character.maxHp" style="margin-left:1rem">ซื้อยา (+10% max HP, 100 เงิน)</button>
    </div>
    <div v-if="deadCharacters && deadCharacters.length">
      <h3>ตัวละครที่ตายไปแล้ว</h3>
      <ul>
        <li v-for="(dead, idx) in deadCharacters" :key="idx">
          <strong>{{ dead.name }}</strong> | HP: {{ dead.hp }} | เงิน: {{ dead.money }} |
          <span>Status: [STR:{{ dead.status.str }}, AGI:{{ dead.status.agi }}, VIT:{{ dead.status.vit }}, DEX:{{ dead.status.dex }}, INT:{{ dead.status.int }}, LUK:{{ dead.status.luk }}, CHA:{{ dead.status.cha }}]</span>
          <span> | Skill: <span v-for="(s, i) in dead.skill" :key="i">{{ s }} </span></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  character: {
    name: string
    hp: number
    maxHp: number
    money: number
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
  deadCharacters?: Array<{
    name: string
    hp: number
    maxHp: number
    money: number
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
  }>
}>()
</script>
