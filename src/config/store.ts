import fs from 'fs-extra'
import { configDir, configFile } from './paths.js'
import { writeFileAtomic } from '../utils/fs.js'
import { logger } from '../utils/logger.js'
import { t } from '../i18n/index.js'

export interface UserConfig {
  apiKey?: string
  apiBaseUrl?: string
  defaultModel?: string
}

export const DEFAULT_API_BASE = 'https://api.tokenmix.ai'

// The model agents default to when the user hasn't chosen one (overridable via
// the TOKENMIX_DEFAULT_MODEL env var or stored config). Single source of truth.
export const DEFAULT_MODEL = 'claude-sonnet-4.6'

// Append the OpenAI-compatible `/v1` suffix to a base URL, tolerating a trailing
// slash so `https://host/` doesn't yield `https://host//v1`.
export function v1Url(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/v1`
}

export async function readConfig(): Promise<UserConfig> {
  let raw: string
  try {
    raw = await fs.readFile(configFile(), 'utf-8')
  } catch {
    return {} // not logged in yet - the config file simply doesn't exist
  }
  try {
    return JSON.parse(raw) as UserConfig
  } catch {
    // The file exists but is corrupt (e.g. a crash truncated it mid-write). Don't
    // silently treat it as "logged out" - warn so the user knows to re-login.
    logger.warn(t('config.corrupt'))
    return {}
  }
}

export async function writeConfig(cfg: UserConfig): Promise<void> {
  await fs.ensureDir(configDir())
  // Atomic write so a crash or a concurrent writer can't truncate the config to
  // 0 bytes and silently lose the apiKey. 0600 = owner read/write only.
  await writeFileAtomic(configFile(), JSON.stringify(cfg, null, 2), 0o600)
}

export async function updateConfig(patch: Partial<UserConfig>): Promise<UserConfig> {
  const current = await readConfig()
  const next = { ...current, ...patch }
  await writeConfig(next)
  return next
}

export async function clearConfig(): Promise<void> {
  try {
    await fs.remove(configFile())
  } catch {
    // ignore
  }
}

export function apiBaseUrl(cfg?: Pick<UserConfig, 'apiBaseUrl'>): string {
  return cfg?.apiBaseUrl || DEFAULT_API_BASE
}
