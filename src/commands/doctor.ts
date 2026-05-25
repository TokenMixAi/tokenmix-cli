import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { readConfig, apiBaseUrl } from '../config/store.js'
import { verifyApiKey } from '../api/client.js'
import { AGENTS } from '../agents/registry.js'

function maskKey(key: string): string {
  if (key.length <= 12) return key
  return `${key.slice(0, 8)}${'*'.repeat(8)}${key.slice(-4)}`
}

export async function doctorCommand(): Promise<void> {
  console.log()
  console.log(chalk.bold('TokenMix CLI diagnostic'))
  console.log()

  const cfg = await readConfig()
  console.log(chalk.bold('Credentials:'))
  if (cfg.apiKey) {
    logger.success(`API key:    ${chalk.cyan(maskKey(cfg.apiKey))}`)
    logger.success(`API base:   ${chalk.cyan(apiBaseUrl(cfg))}`)
    const ok = await verifyApiKey(cfg.apiKey, apiBaseUrl(cfg))
    if (ok) {
      logger.success('API key is valid.')
    } else {
      logger.error('API key did NOT validate. Run `tokenmix login` again.')
    }
  } else {
    logger.warn('Not logged in. Run `tokenmix login`.')
  }

  console.log()
  console.log(chalk.bold('Agent install status:'))
  for (const a of AGENTS) {
    const r = await a.installCheck()
    if (r.installed) {
      logger.success(
        `${a.displayName.padEnd(14)} installed${r.version ? ` (${chalk.dim(r.version)})` : ''}`,
      )
      if (r.hint) console.log(`    ${chalk.dim(r.hint)}`)
    } else {
      logger.warn(`${a.displayName.padEnd(14)} not installed`)
      if (r.hint) console.log(`    ${chalk.dim(r.hint)}`)
    }
  }
  console.log()
}
