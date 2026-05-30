import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists, run, captureRun } from '../utils/exec.js'
import { t } from '../i18n/index.js'

const QWEN_BIN = 'qwen'
const QWEN_NPM_PACKAGE = '@qwen-code/qwen-code'

async function installCheck(): Promise<AgentInstallStatus> {
  const bin = await commandExists(QWEN_BIN)
  if (!bin) {
    const cmd = `npm install -g ${QWEN_NPM_PACKAGE}`
    return {
      installed: false,
      hint: t('install.willInstallVia', { cmd }),
      installCmd: cmd,
    }
  }
  try {
    const v = await captureRun(QWEN_BIN, ['--version'])
    return { installed: true, version: v.stdout.trim() }
  } catch {
    return { installed: true }
  }
}

async function install(): Promise<void> {
  await run('npm', ['install', '-g', `${QWEN_NPM_PACKAGE}@latest`])
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Qwen Code (a Gemini CLI fork) reads OPENAI_API_KEY / OPENAI_BASE_URL /
  // OPENAI_MODEL when launched with `--auth-type openai` — VERIFIED end-to-end
  // against tokenmix (`qwen -p` replied via the gateway). We pass these via env
  // at launch and never touch the user's ~/.qwen/settings.json.
  return {
    envVars: {
      OPENAI_API_KEY: apiKey,
      OPENAI_BASE_URL: `${baseUrl}/v1`,
      OPENAI_MODEL: defaultModel,
    },
    notes: [t('qwen.noteUsing'), t('qwen.noteModel', { model: defaultModel })],
  }
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  // Info-only (`qwen --version` / `--help`) reaches launch with an empty env —
  // just forward, don't force an auth mode.
  if (!env.OPENAI_BASE_URL) {
    await run(QWEN_BIN, args, { env })
    return
  }
  // Force OpenAI auth mode (Qwen OAuth was retired 2026-04-15) so it uses our env.
  // Our flag goes first; user args follow and can override.
  await run(QWEN_BIN, ['--auth-type', 'openai', ...args], { env })
}

export const QwenAgent: AgentDescriptor = {
  id: 'qwen',
  displayName: 'Qwen Code',
  description: 'QwenLM/qwen-code — terminal coding agent (OpenAI-compatible)',
  installMode: 'auto-npm',
  minNode: 22,
  installCheck,
  install,
  configure,
  launch,
}
