import chalk from 'chalk'
import { AGENTS } from '../agents/registry.js'
import { t } from '../i18n/index.js'

// Resolved at call time so it follows the active locale.
function modeLabel(mode: string): string {
  switch (mode) {
    case 'auto-npm':
      return t('list.modeAutoNpm')
    case 'auto-pip':
      return t('list.modeAutoPip')
    case 'manual-vscode':
      return t('list.modeManualVscode')
    case 'manual':
      return t('list.modeManual')
    default:
      return mode
  }
}

// Localized agent tagline; falls back to the descriptor's English description.
function agentDesc(id: string, fallback: string): string {
  switch (id) {
    case 'opencode':
      return t('desc.opencode')
    case 'claude':
      return t('desc.claude')
    case 'aider':
      return t('desc.aider')
    case 'kilo':
      return t('desc.kilo')
    case 'cline':
      return t('desc.cline')
    case 'roo':
      return t('desc.roo')
    case 'continue':
      return t('desc.continue')
    case 'codex':
      return t('desc.codex')
    case 'qwen':
      return t('desc.qwen')
    case 'goose':
      return t('desc.goose')
    default:
      return fallback
  }
}

export async function listCommand(): Promise<void> {
  console.log()
  console.log(chalk.bold(t('list.title')))
  console.log()
  for (const a of AGENTS) {
    const id = chalk.cyan(a.id.padEnd(10))
    const mode = chalk.dim(`[${modeLabel(a.installMode)}]`)
    console.log(`  ${id} ${a.displayName.padEnd(14)} ${mode}`)
    console.log(`    ${chalk.dim(agentDesc(a.id, a.description))}`)
  }
  console.log()
  console.log(chalk.dim(t('list.usage')))
  console.log()
}
