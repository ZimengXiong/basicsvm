<script setup>
import { computed } from 'vue'
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

const current = computed(() => {
  const m = route.path.match(/\/install\/(?:version|migrate-to)-(\d+-\d+)/)
  return m ? m[1] : ''
})
const selected = computed(() => versions.find(v => v.id === current.value))

function go(e) {
  const id = e.target.value
  if (id) router.go(`/install/version-${id}`)
}
</script>

<template>
  <div class="version-picker">
    <h2 class="version-picker-title">Versions</h2>
    <select :value="current" aria-label="Version" @change="go">
      <option value="" disabled>Select</option>
      <option v-for="v in versions" :key="v.id" :value="v.id">{{ v.label }}{{ v.latest ? ' (latest)' : '' }}</option>
    </select>
    <a v-if="selected && selected.migrate" :href="`/install/migrate-to-${selected.id}`" :class="{ active: route.path.includes('migrate-to') }">Migrate to {{ selected.label }}</a>
    <a href="/install/versions" :class="{ active: route.path === '/install/versions' }">All versions</a>
    <a href="/release/" :class="{ active: route.path.startsWith('/release') }">Release notes</a>
  </div>
</template>
