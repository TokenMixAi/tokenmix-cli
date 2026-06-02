import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
  AgentCleanupResult,
} from './types.js'
import { run } from '../utils/exec.js'
import { writeFileAtomic } from '../utils/fs.js'
import { npmInstallCheck, npmInstallGlobal } from './helpers.js'
import { t } from '../i18n/index.js'

const CLAUDE_BIN = 'claude'
const CLAUDE_NPM_PACKAGE = '@anthropic-ai/claude-code'

const installCheck = (): Promise<AgentInstallStatus> =>
  npmInstallCheck(CLAUDE_BIN, CLAUDE_NPM_PACKAGE)

const install = (): Promise<void> => npmInstallGlobal(CLAUDE_NPM_PACKAGE)

async function configure(
  apiKey: string,
  baseUrl: string,
  _defaultModel: string,
): Promise<AgentConfigureResult> {
  // Claude Code reads both the env (ANTHROPIC_BASE_URL, ANTHROPIC_API_KEY) and the
  // env block in ~/.claude/settings.json. We write the settings block and pass env
  // on launch - belt and suspenders.
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
  let existing: Record<string, unknown> = {}
  try {
    const parsed = JSON.parse(await fs.readFile(settingsPath, 'utf-8'))
    // Valid JSON that isn't a plain object (null, array, string) has to be treated
    // as "start fresh", or `existing.env` below throws (JSON.parse("null") -> null
    // -> null.env -> TypeError) and blocks `tokenmix claude` entirely.
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      existing = parsed as Record<string, unknown>
    }
  } catch {
    // first run, or unreadable/corrupt file - start fresh
  }

  const existingEnv = (existing.env as Record<string, string>) || {}

  // Are we about to overwrite the user's own (non-tokenmix) Anthropic setup - e.g.
  // a personal sk-ant- key in settings.json? We still proceed (they asked to use
  // Claude Code via TokenMix), but warn and stash the originals so `tokenmix logout`
  // can restore them.
  const prevKey = existingEnv.ANTHROPIC_API_KEY
  const prevBase = existingEnv.ANTHROPIC_BASE_URL
  const replacingForeign =
    (typeof prevKey === 'string' && prevKey.length > 0 && !prevKey.startsWith('sk-tm-')) ||
    (typeof prevBase === 'string' && prevBase.length > 0 && !/tokenmix/i.test(prevBase))

  const next: Record<string, unknown> = {
    ...existing,
    env: {
      ...existingEnv,
      ANTHROPIC_BASE_URL: baseUrl,
      ANTHROPIC_API_KEY: apiKey,
    },
  }

  // Stash the user's original Anthropic env creds on the first overwrite so
  // cleanup() can put them back. Once the stored key is ours, replacingForeign is
  // false, so we never clobber the backup.
  // `existing.tokenmix` could be any JSON (a user or another tool might set it to a
  // string/array); only spread it when it's a real object, or a string would
  // explode into numeric-index keys and pollute settings.json.
  const prevTmRaw = existing.tokenmix
  const prevTm =
    prevTmRaw && typeof prevTmRaw === 'object' && !Array.isArray(prevTmRaw)
      ? (prevTmRaw as Record<string, unknown>)
      : {}
  const alreadyBackedUp = 'claudeEnvBackup' in prevTm
  if (replacingForeign && !alreadyBackedUp) {
    next.tokenmix = {
      ...prevTm,
      claudeEnvBackup: {
        ANTHROPIC_API_KEY: prevKey ?? null,
        ANTHROPIC_BASE_URL: prevBase ?? null,
      },
    }
  }

  await fs.ensureDir(path.dirname(settingsPath))
  await writeFileAtomic(settingsPath, JSON.stringify(next, null, 2), 0o600)

  // Claude Pro/Max users sign in via OAuth (creds in ~/.claude/.credentials.json or
  // the OS keychain, not in the settings.json env). Claude Code prefers
  // ANTHROPIC_API_KEY over the OAuth subscription, so injecting our key silently
  // switches them to pay-per-token. Warn when we can spot a file-based subscription
  // login - keychain-stored creds aren't detectable from a file.
  let oauthBypass = false
  if (!replacingForeign) {
    try {
      oauthBypass = await fs.pathExists(path.join(os.homedir(), '.claude', '.credentials.json'))
    } catch {
      oauthBypass = false
    }
  }

  const notes = [t('claude.noteModels'), t('claude.noteFullList')]
  if (replacingForeign) {
    notes.unshift(t('claude.noteReplaced1'), t('claude.noteReplaced2'), '')
  } else if (oauthBypass) {
    notes.unshift(t('claude.noteOAuthBypass1'), t('claude.noteOAuthBypass2'), '')
  }

  return {
    configPath: settingsPath,
    envVars: {
      ANTHROPIC_BASE_URL: baseUrl,
      ANTHROPIC_API_KEY: apiKey,
    },
    notes,
  }
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  await run(CLAUDE_BIN, args, { env })
}

