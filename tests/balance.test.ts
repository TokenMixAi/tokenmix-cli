import { describe, it, expect } from 'vitest'
import { formatUSD } from '../src/commands/balance.js'

describe('formatUSD (micro-USD → display)', () => {
  it('shows 2 decimals for amounts >= $1, trimming trailing zeros', () => {
    expect(formatUSD(31_129_663)).toBe('31.13')
    expect(formatUSD(1_000_000)).toBe('1')
    expect(formatUSD(1_500_000)).toBe('1.5')
    expect(formatUSD(40_120_000)).toBe('40.12')
  })

  it('keeps more precision for sub-dollar amounts', () => {
    expect(formatUSD(3823)).toBe('0.003823')
    expect(formatUSD(500_000)).toBe('0.5')
  })

  it('formats zero as 0', () => {
    expect(formatUSD(0)).toBe('0')
  })
})
