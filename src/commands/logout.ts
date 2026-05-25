import { logger } from '../utils/logger.js'
import { clearConfig } from '../config/store.js'

export async function logoutCommand(): Promise<void> {
  await clearConfig()
  logger.success('Logged out. Credentials removed from this machine.')
}
