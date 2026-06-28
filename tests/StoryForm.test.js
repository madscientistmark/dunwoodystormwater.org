import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const submitMock = vi.fn().mockResolvedValue(true)
vi.mock('../src/composables/useSubmit.js', () => ({
  useSubmit: () => ({ state: ref('idle'), error: ref(null), submit: submitMock }),
}))
import StoryForm from '../src/components/StoryForm.vue'

describe('StoryForm', () => {
  beforeEach(() => submitMock.mockClear())

  it('does not submit when required fields missing', async () => {
    const wrapper = mount(StoryForm)
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('required')
  })

  it('submits story with selected issue types', async () => {
    const wrapper = mount(StoryForm)
    await wrapper.find('input[name="name"]').setValue('Sam')
    await wrapper.find('input[name="email"]').setValue('sam@example.com')
    await wrapper.find('textarea[name="story"]').setValue('My street floods.')
    await wrapper.find('input[name="issue"][value="Flooding"]').setValue()
    await wrapper.find('form').trigger('submit.prevent')
    expect(submitMock).toHaveBeenCalledTimes(1)
    const payload = submitMock.mock.calls[0][0]
    expect(payload).toMatchObject({ type: 'story', name: 'Sam', email: 'sam@example.com', story: 'My street floods.' })
    expect(payload.issue_types).toContain('Flooding')
  })
})
