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

// Default model when the user hasn't picked one (override via TOKENMIX_DEFAULT_MODEL
// or stored config).
export const DEFAULT_MODEL = 'claude-sonnet-4.6'

// Append the OpenAI-style /v1 suffix, tolerating a trailing slash so `https://host/`
// doesn't become `https://host//v1`.
export function v1Url(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/v1`
}

export async function readConfig(): Promise<UserConfig> {
  let raw: string
  try {
    raw = await fs.readFile(configFile(), 'utf-8')
  } catch {
    return {} // not logged in yet - no config file
  }
  try {
    return JSON.parse(raw) as UserConfig
  } catch {
    // File exists but is corrupt (e.g. a crash truncated it mid-write). Warn instead
    // of silently treating it as logged-out, so the user knows to re-login.
    logger.warn(t('config.corrupt'))
    return {}
  }
}

export async function writeConfig(cfg: UserConfig): Promise<void> {
  await fs.ensureDir(configDir())
  // Atomic write so a crash or concurrent writer can't truncate the config to 0
  // bytes and lose the apiKey. 0600 = owner read/write only.
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

// Gateway base URL: TOKENMIX_API_BASE env var > stored config > built-in default.
// The env var is a runtime-only override (self-hosted/backup gateway, restricted
// networks) and is never written to disk - unset it and you're back to config/default.
export function apiBaseUrl(cfg?: Pick<UserConfig, 'apiBaseUrl'>): string {
  const env = process.env.TOKENMIX_API_BASE?.trim()
  return env || cfg?.apiBaseUrl || DEFAULT_API_BASE
}
