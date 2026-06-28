# Dunwoody Stormwater Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vue 3 + Vite static website for the Dunwoody Stormwater Stewardship Initiative with custom-branded petition and story forms that submit to a Google Apps Script backed by a Google Sheet, plus a live signature count.

**Architecture:** Static Vue 3 SPA (Vue Router, Composition API) deployed to a static host. All data persistence is a Google Apps Script Web App bound to a Google Sheet (Petitions/Stories tabs) with photos in a Drive folder. The frontend talks to one Apps Script URL via `text/plain` POSTs (to avoid CORS preflight) and a `GET ?action=count`.

**Tech Stack:** Vue 3, Vite, Vue Router 4, Vitest + @vue/test-utils + jsdom, plain CSS with CSS variables. Google Apps Script (Code.gs) for the backend.

## Global Constraints

- Node 18+ / Vite 5+, Vue 3 (Composition API with `<script setup>`).
- Single frontend config value: `VITE_APPS_SCRIPT_URL` (read via `import.meta.env`).
- Contact email everywhere: `info@DunwoodyStormwater.org`. Website: `www.DunwoodyStormwater.org`.
- Tagline: "Because when the rain falls, we all live downstream."
- Petition affirmation checkbox must gate the submit button (disabled until checked).
- POST body sent as `Content-Type: text/plain` to avoid Apps Script CORS preflight.
- Photo upload: single image, ≤5 MB, types jpg/png/webp.
- Page content must match the spec verbatim (see spec at `docs/superpowers/specs/2026-06-28-dunwoody-stormwater-website-design.md`).
- All routes share `SiteHeader` and `SiteFooter`.

---

## File Structure

```
package.json, vite.config.js, vitest.config.js, index.html, .env.example, .gitignore
src/
  main.js                 # app bootstrap + router
  router.js               # route table
  App.vue                 # layout shell (header + <router-view> + footer)
  config.js               # exports APPS_SCRIPT_URL from env
  style.css               # global styles + CSS variables (theme)
  composables/
    useSubmit.js          # POST helper with idle/submitting/success/error
    useSignatureCount.js  # GET count helper
  lib/
    validation.js         # pure validators (email, required, photo)
    petitionFields.js     # petition field constants/options
    storyFields.js        # story issue-type options
  components/
    SiteHeader.vue
    SiteFooter.vue
    CtaButton.vue
    SignatureCount.vue
    PetitionForm.vue
    StoryForm.vue
    FieldError.vue
  pages/
    HomePage.vue
    PetitionPage.vue
    StoryPage.vue
    AboutPage.vue
    FaqPage.vue
    ContactPage.vue
tests/
  validation.test.js
  useSubmit.test.js
  useSignatureCount.test.js
  PetitionForm.test.js
  StoryForm.test.js
  SignatureCount.test.js
apps-script/
  Code.gs
  README.md
README.md
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`, `vite.config.js`, `vitest.config.js`, `index.html`, `.gitignore`, `.env.example`, `src/main.js`, `src/App.vue`, `src/router.js`, `src/config.js`, `src/style.css`
- Create stub pages: `src/pages/HomePage.vue` … `ContactPage.vue` (placeholder content, replaced in later tasks)

**Interfaces:**
- Produces: `src/config.js` exports `APPS_SCRIPT_URL` (string). `src/router.js` exports a configured router with routes `/`, `/petition`, `/share-your-story`, `/about`, `/faq`, `/contact`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dunwoody-stormwater",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^24.0.0",
    "vite": "^5.2.0",
    "vitest": "^1.5.0"
  }
}
```

- [ ] **Step 2: Create config files**

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

`vitest.config.js`:
```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

`.gitignore`:
```
node_modules
dist
.env
.DS_Store
```

`.env.example`:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/REPLACE_ME/exec
```

`index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dunwoody Stormwater Stewardship Initiative</title>
    <meta name="description" content="A citizen-led effort for transparent, consistent, responsible stormwater management in Dunwoody. Sign the petition." />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `src/config.js`**

```js
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''
```

- [ ] **Step 4: Create `src/router.js`**

```js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import PetitionPage from './pages/PetitionPage.vue'
import StoryPage from './pages/StoryPage.vue'
import AboutPage from './pages/AboutPage.vue'
import FaqPage from './pages/FaqPage.vue'
import ContactPage from './pages/ContactPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/petition', name: 'petition', component: PetitionPage },
  { path: '/share-your-story', name: 'story', component: StoryPage },
  { path: '/about', name: 'about', component: AboutPage },
  { path: '/faq', name: 'faq', component: FaqPage },
  { path: '/contact', name: 'contact', component: ContactPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
```

- [ ] **Step 5: Create `src/main.js`, `src/App.vue`, `src/style.css`, and stub pages**

`src/main.js`:
```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './style.css'

createApp(App).use(router).mount('#app')
```

`src/App.vue`:
```vue
<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <SiteHeader />
  <main><router-view /></main>
  <SiteFooter />
</template>
```

`src/style.css` (theme tokens + base; expanded in Task 9):
```css
:root {
  --color-primary: #1565a0;
  --color-primary-dark: #0d4a78;
  --color-accent: #2e8b6f;
  --color-text: #1f2933;
  --color-muted: #52606d;
  --color-bg: #f7fafc;
  --color-surface: #ffffff;
  --color-border: #d9e2ec;
  --max-width: 1080px;
  --radius: 10px;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font); color: var(--color-text); background: var(--color-bg); line-height: 1.6; }
main { min-height: 60vh; }
a { color: var(--color-primary); }
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 1.25rem; }
```

Create the six stub pages — each like (substitute name):
```vue
<template><section class="container"><h1>Home</h1></section></template>
```
(`HomePage.vue`, `PetitionPage.vue`, `StoryPage.vue`, `AboutPage.vue`, `FaqPage.vue`, `ContactPage.vue`.)

