<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: 'Video' }
})

const video = ref(null)
const playing = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const wide = ref(false)
const showControls = ref(false)
let controlsTimeout = null

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
    playing.value = true
  } else {
    video.value.pause()
    playing.value = false
  }
  triggerControlsVisibility()
}

function handleProgressClick(event) {
  if (!video.value || !duration.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
  video.value.currentTime = percentage * duration.value
}

function triggerControlsVisibility() {
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  if (playing.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false
    }, 2500)
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape' && wide.value) {
    wide.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  if (controlsTimeout) clearTimeout(controlsTimeout)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div 
    :class="['video-shell', { 'is-wide': wide }]" 
    @mousemove="triggerControlsVisibility" 
    @mouseleave="showControls = false"
  >
    <div class="video-container">
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
      
      <!-- Center Play Overlay (Visible when paused) -->
      <button 
        v-if="!playing" 
        class="video-play-overlay" 
        @click="togglePlay" 
        aria-label="Play video"
      >
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="currentColor" d="M8 5v14l11-7z"/>
        </svg>
      </button>

      <!-- Video Control Bar Overlay -->
      <div :class="['video-controls-bar', { 'is-visible': showControls || !playing }]">
        <!-- Seek Track Progress Container -->
        <div class="video-progress-container" @click="handleProgressClick">
          <div class="video-progress-bg"></div>
          <div class="video-progress-fill" :style="{ width: `${progress}%` }"></div>
          <div class="video-progress-handle" :style="{ left: `${progress}%` }"></div>
        </div>

        <div class="video-controls-row">
          <div class="video-controls-left">
            <!-- Play/Pause Control -->
            <button class="video-ctrl-btn" type="button" @click="togglePlay" :aria-label="playing ? 'Pause' : 'Play'">
              <svg v-if="!playing" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>

            <!-- Time Display -->
            <span class="video-time-display">
              {{ formatTime(currentTime) }} <span class="video-time-divider">/</span> {{ formatTime(duration) }}
            </span>
          </div>

          <div class="video-controls-right">
            <!-- Toggle Wide View Mode -->
            <button class="video-ctrl-btn" type="button" @click="wide = !wide" :aria-label="wide ? 'Exit Wide View' : 'Wide View'">
              <svg v-if="!wide" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
