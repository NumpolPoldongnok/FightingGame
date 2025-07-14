<script setup lang="ts">
import { useGameStore } from '../store/useGameStore'
const store = useGameStore()
defineEmits(['history', 'result', 'townhall', 'prepare', 'fight'])
</script>

<template>
  <div class="gladiator-layout-root">
    <!-- Gladiator Theme Top Bar Header -->
    <header class="gladiator-header-fixed rounded-b-3xl">
      <div class="header-content">
        <div class="flex items-center gap-3 font-bold text-xl text-yellow-900 drop-shadow gladiator-header-title">
          <span class="text-3xl">⚔️</span>
          <span class="uppercase tracking-widest">Gladiator Arena</span>
        </div>
        <div class="flex items-center gap-4 gladiator-header-money">
          <span class="text-yellow-700 font-bold text-xl">💰</span>
          <span class="font-mono text-lg tracking-wider">{{ store.userProfile.money.toLocaleString() }}</span>
          <span class="text-yellow-800 font-semibold hidden sm:inline">Gold</span>
        </div>
      </div>
    </header>

    <main class="gladiator-main-scroll">
      <!-- Content wrapper, now full-width -->
      <div class="main-container">
        <slot></slot>
      </div>
    </main>

    <!-- Gladiator Theme Footer / Tab Bar -->
    <footer class="gladiator-footer-fixed rounded-t-3xl">
      <nav class="footer-nav">
        <!-- >> CHANGED <<: ปุ่ม Prepare ใช้คลาส gladiator-btn-standard -->
        <button @click="$emit('prepare')" class="btn btn-sm btn-ghost gladiator-btn gladiator-btn-standard">
          <span class="icon">🛡️</span>
          <span class="label">Prepare</span>
        </button>
        <button @click="$emit('townhall')" class="btn btn-sm btn-ghost gladiator-btn gladiator-btn-standard">
          <span class="icon">🏛️</span>
          <span class="label">Store</span>
        </button>
        <!-- >> CHANGED <<: ปุ่ม Fight ถูกปรับให้เด่นขึ้น -->
        <button @click="$emit('fight')" class="btn btn-sm btn-ghost gladiator-btn-fight">
          <span class="icon">💥</span>
          <span class="label">FIGHT</span>
        </button>
        <button @click="$emit('result')" class="btn btn-sm btn-ghost gladiator-btn gladiator-btn-standard">
          <span class="icon">🏆</span>
          <span class="label">Result</span>
        </button>
        <button @click="$emit('history')" class="btn btn-sm btn-ghost gladiator-btn gladiator-btn-standard">
          <span class="icon">📜</span>
          <span class="label">History</span>
        </button>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
/* --- Font Import for Theme --- */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');

/* --- Core Layout --- */
.gladiator-layout-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  background-color: #4a4a4a;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235a5a5a' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  font-family: 'Cinzel', serif;
}

.gladiator-header-fixed, .gladiator-footer-fixed {
  flex-shrink: 0;
  position: sticky;
  z-index: 20;
  background: linear-gradient(180deg, #947b4a 0%, #75603a 100%);
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.gladiator-header-fixed {
  top: 0;
  padding: 0.5rem 0;
  border-bottom: 4px solid #4d3c1a;
}

.gladiator-footer-fixed {
  bottom: 0;
  border-top: 4px solid #4d3c1a;
  padding: 0.25rem 0;
}

.gladiator-main-scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
}

.main-container {
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

/* --- Header Styling --- */
.header-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1.25rem;
  border: 4px solid #e2c178;
  background: linear-gradient(to right, #fef4d8, #e7c77d, #d4ae5c);
  box-shadow: inset 0 2px 10px rgba(100, 70, 20, 0.2);
  margin: 0 1rem;
}

.gladiator-header-title { letter-spacing: 0.12em; text-shadow: 0 1px 1px #ffffff99; }
.gladiator-header-money { background-color: rgba(255, 250, 235, 0.8); padding: 0.25rem 1rem; border-radius: 9999px; border: 2px solid #b48d39; box-shadow: inset 0 1px 4px rgba(0,0,0,0.1); color: #5c451b; }

/* --- Footer Navigation / Tab Bar --- */
.footer-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}


  .gladiator-btn, .gladiator-btn-fight {
    flex-direction: column !important;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    height: auto;
    padding: 0.3rem 0;
    border: 2px solid transparent;
    border-radius: 0.75rem;
    text-transform: uppercase;
    font-size: 0.6rem;
    line-height: 1.2;
    transition: all 0.2s ease-in-out;
  }

  .gladiator-btn .icon, .gladiator-btn-fight .icon { font-size: 1.25rem; display: block; }
  .gladiator-btn .label, .gladiator-btn-fight .label { margin-top: 0.1rem; display: block; }

  .gladiator-btn-standard { color: #44341b; font-weight: 700; }
  .gladiator-btn-standard:hover { background-color: rgba(253, 236, 196, 0.25); border-color: #c8ab6b; }

/* >> REMOVED <<: คลาส .gladiator-btn-prepare ถูกลบออกไปแล้ว */

/* >> UPDATED <<: สไตล์ปุ่ม FIGHT ให้เด่นขึ้น */
.gladiator-btn-fight {
  color: #fff;
  background: linear-gradient(to bottom, #d93a3a, #a91818); /* สีแดงเข้มขึ้น */
  border: 3px solid #ff6b6b; /* ขอบหนาและสว่างขึ้น */
  animation: pulse-fight 2s infinite;
  font-weight: 900; /* ตัวหนาพิเศษ */
  transform: scale(1.05); /* ขนาดใหญ่ขึ้นเล็กน้อย */
  position: relative;
  bottom: 5px; /* ดันขึ้นเล็กน้อย */
  flex-grow: 1.5; /* ให้กินพื้นที่มากกว่าปุ่มอื่น */
  padding: 0.5rem 0;
  border-radius: 1rem;
}

.gladiator-btn-fight:hover {
  background: linear-gradient(to bottom, #e94a4a, #b92828);
  animation-play-state: paused;
}

@keyframes pulse-fight {
  0% { transform: scale(1.05); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
  70% { transform: scale(1.08); box-shadow: 0 0 8px 12px rgba(255, 107, 107, 0); }
  100% { transform: scale(1.05); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
}

  @media (min-width: 640px) {
    .footer-nav { justify-content: center; gap: 0.5rem; align-items: flex-end; }
    .gladiator-btn, .gladiator-btn-fight {
      flex-direction: column !important;
      align-items: center;
      justify-content: center;
      flex-grow: 0;
      gap: 0.1rem;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      bottom: 0; /* Reset bottom position on desktop */
      transform: scale(1);
    }
    .gladiator-btn-fight {
      padding: 0.6rem 1.5rem; /* ทำให้ใหญ่กว่าปุ่มอื่นบน desktop */
      font-size: 1rem;
    }
    .gladiator-btn .icon, .gladiator-btn-fight .icon { font-size: 1.2rem; display: block; }
    .gladiator-btn .label, .gladiator-btn-fight .label { margin-top: 0.1rem; display: block; }
  }
</style>