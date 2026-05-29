import { buildProgram } from './program.js'
import { detectLocale, setLocale } from './i18n/index.js'

// Resolve UI language once, before any command output.
setLocale(detectLocale())

const program = buildProgram()

program.parseAsync(process.argv).catch((err: unknown) => {
  const e = err as { message?: string }
  console.error(e?.message ?? err)
  process.exit(1)
})
