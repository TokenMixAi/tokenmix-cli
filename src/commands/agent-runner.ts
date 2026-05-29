import { Command } from 'commander'
import { logger } from '../utils/logger.js'
import { readConfig, apiBaseUrl } from '../config/store.js'
import { confirm } from '../utils/prompt.js'
import { AGENTS } from '../agents/registry.js'
import { AgentDescriptor } from '../agents/types.js'

const DEFAULT_MODEL = 'claude-sonnet-4.6'

interface ExecaLikeError {
  exitCode?: number
  message?: string
}

export function registerAgentCommands(program: Command): void {
  for (const agent of AGENTS) {
    if (agent.registerCommand) {
      agent.registerCommand(program)
      continue
    }
    program
      .command(`${agent.id} [args...]`)
      .description(`Configure and launch ${agent.displayName} via TokenMix`)
      .allowUnknownOption(true)
      .passThroughOptions(true) // forward --version / --help / --any to the underlying agent
      .action(async (args: string[] = []) => {
        await runAgent(agent, args)
      })
  }
}

async function runAgent(agent: AgentDescriptor, args: string[]): Promise<void> {
  const cfg = await readConfig()
  if (!cfg.apiKey) {
    logger.error('Not logged in. Run `tokenmix login` first.')
    process.exit(1)
  }
  const baseUrl = apiBaseUrl(cfg)
  const defaultModel = cfg.defaultModel || DEFAULT_MODEL

  // 1. Check install status.
  const status = await agent.installCheck()
  if (!status.installed) {
    if (agent.install) {
      const shouldInstall = await confirm(
        `${agent.displayName} is not installed. Install now?`,
        true,
      )
      if (!shouldInstall) {
        if (status.hint) logger.warn(status.hint)
        process.exit(1)
      }
      logger.step(`Installing ${agent.displayName} ...`)
      await agent.install()
      logger.success(`${agent.displayName} installed.`)
    } else {
      logger.warn(status.hint || `${agent.displayName} is not installable from the CLI.`)
      process.exit(1)
    }
  }

  // 2. Configure with tokenmix credentials.
  logger.step(`Configuring ${agent.displayName} ...`)
  const result = await agent.configure(cfg.apiKey, baseUrl, defaultModel)
  if (result.configPath) {
    logger.success(`Wrote ${result.configPath}`)
  }
  if (result.notes && result.notes.length > 0) {
    for (const note of result.notes) {
      if (note === '') console.log()
      else console.log(`  ${note}`)
    }
    console.log()
  }

  // 3. Launch (or stop if the agent has no CLI launcher).
  if (!agent.launch) {
    logger.info(`${agent.displayName} configuration ready.`)
    return
  }

  logger.step(`Launching ${agent.displayName} ...`)
  const env: Record<string, string> = {
    ...(result.envVars ?? {}),
    TOKENMIX_DEFAULT_MODEL: defaultModel,
  }
  try {
    await agent.launch(args, env)
  } catch (err: unknown) {
    const e = err as ExecaLikeError
    if (typeof e.exitCode === 'number' && e.exitCode !== 0) {
      process.exit(e.exitCode)
    }
    throw err
  }
}
