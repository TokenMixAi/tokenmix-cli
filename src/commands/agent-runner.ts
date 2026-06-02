import { Command } from 'commander'
import { logger } from '../utils/logger.js'
import { readConfig, apiBaseUrl, DEFAULT_MODEL } from '../config/store.js'
import { confirm } from '../utils/prompt.js'
import { AGENTS } from '../agents/registry.js'
import { AgentDescriptor } from '../agents/types.js'
import { t } from '../i18n/index.js'

// Major version of the running Node (e.g. 22 from "v22.9.0"). Gates agents whose
// binary needs a newer Node than this process (Codex / Qwen Code require 22).
export function nodeMajor(): number {
  return parseInt(process.versions.node.split('.')[0] ?? '', 10)
}

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
      .description(t('cmd.agent', { name: agent.displayName }))
      .allowUnknownOption(true)
      .passThroughOptions(true) // forward --version / --help / --any to the underlying agent
      .helpOption(false) // so `tokenmix <agent> --help` reaches the agent, not commander's wrapper help
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
      logger.warn(status.hint || t('agent.notInstalled', { name: agent.displayName }))
      process.exit(1)
    }
    await launchOrExit(agent.launch, args, {})
    return
  }

  const cfg = await readConfig()
  if (!cfg.apiKey) {
    logger.error(t('common.notLoggedIn'))
    process.exit(1)
  }
  const baseUrl = apiBaseUrl(cfg)
  // TOKENMIX_DEFAULT_MODEL env overrides the model — handy for CI/scripts that want a
  // cheap model, or as a power-user default. Falls back to stored config, then built-in.
  const defaultModel = process.env.TOKENMIX_DEFAULT_MODEL || cfg.defaultModel || DEFAULT_MODEL

  // Refuse early with a friendly message if the agent's binary needs a newer Node
  // than we're running on (Codex/Qwen need 22) — avoids a cryptic npm/install error.
  if (agent.minNode && nodeMajor() < agent.minNode) {
    logger.error(
      t('agent.needsNode', {
        name: agent.displayName,
        min: agent.minNode,
        cur: process.versions.node,
      }),
    )
    process.exit(1)
  }

  // 1. Check install status.
  const status = await agent.installCheck()
  if (!status.installed) {
    if (agent.install) {
      const shouldInstall = await confirm(
        t('agent.installPrompt', { name: agent.displayName }),
        true,
      )
      if (!shouldInstall) {
        if (status.hint) logger.warn(status.hint)
        process.exit(1)
      }
      logger.step(t('agent.installing', { name: agent.displayName }))
      try {
        await agent.install()
      } catch {
        // The most common global-install failure worldwide is npm lacking
        // permission to write to the global prefix. Give actionable guidance
        // instead of dumping execa's raw error.
        logger.error(t('agent.installFailed', { name: agent.displayName }))
        logger.info(t('agent.installFailHint1'))
        logger.info(t('agent.installFailHint2'))
        if (status.installCmd) {
          logger.info(t('agent.installFailHint3', { cmd: status.installCmd }))
        }
        logger.info(t('agent.installFailHint4'))
        // Slow / restricted networks (e.g. mainland China) are a common install
        // failure too — the registry is reachable but slow/blocked. Point at a mirror.
        logger.info(t('agent.installFailHintMirror'))
        process.exit(1)
      }
      logger.success(t('agent.installed', { name: agent.displayName }))
    } else {
      logger.warn(status.hint || t('agent.notInstallable', { name: agent.displayName }))
      process.exit(1)
    }
  }

  // 2. Configure with tokenmix credentials.
  logger.step(t('agent.configuring', { name: agent.displayName }))
  const result = await agent.configure(cfg.apiKey, baseUrl, defaultModel)
  if (result.configPath) {
    logger.success(t('agent.wrote', { path: result.configPath }))
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
    logger.info(t('agent.configReady', { name: agent.displayName }))
    return
  }

  logger.step(t('agent.launching', { name: agent.displayName }))
  const env: Record<string, string> = {
    ...(result.envVars ?? {}),
    TOKENMIX_DEFAULT_MODEL: defaultModel,
  }
  await launchOrExit(agent.launch, args, env)
}
