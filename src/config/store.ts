import fs from 'fs-extra'
import { configDir, configFile } from './paths.js'

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
  try {
    const raw = await fs.readFile(configFile(), 'utf-8')
    return JSON.parse(raw) as UserConfig
  } catch {
    return {}
  }
}

export async function writeConfig(cfg: UserConfig): Promise<void> {
  await fs.ensureDir(configDir())
  await fs.writeFile(configFile(), JSON.stringify(cfg, null, 2))
  // Restrict to owner read/write only (best-effort on Windows).
  try {
    await fs.chmod(configFile(), 0o600)
  } catch {
    // ignore on filesystems that don't support chmod
  }
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
