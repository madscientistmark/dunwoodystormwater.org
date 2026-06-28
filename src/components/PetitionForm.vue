<script setup>
import { reactive, computed } from 'vue'
import { useSubmit } from '../composables/useSubmit.js'
import { isRequired, isEmail } from '../lib/validation.js'
import { RESIDENCY_OPTIONS } from '../lib/petitionFields.js'
import FieldError from './FieldError.vue'

const emit = defineEmits(['submitted'])

const { state, error, submit } = useSubmit()

const form = reactive({
  name: '', email: '', address: '', residency: '',
  comments: '', updates_optin: false, affirmed: false, hp: '',
})
const errors = reactive({ name: null, email: null, residency: null })

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
  const ok = await submit({
    type: 'petition',
    name: form.name, email: form.email, address: form.address,
    residency: form.residency, comments: form.comments,
    updates_optin: form.updates_optin, affirmed: form.affirmed,
    hp: form.hp,
  })
  if (ok) emit('submitted')
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
      <a href="mailto:ddross@bellsouth.net">ddross@bellsouth.net</a>.
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
