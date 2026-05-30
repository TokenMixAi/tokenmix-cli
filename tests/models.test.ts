import { describe, it, expect } from 'vitest'
import { formatPrice } from '../src/commands/models.js'

describe('formatPrice', () => {
  it('shows a dash for an UNKNOWN price (undefined)', () => {
    expect(formatPrice(undefined)).toBe('-')
  })

  it('shows "0" for a FREE model (price 0) — not a dash', () => {
    expect(formatPrice(0)).toBe('0')
  })

  it('formats a normal price and trims trailing zeros', () => {
    expect(formatPrice(1.5)).toBe('1.5')
    expect(formatPrice(0.262774)).toBe('0.262774')
    expect(formatPrice(5)).toBe('5')
  })
})
