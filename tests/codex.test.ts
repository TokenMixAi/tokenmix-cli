import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock only `run` so we can assert how launch() shells out, without spawning codex.
// commandExists / captureRun keep their real implementations.
vi.mock('../src/utils/exec.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/utils/exec.js')>()
  return { ...actual, run: vi.fn(async () => {}) }
})

import { CodexAgent, providerOverrides } from '../src/agents/codex.js'
import { run } from '../src/utils/exec.js'

describe('CodexAgent descriptor', () => {
  it('is an auto-npm CLI agent with install + launch and no cleanup', () => {
    expect(CodexAgent.id).toBe('codex')
    expect(CodexAgent.installMode).toBe('auto-npm')
    expect(typeof CodexAgent.install).toBe('function')
    expect(typeof CodexAgent.launch).toBe('function')
    // launch-time --config injection only — nothing persisted, nothing to revert.
    expect(CodexAgent.cleanup).toBeUndefined()
  })

  it('configure passes credentials via env and writes no config file', async () => {
    const result = await CodexAgent.configure(
      'sk-tm-abc123',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    expect(result.configPath).toBeUndefined()
    expect(result.envVars?.TOKENMIX_API_KEY).toBe('sk-tm-abc123')
    expect(result.envVars?.TOKENMIX_BASE_URL).toBe('https://api.tokenmix.ai/v1')
  })
})

describe('providerOverrides', () => {
  it('registers a custom tokenmix provider via --config with wire_api=chat', () => {
    const ov = providerOverrides('https://api.tokenmix.ai/v1', 'claude-sonnet-4.6')
    const joined = ov.join(' ')
    expect(ov.filter((a) => a === '--config')).toHaveLength(6)
    expect(joined).toContain('model_provider="tokenmix"')
    expect(joined).toContain('model="claude-sonnet-4.6"')
    expect(joined).toContain('model_providers.tokenmix.base_url="https://api.tokenmix.ai/v1"')
    expect(joined).toContain('model_providers.tokenmix.env_key="TOKENMIX_API_KEY"')
    // critical: Codex 0.135+ requires "responses"; tokenmix implements /v1/responses for Codex
    expect(joined).toContain('model_providers.tokenmix.wire_api="responses"')
    // must not hijack a reserved built-in provider id
    expect(joined).not.toContain('model_provider="openai"')
  })
})

describe('launch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forwards an info-only invocation (empty env) WITHOUT injecting provider config', async () => {
    await CodexAgent.launch!(['--version'], {})
    expect(run).toHaveBeenCalledWith('codex', ['--version'], { env: {} })
  })

  it('injects provider overrides before user args on a real invocation', async () => {
    await CodexAgent.launch!(['exec', 'hi'], {
      TOKENMIX_BASE_URL: 'https://api.tokenmix.ai/v1',
      TOKENMIX_DEFAULT_MODEL: 'claude-opus-4.7',
    })
    const call = (run as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)!
    expect(call[0]).toBe('codex')
    const argv = call[1] as string[]
    expect(argv.join(' ')).toContain('base_url="https://api.tokenmix.ai/v1"')
    expect(argv.join(' ')).toContain('model="claude-opus-4.7"') // honors chosen model
    expect(argv.slice(-2)).toEqual(['exec', 'hi']) // user args come last so they win
  })
})
