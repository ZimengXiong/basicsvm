<script setup>
function open() {
  const btn = document.querySelector('.VPLocalNav .menu')
  if (btn) btn.click()
}
</script>

<template>
  <button type="button" class="sidebar-trigger" aria-label="Menu" @click="open">
    <span /><span /><span />
  </button>
</template>
