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
