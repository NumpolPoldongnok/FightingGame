<template>
  <div class="character-picture-frame" :style="frameStyle">
    <template v-if="image">
      <img :src="image" :alt="alt" class="character-picture-img" />
    </template>
    <template v-else>
      <svg class="character-picture-placeholder" viewBox="0 0 80 80" :width="props.size" :height="props.size" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="80" height="80" rx="12" fill="#f3e7c4" />
        <circle cx="40" cy="32" r="16" fill="#e2c178" />
        <rect x="18" y="54" width="44" height="14" rx="7" fill="#e2c178" />
        <text x="40" y="46" text-anchor="middle" fill="#fff" font-size="12" font-family="'Cinzel', serif" font-weight="bold" dy=".3em">?</text>
      </svg>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ref, watch, onMounted } from 'vue'
import type { Character } from '../store/useGameStore'
import { imageStore } from '../store/imageStore'
const props = defineProps<{
  character: Character,
  size?: number | string,
  alt?: string,
  borderColor?: string,
  bgColor?: string
}>()
const frameStyle = computed(() => ({
  width: typeof props.size === 'number' ? props.size + 'px' : props.size,
  height: typeof props.size === 'number' ? props.size + 'px' : props.size,
  border: `2px solid ${props.borderColor}`,
  background: props.bgColor
}))

const image = ref<string | undefined>(undefined)
async function loadImage() {
  if (props.character && props.character.id) {
    image.value = await imageStore.getImage(props.character.id)
  } else {
    image.value = undefined
  }
}
onMounted(loadImage)
watch(() => props.character.id, loadImage)
</script>

<style scoped>
.character-picture-frame {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.character-picture-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
