<script setup>
import { onMounted, computed } from 'vue'
import { useSignatureCount } from '../composables/useSignatureCount.js'

const { count, status, load } = useSignatureCount()
onMounted(load)

const formatted = computed(() =>
  count.value != null ? count.value.toLocaleString('en-US') : '',
)
</script>

<template>
  <div v-if="status === 'ready' && count != null" class="signature-count">
    <span class="signature-count__number">{{ formatted }}</span>
    <span class="signature-count__label">neighbors have signed</span>
  </div>
</template>

<style scoped>
.signature-count { text-align: center; margin: 1.5rem 0; }
.signature-count__number {
  display: block; font-size: 2.75rem; font-weight: 800; color: var(--color-primary);
}
.signature-count__label { color: var(--color-muted); font-size: 1.05rem; }
</style>
