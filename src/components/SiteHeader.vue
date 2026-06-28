<script setup>
import { ref } from 'vue'
const open = ref(false)
const links = [
  { to: '/', label: 'Home' },
  { to: '/petition', label: 'Petition' },
  { to: '/share-your-story', label: 'Share Your Story' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <router-link to="/" class="brand" @click="open = false">
        <span class="brand__mark">💧</span>
        <span class="brand__text">Dunwoody Stormwater Stewardship</span>
      </router-link>
      <button class="header__toggle" @click="open = !open" aria-label="Toggle menu">☰</button>
      <nav class="nav" :class="{ 'nav--open': open }">
        <router-link
          v-for="l in links" :key="l.to" :to="l.to" class="nav__link"
          @click="open = false"
        >{{ l.label }}</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 50; }
.header__inner { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; padding-bottom: 0.75rem; }
.brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--color-primary-dark); text-decoration: none; font-size: 1.05rem; }
.nav { display: flex; gap: 1.1rem; }
.nav__link { color: var(--color-text); text-decoration: none; font-weight: 600; }
.nav__link.router-link-active { color: var(--color-primary); }
.header__toggle { display: none; font-size: 1.5rem; background: none; border: none; cursor: pointer; }
@media (max-width: 820px) {
  .header__toggle { display: block; }
  .nav { display: none; position: absolute; top: 100%; left: 0; right: 0; flex-direction: column; background: var(--color-surface); padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-border); }
  .nav--open { display: flex; }
}
</style>
