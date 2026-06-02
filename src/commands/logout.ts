import { logger } from '../utils/logger.js'
import { clearConfig } from '../config/store.js'
import { AGENTS } from '../agents/registry.js'
import { t } from '../i18n/index.js'

export async function logoutCommand(): Promise<void> {
  await clearConfig()
  logger.success(t('logout.done'))

  // Also revert the config we injected into agents, so they stop routing through
  // TokenMix with a key that's about to be gone. Best-effort and precise - each
  // agent only removes what it recognizes as its own tokenmix config.
  for (const agent of AGENTS) {
    if (!agent.cleanup) continue
    try {
      const r = await agent.cleanup()
      if (r.reverted) {
        logger.success(
          t('logout.reverted', { name: agent.displayName }) +
            (r.configPath ? ` (${r.configPath})` : ''),
        )
        if (r.note) logger.dim(`  ${r.note}`)
      }
    } catch {
      // never block logout on agent cleanup
    }
  }
}
