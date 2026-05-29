import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists, run, captureRun } from '../utils/exec.js'

const AIDER_BIN = 'aider'

async function installCheck(): Promise<AgentInstallStatus> {
  const bin = await commandExists(AIDER_BIN)
  if (!bin) {
    const py = (await commandExists('python3')) || (await commandExists('python'))
    const pipx = await commandExists('pipx')
    if (!py) {
      return {
        installed: false,
        hint:
          'Aider requires Python 3. Install Python 3 from https://python.org/downloads, then come back and run `tokenmix aider` again.',
      }
    }
    const installCmd = pipx ? 'pipx install aider-chat' : 'pip install aider-chat'
    return {
      installed: false,
      hint:
        `Aider is not installed. Run this in another terminal:\n    ${installCmd}\nThen come back and run \`tokenmix aider\` again — your TokenMix login is already saved, so it will pick up automatically.`,
    }
  }
  try {
    const v = await captureRun(AIDER_BIN, ['--version'])
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
  // Aider reads OPENAI_API_KEY and OPENAI_API_BASE. We pass via env at launch
  // and avoid writing to global ~/.aider.conf.yml — keeps user's existing config clean.
  return {
    envVars: {
      OPENAI_API_KEY: apiKey,
      OPENAI_API_BASE: `${baseUrl}/v1`,
      TOKENMIX_DEFAULT_MODEL: defaultModel,
    },
    notes: [
      `Aider will use TokenMix via OpenAI-compatible endpoint.`,
      `Default model: openai/${defaultModel} — override with --model.`,
    ],
  }
}

// Aider lets you pick a model with --model OR one of its built-in alias flags
// (--sonnet, --opus, ...). If the user used any of them, we must not inject our
// own --model on top, which would be a conflicting second model specifier.
const AIDER_MODEL_ALIAS_FLAGS = new Set([
  '--sonnet',
  '--opus',
  '--haiku',
  '--4o',
  '--4',
  '--mini',
  '--35turbo',
  '--deepseek',
  '--o1',
  '--o1-mini',
  '--o3',
  '--o3-mini',
  '--gemini',
  '--gemini-exp',
])

export function userSelectedModel(args: string[]): boolean {
  return args.some(
    (a) => a === '--model' || a.startsWith('--model=') || AIDER_MODEL_ALIAS_FLAGS.has(a),
  )
}

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  // Inject our default --model only if the user didn't already pick a model.
  const finalArgs = userSelectedModel(args)
    ? args
    : ['--model', `openai/${env.TOKENMIX_DEFAULT_MODEL ?? 'claude-sonnet-4.6'}`, ...args]
  await run(AIDER_BIN, finalArgs, { env })
}

export const AiderAgent: AgentDescriptor = {
  id: 'aider',
  displayName: 'Aider',
  description: 'Aider-AI/aider — paired-programming CLI (requires Python)',
  installMode: 'auto-pip',
  installCheck,
  configure,
  launch,
}
