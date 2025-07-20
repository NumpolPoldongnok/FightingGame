<script lang="ts" setup>
import { computed } from 'vue'
import CharacterPictureFrame from './CharacterPictureFrame.vue'
import type { Character } from '../types/game'
import Popup from './Popup.vue'
const props = defineProps<{
  modelValue: boolean,
  character: Character,
  character2: Character,
  isAttack: boolean, // true for attack, false for defense
  alwaysChecked: boolean,
  actionType: 'phy' | 'magic' | 'mix' | null
}>()

const emit = defineEmits(['update:modelValue', 'select-type', 'update:alwaysChecked', 'dismiss'])

const popupTitle = computed(() =>
  props.isAttack
    ? `You attacking ${props.character.name}`
    : `${props.character.name} attacking you`
)

const popupExplanation = computed(() =>
  props.isAttack
    ? `Select your attack choices.`
    : `Select your defense choices.`
)

const handleSelect = (type: 'phy' | 'magic' | 'mix') => {
  emit('select-type', type)
}

const handleDismiss = () => {
  emit('dismiss')
}

const handleCheckboxChange = (event: Event) => {
  emit('update:alwaysChecked', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <!-- <Popup :modelValue="modelValue" customClass="action-type-popup" :showClose="false"> -->
    <div class="popup-action-content">
      <div class="popup-header-row">
        <div class="frame-row">
          <CharacterPictureFrame
            :character="character"
            size="sm"
            class="header-icon attacker-frame"
          />
          <span class="frame-action-label" :class="isAttack ? 'attack-label' : 'defense-label'">
            <template v-if="isAttack">
              <!-- Crossed swords icon for attack -->
              <svg class="frame-action-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <rect x="21.5" y="4" width="3" height="18" rx="1.2" transform="rotate(45 21.5 4)" fill="#e2c178" stroke="#b71c1c" stroke-width="1.2"/>
                  <rect x="7.5" y="4" width="3" height="18" rx="1.2" transform="rotate(-45 7.5 4)" fill="#e2c178" stroke="#b71c1c" stroke-width="1.2"/>
                  <rect x="19.5" y="19.5" width="6" height="2" rx="1" transform="rotate(45 19.5 19.5)" fill="#b71c1c" stroke="#ef4444" stroke-width="1.2"/>
                  <rect x="6.5" y="19.5" width="6" height="2" rx="1" transform="rotate(-45 6.5 19.5)" fill="#b71c1c" stroke="#ef4444" stroke-width="1.2"/>
                  <polygon points="25,2 27,6 23,6" fill="#fff7c2" stroke="#b71c1c" stroke-width="1.2"/>
                  <polygon points="7,2 9,6 5,6" fill="#fff7c2" stroke="#b71c1c" stroke-width="1.2"/>
                </g>
              </svg>
              ATTACK
            </template>
            <template v-else>
              <!-- Shield icon for defense -->
              <svg class="frame-action-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L28 10V18C28 24 16 28 16 28C16 28 4 24 4 18V10L16 4Z" fill="#22c55e" stroke="#1b5e20" stroke-width="2.5"/>
                <rect x="12" y="14" width="8" height="6" rx="2" fill="#e2fbe2" stroke="#1b5e20" stroke-width="1.5"/>
              </svg>
              DEFENSE
            </template>
          </span>
          <CharacterPictureFrame
            :character="character2"
            size="sm"
            class="header-icon defender-frame"
          />
        </div>
        <h2 class="popup-title">{{ popupTitle }}</h2>
      </div>

      <div class="popup-explanation">
        <span>{{ popupExplanation }}</span>
      </div>

      <div :class="[isAttack ? 'attack-type-options' : 'defense-type-options']">
        <button class="action-type-btn" @click="handleSelect('phy')">Physical</button>
        <button class="action-type-btn" @click="handleSelect('magic')">Magic</button>
        <button class="action-type-btn" @click="handleSelect('mix')">Mixed</button>
      </div>
      <label class="popup-checkbox">
        <input type="checkbox" :checked="alwaysChecked" @change="handleCheckboxChange" /> Always use this {{ isAttack ? 'attack' : 'defense' }} type
      </label>
      <button class="dismiss-btn" @click="handleDismiss">Inspect</button>
    </div>
  <!-- </Popup> -->
</template>

<style scoped>
/* Ensure Popup.vue's modal-content styles are either global or apply via customClass */
/* or define a base for action-type-popup here */
.action-type-popup :deep(.modal-content) {
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.popup-action-content {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  border: 4px solid #e2c178;
  border-radius: 16px;
  box-shadow: 0 0 16px #e2c17880;
  animation: popup-border-glow 1.2s linear infinite;
}

@keyframes popup-border-glow {
  0% {
    border-color: #e2c178;
    box-shadow: 0 0 16px #e2c17880;
  }
  30% {
    border-color: #fff7c2;
    box-shadow: 0 0 24px #fff7c280;
  }
  60% {
    border-color: #e2c178;
    box-shadow: 0 0 16px #e2c17880;
  }
  80% {
    border-color: #b48d39;
    box-shadow: 0 0 24px #b48d3980;
  }
  100% {
    border-color: #e2c178;
    box-shadow: 0 0 16px #e2c17880;
  }
}

.popup-header-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.8rem;
}
.frame-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 340px;
  gap: 1.2rem;
}

.popup-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.6rem, 4vw, 2.2rem); /* Slightly adjusted font size */
  font-weight: 900;
  color: #e2c178;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em; /* Slightly reduced letter spacing */
  text-shadow: 0 2px 8px #000a;
  word-break: break-word;
}

