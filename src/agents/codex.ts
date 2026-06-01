import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { run } from '../utils/exec.js'
import { npmInstallCheck, npmInstallGlobal } from './helpers.js'
import { v1Url, DEFAULT_MODEL } from '../config/store.js'
import { t } from '../i18n/index.js'

const CODEX_BIN = 'codex'
const CODEX_NPM_PACKAGE = '@openai/codex'

// Codex custom provider id. Must NOT collide with Codex's reserved built-in
// provider ids (openai / ollama / lmstudio).
const PROVIDER_ID = 'tokenmix'
// Env var Codex reads for the bearer token (the provider's `env_key`). We set it
// at launch from the user's TokenMix key — nothing is written to ~/.codex.
const KEY_ENV = 'TOKENMIX_API_KEY'

const installCheck = (): Promise<AgentInstallStatus> =>
  npmInstallCheck(CODEX_BIN, CODEX_NPM_PACKAGE)

const install = (): Promise<void> => npmInstallGlobal(CODEX_NPM_PACKAGE)

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // We do NOT write ~/.codex/config.toml. Codex accepts a whole custom provider
  // via `--config` overrides at launch, and reads the key from the env var named
  // by the provider's env_key — so we pass everything through env and inject the
  // overrides in launch(). This never touches the user's Codex config or login.
  return {
    envVars: {
      [KEY_ENV]: apiKey,
      TOKENMIX_BASE_URL: v1Url(baseUrl),
    },
    notes: [t('codex.noteUsing'), t('codex.noteModel', { model: defaultModel })],
  }
}

// Build the `--config key=value` overrides that register tokenmix as a custom
// OpenAI-compatible provider. wire_api MUST be "responses": Codex 0.135+ dropped
// support for "chat" (openai/codex#7782), and tokenmix's gateway implements the
// Responses API specifically for Codex clients (POST /v1/responses).
// Escape a value for a TOML double-quoted string (codex `--config key="value"`),
// so a user-set model/baseUrl containing " \ or a newline can't break the parse
// or inject extra config keys (e.g. overwrite base_url via an embedded newline).
function tomlStr(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n')
}

export function providerOverrides(baseUrl: string, model: string): string[] {
  return [
    '--config',
    `model_provider="${PROVIDER_ID}"`,
    '--config',
    `model="${tomlStr(model)}"`,
    '--config',
    `model_providers.${PROVIDER_ID}.name="TokenMix"`,
    '--config',
    `model_providers.${PROVIDER_ID}.base_url="${tomlStr(baseUrl)}"`,
    '--config',
    `model_providers.${PROVIDER_ID}.env_key="${KEY_ENV}"`,
    '--config',
    `model_providers.${PROVIDER_ID}.wire_api="responses"`,
  ]
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  const baseUrl = env.TOKENMIX_BASE_URL
  // Info-only invocations (`codex --version` / `--help`) reach launch with an
  // empty env (no credentials). Just forward — don't inject a half-built provider.
  if (!baseUrl) {
    await run(CODEX_BIN, args, { env })
    return
  }
  const model = env.TOKENMIX_DEFAULT_MODEL ?? DEFAULT_MODEL
  // Our overrides go first so user-supplied args (e.g. `--config model=...`) win.
  await run(CODEX_BIN, [...providerOverrides(baseUrl, model), ...args], { env })
}

export const CodexAgent: AgentDescriptor = {
  id: 'codex',
  displayName: 'Codex',
  description: 'openai/codex — OpenAI coding agent CLI',
  installMode: 'auto-npm',
  minNode: 22,
  installCheck,
  install,
  configure,
  launch,
}
