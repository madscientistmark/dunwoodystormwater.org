<script setup>
import { onMounted, ref, watch } from 'vue'
import { useSignatureCount } from '../composables/useSignatureCount.js'

const props = defineProps({
  variant: { type: String, default: 'default' }, // 'default' | 'hero'
})

const { count, status, load } = useSignatureCount()

// Displayed (animated) value, tweened toward the real count.
const display = ref(0)
let rafId = null

function animateTo(target) {
  const from = display.value
  if (from === target) return
  cancelAnimationFrame(rafId)
  const duration = 900
  let start = null
  const step = (ts) => {
    if (start === null) start = ts
    const t = Math.min(1, (ts - start) / duration)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)
    display.value = Math.round(from + (target - from) * eased)
    if (t < 1) rafId = requestAnimationFrame(step)
    else display.value = target
  }
  rafId = requestAnimationFrame(step)
}

watch(count, (val) => {
  if (typeof val === 'number') animateTo(val)
})

onMounted(load)

// Let a parent (e.g. the petition page after a signature) re-fetch the count.
defineExpose({ refresh: load })
</script>

<template>
  <div
    v-if="status === 'ready' && count != null"
    class="signature-count"
    :class="`signature-count--${variant}`"
    aria-live="polite"
  >
    <span class="signature-count__number">{{ display.toLocaleString('en-US') }}</span>
    <span class="signature-count__label">neighbors have signed</span>
  </div>
</template>

<style scoped>
.signature-count { text-align: center; margin: 1.5rem 0; }
.signature-count__number {
  display: block; font-size: 2.75rem; font-weight: 800; color: var(--color-primary);
  line-height: 1.1; font-variant-numeric: tabular-nums;
}
.signature-count__label { color: var(--color-muted); font-size: 1.05rem; }

/* Hero variant: white text on the blue hero gradient, extra large. */
.signature-count--hero { margin: 0 0 1.75rem; }
.signature-count--hero .signature-count__number {
  color: #fff; font-size: 3.75rem;
}
.signature-count--hero .signature-count__label {
  color: rgba(255, 255, 255, 0.9); font-size: 1.15rem;
}
@media (max-width: 600px) {
  .signature-count--hero .signature-count__number { font-size: 2.75rem; }
}
</style>
