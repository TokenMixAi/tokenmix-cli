import { describe, it, expect } from 'vitest'
import { formatPrice, filterModels } from '../src/commands/models.js'
import type { ApiModel } from '../src/api/client.js'

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

describe('filterModels', () => {
  const M = (short_id: string, model_type: string): ApiModel =>
    ({ short_id, model_type }) as ApiModel
  const models = [
    M('claude-sonnet-4.6', 'chat'),
    M('gpt-5.5', 'chat'),
    M('text-embedding-3', 'embedding'),
  ]

  it('filters by type', () => {
    expect(filterModels(models, { type: 'embedding' }).map((m) => m.short_id)).toEqual([
      'text-embedding-3',
    ])
  })

  it('filters by search substring, case-insensitively', () => {
    expect(filterModels(models, { search: 'CLAUDE' }).map((m) => m.short_id)).toEqual([
      'claude-sonnet-4.6',
    ])
  })

  it('combines type + search', () => {
    expect(filterModels(models, { type: 'chat', search: 'gpt' }).map((m) => m.short_id)).toEqual([
      'gpt-5.5',
    ])
  })

  it('returns everything when no filter is given', () => {
    expect(filterModels(models, {})).toHaveLength(3)
  })
})
