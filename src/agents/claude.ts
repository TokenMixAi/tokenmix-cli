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

const CLAUDE_BIN = 'claude'
const CLAUDE_NPM_PACKAGE = '@anthropic-ai/claude-code'

async function installCheck(): Promise<AgentInstallStatus> {
  const bin = await commandExists(CLAUDE_BIN)
  if (!bin) {
    return {
      installed: false,
      hint: `Will install via: npm install -g ${CLAUDE_NPM_PACKAGE}`,
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

  return {
    configPath: settingsPath,
    envVars: {
      ANTHROPIC_BASE_URL: baseUrl,
      ANTHROPIC_API_KEY: apiKey,
    },
    notes: [
      'Available Claude models via tokenmix: claude-opus-4.7, claude-sonnet-4.6, claude-haiku-4.5',
      'Run `tokenmix models --type chat` for the full list.',
    ],
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
    note: 'If you had your own ANTHROPIC_API_KEY here before, re-add it.',
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
