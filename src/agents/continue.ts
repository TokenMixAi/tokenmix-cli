import {
  AgentDescriptor,
  AgentInstallStatus,
  AgentConfigureResult,
} from './types.js'
import { commandExists } from '../utils/exec.js'
import { t } from '../i18n/index.js'

async function installCheck(): Promise<AgentInstallStatus> {
  // Continue is a config-only agent (VSCode/JetBrains extension). The CLI cannot
  // install the extension, so we always proceed to configure() and print the
  // config the user pastes into ~/.continue/config.yaml.
  const code = await commandExists('code')
  return {
    installed: true,
    hint: code ? t('continue.hintMarketplace') : t('continue.hintNoVscode'),
  }
}

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // Continue is driven by ~/.continue/config.yaml (verified schema: top-level
  // name/version/schema + a `models:` list; each model needs name/provider/model,
  // plus apiBase/apiKey for an OpenAI-compatible endpoint). We PRINT a ready-to-use
  // config rather than write the file, so we never clobber a user's existing
  // ~/.continue/config.yaml (and need no YAML dependency or cleanup step).
  const yaml = [
    'name: TokenMix',
    'version: 1.0.0',
    'schema: v1',
    'models:',
    '  - name: TokenMix',
    '    provider: openai',
    `    model: ${defaultModel}`,
    `    apiBase: ${baseUrl}/v1`,
    `    apiKey: ${apiKey}`,
  ].join('\n')

  return {
    notes: [
      t('continue.noteNoLauncher'),
      t('continue.noteConfigWith'),
      // Leading '\n' so agent-runner's 2-space note prefix lands on a blank line,
      // keeping the YAML top-level keys at column 0 (valid YAML when pasted).
      '\n' + yaml,
      '',
      t('continue.noteMergeHint'),
      t('continue.noteKeepPrivate'),
    ],
  }
}

export const ContinueAgent: AgentDescriptor = {
  id: 'continue',
  displayName: 'Continue',
  description: 'continuedev/continue — VSCode/JetBrains extension (config file)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
