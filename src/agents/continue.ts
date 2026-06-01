import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { vscodeConfigOnlyCheck } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

// Continue is a config-only agent (VSCode/JetBrains extension): the CLI can't
// install the extension, so installCheck always reports installed and configure()
// prints the config to paste into ~/.continue/config.yaml.
const installCheck = (): Promise<AgentInstallStatus> =>
  vscodeConfigOnlyCheck('continue.hintMarketplace', 'continue.hintNoVscode')

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
  // Quote user-controlled scalars as YAML single-quoted strings so a model/baseUrl
  // containing ':' '#' etc. can't break the structure when pasted into config.yaml.
  const ys = (v: string): string => `'${v.replace(/'/g, "''")}'`
  const yaml = [
    'name: TokenMix',
    'version: 1.0.0',
    'schema: v1',
    'models:',
    '  - name: TokenMix',
    '    provider: openai',
    `    model: ${ys(defaultModel)}`,
    `    apiBase: ${ys(v1Url(baseUrl))}`,
    `    apiKey: ${ys(apiKey)}`,
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
