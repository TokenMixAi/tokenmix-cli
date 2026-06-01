import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/utils/exec.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/utils/exec.js')>()
  return { ...actual, run: vi.fn(async () => {}) }
})

import { OpenHandsAgent } from '../src/agents/openhands.js'
import { run } from '../src/utils/exec.js'

describe('OpenHandsAgent', () => {
  it('is a manual-install agent with launch, no cleanup', () => {
    expect(OpenHandsAgent.id).toBe('openhands')
    expect(OpenHandsAgent.installMode).toBe('manual')
    expect(OpenHandsAgent.install).toBeUndefined()
    expect(typeof OpenHandsAgent.launch).toBe('function')
    expect(OpenHandsAgent.cleanup).toBeUndefined()
  })

  it('configure sets LiteLLM env with the openai/ model prefix and /v1 base', async () => {
    const r = await OpenHandsAgent.configure(
      'sk-tm-abc',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    expect(r.configPath).toBeUndefined()
    expect(r.envVars).toEqual({
      LLM_API_KEY: 'sk-tm-abc',
      LLM_MODEL: 'openai/claude-sonnet-4.6', // LiteLLM provider prefix — bare name won't route
      LLM_BASE_URL: 'https://api.tokenmix.ai/v1',
      OPENHANDS_SUPPRESS_BANNER: '1',
    })
  })

  it('launch injects --override-with-envs (OpenHands ignores LLM_* without it)', async () => {
    vi.clearAllMocks()
    const env = { LLM_BASE_URL: 'https://api.tokenmix.ai/v1', LLM_MODEL: 'openai/m' }
    await OpenHandsAgent.launch!(['--headless', '-t', 'hi'], env)
    expect(run).toHaveBeenCalledWith(
      'openhands',
      ['--override-with-envs', '--headless', '-t', 'hi'],
      { env },
    )
  })

  it('forwards info-only (empty env) without injecting flags', async () => {
    vi.clearAllMocks()
    await OpenHandsAgent.launch!(['--version'], {})
    expect(run).toHaveBeenCalledWith('openhands', ['--version'], { env: {} })
  })
})
