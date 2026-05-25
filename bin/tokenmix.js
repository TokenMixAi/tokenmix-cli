#!/usr/bin/env node
// Production entry: load compiled CLI from dist.
// For dev, run `pnpm dev <command>` which uses tsx on src/cli.ts directly.
import('../dist/cli.js').catch((err) => {
  // Common case: user ran `pnpm start` before `pnpm build`.
  if (err && (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND')) {
    console.error('tokenmix: build artifacts not found. Run `pnpm build` first, or use `pnpm dev`.')
    process.exit(1)
  }
  console.error(err)
  process.exit(1)
})
