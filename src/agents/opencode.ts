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

const OPENCODE_BIN = 'opencode'
const OPENCODE_NPM_PACKAGE = 'opencode-ai'

// OpenCode config search order (lowest to highest priority):
//   ~/.config/opencode/opencode.json  ← we write here
//   $OPENCODE_CONFIG
//   ./opencode.json (project)
//   $OPENCODE_CONFIG_CONTENT (inline)
function configPath(): string {
  const xdgHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  return path.join(xdgHome, 'opencode', 'opencode.json')
}

async function installCheck(): Promise<AgentInstallStatus> {
  const bin = await commandExists(OPENCODE_BIN)
  if (!bin) {
    return {
      installed: false,
      hint: `Will install via: npm install -g ${OPENCODE_NPM_PACKAGE}`,
    }
  }
  try {
    const v = await captureRun(OPENCODE_BIN, ['--version'])
    return { installed: true, version: v.stdout.trim() }
  } catch {
    return { installed: true }
  }
}

async function install(): Promise<void> {
  await run('npm', ['install', '-g', OPENCODE_NPM_PACKAGE])
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  const filePath = configPath()
  let existing: Record<string, unknown> = {}
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    existing = JSON.parse(raw)
  } catch {
    // not present yet
  }

  // Register tokenmix as an OpenAI-compatible provider.
  // OpenCode uses @ai-sdk/openai-compatible under the hood for custom providers.
  const tokenmixProvider = {
    npm: '@ai-sdk/openai-compatible',
    name: 'TokenMix',
    options: {
      baseURL: `${baseUrl}/v1`,
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
  await fs.writeFile(filePath, JSON.stringify(next, null, 2))

  return {
    configPath: filePath,
    notes: [
      `Default model set to tokenmix/${defaultModel}`,
      `To switch models, run \`tokenmix models\` or use \`/connect\` inside OpenCode.`,
    ],
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
    existing = JSON.parse(await fs.readFile(filePath, 'utf-8'))
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

  await fs.writeFile(filePath, JSON.stringify(existing, null, 2))
  return { reverted: true, configPath: filePath }
}

export const OpenCodeAgent: AgentDescriptor = {
  id: 'opencode',
  displayName: 'OpenCode',
  description: 'sst/opencode — open source AI coding agent (TUI / Desktop / IDE)',
  installMode: 'auto-npm',
  installCheck,
  install,
  configure,
  launch,
  cleanup,
}