Also create minimal `src/components/SiteHeader.vue` and `src/components/SiteFooter.vue` stubs so the app mounts:
```vue
<template><header></header></template>
```
```vue
<template><footer></footer></template>
```

- [ ] **Step 6: Install and verify the app builds**

Run: `npm install && npm run build`
Expected: build succeeds, `dist/` produced, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vue 3 + Vite project with router and pages"
```

---

### Task 2: Validation library

**Files:**
- Create: `src/lib/validation.js`
- Test: `tests/validation.test.js`

**Interfaces:**
- Produces:
  - `isRequired(value) -> boolean` (true if non-empty after trim; false for null/undefined/empty/whitespace)
  - `isEmail(value) -> boolean`
  - `validatePhoto(file) -> { ok: boolean, error: string|null }` (≤5 MB; type in jpg/png/webp). `file` may be null → `{ ok: true, error: null }` (photo optional).
  - `MAX_PHOTO_BYTES = 5 * 1024 * 1024`, `ALLOWED_PHOTO_TYPES = ['image/jpeg','image/png','image/webp']`

- [ ] **Step 1: Write the failing test**

`tests/validation.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { isRequired, isEmail, validatePhoto, MAX_PHOTO_BYTES } from '../src/lib/validation.js'

describe('isRequired', () => {
  it('rejects empty/whitespace/null', () => {
    expect(isRequired('')).toBe(false)
    expect(isRequired('   ')).toBe(false)
    expect(isRequired(null)).toBe(false)
    expect(isRequired(undefined)).toBe(false)
  })
  it('accepts non-empty', () => {
    expect(isRequired('a')).toBe(true)
  })
})

describe('isEmail', () => {
  it('accepts valid', () => {
    expect(isEmail('a@b.co')).toBe(true)
  })
  it('rejects invalid', () => {
    expect(isEmail('nope')).toBe(false)
    expect(isEmail('a@b')).toBe(false)
    expect(isEmail('')).toBe(false)
  })
})

