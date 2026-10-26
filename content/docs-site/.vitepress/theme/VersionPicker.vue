<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vitepress'

const versions = [
  { id: '1-4', label: '1.4', latest: true, migrate: true },
  { id: '1-3', label: '1.3', migrate: true },
  { id: '1-2', label: '1.2', migrate: true },
  { id: '1-1', label: '1.1', migrate: true },
  { id: '1-0', label: '1.0' }
]

const route = useRoute()
const router = useRouter()
const open = ref(false)
const root = ref(null)

const current = computed(() => {
  const m = route.path.match(/\/install\/(?:version|migrate-to)-(\d+-\d+)/)
  return m ? m[1] : ''
})
const selected = computed(() => versions.find(v => v.id === current.value))
const label = computed(() => selected.value ? selected.value.label + (selected.value.latest ? ' (latest)' : '') : 'Select')

function onDoc(e) { if (root.value && !root.value.contains(e.target)) close() }
function onKey(e) { if (e.key === 'Escape') close() }
function show() { open.value = true; document.addEventListener('pointerdown', onDoc, true); document.addEventListener('keydown', onKey) }
function close() { open.value = false; document.removeEventListener('pointerdown', onDoc, true); document.removeEventListener('keydown', onKey) }
function toggle() { open.value ? close() : show() }
function pick(v) { close(); router.go(`/install/version-${v.id}`) }
onBeforeUnmount(close)
</script>

<template>
  <div class="version-picker" ref="root">
    <h2 class="version-picker-title">Versions</h2>
    <div class="menu">
      <button type="button" class="menu-btn" aria-haspopup="listbox" :aria-expanded="open" aria-label="Version" @click="toggle">{{ label }}</button>
      <div v-if="open" class="menu-list" role="listbox">
        <button v-for="v in versions" :key="v.id" type="button" role="option" :aria-selected="v.id === current" @click="pick(v)">{{ v.label }}{{ v.latest ? ' (latest)' : '' }}</button>
      </div>
    </div>
    <a v-if="selected && selected.migrate" :href="`/install/migrate-to-${selected.id}`" :class="{ active: route.path.includes('migrate-to') }">Migrate to {{ selected.label }}</a>
    <a href="/install/versions" :class="{ active: route.path === '/install/versions' }">All versions</a>
    <a href="/release/" :class="{ active: route.path.startsWith('/release') }">Release notes</a>
  </div>
</template>
