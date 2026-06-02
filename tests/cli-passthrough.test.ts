import { describe, it, expect } from 'vitest'
import { buildProgram } from '../src/program.js'
import type { AgentDescriptor } from '../src/agents/types.js'

// Parse a user argv through the real program wiring, capturing how each agent
// subcommand's args were resolved - WITHOUT running the real configure/launch.
// This locks in the v0.2.2 fix: agent flags (--version, --help, anything) must be
// forwarded to the underlying binary instead of being eaten by commander.
async function forwardedArgs(argv: string[]): Promise<{ id: string; args: string[] }[]> {
  const calls: { id: string; args: string[] }[] = []
  const program = buildProgram({
    runAgent: async (agent: AgentDescriptor, args: string[]) => {
      calls.push({ id: agent.id, args })
    },
  })
  program.exitOverride()
  await program.parseAsync(argv, { from: 'user' })
  return calls
}

describe('agent subcommand argument forwarding', () => {
  it('forwards --version to the underlying agent (the v0.2.2 regression)', async () => {
    expect(await forwardedArgs(['claude', '--version'])).toEqual([
      { id: 'claude', args: ['--version'] },
    ])
  })

  it('forwards an unknown flag before any operand', async () => {
    expect(await forwardedArgs(['opencode', '--foo'])).toEqual([
      { id: 'opencode', args: ['--foo'] },
    ])
  })

  it('passes through everything after the first operand untouched', async () => {
    expect(await forwardedArgs(['opencode', 'run', '--model', 'gpt-5.5', '-x'])).toEqual([
      { id: 'opencode', args: ['run', '--model', 'gpt-5.5', '-x'] },
    ])
  })

  it('invokes the agent with empty args when none are given', async () => {
    expect(await forwardedArgs(['aider'])).toEqual([{ id: 'aider', args: [] }])
  })

  it('routes each agent id to its own subcommand', async () => {
    expect(await forwardedArgs(['kilo'])).toEqual([{ id: 'kilo', args: [] }])
  })
})
