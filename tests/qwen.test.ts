import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock only `run` so we can assert how launch() shells out, without spawning qwen.
vi.mock('../src/utils/exec.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/utils/exec.js')>()
  return { ...actual, run: vi.fn(async () => {}) }
})

import { QwenAgent } from '../src/agents/qwen.js'
import { run } from '../src/utils/exec.js'

describe('QwenAgent descriptor', () => {
  it('is an auto-npm CLI agent requiring Node 22, with install + launch, no cleanup', () => {
    expect(QwenAgent.id).toBe('qwen')
    expect(QwenAgent.installMode).toBe('auto-npm')
    expect(QwenAgent.minNode).toBe(22)
    expect(typeof QwenAgent.install).toBe('function')
    expect(typeof QwenAgent.launch).toBe('function')
    expect(QwenAgent.cleanup).toBeUndefined()
  })

  it('configure passes OpenAI-compatible env and writes no file', async () => {
    const r = await QwenAgent.configure('sk-tm-abc', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    expect(r.configPath).toBeUndefined()
    expect(r.envVars).toEqual({
      OPENAI_API_KEY: 'sk-tm-abc',
      OPENAI_BASE_URL: 'https://api.tokenmix.ai/v1',
      OPENAI_MODEL: 'claude-sonnet-4.6',
    })
  })
})

describe('QwenAgent.launch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forwards an info-only invocation (empty env) without forcing auth mode', async () => {
    await QwenAgent.launch!(['--version'], {})
    expect(run).toHaveBeenCalledWith('qwen', ['--version'], { env: {} })
  })

  it('forces --auth-type openai before user args on a real invocation', async () => {
    const env = {
      OPENAI_BASE_URL: 'https://api.tokenmix.ai/v1',
      OPENAI_API_KEY: 'k',
      OPENAI_MODEL: 'm',
    }
    await QwenAgent.launch!(['chat'], env)
    expect(run).toHaveBeenCalledWith('qwen', ['--auth-type', 'openai', 'chat'], { env })
  })
})
