<template>
  <div class="create-container">
    <h2 class="create-title">DESIGN YOUR CHAMPION</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Name Input Section -->
      <div class="form-section">
        <label for="gladiator-name" class="section-label">Gladiator's Name</label>
        <input
          id="gladiator-name"
          v-model="name"
          maxlength="16"
          required
          class="name-input"
          placeholder="Enter name..."
        />
      </div>

      <!-- Status Allocation Section -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-label">Shape Your Destiny</label>
          <span class="status-points-display">Points Left: {{ statusLeft }}</span>
        </div>

        <!-- Status Chart -->
        <div class="chart-wrapper">
          <div class="chart-actions">
            <p class="chart-instructions">(Click point to increase / Right-click to decrease)</p>
            <!-- >> NEW << Random Fill Button -->
            <button type="button" class="random-btn" @click="randomFillStatus" :disabled="statusLeft <= 0">
              Randomize Points
            </button>
          </div>
          <div
            id="status-chart"
            @contextmenu.prevent="handleRightClick"
          >
            <apexchart
              type="radar"
              height="350"
              :options="chartOptions"
              :series="chartSeries"
            ></apexchart>
          </div>
        </div>

        <!-- >> NEW << Status Control Buttons -->
        <div class="status-controls-grid">
          <div v-for="key in statusKeys" :key="key" class="status-row">
            <span class="status-key">{{ key.toUpperCase() }}</span>
            <div class="status-controls">
              <button type="button" @click="decrease(key)" :disabled="status[key] <= baseStat" class="stat-btn minus-btn">-</button>
              <span class="status-value">{{ status[key] }}</span>
              <button type="button" @click="increase(key)" :disabled="statusLeft <= 0" class="stat-btn plus-btn">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button type="submit" class="action-btn create-btn" :disabled="!isFormValid">
          Forge Gladiator
        </button>
        <button type="button" @click="$emit('cancel')" class="action-btn cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Status } from '../store/useGameStore'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts;

const emit = defineEmits(['create', 'cancel'])

// --- STATE ---
const name = ref('')
const statusTotal = 30; // Total points to allocate
const baseStat = 1; // << CHANGED: Base stat value is now 1
const status = ref<Status>({
  str: baseStat, agi: baseStat, vit: baseStat,
  dex: baseStat, int: baseStat, luk: baseStat,
})
const statusKeys = ['str', 'agi', 'vit', 'dex', 'int', 'luk'] as const;

// --- COMPUTED PROPERTIES ---
const statusUsed = computed(() => {
  return statusKeys.reduce((sum, k) => sum + (status.value[k] - baseStat), 0);
});
const statusLeft = computed(() => statusTotal - statusUsed.value);

// << CHANGED: Can forge without filling all status points
const isFormValid = computed(() => {
  return name.value.trim().length > 0;
});

// --- CHART CONFIGURATION ---
const chartSeries = computed(() => [{
  name: "Stats",
  data: statusKeys.map(key => status.value[key]),
}]);

const chartOptions = computed(() => ({
  chart: {
    height: 350,
    type: 'radar',
    toolbar: { show: false },
    parentHeightOffset: 0,
    background: 'transparent',
    events: {
      markerClick: (_: any, __: any, { dataPointIndex }: any) => {
        const key = statusKeys[dataPointIndex];
        increase(key);
      },
    },
  },
  colors: ['#e2c178'],
  stroke: { width: 2, colors: ['#e2c178'] },
  fill: { opacity: 0.2, colors: ['#e2c178'] },
  markers: {
    size: 4,
    colors: ['#fff'],
    strokeColors: '#e2c178',
    strokeWidth: 2,
    hover: { size: 6 }
  },
  tooltip: {
    enabled: true,
    theme: 'dark',
    y: { formatter: (val: number) => val.toString() }
  },
  xaxis: {
    categories: statusKeys.map(k => k.toUpperCase()),
    labels: {
      style: {
        colors: statusKeys.map(() => '#c8ab6b'),
        fontSize: '14px',
        fontFamily: 'Cinzel, serif',
      }
    }
  },
  yaxis: {
    show: false,
    min: 0,
    max: Math.max(20, ...Object.values(status.value)) + 5,
  },
  plotOptions: {
    radar: {
      polygons: {
        strokeColors: '#6b552d',
        connectorColors: '#6b552d',
      }
    }
  }
}));

