import { ref } from 'vue'
import { APPS_SCRIPT_URL, ROSTER_KEY } from '../config.js'

export function useSigners() {
  const signers = ref([])
  const status = ref('idle') // 'idle' | 'loading' | 'ready' | 'error' | 'unauthorized'

  async function load() {
    status.value = 'loading'
    try {
      const url = `${APPS_SCRIPT_URL}?action=list&key=${encodeURIComponent(ROSTER_KEY)}`
      const res = await fetch(url)
      const data = await res.json()
      if (!data || !data.ok) {
        status.value = 'unauthorized'
        return
      }
      signers.value = Array.isArray(data.signers) ? data.signers : []
      status.value = 'ready'
    } catch (e) {
      status.value = 'error'
    }
  }

  return { signers, status, load }
}
