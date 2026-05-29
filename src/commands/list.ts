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

export async function listCommand(): Promise<void> {
  console.log()
  console.log(chalk.bold(t('list.title')))
  console.log()
  for (const a of AGENTS) {
    const id = chalk.cyan(a.id.padEnd(10))
    const mode = chalk.dim(`[${modeLabel(a.installMode)}]`)
    console.log(`  ${id} ${a.displayName.padEnd(14)} ${mode}`)
    console.log(`    ${chalk.dim(a.description)}`)
  }
  console.log()
  console.log(chalk.dim(t('list.usage')))
  console.log()
}
