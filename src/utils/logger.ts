import chalk from 'chalk'

// Minimal CLI logger. Symbols are ASCII-friendly Unicode, not emoji.
//
// Stream split, keep it this way:
//   - step()  -> stderr: progress narration ("Configuring...", "Launching...").
//     Off stdout so `tokenmix kilo > config.txt` or piping an agent stays clean.
//   - error() -> stderr: failures.
//   - success()/info()/warn()/dim() -> stdout: actual command output. `balance`
//     prints figures via success(), `doctor` prints its report via success()/warn().
//     Putting those on stderr would split a command's report across two streams.
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
