import { logger } from '../utils/logger.js'
import { openOrHint } from '../utils/browser.js'
import { t } from '../i18n/index.js'

const TOPUP_URL = 'https://tokenmix.ai/dashboard/credits'

export async function topupCommand(): Promise<void> {
  logger.step(t('topup.opening', { url: TOPUP_URL }))
  await openOrHint(TOPUP_URL)
}
