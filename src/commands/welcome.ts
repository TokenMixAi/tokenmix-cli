import chalk from 'chalk'
import { readConfig } from '../config/store.js'
import { t } from '../i18n/index.js'

// Shown for a bare `tokenmix` (no command) — friendly, localized onboarding for
// first-timers instead of commander's raw help. `tokenmix --help` still prints the
// full command reference. Adapts to whether the user is logged in yet.
export async function welcomeCommand(): Promise<void> {
  const cfg = await readConfig()
  const loggedIn = Boolean(cfg.apiKey)

  const row = (cmd: string, desc: string): string =>
    '    ' + chalk.cyan(cmd.padEnd(21)) + chalk.dim(desc)

  console.log()
  console.log('  ' + chalk.bold.cyan('TokenMix') + chalk.dim(' — ' + t('welcome.tagline')))
  console.log()

  if (loggedIn) {
    console.log('  ' + chalk.green('✓') + ' ' + t('welcome.loggedIn'))
    console.log(row('tokenmix opencode', t('welcome.s3')))
    console.log(row('tokenmix list', t('welcome.s2')))
  } else {
    console.log('  ' + chalk.bold(t('welcome.start')))
    console.log(row('1. tokenmix login', t('welcome.s1')))
    console.log(row('2. tokenmix list', t('welcome.s2')))
    console.log(row('3. tokenmix opencode', t('welcome.s3')))
  }

  console.log()
  console.log('  ' + chalk.dim(t('welcome.more')))
  console.log()
}
