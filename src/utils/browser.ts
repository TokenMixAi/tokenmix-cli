import open from 'open'
import { logger } from './logger.js'
import { t } from '../i18n/index.js'

export async function openInBrowser(url: string): Promise<void> {
  const child = await open(url)
  // open() spawns a detached child; if the launcher binary is missing its async
  // 'error' event is uncaught and crashes us. Swallow it - callers print the URL
  // and treat a browser failure as non-fatal.
  child.on('error', () => {})
}

// Print the URL first, then try to open the browser. Without `{ wait: true }`,
// open() resolves immediately even when nothing actually launches (headless / SSH /
// container), so a catch-based fallback never fires. Printing first means the user
// can always copy the link.
export async function openOrHint(url: string): Promise<void> {
  logger.info(t('browser.manual', { url }))
  try {
    const child = await open(url)
    child.on('error', () => {}) // swallow async spawn errors; the URL is already shown
  } catch {
    // best-effort - the URL is already shown above
  }
}
