export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function isRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== ''
}

export function isEmail(value) {
  if (typeof value !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function validatePhoto(file) {
  if (!file) return { ok: true, error: null }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { ok: false, error: 'Photo must be a JPG, PNG, or WebP image.' }
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: 'Photo must be 5 MB or smaller.' }
  }
  return { ok: true, error: null }
}