describe('validatePhoto', () => {
  it('passes when no file (optional)', () => {
    expect(validatePhoto(null)).toEqual({ ok: true, error: null })
  })
  it('rejects wrong type', () => {
    const f = { type: 'application/pdf', size: 100 }
    expect(validatePhoto(f).ok).toBe(false)
  })
  it('rejects too large', () => {
    const f = { type: 'image/png', size: MAX_PHOTO_BYTES + 1 }
    expect(validatePhoto(f).ok).toBe(false)
  })
  it('accepts valid image', () => {
    const f = { type: 'image/jpeg', size: 1000 }
    expect(validatePhoto(f)).toEqual({ ok: true, error: null })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/validation.test.js`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Write minimal implementation**

`src/lib/validation.js`:
```js
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function isRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== ''
}

export function isEmail(value) {
  if (typeof value !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function validatePhoto(file) {
  if (!file) return { ok: true, error: null }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { ok: false, error: 'Photo must be a JPG, PNG, or WebP image.' }
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: 'Photo must be 5 MB or smaller.' }
  }
  return { ok: true, error: null }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/validation.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.js tests/validation.test.js
git commit -m "feat: add form validation helpers"
```

---

### Task 3: Field constants

**Files:**
- Create: `src/lib/petitionFields.js`, `src/lib/storyFields.js`

**Interfaces:**
- Produces:
  - `petitionFields.js`: `RESIDENCY_OPTIONS = ['Yes', 'No', 'I own property but live elsewhere']`; `AFFIRMATION_POINTS` (array of 5 strings, verbatim from spec).
  - `storyFields.js`: `ISSUE_TYPES = ['Flooding','Erosion','Drainage problems','Pond issues','Lake issues','Stream bank erosion','Stormwater pipe failures']`.

- [ ] **Step 1: Create `src/lib/petitionFields.js`**

```js
export const RESIDENCY_OPTIONS = [
  'Yes',
  'No',
  'I own property but live elsewhere',
]

export const AFFIRMATION_POINTS = [
  'Every neighborhood deserves fair and consistent stormwater management.',
  'Stormwater policies should be transparent.',
  'Lakes, ponds, streams, and drainage systems deserve responsible stewardship.',
  'Citizens deserve meaningful participation in decisions affecting their neighborhoods.',
  'Dunwoody should become a model for stormwater stewardship.',
]
```

- [ ] **Step 2: Create `src/lib/storyFields.js`**

```js
export const ISSUE_TYPES = [
  'Flooding',
  'Erosion',
  'Drainage problems',
  'Pond issues',
  'Lake issues',
  'Stream bank erosion',
  'Stormwater pipe failures',
]
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/petitionFields.js src/lib/storyFields.js
git commit -m "feat: add petition and story field constants"
```

---

### Task 4: useSubmit composable

**Files:**
- Create: `src/composables/useSubmit.js`
- Test: `tests/useSubmit.test.js`

**Interfaces:**
- Consumes: `APPS_SCRIPT_URL` from `src/config.js`.
- Produces: `useSubmit()` returns `{ state, error, submit }` where `state` is a ref ('idle'|'submitting'|'success'|'error'), `error` is a ref(string|null), and `submit(payload)` POSTs JSON-as-text to `APPS_SCRIPT_URL` and resolves to `true` on success, `false` on failure. On `{ok:false}` or network error, `state`='error' and `error` is set.

- [ ] **Step 1: Write the failing test**

`tests/useSubmit.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/config.js', () => ({ APPS_SCRIPT_URL: 'https://example.test/exec' }))
import { useSubmit } from '../src/composables/useSubmit.js'

describe('useSubmit', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('sets success on {ok:true}', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ ok: true }) })
    const { state, submit } = useSubmit()
    const result = await submit({ type: 'petition', name: 'A' })
    expect(result).toBe(true)
    expect(state.value).toBe('success')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test/exec',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sets error on {ok:false}', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ ok: false, error: 'bad' }) })
    const { state, error, submit } = useSubmit()
    const result = await submit({ type: 'petition' })
    expect(result).toBe(false)
    expect(state.value).toBe('error')
    expect(error.value).toBe('bad')
  })

  it('sets error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    const { state, submit } = useSubmit()
    const result = await submit({ type: 'petition' })
    expect(result).toBe(false)
    expect(state.value).toBe('error')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/useSubmit.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

`src/composables/useSubmit.js`:
```js
import { ref } from 'vue'
import { APPS_SCRIPT_URL } from '../config.js'

export function useSubmit() {
  const state = ref('idle')
  const error = ref(null)

  async function submit(payload) {
    state.value = 'submitting'
    error.value = null
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data && data.ok) {
        state.value = 'success'
        return true
      }
      state.value = 'error'
      error.value = (data && data.error) || 'Something went wrong. Please try again.'
      return false
    } catch (e) {
      state.value = 'error'
      error.value = 'We could not reach the server. Please try again.'
      return false
    }
  }

  return { state, error, submit }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/useSubmit.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useSubmit.js tests/useSubmit.test.js
git commit -m "feat: add useSubmit composable for form submissions"
```

---

### Task 5: useSignatureCount composable + SignatureCount component

**Files:**
- Create: `src/composables/useSignatureCount.js`, `src/components/SignatureCount.vue`
- Test: `tests/useSignatureCount.test.js`, `tests/SignatureCount.test.js`

**Interfaces:**
- Consumes: `APPS_SCRIPT_URL` from `src/config.js`.
- Produces:
  - `useSignatureCount()` returns `{ count, status, load }` where `count` is ref(number|null), `status` is ref('idle'|'loading'|'ready'|'error'), `load()` does `GET ${APPS_SCRIPT_URL}?action=count` and sets `count` from `data.count`.
  - `SignatureCount.vue` calls `load()` on mount; renders nothing when status==='error' or count is null; renders the formatted count otherwise.

- [ ] **Step 1: Write the failing tests**

`tests/useSignatureCount.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('../src/config.js', () => ({ APPS_SCRIPT_URL: 'https://example.test/exec' }))
import { useSignatureCount } from '../src/composables/useSignatureCount.js'

describe('useSignatureCount', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('loads count on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 42 }) })
    const { count, status, load } = useSignatureCount()
    await load()
    expect(count.value).toBe(42)
    expect(status.value).toBe('ready')
  })

  it('sets error status on failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('x'))
    const { status, load } = useSignatureCount()
    await load()
    expect(status.value).toBe('error')
  })
})
```

`tests/SignatureCount.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
vi.mock('../src/config.js', () => ({ APPS_SCRIPT_URL: 'https://example.test/exec' }))
import SignatureCount from '../src/components/SignatureCount.vue'

describe('SignatureCount', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('renders formatted count when ready', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 1247 }) })
    const wrapper = mount(SignatureCount)
    await flushPromises()
    expect(wrapper.text()).toContain('1,247')
  })

  it('renders nothing on error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('x'))
    const wrapper = mount(SignatureCount)
    await flushPromises()
    expect(wrapper.text()).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/useSignatureCount.test.js tests/SignatureCount.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write minimal implementations**

`src/composables/useSignatureCount.js`:
```js
import { ref } from 'vue'
import { APPS_SCRIPT_URL } from '../config.js'

export function useSignatureCount() {
  const count = ref(null)
  const status = ref('idle')

  async function load() {
    status.value = 'loading'
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=count`)
      const data = await res.json()
      count.value = typeof data.count === 'number' ? data.count : null
      status.value = count.value === null ? 'error' : 'ready'
    } catch (e) {
      status.value = 'error'
    }
  }

  return { count, status, load }
}
```

`src/components/SignatureCount.vue`:
```vue
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/useSignatureCount.test.js tests/SignatureCount.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useSignatureCount.js src/components/SignatureCount.vue tests/useSignatureCount.test.js tests/SignatureCount.test.js
git commit -m "feat: add live signature count composable and component"
```

---

### Task 6: Shared UI components (FieldError, CtaButton, SiteHeader, SiteFooter)

**Files:**
- Create/replace: `src/components/FieldError.vue`, `src/components/CtaButton.vue`, `src/components/SiteHeader.vue`, `src/components/SiteFooter.vue`

**Interfaces:**
- Produces:
  - `FieldError.vue` — prop `message` (string|null); renders a `<p class="field-error">` only when message is truthy.
  - `CtaButton.vue` — prop `to` (router path string) and `variant` ('primary'|'secondary', default 'primary'); renders a `<router-link>` styled as a button; slot = label.
  - `SiteHeader.vue` — logo/title linking to `/`, nav with the 6 routes, mobile hamburger toggle.
  - `SiteFooter.vue` — contact email, website, tagline.

- [ ] **Step 1: Create `FieldError.vue`**

```vue
<script setup>
defineProps({ message: { type: String, default: null } })
</script>

<template>
  <p v-if="message" class="field-error" role="alert">{{ message }}</p>
</template>

<style scoped>
.field-error { color: #b42318; font-size: 0.9rem; margin: 0.25rem 0 0; }
</style>
```

- [ ] **Step 2: Create `CtaButton.vue`**

```vue
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
```

- [ ] **Step 3: Create `SiteHeader.vue`**

```vue
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
```

- [ ] **Step 4: Create `SiteFooter.vue`**

```vue
<template>
  <footer class="footer">
    <div class="container">
      <p class="footer__tag">Because when the rain falls, we all live downstream.</p>
      <p class="footer__contact">
        <a href="mailto:info@DunwoodyStormwater.org">info@DunwoodyStormwater.org</a>
        &nbsp;·&nbsp; www.DunwoodyStormwater.org
      </p>
      <p class="footer__fine">A citizen-led initiative for transparent, consistent stormwater management in Dunwoody.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--color-primary-dark); color: #fff; margin-top: 4rem; padding: 2rem 0; text-align: center; }
.footer a { color: #cfe6ff; }
.footer__tag { font-style: italic; font-size: 1.1rem; margin: 0 0 0.75rem; }
.footer__contact { margin: 0 0 0.5rem; }
.footer__fine { color: #bcd3e8; font-size: 0.9rem; margin: 0; }
</style>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/FieldError.vue src/components/CtaButton.vue src/components/SiteHeader.vue src/components/SiteFooter.vue
git commit -m "feat: add header, footer, CTA button, and field error components"
```

---

### Task 7: PetitionForm component

**Files:**
- Create: `src/components/PetitionForm.vue`
- Test: `tests/PetitionForm.test.js`

**Interfaces:**
- Consumes: `useSubmit` (Task 4); `isRequired`, `isEmail` (Task 2); `RESIDENCY_OPTIONS` (Task 3); `FieldError` (Task 6).
- Produces: `PetitionForm.vue` — self-contained form. Builds a payload `{ type: 'petition', name, email, address, residency, comments, updates_optin, affirmed, hp, startedAt }` where `hp` is the honeypot value and `startedAt` is the epoch ms set on mount. Submit button disabled unless `affirmed` is true AND not submitting. On success shows a thank-you panel.

- [ ] **Step 1: Write the failing test**

`tests/PetitionForm.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const submitMock = vi.fn().mockResolvedValue(true)
vi.mock('../src/composables/useSubmit.js', () => ({
  useSubmit: () => ({ state: { value: 'idle' }, error: { value: null }, submit: submitMock }),
}))
import PetitionForm from '../src/components/PetitionForm.vue'

describe('PetitionForm', () => {
  beforeEach(() => submitMock.mockClear())

  it('disables submit until affirmation is checked', async () => {
    const wrapper = mount(PetitionForm)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    await wrapper.find('input[name="affirmed"]').setValue(true)
    expect(btn.attributes('disabled')).toBeUndefined()
  })

  it('shows validation errors and does not submit when required fields missing', async () => {
    const wrapper = mount(PetitionForm)
    await wrapper.find('input[name="affirmed"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('required')
  })

  it('submits a valid payload', async () => {
    const wrapper = mount(PetitionForm)
    await wrapper.find('input[name="name"]').setValue('Jane Doe')
    await wrapper.find('input[name="email"]').setValue('jane@example.com')
    await wrapper.find('input[name="residency"][value="Yes"]').setValue()
    await wrapper.find('input[name="affirmed"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).toHaveBeenCalledTimes(1)
    const payload = submitMock.mock.calls[0][0]
    expect(payload).toMatchObject({ type: 'petition', name: 'Jane Doe', email: 'jane@example.com', residency: 'Yes', affirmed: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/PetitionForm.test.js`
Expected: FAIL (component not found).

- [ ] **Step 3: Write minimal implementation**

`src/components/PetitionForm.vue`:
```vue
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useSubmit } from '../composables/useSubmit.js'
import { isRequired, isEmail } from '../lib/validation.js'
import { RESIDENCY_OPTIONS } from '../lib/petitionFields.js'
import FieldError from './FieldError.vue'

const { state, error, submit } = useSubmit()

const form = reactive({
  name: '', email: '', address: '', residency: '',
  comments: '', updates_optin: false, affirmed: false, hp: '',
})
const errors = reactive({ name: null, email: null, residency: null })
const startedAt = ref(0)
onMounted(() => { startedAt.value = Date.now() })

const canSubmit = computed(() => form.affirmed && state.value !== 'submitting')

function validate() {
  errors.name = isRequired(form.name) ? null : 'Name is required.'
  errors.email = !isRequired(form.email)
    ? 'Email is required.'
    : isEmail(form.email) ? null : 'Enter a valid email.'
  errors.residency = isRequired(form.residency) ? null : 'Please select an option.'
  return !errors.name && !errors.email && !errors.residency
}

async function onSubmit() {
  if (!validate()) return
  await submit({
    type: 'petition',
    name: form.name, email: form.email, address: form.address,
    residency: form.residency, comments: form.comments,
    updates_optin: form.updates_optin, affirmed: form.affirmed,
    hp: form.hp, startedAt: startedAt.value,
  })
}
</script>

<template>
  <div v-if="state === 'success'" class="thanks">
    <h3>Thank you for signing.</h3>
    <p>Your signature has been recorded. Please share the petition with your neighbors —
      every neighborhood deserves to be heard.</p>
  </div>

  <form v-else class="form" @submit.prevent="onSubmit" novalidate>
    <label class="field">
      <span class="field__label">Full name *</span>
      <input name="name" v-model="form.name" type="text" autocomplete="name" />
      <FieldError :message="errors.name" />
    </label>

    <label class="field">
      <span class="field__label">Email *</span>
      <input name="email" v-model="form.email" type="email" autocomplete="email" />
      <FieldError :message="errors.email" />
    </label>

    <label class="field">
      <span class="field__label">Street address or neighborhood</span>
      <input name="address" v-model="form.address" type="text" />
    </label>

    <fieldset class="field">
      <legend class="field__label">Are you a Dunwoody resident? *</legend>
      <label v-for="opt in RESIDENCY_OPTIONS" :key="opt" class="radio">
        <input type="radio" name="residency" :value="opt" v-model="form.residency" />
        <span>{{ opt }}</span>
      </label>
      <FieldError :message="errors.residency" />
    </fieldset>

    <label class="field">
      <span class="field__label">Comments</span>
      <textarea name="comments" v-model="form.comments" rows="3"></textarea>
    </label>

    <label class="checkbox">
      <input type="checkbox" name="updates_optin" v-model="form.updates_optin" />
      <span>Send me periodic updates about the Initiative.</span>
    </label>

    <label class="checkbox checkbox--affirm">
      <input type="checkbox" name="affirmed" v-model="form.affirmed" />
      <span>I affirm the statements above. *</span>
    </label>

    <!-- honeypot: hidden from users -->
    <input class="hp" name="hp" v-model="form.hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

    <FieldError :message="error" />
    <button type="submit" class="submit" :disabled="!canSubmit">
      {{ state === 'submitting' ? 'Submitting…' : 'Sign the Petition' }}
    </button>

    <p v-if="state === 'error'" class="fallback">
      Trouble submitting? Email us at
      <a href="mailto:info@DunwoodyStormwater.org">info@DunwoodyStormwater.org</a>.
    </p>
  </form>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 1.1rem; max-width: 560px; }
.field { display: flex; flex-direction: column; border: 0; padding: 0; margin: 0; }
.field__label { font-weight: 600; margin-bottom: 0.35rem; }
input[type="text"], input[type="email"], textarea {
  padding: 0.65rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius);
  font: inherit; width: 100%;
}
.radio, .checkbox { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0.3rem 0; font-weight: 400; }
.checkbox--affirm { font-weight: 600; }
.submit {
  background: var(--color-primary); color: #fff; border: 0; border-radius: var(--radius);
  padding: 0.9rem 1.5rem; font-size: 1.05rem; font-weight: 700; cursor: pointer;
}
.submit:disabled { background: #9db8cd; cursor: not-allowed; }
.thanks { background: #e8f5ee; border: 1px solid var(--color-accent); border-radius: var(--radius); padding: 1.5rem; }
.fallback { color: var(--color-muted); font-size: 0.95rem; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/PetitionForm.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PetitionForm.vue tests/PetitionForm.test.js
git commit -m "feat: add petition form with validation and affirmation gating"
```

---

### Task 8: StoryForm component (with photo upload)

**Files:**
- Create: `src/components/StoryForm.vue`
- Test: `tests/StoryForm.test.js`

**Interfaces:**
- Consumes: `useSubmit` (Task 4); `isRequired`, `isEmail`, `validatePhoto` (Task 2); `ISSUE_TYPES` (Task 3); `FieldError` (Task 6).
- Produces: `StoryForm.vue` — payload `{ type: 'story', name, email, neighborhood, issue_types (array), story, photo: { name, mimeType, dataBase64 }|null, hp, startedAt }`. Photo read via FileReader → base64 (strip the `data:...;base64,` prefix). Required: name, email, story. On success shows thank-you panel.

- [ ] **Step 1: Write the failing test**

`tests/StoryForm.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const submitMock = vi.fn().mockResolvedValue(true)
vi.mock('../src/composables/useSubmit.js', () => ({
  useSubmit: () => ({ state: { value: 'idle' }, error: { value: null }, submit: submitMock }),
}))
import StoryForm from '../src/components/StoryForm.vue'

describe('StoryForm', () => {
  beforeEach(() => submitMock.mockClear())

  it('does not submit when required fields missing', async () => {
    const wrapper = mount(StoryForm)
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('required')
  })

  it('submits story with selected issue types', async () => {
    const wrapper = mount(StoryForm)
    await wrapper.find('input[name="name"]').setValue('Sam')
    await wrapper.find('input[name="email"]').setValue('sam@example.com')
    await wrapper.find('textarea[name="story"]').setValue('My street floods.')
    await wrapper.find('input[name="issue"][value="Flooding"]').setValue()
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).toHaveBeenCalledTimes(1)
    const payload = submitMock.mock.calls[0][0]
    expect(payload).toMatchObject({ type: 'story', name: 'Sam', email: 'sam@example.com', story: 'My street floods.' })
    expect(payload.issue_types).toContain('Flooding')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/StoryForm.test.js`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

`src/components/StoryForm.vue`:
```vue
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useSubmit } from '../composables/useSubmit.js'
import { isRequired, isEmail, validatePhoto } from '../lib/validation.js'
import { ISSUE_TYPES } from '../lib/storyFields.js'
import FieldError from './FieldError.vue'

const { state, error, submit } = useSubmit()

const form = reactive({
  name: '', email: '', neighborhood: '', issue_types: [], story: '', hp: '',
})
const errors = reactive({ name: null, email: null, story: null, photo: null })
const photoFile = ref(null)
const startedAt = ref(0)
onMounted(() => { startedAt.value = Date.now() })

const submitting = computed(() => state.value === 'submitting')

function onPhotoChange(e) {
  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
  const check = validatePhoto(file)
  errors.photo = check.ok ? null : check.error
  photoFile.value = check.ok ? file : null
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function validate() {
  errors.name = isRequired(form.name) ? null : 'Name is required.'
  errors.email = !isRequired(form.email)
    ? 'Email is required.'
    : isEmail(form.email) ? null : 'Enter a valid email.'
  errors.story = isRequired(form.story) ? null : 'Your story is required.'
  return !errors.name && !errors.email && !errors.story && !errors.photo
}

async function onSubmit() {
  if (!validate()) return
  let photo = null
  if (photoFile.value) {
    photo = {
      name: photoFile.value.name,
      mimeType: photoFile.value.type,
      dataBase64: await fileToBase64(photoFile.value),
    }
  }
  await submit({
    type: 'story',
    name: form.name, email: form.email, neighborhood: form.neighborhood,
    issue_types: form.issue_types, story: form.story,
    photo, hp: form.hp, startedAt: startedAt.value,
  })
}
</script>

<template>
  <div v-if="state === 'success'" class="thanks">
    <h3>Thank you for sharing your story.</h3>
    <p>Your experience helps us understand stormwater challenges across Dunwoody.</p>
  </div>

  <form v-else class="form" @submit.prevent="onSubmit" novalidate>
    <label class="field">
      <span class="field__label">Name *</span>
      <input name="name" v-model="form.name" type="text" autocomplete="name" />
      <FieldError :message="errors.name" />
    </label>

    <label class="field">
      <span class="field__label">Email *</span>
      <input name="email" v-model="form.email" type="email" autocomplete="email" />
      <FieldError :message="errors.email" />
    </label>

    <label class="field">
      <span class="field__label">Neighborhood</span>
      <input name="neighborhood" v-model="form.neighborhood" type="text" />
    </label>

    <fieldset class="field">
      <legend class="field__label">What has your neighborhood experienced?</legend>
      <label v-for="opt in ISSUE_TYPES" :key="opt" class="checkbox">
        <input type="checkbox" name="issue" :value="opt" v-model="form.issue_types" />
        <span>{{ opt }}</span>
      </label>
    </fieldset>

    <label class="field">
      <span class="field__label">Your story *</span>
      <textarea name="story" v-model="form.story" rows="5"></textarea>
      <FieldError :message="errors.story" />
    </label>

    <label class="field">
      <span class="field__label">Photo (optional)</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" @change="onPhotoChange" />
      <FieldError :message="errors.photo" />
    </label>

    <input class="hp" name="hp" v-model="form.hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

    <FieldError :message="error" />
    <button type="submit" class="submit" :disabled="submitting">
      {{ submitting ? 'Submitting…' : 'Share My Story' }}
    </button>

    <p v-if="state === 'error'" class="fallback">
      Trouble submitting? Email us at
      <a href="mailto:info@DunwoodyStormwater.org">info@DunwoodyStormwater.org</a>.
    </p>
  </form>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 1.1rem; max-width: 560px; }
.field { display: flex; flex-direction: column; border: 0; padding: 0; margin: 0; }
.field__label { font-weight: 600; margin-bottom: 0.35rem; }
input[type="text"], input[type="email"], textarea {
  padding: 0.65rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius);
  font: inherit; width: 100%;
}
.checkbox { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0.3rem 0; font-weight: 400; }
.submit {
  background: var(--color-accent); color: #fff; border: 0; border-radius: var(--radius);
  padding: 0.9rem 1.5rem; font-size: 1.05rem; font-weight: 700; cursor: pointer;
}
.submit:disabled { background: #9db8cd; cursor: not-allowed; }
.thanks { background: #e8f5ee; border: 1px solid var(--color-accent); border-radius: var(--radius); padding: 1.5rem; }
.fallback { color: var(--color-muted); font-size: 0.95rem; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/StoryForm.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/StoryForm.vue tests/StoryForm.test.js
git commit -m "feat: add story form with issue types and photo upload"
```

---

### Task 9: Pages — full content

**Files:**
- Replace: `src/pages/HomePage.vue`, `PetitionPage.vue`, `StoryPage.vue`, `AboutPage.vue`, `FaqPage.vue`, `ContactPage.vue`
- Modify: `src/style.css` (add shared section/hero/prose classes)

**Interfaces:**
- Consumes: `CtaButton`, `SignatureCount`, `PetitionForm`, `StoryForm` components; `AFFIRMATION_POINTS` (Task 3); `ISSUE_TYPES` (Task 3).

- [ ] **Step 1: Add shared page styles to `src/style.css`**

Append:
```css
.section { padding: 3rem 0; }
.section--alt { background: var(--color-surface); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.hero {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff; padding: 4.5rem 0; text-align: center;
}
.hero h1 { font-size: 2.5rem; margin: 0 0 0.5rem; }
.hero .tagline { font-style: italic; font-size: 1.25rem; opacity: 0.95; margin: 0 0 1.75rem; }
.hero .cta-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.prose { max-width: 720px; }
.prose h2 { color: var(--color-primary-dark); margin-top: 0; }
.prose ul { padding-left: 1.2rem; }
.lead { font-size: 1.15rem; }
.page-title { color: var(--color-primary-dark); }
.faq__q { font-weight: 700; margin-bottom: 0.25rem; }
.faq__item { margin-bottom: 1.5rem; }
@media (max-width: 600px) { .hero h1 { font-size: 2rem; } }
```

- [ ] **Step 2: Write `HomePage.vue`**

```vue
<script setup>
import CtaButton from '../components/CtaButton.vue'
import SignatureCount from '../components/SignatureCount.vue'
</script>

<template>
  <section class="hero">
    <div class="container">
      <h1>We All Live Downstream</h1>
      <p class="tagline">Because when the rain falls, we all live downstream.</p>
      <div class="cta-row">
        <CtaButton to="/petition">Sign the Petition</CtaButton>
        <CtaButton to="/share-your-story" variant="secondary">Share Your Story</CtaButton>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container prose">
      <h2>Welcome</h2>
      <p class="lead">If you are visiting this website, you have probably just read
        "We All Live Downstream" in the Dunwoody Crier.</p>
      <p>Thank you for taking the next step.</p>
      <p>Stormwater affects every neighborhood in Dunwoody. Whether your concern is flooding,
        erosion, ponds, lakes, streams, culverts, drainage channels, or stormwater infrastructure,
        we all depend upon the same interconnected system.</p>
      <p>The Dunwoody Stormwater Stewardship Initiative is a citizen-led effort dedicated to
        promoting transparent, consistent, and responsible stormwater management throughout our city.</p>
      <p><strong>This initiative is not about one neighborhood. It is about one city.</strong></p>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container prose">
      <h2>Our Mission</h2>
      <p>We believe Dunwoody can become a model for stormwater stewardship. Our mission is to encourage:</p>
      <ul>
        <li>Transparent government</li>
        <li>Consistent application of stormwater policies</li>
        <li>Responsible stewardship</li>
        <li>Sound engineering</li>
        <li>Meaningful citizen involvement</li>
        <li>Equal treatment for every neighborhood</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container prose">
      <h2>Why We Need Your Help</h2>
      <p>One signature will not solve this problem. Thousands of signatures can change the conversation.</p>
      <p>Stormwater touches every neighborhood. Every homeowner pays a stormwater utility fee.
        Every neighborhood deserves to be heard.</p>
      <p>Today we are asking you to take one simple step. Sign the Citizens' Petition for
        Transparent and Consistent Stormwater Management.</p>
      <SignatureCount />
      <div class="cta-row" style="justify-content:flex-start;">
        <CtaButton to="/petition">Sign the Petition</CtaButton>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Write `PetitionPage.vue`**

```vue
<script setup>
import PetitionForm from '../components/PetitionForm.vue'
import SignatureCount from '../components/SignatureCount.vue'
import { AFFIRMATION_POINTS } from '../lib/petitionFields.js'
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Citizens' Petition for Transparent and Consistent Stormwater Management</h1>
      <SignatureCount />
      <p>By signing this petition, I affirm that:</p>
      <ul>
        <li v-for="point in AFFIRMATION_POINTS" :key="point">{{ point }}</li>
      </ul>
      <PetitionForm />
    </div>
  </section>
</template>
```

- [ ] **Step 4: Write `StoryPage.vue`**

```vue
<script setup>
import StoryForm from '../components/StoryForm.vue'
import { ISSUE_TYPES } from '../lib/storyFields.js'
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Share Your Story</h1>
      <p class="lead">Every neighborhood has a stormwater story.</p>
      <p>Has your neighborhood experienced:</p>
      <ul>
        <li v-for="issue in ISSUE_TYPES" :key="issue">{{ issue }}</li>
      </ul>
      <p>We would like to hear your story. Your experience may help improve stormwater
        management throughout Dunwoody.</p>
      <StoryForm />
    </div>
  </section>
</template>
```

- [ ] **Step 5: Write `AboutPage.vue`**

```vue
<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">About the Initiative</h1>
      <p>The Dunwoody Stormwater Stewardship Initiative is a citizen-led effort to encourage
        better stormwater management throughout the City of Dunwoody.</p>
      <p><strong>Our objective is not conflict. Our objective is stewardship.</strong></p>
      <p>We believe the best solutions occur when citizens, engineers, city staff, elected
        officials, and neighborhoods work together.</p>
    </div>
  </section>
</template>
```

- [ ] **Step 6: Write `FaqPage.vue`**

```vue
<script setup>
const faqs = [
  { q: 'Is this only about Kingsley Lake?', a: 'No. Kingsley simply reminds us that stormwater affects every neighborhood in Dunwoody.' },
  { q: 'Is this an organization opposing the City?', a: 'No. We support responsible stewardship, transparency, and constructive dialogue.' },
  { q: 'Why should I sign?', a: 'Your signature demonstrates that residents throughout Dunwoody believe stormwater deserves greater attention and consistent management.' },
  { q: 'What happens after I sign?', a: 'You will receive periodic updates about the Initiative, opportunities to participate, and information regarding future meetings and progress.' },
]
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Frequently Asked Questions</h1>
      <div v-for="item in faqs" :key="item.q" class="faq__item">
        <p class="faq__q">{{ item.q }}</p>
        <p>{{ item.a }}</p>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 7: Write `ContactPage.vue`**

```vue
<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Contact</h1>
      <p>Email: <a href="mailto:info@DunwoodyStormwater.org">info@DunwoodyStormwater.org</a></p>
      <p>Website: www.DunwoodyStormwater.org</p>
    </div>
  </section>
</template>
```

- [ ] **Step 8: Verify build and full test suite**

Run: `npm run build && npx vitest run`
Expected: build succeeds; all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/pages src/style.css
git commit -m "feat: add full page content for all six routes"
```

---

### Task 10: Google Apps Script backend

**Files:**
- Create: `apps-script/Code.gs`, `apps-script/README.md`

**Interfaces:**
- Consumes: JSON payloads from `useSubmit` (petition/story shapes from Tasks 7/8) and `GET ?action=count` from Task 5.
- Produces: a deployable Apps Script Web App. Petition rows → `Petitions` tab; story rows → `Stories` tab; photos → Drive folder; `?action=count` → `{count}`.

- [ ] **Step 1: Write `apps-script/Code.gs`**

```js
/**
 * Dunwoody Stormwater Stewardship — backend.
 * Bind this script to a Google Sheet (Extensions → Apps Script) and deploy as a Web App
 * (Execute as: Me; Who has access: Anyone). See README.md in this folder.
 */

var PETITION_SHEET = 'Petitions'
var STORY_SHEET = 'Stories'
var PHOTO_FOLDER_NAME = 'Dunwoody Stormwater Photos'
var MIN_FILL_SECONDS = 3 // submissions faster than this are treated as bots

var PETITION_HEADERS = ['timestamp', 'name', 'email', 'address', 'residency', 'comments', 'updates_optin', 'affirmed', 'source']
var STORY_HEADERS = ['timestamp', 'name', 'email', 'neighborhood', 'issue_types', 'story', 'photo_url', 'source']

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'count') {
    return json({ count: countPetitions() })
  }
  return json({ ok: true, message: 'Dunwoody Stormwater API' })
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents)

    // Spam checks: honeypot must be empty; minimum fill time.
    if (body.hp) return json({ ok: true }) // silently drop
    if (body.startedAt && (Date.now() - Number(body.startedAt)) < MIN_FILL_SECONDS * 1000) {
      return json({ ok: true }) // silently drop
    }

    if (body.type === 'petition') return handlePetition(body)
    if (body.type === 'story') return handleStory(body)
    return json({ ok: false, error: 'Unknown submission type.' })
  } catch (err) {
    return json({ ok: false, error: 'Server error: ' + err.message })
  }
}

