import { describe, it, expect } from 'vitest'
// Source imports are written with the NodeNext `.js` extension; this test
// doubles as a check that vitest resolves them back to the `.ts` source.
import { apiBaseUrl } from '../src/config/store.js'

describe('test harness', () => {
  it('runs and resolves `.js`-style source imports', () => {
    expect(apiBaseUrl({})).toBe('https://api.tokenmix.ai')
    expect(apiBaseUrl({ apiBaseUrl: 'http://localhost:8787' })).toBe('http://localhost:8787')
  })
})
