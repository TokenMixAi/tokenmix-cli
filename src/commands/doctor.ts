import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { readConfig, apiBaseUrl } from '../config/store.js'
import { verifyApiKey } from '../api/client.js'
import { AGENTS } from '../agents/registry.js'
import { t } from '../i18n/index.js'

function maskKey(key: string): string {
  if (key.length <= 12) return key
  return `${key.slice(0, 8)}${'*'.repeat(8)}${key.slice(-4)}`
}

export async function doctorCommand(): Promise<void> {
  console.log()
  console.log(chalk.bold(t('doctor.title')))
  console.log()

  const cfg = await readConfig()
  console.log(chalk.bold(t('doctor.credentials')))
  if (cfg.apiKey) {
    logger.success(`${t('doctor.apiKeyLabel')}  ${chalk.cyan(maskKey(cfg.apiKey))}`)
    logger.success(`${t('doctor.apiBaseLabel')}  ${chalk.cyan(apiBaseUrl(cfg))}`)
    try {
      const ok = await verifyApiKey(cfg.apiKey, apiBaseUrl(cfg))
      if (ok) {
        logger.success(t('doctor.keyValid'))
      } else {
        logger.error(t('doctor.keyInvalid'))
      }
    } catch (err: unknown) {
      // Network problem, not necessarily a bad key — say so rather than claiming
      // the key failed to validate.
      logger.warn(err instanceof Error ? err.message : String(err))
    }
  } else {
    logger.warn(t('doctor.notLoggedIn'))
  }

  console.log()
  console.log(chalk.bold(t('doctor.agentStatus')))
  for (const a of AGENTS) {
    const r = await a.installCheck()
    // Config-only agents (VSCode extensions) have no binary of their own to install,
    // so installCheck always reports installed:true — labeling them "installed" is
    // misleading. Show their install mode instead, matching `tokenmix list`.
    if (a.installMode === 'manual-vscode') {
      logger.success(`${a.displayName.padEnd(14)} ${chalk.dim(t('list.modeManualVscode'))}`)
      if (r.hint) console.log(`    ${chalk.dim(r.hint)}`)
      continue
    }
    if (r.installed) {
      logger.success(
        `${a.displayName.padEnd(14)} ${t('doctor.installed')}${r.version ? ` (${chalk.dim(r.version)})` : ''}`,
      )
      if (r.hint) console.log(`    ${chalk.dim(r.hint)}`)
    } else {
      logger.warn(`${a.displayName.padEnd(14)} ${t('doctor.notInstalled')}`)
      if (r.hint) console.log(`    ${chalk.dim(r.hint)}`)
    }
  }
  console.log()
}
