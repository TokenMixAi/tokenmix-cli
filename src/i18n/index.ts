import { catalogs, en, MessageKey } from './messages.js'

export type Locale = keyof typeof catalogs

let current: Locale = 'en'

// Resolve the UI language from the environment. Precedence:
//   TOKENMIX_LANG  (explicit override, e.g. `TOKENMIX_LANG=zh`)
//   LC_ALL / LC_MESSAGES / LANG  (the user's system locale, e.g. zh_CN.UTF-8)
//   default: en
// Takes `env` for testability; defaults to process.env.
export function detectLocale(env: NodeJS.ProcessEnv = process.env): Locale {
  const raw = (env.TOKENMIX_LANG || env.LC_ALL || env.LC_MESSAGES || env.LANG || '')
    .toLowerCase()
    .trim()
  // Primary language subtag: zh_CN.UTF-8 -> zh, pt-BR -> pt, fr.UTF-8 -> fr.
  // Any subtag with a catalog is supported; everything else falls back to en.
  const lang = raw.split(/[-_.@]/)[0] ?? ''
  return Object.prototype.hasOwnProperty.call(catalogs, lang) ? (lang as Locale) : 'en'
}

export function setLocale(loc: Locale): void {
  current = loc
}

export function getLocale(): Locale {
  return current
}

// Translate a key for the active locale, filling {placeholders} from params.
// Falls back to English, then to the raw key, so a partial catalog never throws.
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const s: string = catalogs[current]?.[key] ?? en[key] ?? key
  if (!params) return s
  // Single pass, so a value that itself contains "{other}" won't get re-substituted
  // by a later param - order-independent and injection-safe.
  return s.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  )
}
