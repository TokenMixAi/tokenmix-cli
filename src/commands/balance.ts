import { logger } from '../utils/logger.js'
import { openOrHint } from '../utils/browser.js'
import { readConfig } from '../config/store.js'

// v0.1: balance lookup over API requires a user JWT, which we do not yet have
// (the CLI uses an API Key today). We open the dashboard instead.
// Once the device-flow login lands in the backend, this will hit /api/user/wallet directly.
const DASHBOARD_URL = 'https://tokenmix.ai/dashboard'

export async function balanceCommand(): Promise<void> {
  const cfg = await readConfig()
  if (!cfg.apiKey) {
    logger.error('Not logged in. Run `tokenmix login` first.')
    process.exit(1)
  }
  logger.step(`Opening dashboard to view balance: ${DASHBOARD_URL}`)
  await openOrHint(DASHBOARD_URL)
}
