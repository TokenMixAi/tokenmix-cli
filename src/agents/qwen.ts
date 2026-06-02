import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { run } from '../utils/exec.js'
import { npmInstallCheck, npmInstallGlobal } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

const QWEN_BIN = 'qwen'
const QWEN_NPM_PACKAGE = '@qwen-code/qwen-code'

const installCheck = (): Promise<AgentInstallStatus> => npmInstallCheck(QWEN_BIN, QWEN_NPM_PACKAGE)

const install = (): Promise<void> => npmInstallGlobal(`${QWEN_NPM_PACKAGE}@latest`)

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Qwen Code (a Gemini CLI fork) reads OPENAI_API_KEY / OPENAI_BASE_URL /
  // OPENAI_MODEL when launched with `--auth-type openai`. Verified end-to-end
  // against tokenmix (`qwen -p` replied via the gateway). Passed via env at launch;
  // we never touch the user's ~/.qwen/settings.json.
  return {
    envVars: {
      OPENAI_API_KEY: apiKey,
      OPENAI_BASE_URL: v1Url(baseUrl),
      OPENAI_MODEL: defaultModel,
    },
    notes: [t('qwen.noteUsing'), t('qwen.noteModel', { model: defaultModel })],
  }
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  // Info-only (`qwen --version` / `--help`) reaches launch with an empty env -
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
  description: 'QwenLM/qwen-code - terminal coding agent (OpenAI-compatible)',
  installMode: 'auto-npm',
  minNode: 22,
  installCheck,
  install,
  configure,
  launch,
}
