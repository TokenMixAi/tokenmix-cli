import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/utils/exec.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/utils/exec.js')>()
  return { ...actual, run: vi.fn(async () => {}) }
})

import { GooseAgent } from '../src/agents/goose.js'
import { run } from '../src/utils/exec.js'

describe('GooseAgent', () => {
  it('is a manual-install agent (no auto-install), with launch, no cleanup', () => {
    expect(GooseAgent.id).toBe('goose')
    expect(GooseAgent.installMode).toBe('manual')
    expect(GooseAgent.install).toBeUndefined() // the curl|bash is printed, never auto-run
    expect(typeof GooseAgent.launch).toBe('function')
    expect(GooseAgent.cleanup).toBeUndefined()
  })

  it('configure sets Goose OpenAI env with a BARE host (no /v1) and disables keyring', async () => {
    const r = await GooseAgent.configure(
      'sk-tm-abc',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    expect(r.configPath).toBeUndefined()
    expect(r.envVars).toEqual({
      GOOSE_PROVIDER: 'openai',
      GOOSE_MODEL: 'claude-sonnet-4.6',
      // bare host — Goose appends /v1/chat/completions itself; adding /v1 would double it
      OPENAI_HOST: 'https://api.tokenmix.ai',
      OPENAI_API_KEY: 'sk-tm-abc',
      GOOSE_DISABLE_KEYRING: '1',
    })
  })

  it('launch passes through to goose with our env (no flag injection)', async () => {
    vi.clearAllMocks()
    await GooseAgent.launch!(['run', '-t', 'hi'], { GOOSE_MODEL: 'm' })
    expect(run).toHaveBeenCalledWith('goose', ['run', '-t', 'hi'], { env: { GOOSE_MODEL: 'm' } })
  })
})
