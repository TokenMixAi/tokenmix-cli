import { describe, it, expect, vi, beforeEach } from 'vitest'

// Keep these tests independent of whether this machine is logged in.
vi.mock('../src/config/store.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/config/store.js')>()
  return { ...actual, readConfig: vi.fn(async () => ({ apiKey: 'sk-tm-test' })) }
})

import { isInfoOnlyInvocation, runAgent, nodeMajor } from '../src/commands/agent-runner.js'
import type { AgentDescriptor } from '../src/agents/types.js'

describe('isInfoOnlyInvocation', () => {
  it('treats a lone --version/--help/-V/-h as info-only', () => {
    expect(isInfoOnlyInvocation(['--version'])).toBe(true)
    expect(isInfoOnlyInvocation(['--help'])).toBe(true)
    expect(isInfoOnlyInvocation(['-V'])).toBe(true)
    expect(isInfoOnlyInvocation(['-h'])).toBe(true)
  })

  it('is false for empty args or anything that does real work', () => {
    expect(isInfoOnlyInvocation([])).toBe(false)
    expect(isInfoOnlyInvocation(['run'])).toBe(false)
    expect(isInfoOnlyInvocation(['chat'])).toBe(false)
    expect(isInfoOnlyInvocation(['--version', 'extra'])).toBe(false)
  })
})

type SpiedAgent = AgentDescriptor & {
  installCheck: ReturnType<typeof vi.fn>
  configure: ReturnType<typeof vi.fn>
  launch: ReturnType<typeof vi.fn>
}

function fakeAgent(): SpiedAgent {
  return {
    id: 'fake',
    displayName: 'Fake',
    description: '',
    installMode: 'auto-npm',
    installCheck: vi.fn(async () => ({ installed: true })),
    configure: vi.fn(async () => ({})),
    launch: vi.fn(async () => {}),
  } as SpiedAgent
}

describe('runAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forwards an info-only flag to launch WITHOUT configuring', async () => {
    const agent = fakeAgent()
    await runAgent(agent, ['--version'])
    expect(agent.installCheck).toHaveBeenCalledOnce()
    expect(agent.configure).not.toHaveBeenCalled()
    expect(agent.launch).toHaveBeenCalledWith(['--version'], {})
  })

  it('configures before launching for a normal invocation', async () => {
    const agent = fakeAgent()
    await runAgent(agent, ['chat'])
    expect(agent.configure).toHaveBeenCalledOnce()
    expect(agent.launch).toHaveBeenCalledWith(
      ['chat'],
      expect.objectContaining({ TOKENMIX_DEFAULT_MODEL: 'claude-sonnet-4.6' }),
    )
  })

  it('refuses (exit 1) BEFORE configuring when the agent needs a newer Node', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit')
    }) as never)
    const agent = fakeAgent()
    agent.minNode = 999 // impossibly high → the Node guard must trip
    await expect(runAgent(agent, ['chat'])).rejects.toThrow('process.exit')
    expect(agent.configure).not.toHaveBeenCalled()
    exitSpy.mockRestore()
  })
})

describe('nodeMajor', () => {
  it('parses the running Node major version', () => {
    expect(nodeMajor()).toBe(parseInt(process.versions.node.split('.')[0], 10))
    expect(nodeMajor()).toBeGreaterThanOrEqual(18)
  })
})
