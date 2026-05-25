import { logger } from '../utils/logger.js'
import { openInBrowser } from '../utils/browser.js'

const TOPUP_URL = 'https://tokenmix.ai/dashboard/credits'

export async function topupCommand(): Promise<void> {
  logger.step(`Opening top-up page: ${TOPUP_URL}`)
  await openInBrowser(TOPUP_URL)
}
