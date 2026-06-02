import prompts from 'prompts'
import { t } from '../i18n/index.js'

export async function promptApiKey(): Promise<string | null> {
  const r = await prompts({
    type: 'password',
    name: 'apiKey',
    message: t('prompt.pasteKey'),
    validate: (v: string) => (v && v.trim().startsWith('sk-tm-') ? true : t('login.keyMustStart')),
  })
  const key = (r.apiKey as string | undefined)?.trim()
  return key || null
}

export async function confirm(message: string, initial: boolean = true): Promise<boolean> {
  // No TTY (CI, piped): can't ask, so return the default. Rendering the prompt here
  // would flash by and silently no-op - `tokenmix opencode` would exit 0 having
  // installed nothing.
  if (!process.stdin.isTTY) return initial
  const r = await prompts({
    type: 'confirm',
    name: 'ok',
    message,
    initial,
  })
  return Boolean(r.ok)
}
