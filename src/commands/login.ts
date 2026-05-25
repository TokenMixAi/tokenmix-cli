import { logger } from '../utils/logger.js'
import { promptApiKey } from '../utils/prompt.js'
import { verifyApiKey } from '../api/client.js'
import { readConfig, updateConfig, apiBaseUrl } from '../config/store.js'

export interface LoginOptions {
  key?: string
  url?: string
}

export async function loginCommand(opts: LoginOptions): Promise<void> {
  const cfg = await readConfig()
  const baseUrl = opts.url || apiBaseUrl(cfg)

  let apiKey = opts.key
  if (!apiKey) {
    const entered = await promptApiKey()
    apiKey = entered || undefined
  }
  if (!apiKey) {
    logger.error('No API key provided.')
    process.exit(1)
  }
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
