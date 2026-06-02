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
import { npmInstallCheck, npmInstallGlobal } from './helpers.js'
import { v1Url } from '../config/store.js'
import { writeFileAtomic } from '../utils/fs.js'
import { t } from '../i18n/index.js'

const OPENCODE_BIN = 'opencode'
const OPENCODE_NPM_PACKAGE = 'opencode-ai'

// OpenCode config search order (lowest to highest priority):
//   ~/.config/opencode/opencode.json  <- we write here
//   $OPENCODE_CONFIG
//   ./opencode.json (project)
//   $OPENCODE_CONFIG_CONTENT (inline)
function configPath(): string {
  const xdgHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  return path.join(xdgHome, 'opencode', 'opencode.json')
}

const installCheck = (): Promise<AgentInstallStatus> =>
  npmInstallCheck(OPENCODE_BIN, OPENCODE_NPM_PACKAGE)

const install = (): Promise<void> => npmInstallGlobal(OPENCODE_NPM_PACKAGE)

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  const filePath = configPath()
  let existing: Record<string, unknown> = {}
  try {
    const parsed = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      existing = parsed as Record<string, unknown>
    }
  } catch {
    // not present yet, or corrupt - start fresh
  }

  // Register tokenmix as an OpenAI-compatible provider. OpenCode drives custom
  // providers through @ai-sdk/openai-compatible.
  const tokenmixProvider = {
    npm: '@ai-sdk/openai-compatible',
    name: 'TokenMix',
    options: {
      baseURL: v1Url(baseUrl),
      apiKey,
    },
    // Listed models populate /connect picker; users can still type any tokenmix short_id.
    models: {
      [defaultModel]: { name: defaultModel },
    },
  }

  const existingProvider = (existing.provider as Record<string, unknown>) || {}

  const next = {
    ...existing,
    model: existing.model ?? `tokenmix/${defaultModel}`,
    provider: {
      ...existingProvider,
      tokenmix: tokenmixProvider,
    },
  }

  await fs.ensureDir(path.dirname(filePath))
  await writeFileAtomic(filePath, JSON.stringify(next, null, 2))

  return {
    configPath: filePath,
    notes: [t('opencode.noteModel', { model: defaultModel }), t('opencode.noteSwitch')],
  }
}

async function launch(args: string[]): Promise<void> {
  await run(OPENCODE_BIN, args)
}

// Remove the tokenmix provider (and our default model pin) from opencode.json,
// preserving any other providers or a user-chosen model.
async function cleanup(): Promise<AgentCleanupResult> {
  const filePath = configPath()
  let existing: Record<string, unknown>
  try {
    const parsed = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { reverted: false, configPath: filePath }
    }
    existing = parsed as Record<string, unknown>
  } catch {
    return { reverted: false }
  }

  let changed = false
  const provider = existing.provider as Record<string, unknown> | undefined
  if (provider && 'tokenmix' in provider) {
    delete provider.tokenmix
    changed = true
    if (Object.keys(provider).length === 0) delete existing.provider
  }
  if (typeof existing.model === 'string' && existing.model.startsWith('tokenmix/')) {
    delete existing.model
    changed = true
  }

  if (!changed) return { reverted: false, configPath: filePath }

  await writeFileAtomic(filePath, JSON.stringify(existing, null, 2))
  return { reverted: true, configPath: filePath }
}

export const OpenCodeAgent: AgentDescriptor = {
  id: 'opencode',
  displayName: 'OpenCode',
  description: 'sst/opencode - open source AI coding agent (TUI / Desktop / IDE)',
  installMode: 'auto-npm',
  installCheck,
  install,
  configure,
  launch,
  cleanup,
}
