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
