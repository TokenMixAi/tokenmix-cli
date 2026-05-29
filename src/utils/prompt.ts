import prompts from 'prompts'
import { t } from '../i18n/index.js'

export async function promptApiKey(): Promise<string | null> {
  const r = await prompts({
    type: 'password',
    name: 'apiKey',
    message: t('prompt.pasteKey'),
    validate: (v: string) =>
      v && v.startsWith('sk-tm-') ? true : t('login.keyMustStart'),
  })
  const key = (r.apiKey as string | undefined)?.trim()
  return key || null
}

export async function confirm(message: string, initial: boolean = true): Promise<boolean> {
  // Non-interactive (CI, piped, no TTY): we cannot ask. Return the default instead
  // of rendering an unanswerable prompt that then silently no-ops — otherwise a
  // script running e.g. `tokenmix opencode` sees the question flash by, nothing
  // installs, and the process still exits 0.
  if (!process.stdin.isTTY) return initial
  const r = await prompts({
    type: 'confirm',
    name: 'ok',
    message,
    initial,
  })
  return Boolean(r.ok)
}

export interface SelectChoice<T extends string> {
  title: string
  value: T
  description?: string
}

export async function select<T extends string>(
  message: string,
  choices: SelectChoice<T>[],
): Promise<T | null> {
  const r = await prompts({
    type: 'select',
    name: 'value',
    message,
    choices,
  })
  return (r.value as T) ?? null
}
