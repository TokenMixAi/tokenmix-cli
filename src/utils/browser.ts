import open from 'open'
import { logger } from './logger.js'

export async function openInBrowser(url: string): Promise<void> {
  await open(url)
}

// Try to open the browser; on failure (headless / SSH / no desktop environment),
// print the URL so the user can open it manually instead of crashing.
export async function openOrHint(url: string): Promise<void> {
  try {
    await open(url)
  } catch {
    logger.info(`Could not open a browser automatically. Open this URL manually:\n  ${url}`)
  }
}
