import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { promptApiKey, confirm } from '../utils/prompt.js'
import { openInBrowser } from '../utils/browser.js'
import {
  verifyApiKey,
  startDeviceAuthorization,
  pollDeviceToken,
  DeviceFlowError,
} from '../api/client.js'
import { readConfig, updateConfig, apiBaseUrl } from '../config/store.js'
import { t } from '../i18n/index.js'

export interface LoginOptions {
  key?: string
  url?: string
  paste?: boolean
}

export async function loginCommand(opts: LoginOptions): Promise<void> {
  const cfg = await readConfig()
  const baseUrl = opts.url || apiBaseUrl(cfg)

  // 显式 --key 走老路径（适合 CI/无浏览器环境）
  if (opts.key) {
    await loginByKey(opts.key, baseUrl)
    return
  }

  // 显式 --paste 让用户手动粘贴
  if (opts.paste) {
    const entered = await promptApiKey()
    if (!entered) {
      logger.error(t('login.noKey'))
      process.exit(1)
    }
    await loginByKey(entered, baseUrl)
    return
  }

  // 默认走 device flow（浏览器扫码授权）
  await loginByDeviceFlow(baseUrl)
}

async function loginByKey(apiKey: string, baseUrl: string): Promise<void> {
  if (!apiKey.startsWith('sk-tm-')) {
    logger.error(t('login.keyMustStart'))
    process.exit(1)
  }
  logger.step(t('login.verifying', { baseUrl }))
  let ok = false
  try {
    ok = await verifyApiKey(apiKey, baseUrl)
  } catch (err: unknown) {
    // Couldn't reach the API (offline / DNS / firewall / outage). Surface the
    // network problem instead of falsely claiming the key is wrong.
    logger.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
  if (!ok) {
    logger.error(t('login.verifyFailed'))
    process.exit(1)
  }
  await updateConfig({ apiKey, apiBaseUrl: baseUrl })
  logger.success(t('login.loggedInHint'))
}

async function loginByDeviceFlow(baseUrl: string): Promise<void> {
  logger.step(t('login.requesting'))
  let auth
  try {
    auth = await startDeviceAuthorization(baseUrl)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error(t('login.couldNotStart', { msg }))
    logger.info(t('login.fallbackPaste'))
    const entered = await promptApiKey()
    if (!entered) process.exit(1)
    await loginByKey(entered, baseUrl)
    return
  }

  // verification_uri_complete is optional per RFC 8628; fall back to the plain
  // verification_uri (the user_code is shown separately just below either way).
  const verifyUrl = auth.verification_uri_complete || auth.verification_uri

  // Display user_code prominently
  console.log()
  console.log('  ' + chalk.dim(t('login.openLinkConfirm')))
  console.log()
  console.log('  ' + chalk.bold.cyan(auth.user_code))
  console.log()
  console.log('  ' + chalk.dim(t('login.link')))
  console.log('  ' + chalk.underline(verifyUrl))
  console.log()

  // Try to open browser, but proceed even if it fails (headless / SSH)
  try {
    await openInBrowser(verifyUrl)
    logger.dim('  ' + t('login.browserOpened'))
  } catch {
    logger.dim('  ' + t('login.browserFailed'))
  }
  console.log()

  logger.step(t('login.waiting', { expires: auth.expires_in, interval: auth.interval }))

  let lastReported = -1
  try {
    const result = await pollDeviceToken(baseUrl, auth, (secondsRemaining) => {
      // Print a heartbeat at most every 15s so the terminal isn't silent
      if (lastReported < 0 || lastReported - secondsRemaining >= 15) {
        lastReported = secondsRemaining
        logger.dim('  ' + t('login.stillWaiting', { seconds: secondsRemaining }))
      }
    })
    await updateConfig({ apiKey: result.apiKey, apiBaseUrl: baseUrl })
    console.log()
    if (result.userEmail) {
      logger.success(
        t('login.loggedInAs', { email: chalk.bold(result.userEmail), id: result.apiKeyId }),
      )
    } else {
      logger.success(t('login.loggedInId', { id: result.apiKeyId }))
    }
    logger.info(t('login.tryFirstAgent'))
  } catch (err: unknown) {
    console.log()
    if (err instanceof DeviceFlowError) {
      logger.error(err.message)
      // Only offer to retry when interactive — in a non-TTY (CI) the user can't
      // approve in a browser anyway, and an auto-yes here would loop forever.
      if ((err.code === 'expired_token' || err.code === 'timeout') && process.stdin.isTTY) {
        const retry = await confirm(t('login.tryAgain'), true)
        if (retry) {
          await loginByDeviceFlow(baseUrl)
          return
        }
      }
    } else {
      logger.error(err instanceof Error ? err.message : String(err))
    }
    process.exit(1)
  }
}
