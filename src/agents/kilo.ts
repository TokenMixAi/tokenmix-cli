import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { vscodeConfigOnlyCheck } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

// Config-only agent (VSCode extension): the CLI can't install the extension, so
// installCheck always reports installed and configure() prints the snippet (the
// user may be copying the config for another machine).
const installCheck = (): Promise<AgentInstallStatus> =>
  vscodeConfigOnlyCheck('kilo.hintMarketplace', 'kilo.hintNoVscode')

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Values to paste into Kilo's settings panel.
  return {
    notes: [
      t('kilo.noteNoLauncher'),
      t('kilo.noteConfigWith'),
      '',
      `  Provider:      OpenAI Compatible`,
      `  Base URL:      ${v1Url(baseUrl)}`,
      `  API Key:       ${apiKey}`,
      `  Default Model: ${defaultModel}`,
      '',
      t('kilo.notePasteJson'),
      '',
      JSON.stringify(
        {
          provider: 'openai-compatible',
          openAiBaseUrl: v1Url(baseUrl),
          openAiApiKey: apiKey,
          defaultModelId: defaultModel,
        },
        null,
        2,
      ),
      '',
      t('kilo.noteKeepPrivate'),
    ],
  }
}

export const KiloAgent: AgentDescriptor = {
  id: 'kilo',
  displayName: 'Kilo Code',
  description: 'Kilo-Org/kilocode - VSCode extension (config-only)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
