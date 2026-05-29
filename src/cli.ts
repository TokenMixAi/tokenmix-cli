import { buildProgram } from './program.js'

const program = buildProgram()

program.parseAsync(process.argv).catch((err: unknown) => {
  const e = err as { message?: string }
  console.error(e?.message ?? err)
  process.exit(1)
})
