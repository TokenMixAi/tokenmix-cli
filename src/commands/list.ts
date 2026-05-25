import chalk from 'chalk'
import { AGENTS } from '../agents/registry.js'

const MODE_LABEL: Record<string, string> = {
  'auto-npm': 'auto (npm)',
  'auto-pip': 'semi (pip)',
  'manual-vscode': 'config-only (VSCode)',
  manual: 'manual',
}

export async function listCommand(): Promise<void> {
  console.log()
  console.log(chalk.bold('Supported agents:'))
  console.log()
  for (const a of AGENTS) {
    const id = chalk.cyan(a.id.padEnd(10))
    const mode = chalk.dim(`[${MODE_LABEL[a.installMode] ?? a.installMode}]`)
    console.log(`  ${id} ${a.displayName.padEnd(14)} ${mode}`)
    console.log(`    ${chalk.dim(a.description)}`)
  }
  console.log()
  console.log(chalk.dim('Usage: tokenmix <agent> [args...]'))
  console.log()
}
