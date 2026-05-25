import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists } from '../utils/exec.js'

async function installCheck(): Promise<AgentInstallStatus> {
  const code = await commandExists('code')
  if (!code) {
    return {
      installed: false,
      hint: 'Kilo Code is a VSCode extension. Install VSCode first, then install "Kilo Code" from the marketplace.',
    }
  }
  return {
    installed: true,
    hint: 'If you have not installed the Kilo Code extension yet, search "Kilo Code" in the VSCode marketplace.',
  }
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Kilo Code is a VSCode extension; there is no CLI launcher.
  // We print the configuration values for the user to paste into Kilo settings.
  return {
    notes: [
      'Kilo Code is a VSCode extension and does not have a CLI launcher.',
      'Configure Kilo Code with the following:',
      '',
      `  Provider:      OpenAI Compatible`,
      `  Base URL:      ${baseUrl}/v1`,
      `  API Key:       ${apiKey}`,
      `  Default Model: ${defaultModel}`,
      '',
      'Or paste this JSON snippet into Kilo Code settings (Settings → Providers → JSON):',
      '',
      JSON.stringify(
        {
          provider: 'openai-compatible',
          openAiBaseUrl: `${baseUrl}/v1`,
          openAiApiKey: apiKey,
          defaultModelId: defaultModel,
        },
        null,
        2,
      ),
    ],
  }
}

export const KiloAgent: AgentDescriptor = {
  id: 'kilo',
  displayName: 'Kilo Code',
  description: 'Kilo-Org/kilocode — VSCode extension (config-only)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
