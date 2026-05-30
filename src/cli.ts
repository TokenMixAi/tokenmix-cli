import { buildProgram } from './program.js'
import { detectLocale, setLocale } from './i18n/index.js'

// Resolve UI language once, before any command output.
setLocale(detectLocale())

const program = buildProgram()

program.parseAsync(process.argv).catch((err: unknown) => {
  // Avoid printing "[object Object]" for non-Error throws.
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : ((err as { message?: string })?.message ?? String(err))
  console.error(msg)
  process.exit(1)
})
