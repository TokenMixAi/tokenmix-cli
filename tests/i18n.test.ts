import { describe, it, expect, afterEach } from 'vitest'
import { detectLocale, t, setLocale, getLocale } from '../src/i18n/index.js'
import { en, zh } from '../src/i18n/messages.js'

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
})

describe('catalog completeness', () => {
  it('zh has exactly the same keys as en (compile-time + runtime guard)', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
  })

  it('no translation is empty', () => {
    for (const [k, v] of Object.entries(zh)) {
      expect(v, `zh[${k}] must be non-empty`).toBeTruthy()
    }
  })
})
