import { createRequire } from 'node:module'
import { Command } from 'commander'
import { loginCommand } from './commands/login.js'
import { logoutCommand } from './commands/logout.js'
import { balanceCommand } from './commands/balance.js'
import { topupCommand } from './commands/topup.js'
import { modelsCommand } from './commands/models.js'
import { listCommand } from './commands/list.js'
import { doctorCommand } from './commands/doctor.js'
import { welcomeCommand } from './commands/welcome.js'
import { registerAgentCommands, AgentRunner } from './commands/agent-runner.js'
import { t } from './i18n/index.js'

// Read version from package.json so we never have to bump it in two places.
const pkg = createRequire(import.meta.url)('../package.json') as { version: string }

export interface ProgramDeps {
  // Override the agent runner (used by tests to assert arg forwarding without side effects).
  runAgent?: AgentRunner
}

// Build the fully-wired commander program WITHOUT parsing argv.
// Keeping construction separate from execution makes the CLI unit-testable.
export function buildProgram(deps: ProgramDeps = {}): Command {
  const program = new Command()

  // Required so that agent subcommands can use passThroughOptions() to forward
  // --version / --help / --any to the underlying agent binary instead of having
  // tokenmix consume them.
  program.enablePositionalOptions()

  program
    .name('tokenmix')
    .description(t('cmd.program'))
    .version(pkg.version)
    // Bare `tokenmix` (no command) shows a friendly onboarding screen, not raw help.
    .action(welcomeCommand)

  program
    .command('login')
    .description(t('cmd.login'))
    .option('-k, --key <apiKey>', t('cmd.loginKey'))
    .option('-p, --paste', t('cmd.loginPaste'))
    .option('-u, --url <baseUrl>', t('cmd.loginUrl'))
    .action(loginCommand)

  program
    .command('logout')
    .description(t('cmd.logout'))
    .action(logoutCommand)

  program
    .command('balance')
    .description(t('cmd.balance'))
    .action(balanceCommand)

  program
    .command('topup')
    .description(t('cmd.topup'))
    .action(topupCommand)

  program
    .command('models')
    .description(t('cmd.models'))
    .option('-t, --type <type>', t('cmd.modelsType'))
    .option('-s, --search <keyword>', t('cmd.modelsSearch'))
    .action(modelsCommand)

  program
    .command('list')
    .description(t('cmd.list'))
    .action(listCommand)

  program
    .command('doctor')
    .description(t('cmd.doctor'))
    .action(doctorCommand)

  // Register one subcommand per supported agent (opencode, claude, aider, kilo, ...).
  registerAgentCommands(program, deps.runAgent)

  return program
}
