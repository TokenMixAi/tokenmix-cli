import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { commandExists, run } from '../utils/exec.js'
import { probeVersion } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

const OPENHANDS_BIN = 'openhands'
// OpenHands needs Python 3.12+; `uv` pulls a matching Python automatically. We
// print this rather than auto-running it (it installs a toolchain + Python).
const OPENHANDS_INSTALL = 'uv tool install openhands --python 3.12'

async function installCheck(): Promise<AgentInstallStatus> {
  if (!(await commandExists(OPENHANDS_BIN))) {
    return {
      installed: false,
      hint: t('openhands.hintInstall', { cmd: OPENHANDS_INSTALL }),
      installCmd: OPENHANDS_INSTALL,
    }
  }
  return probeVersion(OPENHANDS_BIN)
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // OpenHands reads LLM_API_KEY/LLM_MODEL/LLM_BASE_URL but ONLY when launched with
  // --override-with-envs (injected in launch()). LLM_MODEL needs a LiteLLM provider
  // prefix — `openai/` routes to the OpenAI-compatible path. Verified end-to-end.
  return {
    envVars: {
      LLM_API_KEY: apiKey,
      LLM_MODEL: `openai/${defaultModel}`,
      LLM_BASE_URL: v1Url(baseUrl),
      OPENHANDS_SUPPRESS_BANNER: '1',
    },
    notes: [t('openhands.noteUsing'), t('openhands.noteModel', { model: defaultModel })],
  }
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  // Info-only (`openhands --version`) arrives with an empty env — just forward.
  if (!env.LLM_BASE_URL) {
    await run(OPENHANDS_BIN, args, { env })
    return
  }
  // OpenHands ignores the LLM_* env vars unless --override-with-envs is passed.
  await run(OPENHANDS_BIN, ['--override-with-envs', ...args], { env })
}

export const OpenHandsAgent: AgentDescriptor = {
  id: 'openhands',
  displayName: 'OpenHands',
  description: 'All-Hands-AI/OpenHands — autonomous coding agent (OpenAI-compatible)',
  installMode: 'manual',
  installCheck,
  configure,
  launch,
}
