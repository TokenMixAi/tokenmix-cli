import chalk from 'chalk'

// Minimal CLI logger. Symbols are ASCII-friendly Unicode, not emoji.
//
// Output-stream contract (deliberate — keep it this way):
//   • step()  → STDERR: progress narration ("Configuring…", "Launching…").
//     Off stdout so `tokenmix kilo > config.txt`, piping an agent, or scripting
//     `tokenmix balance` isn't polluted with our progress chatter.
//   • error() → STDERR: failures.
//   • success()/info()/warn()/dim() → STDOUT: these carry user-facing OUTPUT,
//     not just chatter — `balance` prints figures via success(), `doctor` prints
//     its report (incl. "not logged in"/"not installed") via success()/warn().
//     Moving those to stderr would split a command's report across two streams.
export const logger = {
  info(msg: string): void {
    console.log(msg)
  },
  success(msg: string): void {
    console.log(chalk.green('✓'), msg)
  },
  warn(msg: string): void {
    console.log(chalk.yellow('!'), msg)
  },
  error(msg: string): void {
    console.error(chalk.red('✗'), msg)
  },
  step(msg: string): void {
    console.error(chalk.cyan('→'), msg)
  },
  dim(msg: string): void {
    console.log(chalk.dim(msg))
  },
}
