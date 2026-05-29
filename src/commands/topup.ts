import { logger } from '../utils/logger.js'
import { openOrHint } from '../utils/browser.js'

const TOPUP_URL = 'https://tokenmix.ai/dashboard/credits'

export async function topupCommand(): Promise<void> {
  logger.step(`Opening top-up page: ${TOPUP_URL}`)
  await openOrHint(TOPUP_URL)
}
