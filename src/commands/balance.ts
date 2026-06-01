import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { openOrHint } from '../utils/browser.js'
import { readConfig, apiBaseUrl } from '../config/store.js'
import { fetchWallet } from '../api/client.js'
import { DASHBOARD_URL, DASHBOARD_CREDITS_URL } from '../config/urls.js'
import { t } from '../i18n/index.js'

// micro-USD → display string. Mirrors the platform / plugin: 2 decimals for
// amounts >= $1 (trailing zeros trimmed), more precision for sub-dollar amounts.
export function formatUSD(microUsd: number): string {
  const usd = microUsd / 1_000_000
  if (Math.abs(usd) >= 1) return usd.toFixed(2).replace(/\.?0+$/, '')
  return usd.toFixed(6).replace(/\.?0+$/, '')
}

export async function balanceCommand(): Promise<void> {
  const cfg = await readConfig()
  if (!cfg.apiKey) {
    logger.error(t('common.notLoggedIn'))
    process.exit(1)
  }

  try {
    const w = await fetchWallet(cfg.apiKey, apiBaseUrl(cfg))
    const available = formatUSD(w.balance + w.gift_balance)
    console.log()
    logger.success(`${t('balance.available')}  ${chalk.bold(`$${available}`)} ${w.currency}`)
    console.log(`  ${t('balance.balanceLabel')}: $${formatUSD(w.balance)}`)
    console.log(`  ${t('balance.giftLabel')}: $${formatUSD(w.gift_balance)}`)
    console.log(`  ${t('balance.spentLabel')}: $${formatUSD(w.total_used)}`)
    if (w.frozen > 0) {
      console.log(`  ${t('balance.reservedLabel')}: $${formatUSD(w.frozen)}`)
    }
    console.log()
    logger.dim(t('balance.topupAt', { url: DASHBOARD_CREDITS_URL }))
    console.log()
  } catch (err) {
    // Couldn't fetch the wallet (network failure, or an invalid/expired key).
    // Surface the reason — consistent with doctor/login — then fall back to the
    // dashboard so the user isn't stuck.
    logger.warn(t('balance.fetchFailed'))
    if (err instanceof Error && err.message) logger.dim(err.message)
    logger.step(t('balance.opening', { url: DASHBOARD_URL }))
    await openOrHint(DASHBOARD_URL)
  }
}
