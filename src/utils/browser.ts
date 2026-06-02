import open from 'open'
import { logger } from './logger.js'
import { t } from '../i18n/index.js'

export async function openInBrowser(url: string): Promise<void> {
  const child = await open(url)
  // open() spawns a detached, unref'd child; if the launcher binary is missing its
  // async 'error' event would otherwise be uncaught (→ process crash). Swallow it -
  // callers print the URL and treat a browser failure as non-fatal.
  child.on('error', () => {})
}

// Print the URL, then best-effort open the browser. We print UNCONDITIONALLY and
// first: without `{ wait: true }`, open() resolves immediately even when no browser
// actually launches (headless / SSH / container / no desktop), so a catch-based
// fallback would never fire and the user would be left staring at nothing. Printing
// first guarantees they can always copy the link.
export async function openOrHint(url: string): Promise<void> {
  logger.info(t('browser.manual', { url }))
  try {
    const child = await open(url)
    child.on('error', () => {}) // swallow async spawn errors; the URL is already shown
  } catch {
    // best-effort - the URL is already shown above
  }
}