/* Style for the smaller character icon in the header */
.header-icon {
  flex-shrink: 0;
  height: 100px;
}
.attacker-frame {
  border: 4px solid #b71c1c;
  border-radius: 12px;
  box-shadow: 0 0 12px #b71c1c80;
  animation: attacker-glow 1.2s linear infinite;
}
.defender-frame {
  border: 4px solid #1b5e20;
  border-radius: 12px;
  box-shadow: 0 0 12px #1b5e2080;
  animation: defender-glow 1.2s linear infinite;
}

@keyframes attacker-glow {
  0% {
    border-color: #b71c1c;
    box-shadow: 0 0 12px #b71c1c80;
  }
  50% {
    border-color: #ef4444;
    box-shadow: 0 0 24px #ef444480;
  }
  100% {
    border-color: #b71c1c;
    box-shadow: 0 0 12px #b71c1c80;
  }
}
@keyframes defender-glow {
  0% {
    border-color: #1b5e20;
    box-shadow: 0 0 12px #1b5e2080;
  }
  50% {
    border-color: #22c55e;
    box-shadow: 0 0 24px #22c55e80;
  }
  100% {
    border-color: #1b5e20;
    box-shadow: 0 0 12px #1b5e2080;
  }
}

.popup-explanation {
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: #e2c178;
  font-size: clamp(0.9rem, 2.5vw, 1.05rem);
  margin-bottom: 0.5rem;
  text-align: center; /* Changed to center for better look with icon */
  max-width: 95%;
  word-break: break-word;
  box-sizing: border-box;
}

.attack-type-options,
.defense-type-options {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}

.action-type-btn { /* Combined styles for both attack and defense buttons */
  font-family: 'Cinzel', serif;
  font-size: clamp(0.9rem, 2.8vw, 1.1rem);
  font-weight: 700;
  padding: 0.6rem 1.8rem;
  border-radius: 10px;
  border: 3px solid #e2c178;
  background: linear-gradient(to bottom, #3a2e15, #6b552d);
  color: #fdecc4;
  box-shadow: 0 2px 8px #0006;
  transition: all 0.18s;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 100px;
  box-sizing: border-box;
}
.action-type-btn:hover {
  background: linear-gradient(to bottom, #e2c178, #b48d39);
  color: #3a2e15;
  border-color: #fff;
  box-shadow: 0 0 10px #e2c178;
}

.popup-checkbox {
  margin-top: 0.7rem;
  color: #e2c178;
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.popup-checkbox input[type="checkbox"] {
  accent-color: #e2c178;
  width: 1.1em;
  height: 1.1em;
}

.dismiss-btn {
  background: none; border: none; color: #c8ab6b;
  opacity: 0.8; cursor: pointer; text-decoration: underline;
  font-size: clamp(0.8rem, 2.2vw, 0.9rem); padding: 0.4rem;
}
.dismiss-btn:hover { opacity: 1; color: #fff; }


/* Media Queries for very small screens */
@media (max-width: 480px) {
  .frame-row {
    max-width: 100%;
    gap: 0.5rem;
  }
  .popup-title {
    font-size: 1.5rem;
    text-align: center;
  }
}
</style>