function handlePetition(body) {
  if (!str(body.name)) return json({ ok: false, error: 'Name is required.' })
  if (!isEmail(body.email)) return json({ ok: false, error: 'A valid email is required.' })
  if (!str(body.residency)) return json({ ok: false, error: 'Residency is required.' })
  if (!body.affirmed) return json({ ok: false, error: 'You must affirm the statements.' })

  var sheet = getSheet(PETITION_SHEET, PETITION_HEADERS)
  sheet.appendRow([
    new Date(), str(body.name), str(body.email), str(body.address),
    str(body.residency), str(body.comments),
    body.updates_optin ? 'Yes' : 'No', body.affirmed ? 'Yes' : 'No', 'petition',
  ])
  return json({ ok: true })
}

function handleStory(body) {
  if (!str(body.name)) return json({ ok: false, error: 'Name is required.' })
  if (!isEmail(body.email)) return json({ ok: false, error: 'A valid email is required.' })
  if (!str(body.story)) return json({ ok: false, error: 'Your story is required.' })

  var photoUrl = ''
  if (body.photo && body.photo.dataBase64) {
    photoUrl = savePhoto(body.photo)
  }

  var issues = Array.isArray(body.issue_types) ? body.issue_types.join(', ') : ''
  var sheet = getSheet(STORY_SHEET, STORY_HEADERS)
  sheet.appendRow([
    new Date(), str(body.name), str(body.email), str(body.neighborhood),
    issues, str(body.story), photoUrl, 'story',
  ])
  return json({ ok: true })
}

