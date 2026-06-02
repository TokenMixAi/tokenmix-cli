import { describe, it, expect, afterEach } from 'vitest'
import { detectLocale, t, setLocale, getLocale } from '../src/i18n/index.js'
import { catalogs, en, zh } from '../src/i18n/messages.js'

describe('detectLocale', () => {
  it('prefers an explicit TOKENMIX_LANG override', () => {
    expect(detectLocale({ TOKENMIX_LANG: 'zh', LANG: 'en_US.UTF-8' })).toBe('zh')
    expect(detectLocale({ TOKENMIX_LANG: 'en', LANG: 'zh_CN.UTF-8' })).toBe('en')
  })

  it('falls back to the system locale (LC_ALL / LC_MESSAGES / LANG)', () => {
    expect(detectLocale({ LANG: 'zh_CN.UTF-8' })).toBe('zh')
    expect(detectLocale({ LC_ALL: 'zh_TW.UTF-8' })).toBe('zh')
    expect(detectLocale({ LC_MESSAGES: 'zh-Hans' })).toBe('zh')
    expect(detectLocale({ LANG: 'en_US.UTF-8' })).toBe('en')
  })

  it('defaults to en when nothing is set', () => {
    expect(detectLocale({})).toBe('en')
  })

  it('maps each supported language subtag', () => {
    expect(detectLocale({ LANG: 'ja_JP.UTF-8' })).toBe('ja')
    expect(detectLocale({ LANG: 'ko_KR.UTF-8' })).toBe('ko')
    expect(detectLocale({ LANG: 'es_ES.UTF-8' })).toBe('es')
    expect(detectLocale({ LANG: 'fr_FR.UTF-8' })).toBe('fr')
    expect(detectLocale({ TOKENMIX_LANG: 'de' })).toBe('en') // unsupported → en
  })
})

describe('t', () => {
  afterEach(() => setLocale('en'))

  it('returns the active-locale string', () => {
    setLocale('zh')
    expect(t('logout.done')).toBe(zh['logout.done'])
    expect(getLocale()).toBe('zh')
    setLocale('en')
    expect(t('logout.done')).toBe(en['logout.done'])
  })

  it('interpolates every placeholder occurrence', () => {
    setLocale('en')
    expect(t('agent.installing', { name: 'OpenCode' })).toBe('Installing OpenCode ...')
    expect(t('login.waiting', { expires: 300, interval: 5 })).toBe(
      'Waiting for authorization (expires in 300s, polling every 5s) ...',
    )
  })

  it('does NOT re-substitute a {token} inside a param value (single-pass, injection-safe)', () => {
    setLocale('en')
    // {name}'s value contains "{min}" - it must stay literal, not get replaced by `min`
    expect(t('agent.needsNode', { name: 'pwn {min}', min: 'SECRET', cur: '9' })).toContain(
      'pwn {min}',
    )
  })

  it('leaves an unknown placeholder untouched', () => {
    setLocale('en')
    expect(t('agent.installing', {})).toContain('{name}')
  })
})

describe('catalog completeness', () => {
  const enKeys = Object.keys(en).sort()

  it('every catalog has exactly the same keys as en (compile-time + runtime guard)', () => {
    for (const [loc, cat] of Object.entries(catalogs)) {
      expect(Object.keys(cat).sort(), `${loc} keys`).toEqual(enKeys)
    }
  })

  it('no translation in any catalog is empty', () => {
    for (const [loc, cat] of Object.entries(catalogs)) {
      for (const [k, v] of Object.entries(cat)) {
        expect(v, `${loc}[${k}] must be non-empty`).toBeTruthy()
      }
    }
  })
})
