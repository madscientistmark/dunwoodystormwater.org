<script setup>
defineProps({
  to: { type: String, required: true },
  variant: { type: String, default: 'primary' },
})
</script>

<template>
  <router-link :to="to" class="cta" :class="`cta--${variant}`">
    <slot />
  </router-link>
</template>

<style scoped>
.cta {
  display: inline-block; padding: 0.85rem 1.6rem; border-radius: var(--radius);
  font-weight: 700; text-decoration: none; transition: background 0.15s, color 0.15s;
}
.cta--primary { background: var(--color-primary); color: #fff; }
.cta--primary:hover { background: var(--color-primary-dark); }
.cta--secondary { background: #fff; color: var(--color-primary); border: 2px solid var(--color-primary); }
.cta--secondary:hover { background: var(--color-bg); }
</style>
