<script setup>
import { useData } from 'vitepress'

const { theme, isDark, page } = useData()
const links = theme.value.nav || []

function current(link) {
  const p = page.value.relativePath
  if (link === '/') return p === 'index.md'
  return ('/' + p).startsWith(link.replace(/\/$/, ''))
}
function toggleDark() { isDark.value = !isDark.value }
</script>

<template>
  <div class="mobile-nav">
    <h2 class="mobile-nav-title">Site</h2>
    <a
      v-for="l in links"
      :key="l.link"
      :href="l.link"
      :class="{ active: current(l.link) }"
      :target="l.target || (/^https?:/.test(l.link) ? '_blank' : null)"
      :rel="/^https?:/.test(l.link) ? 'noreferrer' : null"
    >{{ l.text }}</a>
    <button type="button" class="mobile-nav-appearance" role="switch" :aria-checked="isDark" @click="toggleDark">
      <span>Dark mode</span>
      <span class="mobile-nav-switch"><span class="mobile-nav-knob" /></span>
    </button>
  </div>
</template>
