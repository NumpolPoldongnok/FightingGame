
<script setup lang="ts">
import { ref } from 'vue'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'

type Status = {
  str: number
  agi: number
  vit: number
  dex: number
  int: number
  luk: number
  cha: number
}

type Character = {
  name: string
  hp: number
  maxHp: number
  money: number
  status: Status
  skill: string[]
}

const scenes = {
  PREPARE: 'prepare',
  FIGHT: 'fight',
}

const character = ref<Character | null>(null)
const enemy = ref<Character | null>(null)
const winStreak = ref(0)
const currentScene = ref(scenes.PREPARE)
const deadCharacters = ref<Character[]>([])
const skillChoices = ref<string[][]>([])
const showSkillSelect = ref(false)
const showResultButton = ref(false)
type CharacterHistory = Character & { winCount: number }
const characterHistory = ref<CharacterHistory[]>([])

function onBattleFinished() {
  showResultButton.value = true
}

function randomStatus(total: number, base: Status = {str:1,agi:1,vit:1,dex:1,int:1,luk:1,cha:1}): Status {
  // กระจายแต้มแบบสุ่ม
  let remain = total - 7;
  const keys = Object.keys(base) as (keyof Status)[];
  const status: Status = { ...base };
  while (remain > 0) {
    const k = keys[Math.floor(Math.random() * keys.length)];
    status[k]++;
    remain--;
  }
  return status;
}

function randomCharacter(statusTotal = 30, baseStatus?: Status): Character {
  const names = ['Maximus', 'Spartacus', 'Crixus', 'Commodus', 'Tigris'];
  const status = randomStatus(statusTotal, baseStatus);
  const maxHp = Math.floor(Math.random() * statusTotal) + 100;
  return {
    name: names[Math.floor(Math.random() * names.length)],
    hp: maxHp,
    maxHp,
    money: 0,
    status,
    skill: [],
  };
}

let statusTotal = 30;
function startNewGame() {
  // ทุกครั้งที่เกิดใหม่ statustTotal + 1 และ base เอามาแค่ 10%
  let base: Status | undefined = undefined;
  if (character.value) {
    // เก็บประวัติตัวละครก่อนรี
    characterHistory.value.push({ ...character.value, winCount: winStreak.value });
    // base = 10% ของ status เดิม
    base = { ...character.value.status };
    Object.keys(base).forEach(k => {
      base![k as keyof Status] = Math.floor(base![k as keyof Status] * 0.1);
    });
    statusTotal++;
  } else {
    statusTotal = 30;
  }
  character.value = randomCharacter(statusTotal, base);
  winStreak.value = 0;
  deadCharacters.value = [];
  currentScene.value = scenes.PREPARE;
}

function startFight() {
  // ป้องกันเข้าฉากต่อสู้ถ้า HP หมด
  if (!character.value || character.value.hp <= 0) return;
  // ถ้ามีตัวละครที่เคยใช้และตายที่ winStreak ปัจจุบัน ให้เอามาเป็นศัตรู
  const found = characterHistory.value.find(
    (c) => c.hp <= 0 && c.skill && c.skill.length && c.skill[c.skill.length - 1].includes(`win: ${winStreak.value}`)
  );
  if (deadCharacters.value.length > 0) {
    // หาใน deadCharacters ที่ตายรอบ winStreak นี้
    const dead = deadCharacters.value.find((c) => c.hp <= 0 && c.skill && c.skill.length && c.skill[c.skill.length - 1].includes(`win: ${winStreak.value}`));
    if (dead) {
      enemy.value = { ...dead };
      currentScene.value = scenes.FIGHT;
      return;
    }
  }
  // ถ้าไม่มี ให้สุ่มศัตรูใหม่
  const total = 20 + winStreak.value * 10;
  enemy.value = randomCharacter(total);
  currentScene.value = scenes.FIGHT;
}

function fight() {
  if (!character.value || !enemy.value) return;
  // ระบบต่อสู้อิง str, agi, vit
  const playerAttack = Math.floor(Math.random() * character.value.status.str) + character.value.status.agi;
  const enemyAttack = Math.floor(Math.random() * enemy.value.status.str) + enemy.value.status.agi;
  enemy.value.hp -= playerAttack;
  if (enemy.value.hp <= 0) {
    // ชนะ
    winStreak.value++;
    character.value.money += 10 * winStreak.value;
    // สุ่ม skill 3 แบบให้เลือก
    skillChoices.value = randomSkillChoices();
    showSkillSelect.value = true;
    currentScene.value = scenes.PREPARE;
    return;
  }
  character.value.hp -= enemyAttack;
  if (character.value.hp <= 0) {
    // แพ้
    // บันทึก winStreak ที่ตายลง skill log เพื่อใช้ตามหาในอนาคต
    const charCopy = { ...character.value, skill: [...character.value.skill, `win: ${winStreak.value}`] };
    deadCharacters.value.push(charCopy);
    characterHistory.value.push({ ...charCopy, winCount: winStreak.value });
    currentScene.value = scenes.PREPARE;
    setTimeout(startNewGame, 1500);
  }
}

