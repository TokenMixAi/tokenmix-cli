import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
  AgentCleanupResult,
} from './types.js'
import { commandExists, run, captureRun } from '../utils/exec.js'
import { t } from '../i18n/index.js'

const CLAUDE_BIN = 'claude'
const CLAUDE_NPM_PACKAGE = '@anthropic-ai/claude-code'

async function installCheck(): Promise<AgentInstallStatus> {
  const bin = await commandExists(CLAUDE_BIN)
  if (!bin) {
    const cmd = `npm install -g ${CLAUDE_NPM_PACKAGE}`
    return {
      installed: false,
      hint: t('install.willInstallVia', { cmd }),
      installCmd: cmd,
    }
  }
  try {
    const v = await captureRun(CLAUDE_BIN, ['--version'])
    return { installed: true, version: v.stdout.trim() }
  } catch {
    return { installed: true }
  }
}

async function install(): Promise<void> {
  await run('npm', ['install', '-g', CLAUDE_NPM_PACKAGE])
}

async function configure(
  apiKey: string,
  baseUrl: string,
  _defaultModel: string,
): Promise<AgentConfigureResult> {
  // Claude Code reads:
  //   - env: ANTHROPIC_BASE_URL, ANTHROPIC_API_KEY
  //   - ~/.claude/settings.json (env block is honored)
  // We write the settings.json env block AND pass env on launch (belt + suspenders).
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
  let existing: Record<string, unknown> = {}
  try {
    const raw = await fs.readFile(settingsPath, 'utf-8')
    existing = JSON.parse(raw)
  } catch {
    // first run
  }

  const existingEnv = (existing.env as Record<string, string>) || {}

  // Detect that we're about to overwrite a user's OWN (non-tokenmix) Anthropic
  // setup — e.g. a Claude Pro/Max OAuth or a personal sk-ant- key. We still
  // proceed (they explicitly asked to use Claude Code via TokenMix), but warn
  // so it isn't a silent hijack of their primary tool.
  const prevKey = existingEnv.ANTHROPIC_API_KEY
  const prevBase = existingEnv.ANTHROPIC_BASE_URL
  const replacingForeign =
    (typeof prevKey === 'string' && prevKey.length > 0 && !prevKey.startsWith('sk-tm-')) ||
    (typeof prevBase === 'string' && prevBase.length > 0 && !/tokenmix/i.test(prevBase))

  const next = {
    ...existing,
    env: {
      ...existingEnv,
      ANTHROPIC_BASE_URL: baseUrl,
      ANTHROPIC_API_KEY: apiKey,
    },
  }

  await fs.ensureDir(path.dirname(settingsPath))
  await fs.writeFile(settingsPath, JSON.stringify(next, null, 2))
  try {
    await fs.chmod(settingsPath, 0o600)
  } catch {
    // ignore
  }

  const notes = [t('claude.noteModels'), t('claude.noteFullList')]
  if (replacingForeign) {
    notes.unshift(t('claude.noteReplaced1'), t('claude.noteReplaced2'), '')
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

// Remove the ANTHROPIC_* env we injected, leaving everything else in
// settings.json untouched. Only acts when the config looks like ours (tokenmix
// key or base URL) so we never clobber a user's own Anthropic credentials.
async function cleanup(): Promise<AgentCleanupResult> {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')
  let existing: Record<string, unknown>
  try {
    existing = JSON.parse(await fs.readFile(settingsPath, 'utf-8'))
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

  delete env.ANTHROPIC_API_KEY
  delete env.ANTHROPIC_BASE_URL
  if (Object.keys(env).length === 0) delete existing.env
  else existing.env = env

  await fs.writeFile(settingsPath, JSON.stringify(existing, null, 2))
  try {
    await fs.chmod(settingsPath, 0o600)
  } catch {
    // ignore
  }

  return {
    reverted: true,
    configPath: settingsPath,
    note: t('claude.cleanupNote'),
  }
}

export const ClaudeCodeAgent: AgentDescriptor = {
  id: 'claude',
  displayName: 'Claude Code',
  description: 'anthropics/claude-code — official Anthropic CLI coding agent',
  installMode: 'auto-npm',
  installCheck,
  install,
  configure,
  launch,
  cleanup,
}
