import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('../src/config.js', () => ({
  APPS_SCRIPT_URL: 'https://example.test/exec',
  ROSTER_KEY: 'secret123',
}))
import { useSigners } from '../src/composables/useSigners.js'

describe('useSigners', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('loads signers when authorized', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, signers: [{ name: 'Jane', address: 'Elm St', residency: 'Yes', timestamp: '2026-01-01T00:00:00.000Z' }] }),
    })
    const { signers, status, load } = useSigners()
    await load()
    expect(status.value).toBe('ready')
    expect(signers.value).toHaveLength(1)
    expect(signers.value[0].name).toBe('Jane')
    // key is sent in the request
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('key=secret123'))
  })

  it('marks unauthorized when ok is false', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ ok: false, error: 'Unauthorized.' }) })
    const { status, load } = useSigners()
    await load()
    expect(status.value).toBe('unauthorized')
  })

  it('sets error status on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('x'))
    const { status, load } = useSigners()
    await load()
    expect(status.value).toBe('error')
  })
})
