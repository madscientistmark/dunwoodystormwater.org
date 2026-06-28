<script setup>
import { reactive, ref, computed } from 'vue'
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
    photo, hp: form.hp,
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
