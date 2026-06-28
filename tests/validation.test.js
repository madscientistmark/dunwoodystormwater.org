import { describe, it, expect } from 'vitest'
import { isRequired, isEmail, validatePhoto, MAX_PHOTO_BYTES } from '../src/lib/validation.js'

describe('isRequired', () => {
  it('rejects empty/whitespace/null', () => {
    expect(isRequired('')).toBe(false)
    expect(isRequired('   ')).toBe(false)
    expect(isRequired(null)).toBe(false)
    expect(isRequired(undefined)).toBe(false)
  })
  it('accepts non-empty', () => {
    expect(isRequired('a')).toBe(true)
  })
})

describe('isEmail', () => {
  it('accepts valid', () => {
    expect(isEmail('a@b.co')).toBe(true)
  })
  it('rejects invalid', () => {
    expect(isEmail('nope')).toBe(false)
    expect(isEmail('a@b')).toBe(false)
    expect(isEmail('')).toBe(false)
  })
})

describe('validatePhoto', () => {
  it('passes when no file (optional)', () => {
    expect(validatePhoto(null)).toEqual({ ok: true, error: null })
  })
  it('rejects wrong type', () => {
    const f = { type: 'application/pdf', size: 100 }
    expect(validatePhoto(f).ok).toBe(false)
  })
  it('rejects too large', () => {
    const f = { type: 'image/png', size: MAX_PHOTO_BYTES + 1 }
    expect(validatePhoto(f).ok).toBe(false)
  })
  it('accepts valid image', () => {
    const f = { type: 'image/jpeg', size: 1000 }
    expect(validatePhoto(f)).toEqual({ ok: true, error: null })
  })
})
