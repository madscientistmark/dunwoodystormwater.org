import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
vi.mock('../src/config.js', () => ({ APPS_SCRIPT_URL: 'https://example.test/exec' }))
import SignatureCount from '../src/components/SignatureCount.vue'

describe('SignatureCount', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Drive requestAnimationFrame synchronously with an ever-advancing timestamp,
    // so the first frame starts the clock and the next frame is already past the
    // animation duration — the tween lands on its target value deterministically.
    let ts = 0
    vi.stubGlobal('requestAnimationFrame', (cb) => { ts += 5000; cb(ts); return 1 })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })
  afterEach(() => vi.unstubAllGlobals())

  it('renders formatted count when ready (animated to target)', async () => {
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

  it('applies the hero variant class', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 5 }) })
    const wrapper = mount(SignatureCount, { props: { variant: 'hero' } })
    await flushPromises()
    expect(wrapper.find('.signature-count--hero').exists()).toBe(true)
  })
})
