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
      logger.error('No API key provided.')
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
    logger.error('API key should start with sk-tm-')
    process.exit(1)
  }
  logger.step(`Verifying API key against ${baseUrl} ...`)
  const ok = await verifyApiKey(apiKey, baseUrl)
  if (!ok) {
    logger.error('API key verification failed. Double-check at https://tokenmix.ai/dashboard/keys')
    process.exit(1)
  }
  await updateConfig({ apiKey, apiBaseUrl: baseUrl })
  logger.success('Logged in. Try `tokenmix opencode` to launch your first agent.')
}

async function loginByDeviceFlow(baseUrl: string): Promise<void> {
  logger.step('Requesting device authorization ...')
  let auth
  try {
    auth = await startDeviceAuthorization(baseUrl)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error(`Could not start device authorization: ${msg}`)
    logger.info('Falling back to manual paste. Get an API key at https://tokenmix.ai/dashboard/keys')
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
  console.log('  ' + chalk.dim('Open the link below and confirm this code:'))
  console.log()
  console.log('  ' + chalk.bold.cyan(auth.user_code))
  console.log()
  console.log('  ' + chalk.dim('Link:'))
  console.log('  ' + chalk.underline(verifyUrl))
  console.log()

  // Try to open browser, but proceed even if it fails (headless / SSH)
  try {
    await openInBrowser(verifyUrl)
    logger.dim('  (browser opened; if nothing happens, copy the link above)')
  } catch {
    logger.dim('  (could not open browser; copy the link above into one)')
  }
  console.log()

  logger.step(`Waiting for authorization (expires in ${auth.expires_in}s, polling every ${auth.interval}s) ...`)

  let lastReported = -1
  try {
    const result = await pollDeviceToken(baseUrl, auth, (secondsRemaining) => {
      // Print a heartbeat at most every 15s so the terminal isn't silent
      if (lastReported < 0 || lastReported - secondsRemaining >= 15) {
        lastReported = secondsRemaining
        logger.dim(`  ... still waiting (${secondsRemaining}s remaining)`)
      }
    })
    await updateConfig({ apiKey: result.apiKey, apiBaseUrl: baseUrl })
    console.log()
    if (result.userEmail) {
      logger.success(`Logged in as ${chalk.bold(result.userEmail)} (API key #${result.apiKeyId})`)
    } else {
      logger.success(`Logged in (API key #${result.apiKeyId})`)
    }
    logger.info('Try `tokenmix opencode` to launch your first agent.')
  } catch (err: unknown) {
    console.log()
    if (err instanceof DeviceFlowError) {
      logger.error(err.message)
      if (err.code === 'expired_token' || err.code === 'timeout') {
        const retry = await confirm('Try again?', true)
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
