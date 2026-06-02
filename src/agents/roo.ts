import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { vscodeConfigOnlyCheck } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

// Config-only agent (VSCode extension, a Cline fork): the CLI can't install the
// extension, so installCheck always reports installed and configure() prints the
// settings (the user may be copying the config for another machine).
const installCheck = (): Promise<AgentInstallStatus> =>
  vscodeConfigOnlyCheck('roo.hintMarketplace', 'roo.hintNoVscode')

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Configured through the settings panel (API Provider -> "OpenAI Compatible"),
  // like Cline. No documented settings.json import, so we print the field values
  // to enter by hand.
  return {
    notes: [
      t('roo.noteNoLauncher'),
      t('roo.noteConfigWith'),
      '',
      `  Provider:   OpenAI Compatible`,
      `  Base URL:   ${v1Url(baseUrl)}`,
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
  description: 'RooCodeInc/Roo-Code - VSCode extension (config-only)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
