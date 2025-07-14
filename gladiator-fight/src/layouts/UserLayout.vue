<script setup lang="ts">
import { useGameStore } from '../store/useGameStore'
const store = useGameStore()
defineEmits(['history', 'result', 'townhall', 'prepare', 'fight'])
</script>

<template>
    <div>
        <!-- Compact Genshin-style Fixed Top Bar Heade -->
        <header class="gladiator-header-bg">
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
                <button @click="$emit('fight')" class="header-btn">FIGHT</button>
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
</style>
