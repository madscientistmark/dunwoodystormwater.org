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
