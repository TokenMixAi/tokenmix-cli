import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists } from '../utils/exec.js'
import { t } from '../i18n/index.js'

async function installCheck(): Promise<AgentInstallStatus> {
  // Roo Code is a config-only agent (VSCode extension, a Cline fork). The CLI
  // cannot install the extension, so we always proceed to configure() and print
  // the settings — the user may also be copying the config for another machine.
  const code = await commandExists('code')
  return {
    installed: true,
    hint: code ? t('roo.hintMarketplace') : t('roo.hintNoVscode'),
  }
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Roo Code is configured through its settings panel (API Provider →
  // "OpenAI Compatible"), exactly like Cline. No documented settings.json
  // import, so we only print the field values to enter by hand.
  return {
    notes: [
      t('roo.noteNoLauncher'),
      t('roo.noteConfigWith'),
      '',
      `  Provider:   OpenAI Compatible`,
      `  Base URL:   ${baseUrl}/v1`,
      `  API Key:    ${apiKey}`,
      `  Model ID:   ${defaultModel}`,
      '',
      t('roo.noteKeepPrivate'),
    ],
  }
}

export const RooAgent: AgentDescriptor = {
  id: 'roo',
  displayName: 'Roo Code',
  description: 'RooCodeInc/Roo-Code — VSCode extension (config-only)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
