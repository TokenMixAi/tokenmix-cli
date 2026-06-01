import { logger } from '../utils/logger.js'
import { openOrHint } from '../utils/browser.js'
import { DASHBOARD_CREDITS_URL } from '../config/urls.js'
import { t } from '../i18n/index.js'

export async function topupCommand(): Promise<void> {
  logger.step(t('topup.opening', { url: DASHBOARD_CREDITS_URL }))
  await openOrHint(DASHBOARD_CREDITS_URL)
}