// --- FUNCTIONS ---
function increase(key: keyof typeof status.value) {
  if (statusLeft.value > 0) status.value[key]++;
}

function decrease(key: keyof typeof status.value) {
  if (status.value[key] > baseStat) status.value[key]--;
}

function handleRightClick() {
  const hoveredPoint = document.querySelector("#status-chart .apexcharts-series-markers .apexcharts-marker.hover");
  if (hoveredPoint) {
    const index = Number(hoveredPoint.getAttribute('data-real-index'));
    if (!isNaN(index)) {
      const key = statusKeys[index];
      decrease(key);
    }
  }
}

// << NEW >> Randomly allocates all remaining points
function randomFillStatus() {
  const pointsToDistribute = statusLeft.value;
  for (let i = 0; i < pointsToDistribute; i++) {
    const randomIndex = Math.floor(Math.random() * statusKeys.length);
    const randomKey = statusKeys[randomIndex];
    increase(randomKey);
  }
}

function handleSubmit() {
  if (isFormValid.value) {
    emit('create', { name: name.value.trim(), status: { ...status.value } })
  }
}
</script>

<style scoped>
/* === Gladiator Themed Create Character Scene === */
.create-container {
  width: 100%;
  max-width: 700px;
  margin: 1rem auto;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 12px;
  border: 4px solid #6b552d;
  padding: 2rem;
  box-sizing: border-box;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
}
.create-title { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 900; text-align: center; color: #e2c178; text-transform: uppercase; letter-spacing: 0.1em; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin: 0 0 2rem 0; }
.form-section { margin-bottom: 2rem; }
.section-label { display: block; font-family: 'Cinzel', serif; font-weight: 700; color: #c8ab6b; margin-bottom: 0.75rem; }
.name-input { width: 100%; background-color: #fdf6e7; border: 2px solid #8a703d; border-radius: 6px; padding: 0.75rem 1rem; color: #44341b; font-size: 1.1rem; font-weight: 600; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
.name-input:focus { outline: none; border-color: #e2c178; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 10px #e2c17880; }
.section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; }
.status-points-display { font-weight: 600; color: #fdecc4; }

.chart-wrapper { background-color: rgba(0,0,0,0.1); border: 2px solid #6b552d; border-radius: 6px; padding: 0.5rem; }
.chart-actions { display: flex; justify-content: space-between; align-items: center; padding: 0 0.5rem; }
.chart-instructions { text-align: center; font-size: 0.8rem; color: #c8ab6b; font-style: italic; }
.random-btn { background: none; border: 1px solid #8a703d; color: #c8ab6b; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.random-btn:hover:not(:disabled) { background-color: #8a703d; color: #fff; }
.random-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* >> NEW << Status controls below chart */
.status-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  margin-top: 1.5rem;
  background-color: #fdf6e7;
  border: 2px solid #8a703d;
  border-radius: 6px;
}
.status-row { display: flex; align-items: center; gap: 1rem; }
.status-key { font-family: 'Cinzel', serif; font-weight: 700; color: #6b552d; width: 50px; }
.status-controls { display: flex; align-items: center; gap: 0.5rem; }
.stat-btn { width: 32px; height: 32px; border-radius: 50%; border: 2px solid; font-size: 1.5rem; font-weight: 700; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; transition: all 0.15s; }
.stat-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.minus-btn { background-color: #b71c1c; border-color: #ef4444; }
.plus-btn { background-color: #2b6b3e; border-color: #4caf50; }
.status-value { font-size: 1.2rem; font-weight: 700; color: #44341b; width: 30px; text-align: center; }

/* Action Buttons */
.action-buttons { display: flex; justify-content: center; gap: 1rem; margin-top: 2.5rem; }
.action-btn { font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.2rem; padding: 0.75rem 2.5rem; border-radius: 8px; border-width: 3px; border-style: solid; color: #fff; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
.action-btn:disabled { background: #555; border-color: #777; color: #999; cursor: not-allowed; opacity: 0.7; }
.create-btn { background: linear-gradient(to bottom, #c08d2c, #8a621c); border-color: #f7d88b; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
.cancel-btn { background: linear-gradient(to bottom, #6b552d, #4a3c23); border-color: #c8ab6b; }

/* Deep selector to style chart elements */
:deep(.apexcharts-radar-series path) { stroke-width: 3px; }
</style>