<script setup lang="ts">
import { useGameStore } from '../store/useGameStore'
const store = useGameStore()
defineEmits(['history', 'result', 'townhall', 'prepare', 'fight'])
</script>

<template>
    <div>
        <!-- Gladiator Theme Top Bar Header -->
        <header class="gladiator-header-bg">
            <div class="flex flex-wrap justify-between items-center px-4 py-2 gap-2 shadow-md rounded-b-xl border-b-4 border-yellow-800 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700">
                <div class="flex items-center gap-3 font-bold text-xl text-yellow-900 drop-shadow gladiator-header-title">
                  <span class="text-2xl font-extrabold text-yellow-800">⚔️</span>
                  <span class="uppercase tracking-widest">Gladiator Arena</span>
                </div>
                <div class="flex items-center gap-4 gladiator-header-money bg-yellow-100/80 px-4 py-1 rounded-full border-2 border-yellow-700 shadow-inner">
                  <span class="text-yellow-700 font-bold text-lg">฿</span>
                  <span class="font-mono text-lg">{{ store.userProfile.money.toLocaleString() }}</span>
                  <span class="text-yellow-800 font-semibold">Gold</span>
                </div>
                <div class="flex flex-wrap gap-2 gladiator-header-btns">
                  <button @click="$emit('history')" class="btn btn-sm bg-yellow-200 border-yellow-700 text-yellow-900 hover:bg-yellow-300 gladiator-btn">History</button>
                  <button @click="$emit('result')" class="btn btn-sm bg-yellow-300 border-yellow-800 text-yellow-900 hover:bg-yellow-400 gladiator-btn">Result</button>
                  <button @click="$emit('townhall')" class="btn btn-sm bg-yellow-400 border-yellow-900 text-yellow-900 hover:bg-yellow-500 gladiator-btn">Townhall</button>
                  <button @click="$emit('prepare')" class="btn btn-sm bg-yellow-500 border-yellow-900 text-yellow-100 hover:bg-yellow-600 gladiator-btn">PREPARE</button>
                  <button @click="$emit('fight')" class="btn btn-sm bg-red-700 border-yellow-900 text-yellow-100 hover:bg-red-800 gladiator-btn">FIGHT</button>
                </div>
            </div>
        </header>
        <!-- Main content with mobile padding and header offset -->
        <main>
            <div class="main-container">
                <slot></slot>
            </div>
        </main>
    </div>
</template>

<style scoped>
.main-container {
  padding: 1.5rem 0.7rem 2.5rem 0.7rem;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}
.gladiator-header-bg {
  background: linear-gradient(90deg, #e2c178 0%, #bfa76a 60%, #a88c4a 100%);
  border-bottom: 4px solid #bfa100;
  box-shadow: 0 2px 12px #bfa10044;
  padding: 0.5em 0;
}
.gladiator-header-title {
  letter-spacing: 0.12em;
  text-shadow: 0 2px 6px #bfa10088, 0 1px 0 #fff;
}
.gladiator-header-money {
  box-shadow: 0 2px 8px #bfa10033;
}
.gladiator-header-btns .gladiator-btn {
  border-width: 2px;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 0.7em;
  transition: background 0.15s, color 0.15s, border 0.15s;
  box-shadow: 0 1px 4px #bfa10022;
}
</style>
