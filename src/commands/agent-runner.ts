import { Command } from 'commander'
import { logger } from '../utils/logger.js'
import { readConfig, apiBaseUrl } from '../config/store.js'
import { confirm } from '../utils/prompt.js'
import { AGENTS } from '../agents/registry.js'
import { AgentDescriptor } from '../agents/types.js'

const DEFAULT_MODEL = 'claude-sonnet-4.6'

// Flags that are pure information requests meant for the underlying agent binary.
// For these we must NOT rewrite global config or require login — just forward them.
const INFO_ONLY_FLAGS = new Set(['--version', '-V', '--help', '-h'])

export function isInfoOnlyInvocation(args: string[]): boolean {
  return args.length > 0 && args.every((a) => INFO_ONLY_FLAGS.has(a))
}

interface ExecaLikeError {
  exitCode?: number
  message?: string
}

// Forward to the agent binary, mirroring its exit code; re-throw non-exec errors.
async function launchOrExit(
  launch: NonNullable<AgentDescriptor['launch']>,
  args: string[],
  env: Record<string, string>,
): Promise<void> {
  try {
    await launch(args, env)
  } catch (err: unknown) {
    const e = err as ExecaLikeError
    if (typeof e.exitCode === 'number' && e.exitCode !== 0) {
      process.exit(e.exitCode)
    }
    throw err
  }
}

// The function that actually configures + launches an agent. Injectable so tests
// can assert how commander parses/forwards args without triggering real side effects.
export type AgentRunner = (agent: AgentDescriptor, args: string[]) => Promise<void>

export function registerAgentCommands(program: Command, runner: AgentRunner = runAgent): void {
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
        await runner(agent, args)
      })
  }
}

export async function runAgent(agent: AgentDescriptor, args: string[]): Promise<void> {
  // `tokenmix <agent> --version|--help`: forward straight to the binary without
  // rewriting global config or requiring login — a query must not have side effects.
  if (agent.launch && isInfoOnlyInvocation(args)) {
    const status = await agent.installCheck()
    if (!status.installed) {
      logger.warn(status.hint || `${agent.displayName} is not installed.`)
      process.exit(1)
    }
    await launchOrExit(agent.launch, args, {})
    return
  }

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
      try {
        await agent.install()
      } catch {
        // The most common global-install failure worldwide is npm lacking
        // permission to write to the global prefix. Give actionable guidance
        // instead of dumping execa's raw error.
        logger.error(`Could not install ${agent.displayName} automatically.`)
        logger.info('This usually means npm cannot write to its global folder. Options:')
        logger.info('  • Use a Node version manager (nvm / fnm / volta) — then global installs need no sudo, or')
        if (status.hint) logger.info(`  • Install it yourself: ${status.hint.replace(/^Will install via:\s*/, '')}`)
        logger.info('Then re-run this command — your TokenMix login is already saved.')
        process.exit(1)
      }
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
  await launchOrExit(agent.launch, args, env)
}
