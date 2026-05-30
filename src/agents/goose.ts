import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists, run, captureRun } from '../utils/exec.js'
import { t } from '../i18n/index.js'

const GOOSE_BIN = 'goose'
// Goose ships as a Rust binary via an official install script. We do NOT auto-run
// a `curl | bash`; we print it so the user installs it deliberately.
const GOOSE_INSTALL =
  'curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | bash'

async function installCheck(): Promise<AgentInstallStatus> {
  const bin = await commandExists(GOOSE_BIN)
  if (!bin) {
    return {
      installed: false,
      hint: t('goose.hintInstall', { cmd: GOOSE_INSTALL }),
      installCmd: GOOSE_INSTALL,
    }
  }
  try {
    const v = await captureRun(GOOSE_BIN, ['--version'])
    return { installed: true, version: v.stdout.trim() }
  } catch {
    return { installed: true }
  }
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Goose reads GOOSE_PROVIDER/GOOSE_MODEL + OPENAI_HOST/OPENAI_API_KEY. NOTE:
  // OPENAI_HOST is the BARE host — Goose appends /v1/chat/completions itself, so we
  // pass baseUrl WITHOUT /v1 (unlike every other agent). GOOSE_DISABLE_KEYRING
  // avoids an interactive keyring prompt. Verified end-to-end against tokenmix.
  return {
    envVars: {
      GOOSE_PROVIDER: 'openai',
      GOOSE_MODEL: defaultModel,
      OPENAI_HOST: baseUrl,
      OPENAI_API_KEY: apiKey,
      GOOSE_DISABLE_KEYRING: '1',
    },
    notes: [t('goose.noteUsing'), t('goose.noteModel', { model: defaultModel })],
  }
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  // Pure pass-through: `tokenmix goose run -t "..."` → `goose run -t "..."` with our
  // env. No flag injection, so info-only (`goose --version`) needs no special-casing.
  await run(GOOSE_BIN, args, { env })
}

export const GooseAgent: AgentDescriptor = {
  id: 'goose',
  displayName: 'Goose',
  description: 'block/goose — on-machine AI agent (OpenAI-compatible)',
  installMode: 'manual',
  installCheck,
  configure,
  launch,
}
