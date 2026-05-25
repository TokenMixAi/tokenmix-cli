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
    if (!py) {
      return {
        installed: false,
        hint: 'Aider requires Python 3. Install Python first, then `pipx install aider-chat`.',
      }
    }
    return {
      installed: false,
      hint: 'Run `pipx install aider-chat` (preferred) or `pip install aider-chat` to install Aider.',
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

async function launch(args: string[], env: Record<string, string>): Promise<void> {
  // Inject --model only if user didn't supply one.
  const hasModel = args.some((a) => a === '--model' || a.startsWith('--model='))
  const finalArgs = hasModel
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
