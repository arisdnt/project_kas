export const SATUAN_OPTIONS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (gram)' },
  { value: 'liter', label: 'Liter (liter)' },
  { value: 'ml', label: 'Mililiter (ml)' },
  { value: 'meter', label: 'Meter (meter)' },
  { value: 'cm', label: 'Centimeter (cm)' },
  { value: 'box', label: 'Box (box)' },
  { value: 'pack', label: 'Pack (pack)' },
  { value: 'lusin', label: 'Lusin (lusin)' },
]

export const IMAGE_UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: 'image/*',
  PREVIEW_SIZE: {
    width: 128,
    height: 128
  }
}