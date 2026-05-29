import open from 'open'
import { logger } from './logger.js'
import { t } from '../i18n/index.js'

export async function openInBrowser(url: string): Promise<void> {
  await open(url)
}

// Try to open the browser; on failure (headless / SSH / no desktop environment),
// print the URL so the user can open it manually instead of crashing.
export async function openOrHint(url: string): Promise<void> {
  try {
    await open(url)
  } catch {
    logger.info(t('browser.manual', { url }))
  }
}
