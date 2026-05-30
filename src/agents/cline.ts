import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists } from '../utils/exec.js'
import { t } from '../i18n/index.js'

async function installCheck(): Promise<AgentInstallStatus> {
  // Cline is a config-only agent (VSCode extension). The CLI cannot install the
  // extension on the user's behalf, so we always proceed to `configure()` and
  // print the settings — even if VSCode isn't installed locally yet, the user
  // may be copying the config for another machine.
  const code = await commandExists('code')
  return {
    installed: true,
    hint: code ? t('cline.hintMarketplace') : t('cline.hintNoVscode'),
  }
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Cline is a VSCode extension configured through its settings panel
  // (API Provider → "OpenAI Compatible"). Unlike Kilo it exposes no documented
  // settings.json import, so we only print the field values to enter by hand —
  // we never fabricate a JSON snippet that might not be read.
  return {
    notes: [
      t('cline.noteNoLauncher'),
      t('cline.noteConfigWith'),
      '',
      `  Provider:   OpenAI Compatible`,
      `  Base URL:   ${baseUrl}/v1`,
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
  description: 'cline/cline — VSCode extension (config-only)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
