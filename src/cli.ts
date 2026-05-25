import { Command } from 'commander'
import { loginCommand } from './commands/login.js'
import { logoutCommand } from './commands/logout.js'
import { balanceCommand } from './commands/balance.js'
import { topupCommand } from './commands/topup.js'
import { modelsCommand } from './commands/models.js'
import { listCommand } from './commands/list.js'
import { doctorCommand } from './commands/doctor.js'
import { registerAgentCommands } from './commands/agent-runner.js'

const program = new Command()

program
  .name('tokenmix')
  .description('Zero-config CLI to use any open-source coding agent with TokenMix as the unified LLM backend.')
  .version('0.1.0')

program
  .command('login')
  .description('Log in to TokenMix (default: browser device authorization)')
  .option('-k, --key <apiKey>', 'Paste an API key directly (skip browser flow, useful in CI)')
  .option('-p, --paste', 'Force interactive paste prompt instead of browser flow')
  .option('-u, --url <baseUrl>', 'Override API base URL (default: https://api.tokenmix.ai)')
  .action(loginCommand)

program
  .command('logout')
  .description('Remove stored credentials from this machine')
  .action(logoutCommand)

program
  .command('balance')
  .description('Open the dashboard to view your balance')
  .action(balanceCommand)

program
  .command('topup')
  .description('Open the browser to top up your account')
  .action(topupCommand)

program
  .command('models')
  .description('List available models with prices')
  .option('-t, --type <type>', 'Filter by type: chat | embedding | image | audio | video')
  .action(modelsCommand)

program
  .command('list')
  .description('List supported coding agents')
  .action(listCommand)

program
  .command('doctor')
  .description('Diagnose CLI configuration and agent installation')
  .action(doctorCommand)

// Register one subcommand per supported agent (opencode, claude, aider, kilo, ...).
registerAgentCommands(program)

program.parseAsync(process.argv).catch((err: unknown) => {
  const e = err as { message?: string }
  console.error(e?.message ?? err)
  process.exit(1)
})
