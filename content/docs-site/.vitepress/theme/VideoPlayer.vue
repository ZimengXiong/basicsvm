<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: 'Video' }
})

const video = ref(null)
const playing = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const wide = ref(false)

const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(value) {
  if (!Number.isFinite(value)) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function togglePlay() {
  if (!video.value) return
  if (video.value.paused) {
    video.value.play()
  } else {
    video.value.pause()
  }
}

function seek(event) {
  if (!video.value || !duration.value) return
  video.value.currentTime = Number(event.target.value)
}

</script>

<template>
  <div :class="['video-shell', { 'is-wide': wide }]">
    <div class="video-frame">
      <video
        ref="video"
        :src="src"
        preload="metadata"
        playsinline
        @click="togglePlay"
        @play="playing = true"
        @pause="playing = false"
        @loadedmetadata="duration = video?.duration || 0"
        @timeupdate="currentTime = video?.currentTime || 0"
      />
      <div class="video-controls">
        <button type="button" @click="togglePlay" :aria-label="playing ? 'Pause video' : 'Play video'">
          {{ playing ? 'Pause' : 'Play' }}
        </button>
        <span class="video-time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        <input
          type="range"
          min="0"
          :max="duration || 0"
          step="0.01"
          :value="currentTime"
          :style="{ '--video-progress': `${progress}%` }"
          aria-label="Video progress"
          @input="seek"
        >
        <button type="button" @click="wide = !wide">{{ wide ? 'Close' : 'Wide' }}</button>
      </div>
    </div>
  </div>
</template>
