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