function savePhoto(photo) {
  var bytes = Utilities.base64Decode(photo.dataBase64)
  var blob = Utilities.newBlob(bytes, photo.mimeType || 'image/jpeg', photo.name || 'photo')
  var folder = getPhotoFolder()
  var file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  return file.getUrl()
}

function getPhotoFolder() {
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME)
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME)
}

function countPetitions() {
  var sheet = getSheet(PETITION_SHEET, PETITION_HEADERS)
  return Math.max(0, sheet.getLastRow() - 1) // minus header row
}

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow(headers)
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers)
  }
  return sheet
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

function str(v) { return v == null ? '' : String(v).trim() }
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(v)) }
```

- [ ] **Step 2: Write `apps-script/README.md`**

````markdown
# Google Apps Script Backend Setup

1. Create a new Google Sheet (this stores all submissions).
2. In the Sheet: **Extensions → Apps Script**.
3. Delete any boilerplate and paste the contents of `Code.gs`.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Description: Dunwoody Stormwater API
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when prompted (it needs Sheets + Drive access for photo uploads).
6. Copy the **Web app URL** (ends in `/exec`).
7. In the frontend, set `VITE_APPS_SCRIPT_URL` to that URL (see project `.env`).

The script auto-creates the `Petitions` and `Stories` tabs and a Drive folder
named **Dunwoody Stormwater Photos** on first use. To export, use the Sheet's
**File → Download → CSV**.

### Notes
- Re-deploy (Deploy → Manage deployments → Edit → New version) after editing `Code.gs`.
- Spam protection: a honeypot field and a minimum fill-time check silently drop bot submissions.
````

- [ ] **Step 3: Commit**

```bash
git add apps-script/
git commit -m "feat: add Google Apps Script backend for petitions, stories, and count"
```

---

### Task 11: Project README + final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# Dunwoody Stormwater Stewardship Initiative — Website

Vue 3 + Vite static site with custom petition and story forms backed by Google Apps Script + Google Sheets.

## Prerequisites
- Node 18+

## Setup
```bash
npm install
cp .env.example .env   # then edit VITE_APPS_SCRIPT_URL
```

Set `VITE_APPS_SCRIPT_URL` to your deployed Apps Script Web App URL. See `apps-script/README.md` to create it.

## Develop
```bash
npm run dev
```

## Test
```bash
npm run test
```

## Build (static output in dist/)
```bash
npm run build
npm run preview   # preview the production build locally
```

## Deploy
The build output in `dist/` is a static SPA. Deploy to any static host:
- **Netlify / Vercel:** set build command `npm run build`, publish dir `dist`, and add env var `VITE_APPS_SCRIPT_URL`. Add an SPA redirect (`/* -> /index.html`).
- **GitHub Pages:** build and publish `dist/` (configure a 404 fallback to `index.html` for SPA routing).

## Architecture
- `src/pages` — one component per route (Home, Petition, Share Your Story, About, FAQ, Contact).
- `src/components` — header, footer, forms, signature count, CTA button.
- `src/composables` — `useSubmit` (POST to Apps Script), `useSignatureCount` (GET count).
- `src/lib` — pure validation + field constants.
- `apps-script/Code.gs` — the backend (deploy separately to Google).

All submissions land in a Google Sheet; story photos land in a Google Drive folder.
````

- [ ] **Step 2: Final full verification**

Run: `npm run build && npx vitest run`
Expected: build succeeds; all test files pass.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add project README with setup and deploy instructions"
```

---

## Self-Review Notes

- **Spec coverage:** Home/Petition/Story/About/FAQ/Contact pages (Task 9); petition form fields incl. residency, updates opt-in, affirmation gating (Task 7); story form incl. issue types + photo upload (Task 8); live signature count (Task 5); Google Sheet schema + Drive photos + count endpoint (Task 10); honeypot/timing spam protection (Tasks 7/8 set fields, Task 10 enforces); Vitest tests (Tasks 2,4,5,7,8); README + Apps Script setup (Tasks 10,11). All spec sections mapped.
- **Type consistency:** payload `type` discriminator ('petition'/'story') consistent across Tasks 7/8/10; `useSubmit` returns `{state,error,submit}` used identically in both forms; `useSignatureCount` returns `{count,status,load}` used by SignatureCount; honeypot field `hp` and `startedAt` consistent client→server.
- **No placeholders:** all steps contain full code/commands.