function randomSkillChoices(): string[][] {
  // 4 skill: เพิ่ม status random 10, เพิ่ม status ใดๆ 10, คูณ status 1.1x-2x, เพิ่ม maxHp 10%
  const keys = ['str','agi','vit','dex','int','luk','cha'];
  return [
    [`เพิ่ม status แบบสุ่ม 10`, 'random10'],
    [`เพิ่ม status ใดๆ 10`, 'choose10'],
    [`คูณ status ทั้งหมด x${(Math.random()*0.9+1.1).toFixed(2)}`, 'multiply'],
    [`เพิ่ม Max HP 10%`, 'maxhp10']
  ];
}

function applySkill(idx: number) {
  if (!character.value) return;
  const skill = skillChoices.value[idx][1];
  if (skill === 'random10') {
    // เพิ่ม status แบบสุ่ม 10
    for (let i = 0; i < 10; i++) {
      const k = Object.keys(character.value.status) as (keyof Status)[];
      const key = k[Math.floor(Math.random() * k.length)];
      character.value.status[key]++;
    }
  } else if (skill === 'choose10') {
    // เพิ่ม status ใดๆ 10 (เลือก str เป็นตัวอย่าง)
    character.value.status.str += 10;
  } else if (skill === 'multiply') {
    // คูณ status ทั้งหมด
    const mul = parseFloat(skillChoices.value[idx][0].split('x')[1]);
    Object.keys(character.value.status).forEach(k => {
      character.value!.status[k as keyof Status] = Math.floor(character.value!.status[k as keyof Status] * mul);
    });
  } else if (skill === 'maxhp10') {
    // เพิ่ม maxHp 10% และฟื้น HP ตาม max ใหม่
    const add = Math.floor(character.value.maxHp * 0.1);
    character.value.maxHp += add;
    character.value.hp += add;
    if (character.value.hp > character.value.maxHp) character.value.hp = character.value.maxHp;
  }
  character.value.skill.push(skillChoices.value[idx][0]);
  showSkillSelect.value = false;
}

// เริ่มเกมทันที
startNewGame()
</script>


<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    <div class="wrapper">
      <h1>Gladiator Fight</h1>
      <p>ชนะติดต่อกัน: {{ winStreak }}</p>
      <button v-if="character && character.hp <= 0" @click="startNewGame">เกิดใหม่</button>
    </div>
  </header>
  <main>
    <button @click="currentScene = 'history'" style="margin-bottom:1rem">ดูประวัติตัวละครที่เคยใช้</button>
    <PrepareScene
      v-if="currentScene === scenes.PREPARE && character"
      :character="character"
      :dead-characters="deadCharacters"
      @start-fight="startFight"
      @buy-heal="() => { if (character && character.money >= 100 && character.hp < character.maxHp) { character.money -= 100; const heal = Math.floor(character.maxHp * 0.1); character.hp += heal; if (character.hp > character.maxHp) character.hp = character.maxHp; } }"
    />
    <FightScene
      v-if="currentScene === scenes.FIGHT && character && enemy"
      :character="character"
      :enemy="enemy"
      @battle-finished="onBattleFinished"
    />
    <!-- Skill Select Popup -->
    <div v-if="showSkillSelect" class="modal-overlay">
      <div class="modal-box">
        <h3>เลือก Skill หลังชนะ</h3>
        <ul>
          <li v-for="(s, i) in skillChoices" :key="i">
            <button @click="applySkill(i)">{{ s[0] }}</button>
          </li>
        </ul>
      </div>
    </div>
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
    <div v-if="currentScene === scenes.FIGHT && showResultButton">
      <button @click="showResultButton = false; currentScene = scenes.PREPARE">ดูผลและกลับไปเตรียมตัว</button>
    </div>
    <div v-if="currentScene === 'history'">
      <h2>ประวัติตัวละครที่เคยใช้</h2>
      <ul>
        <li v-for="(c, idx) in characterHistory" :key="idx">
          <strong>{{ c.name }}</strong> | HP: {{ c.hp }} | เงิน: {{ c.money }} | <span>ชนะ: {{ c.winCount ?? 0 }}</span>
          <span>Status: [STR:{{ c.status.str }}, AGI:{{ c.status.agi }}, VIT:{{ c.status.vit }}, DEX:{{ c.status.dex }}, INT:{{ c.status.int }}, LUK:{{ c.status.luk }}, CHA:{{ c.status.cha }}]</span>
          <span> | Skill: <span v-for="(s, i) in c.skill" :key="i">{{ s }} </span></span>
        </li>
      </ul>
      <button @click="currentScene = scenes.PREPARE">กลับ</button>
    </div>
  </main>
</template>
<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
