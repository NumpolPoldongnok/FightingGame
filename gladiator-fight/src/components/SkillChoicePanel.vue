<template>
    <div>
        <span>เลือก Skill รางวัล</span>
        <span style="margin: 0 8px;"></span>
        <button @click="$emit('refresh-skill')">🔄</button>
    </div>
    <ul>
        <li v-for="(s, i) in skillChoices" :key="i">
            <SkillChoiceButton :skill="s" :index="i" @choose="$emit('choose-skill', i)" />
        </li>
    </ul>
    <div>
        <button @click="showConfirm = true">กลับไปเตรียมตัว</button>
        <div v-if="showConfirm" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:1000;">
            <div style="background:white;padding:2em 2.5em;border-radius:1em;box-shadow:0 2px 16px #0002;min-width:220px;text-align:center;">
                <div style="margin-bottom:1em;font-weight:bold;color:#222;">
                  ยังไม่ได้รับรางวัล<br>ยืนยันกลับไปเตรียมตัว?
                </div>
                <button @click="showConfirm = false" style="margin-right:1em;">ยกเลิก</button>
                <button @click="confirmBack">ยืนยัน</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Skill } from '../store/skillUtils'
import SkillChoiceButton from './SkillChoiceButton.vue'
const props = defineProps<{
    skillChoices: Skill[]
}>()
const emit = defineEmits(['choose-skill', 'refresh-skill', 'back'])
const showConfirm = ref(false)
function confirmBack() {
    showConfirm.value = false
    emit('back')
}
</script>
