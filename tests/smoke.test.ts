import { describe, it, expect, afterEach } from 'vitest'
// Source imports are written with the NodeNext `.js` extension; this test
// doubles as a check that vitest resolves them back to the `.ts` source.
import { apiBaseUrl, DEFAULT_API_BASE } from '../src/config/store.js'

describe('test harness', () => {
  it('runs and resolves `.js`-style source imports', () => {
    expect(apiBaseUrl({})).toBe('https://api.tokenmix.ai')
    expect(apiBaseUrl({ apiBaseUrl: 'http://localhost:8787' })).toBe('http://localhost:8787')
  })
})

describe('apiBaseUrl gateway override precedence', () => {
  const ENV = 'TOKENMIX_API_BASE'
  afterEach(() => {
    delete process.env[ENV]
  })

  it('falls back to the built-in default when nothing is set', () => {
    delete process.env[ENV]
    expect(apiBaseUrl()).toBe(DEFAULT_API_BASE)
    expect(apiBaseUrl({})).toBe(DEFAULT_API_BASE)
  })

  it('TOKENMIX_API_BASE overrides both stored config and the default', () => {
    process.env[ENV] = 'https://backup.example.com'
    expect(apiBaseUrl({})).toBe('https://backup.example.com')
    expect(apiBaseUrl({ apiBaseUrl: 'https://stored.example.com' })).toBe(
      'https://backup.example.com',
    )
  })

  it('ignores a blank/whitespace env value (treats it as unset)', () => {
    process.env[ENV] = '   '
    expect(apiBaseUrl({ apiBaseUrl: 'https://stored.example.com' })).toBe(
      'https://stored.example.com',
    )
    expect(apiBaseUrl({})).toBe(DEFAULT_API_BASE)
  })
})
