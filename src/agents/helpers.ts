import { AgentInstallStatus } from './types.js'
import { commandExists, run, captureRun } from '../utils/exec.js'
import { t } from '../i18n/index.js'
import { MessageKey } from '../i18n/messages.js'

// Shared install-check / install helpers, so each agent descriptor stays a thin
// declaration instead of repeating boilerplate.

// Best-effort version probe for an installed binary. `<bin> --version` is advisory,
// so a missing or unparseable version still reports installed.
export async function probeVersion(bin: string): Promise<AgentInstallStatus> {
  try {
    const v = await captureRun(bin, ['--version'])
    return { installed: true, version: v.stdout.trim() }
  } catch {
    return { installed: true }
  }
}

// Install-check for an agent shipped as a global npm package: present -> probe
// version; absent -> offer the `npm install -g <pkg>` command.
export async function npmInstallCheck(
  bin: string,
  npmPackage: string,
): Promise<AgentInstallStatus> {
  if (!(await commandExists(bin))) {
    const cmd = `npm install -g ${npmPackage}`
    return { installed: false, hint: t('install.willInstallVia', { cmd }), installCmd: cmd }
  }
  return probeVersion(bin)
}

// Install a global npm package (the auto-install path for npm-based agents).
export async function npmInstallGlobal(npmPackage: string): Promise<void> {
  await run('npm', ['install', '-g', npmPackage])
}

// Install-check for config-only VSCode-extension agents (Kilo, Cline, Roo,
// Continue): the CLI can't install the extension, so it's always "installed". Hint
// points at the marketplace when `code` is on PATH, else at installing VSCode first.
export async function vscodeConfigOnlyCheck(
  marketplaceHint: MessageKey,
  noVscodeHint: MessageKey,
): Promise<AgentInstallStatus> {
  const code = await commandExists('code')
  return { installed: true, hint: code ? t(marketplaceHint) : t(noVscodeHint) }
}
