<script setup>
import { onMounted, ref } from 'vue'

const KEY = 'basicsvm-ux'
const current = ref('1')
const options = ['1', '2', '3', '4', '5']

function apply(value) {
  current.value = value
  document.documentElement.dataset.ux = value
  try { localStorage.setItem(KEY, value) } catch {}
}

onMounted(() => {
  let saved = '1'
  try { saved = localStorage.getItem(KEY) || '1' } catch {}
  apply(options.includes(saved) ? saved : '1')
})
</script>

<template>
  <div class="ux-switcher">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      :aria-pressed="current === option"
      @click="apply(option)"
    >{{ option }}</button>
  </div>
</template>
