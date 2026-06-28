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
