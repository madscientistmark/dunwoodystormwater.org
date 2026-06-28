import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const submitMock = vi.fn().mockResolvedValue(true)
vi.mock('../src/composables/useSubmit.js', () => ({
  useSubmit: () => ({ state: ref('idle'), error: ref(null), submit: submitMock }),
}))
import PetitionForm from '../src/components/PetitionForm.vue'

describe('PetitionForm', () => {
  beforeEach(() => submitMock.mockClear())

  it('disables submit until affirmation is checked', async () => {
    const wrapper = mount(PetitionForm)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    await wrapper.find('input[name="affirmed"]').setValue(true)
    expect(btn.attributes('disabled')).toBeUndefined()
  })

  it('shows validation errors and does not submit when required fields missing', async () => {
    const wrapper = mount(PetitionForm)
    await wrapper.find('input[name="affirmed"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('required')
  })

  it('submits a valid payload', async () => {
    const wrapper = mount(PetitionForm)
    await wrapper.find('input[name="name"]').setValue('Jane Doe')
    await wrapper.find('input[name="email"]').setValue('jane@example.com')
    await wrapper.find('input[name="residency"][value="Yes"]').setValue()
    await wrapper.find('input[name="affirmed"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).toHaveBeenCalledTimes(1)
    const payload = submitMock.mock.calls[0][0]
    expect(payload).toMatchObject({ type: 'petition', name: 'Jane Doe', email: 'jane@example.com', residency: 'Yes', affirmed: true })
  })

  it('emits "submitted" after a successful submission', async () => {
    submitMock.mockResolvedValueOnce(true)
    const wrapper = mount(PetitionForm)
    await wrapper.find('input[name="name"]').setValue('Jane Doe')
    await wrapper.find('input[name="email"]').setValue('jane@example.com')
    await wrapper.find('input[name="residency"][value="Yes"]').setValue()
    await wrapper.find('input[name="affirmed"]').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(wrapper.emitted('submitted')).toBeTruthy()
  })
})
