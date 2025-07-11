<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h2>Townhall</h2>
      <p>เงินของคุณ: {{ userProfile.money }}</p>
      <button @click="buyHeal" :disabled="userProfile.money < 100 || character!.hp >= character!.maxHp">
        ซื้อยา (+10% max HP, 100 เงิน)
      </button>
      <button @click="$emit('close')" style="margin-left:1rem">ออก</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{
  userProfile: { money: number },
  character: any
  buyHeal: () => void
}>()
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #232323;
  color: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  min-width: 300px;
  box-shadow: 0 2px 16px #000a;
  text-align: center;
}
</style>
