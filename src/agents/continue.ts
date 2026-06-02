import { AgentDescriptor, AgentInstallStatus, AgentConfigureResult } from './types.js'
import { vscodeConfigOnlyCheck } from './helpers.js'
import { v1Url } from '../config/store.js'
import { t } from '../i18n/index.js'

// Config-only agent (VSCode/JetBrains extension): the CLI can't install the
// extension, so installCheck always reports installed and configure() prints the
// config to paste into ~/.continue/config.yaml.
const installCheck = (): Promise<AgentInstallStatus> =>
  vscodeConfigOnlyCheck('continue.hintMarketplace', 'continue.hintNoVscode')

async function configure(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<AgentConfigureResult> {
  // ~/.continue/config.yaml schema: top-level name/version/schema + a `models:`
  // list; each model needs name/provider/model, plus apiBase/apiKey for an
  // OpenAI-compatible endpoint. We print the config rather than write the file, so
  // we don't clobber an existing config.yaml (and need no YAML dep or cleanup).
  // Quote user-controlled scalars as YAML single-quoted strings, or a model/baseUrl
  // with ':' '#' etc. would break the structure when pasted in.
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
      // keeping the YAML top-level keys at column 0 - otherwise it's invalid YAML.
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
  description: 'continuedev/continue - VSCode/JetBrains extension (config file)',
  installMode: 'manual-vscode',
  installCheck,
  configure,
}