// Remove the ANTHROPIC_* env we injected, leaving the rest of settings.json
// untouched. Only acts when the config looks like ours (tokenmix key or base URL),
// so a user's own Anthropic credentials are never clobbered.
async function cleanup(): Promise<AgentCleanupResult> {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
  let existing: Record<string, unknown>
  try {
    const parsed = JSON.parse(await fs.readFile(settingsPath, 'utf-8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { reverted: false, configPath: settingsPath }
    }
    existing = parsed as Record<string, unknown>
  } catch {
    return { reverted: false }
  }

  const env = existing.env as Record<string, string> | undefined
  if (!env || typeof env !== 'object') {
    return { reverted: false, configPath: settingsPath }
  }

  const key = env.ANTHROPIC_API_KEY
  const base = env.ANTHROPIC_BASE_URL
  const ours =
    (typeof key === 'string' && key.startsWith('sk-tm-')) ||
    (typeof base === 'string' && /tokenmix/i.test(base))
  if (!ours) {
    return { reverted: false, configPath: settingsPath }
  }

  // If configure() stashed the user's original creds, restore them instead of just
  // deleting ours, so a user who had their own key isn't left broken after logout.
  // A null in the backup means "we added this; drop it on restore".
  const tm = existing.tokenmix as
    | { claudeEnvBackup?: { ANTHROPIC_API_KEY: string | null; ANTHROPIC_BASE_URL: string | null } }
    | undefined
  const backup = tm?.claudeEnvBackup
  if (backup) {
    if (backup.ANTHROPIC_API_KEY != null) env.ANTHROPIC_API_KEY = backup.ANTHROPIC_API_KEY
    else delete env.ANTHROPIC_API_KEY
    if (backup.ANTHROPIC_BASE_URL != null) env.ANTHROPIC_BASE_URL = backup.ANTHROPIC_BASE_URL
    else delete env.ANTHROPIC_BASE_URL
  } else {
    delete env.ANTHROPIC_API_KEY
    delete env.ANTHROPIC_BASE_URL
  }

  if (Object.keys(env).length === 0) delete existing.env
  else existing.env = env

  // Drop our bookkeeping; remove the `tokenmix` block if it only held the backup
  if (tm && typeof tm === 'object') {
    delete (tm as Record<string, unknown>).claudeEnvBackup
    if (Object.keys(tm).length === 0) delete existing.tokenmix
    else existing.tokenmix = tm
  }

  await writeFileAtomic(settingsPath, JSON.stringify(existing, null, 2), 0o600)

  return {
    reverted: true,
    configPath: settingsPath,
    note: backup ? t('claude.cleanupRestored') : t('claude.cleanupNote'),
  }
}

export const ClaudeCodeAgent: AgentDescriptor = {
  id: 'claude',
  displayName: 'Claude Code',
  description: 'anthropics/claude-code - official Anthropic CLI coding agent',
  installMode: 'auto-npm',
  installCheck,
  install,
  configure,
  launch,
  cleanup,
}
