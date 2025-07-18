<template>
  <transition name="fade">
    <div v-if="modelValue" class="popup-overlay" @click.self="close">
      <div class="popup-content" :class="customClass">
        <slot></slot>
        <button v-if="showClose" class="popup-close-btn" @click="close">&times;</button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  showClose: { type: Boolean, default: false },
  customClass: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.popup-content {
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border: 4px solid #6b552d;
  border-radius: 12px;
  padding: 2rem 3rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  max-width: 95vw;
  max-height: 90vh;
  overflow: auto;
  box-sizing: border-box;
  position: relative;
}
.popup-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #c8ab6b;
  font-size: 2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.popup-close-btn:hover {
  opacity: 1;
  color: #fff;
}
</style>
