import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists } from '../utils/exec.js'

async function installCheck(): Promise<AgentInstallStatus> {
  // Kilo Code is a config-only agent (VSCode extension). The CLI cannot install
  // the extension on the user's behalf, so we always proceed to `configure()` and
  // print the snippet — even if VSCode isn't installed locally yet, the user
  // may be copying the config for another machine.
  const code = await commandExists('code')
  return {
    installed: true,
    hint: code
      ? 'Install "Kilo Code" from the VSCode marketplace, then paste the snippet below into its settings.'
      : 'VSCode not detected on PATH. Install VSCode, then add the Kilo Code extension, then use the snippet below.',
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
