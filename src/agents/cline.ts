import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { vscodeConfigOnlyCheck } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

// Config-only agent (VSCode extension): the CLI can't install the extension, so
// installCheck always reports installed and configure() prints the settings to
// paste (the user may be copying the config for another machine).
const installCheck = (): Promise<AgentInstallStatus> =>
  vscodeConfigOnlyCheck('cline.hintMarketplace', 'cline.hintNoVscode')

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Configured through the extension's settings panel (API Provider ->
  // "OpenAI Compatible"). Unlike Kilo, Cline exposes no documented settings.json
  // import, so we print the field values to enter by hand rather than a JSON
  // snippet that might never be read.
  return {
    notes: [
      t('cline.noteNoLauncher'),
      t('cline.noteConfigWith'),
      '',
      `  Provider:   OpenAI Compatible`,
      `  Base URL:   ${v1Url(baseUrl)}`,
      `  API Key:    ${apiKey}`,
      `  Model ID:   ${defaultModel}`,
      '',
      t('cline.noteKeepPrivate'),
    ],
  }
}

export const ClineAgent: AgentDescriptor = {
  id: 'cline',
  displayName: 'Cline',
  description: 'cline/cline - VSCode extension (config-only)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
