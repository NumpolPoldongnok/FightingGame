<script setup lang="ts">
import { useGameStore } from '../store/useGameStore'
const store = useGameStore()
defineEmits(['history', 'result', 'townhall', 'prepare'])
</script>

<template>
    <div>
        <!-- Compact Genshin-style Fixed Top Bar Heade -->
        <header>
            <div>
                <div>
                  <span>฿</span>
                  <span>{{ store.userProfile.money.toLocaleString() }}</span>
                  <span>Gold</span>
                </div>
                <button @click="$emit('history')" class="header-btn">History</button>
                <button @click="$emit('result')" class="header-btn">Result</button>
                <button @click="$emit('townhall')" class="header-btn">Townhall</button>
                <button @click="$emit('prepare')" class="header-btn">PREPARE</button>
            </div>
        </header>
        <!-- Main content with mobile padding and header offset -->
        <main>
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
.header-btn {
  height: 2.5em;
  min-height: 2.5em;
  max-height: 2.5em;
  padding: 0 1.2em;
  font-size: 1em;
  border-radius: 0.7em;
  border: 1.5px solid #b2c7e1;
  background: #e3eafc;
  color: #2d3142;
  font-weight: 600;
  margin-left: 0.3em;
  margin-right: 0.3em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  box-sizing: border-box;
}
.header-btn:active, .header-btn:focus {
  background: #c9e4ff;
  color: #1a233a;
}
</style>
