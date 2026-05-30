import { describe, it, expect } from 'vitest'
import { RooAgent } from '../src/agents/roo.js'

describe('RooAgent', () => {
  it('is a config-only agent with no launcher or cleanup (like cline)', () => {
    expect(RooAgent.id).toBe('roo')
    expect(RooAgent.installMode).toBe('manual-vscode')
    expect(RooAgent.launch).toBeUndefined()
    expect(RooAgent.cleanup).toBeUndefined()
  })

  it('configure prints the OpenAI-Compatible settings to enter in Roo Code', async () => {
    const result = await RooAgent.configure(
      'sk-tm-abc123',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    const text = (result.notes ?? []).join('\n')
    expect(text).toContain('OpenAI Compatible')
    expect(text).toContain('https://api.tokenmix.ai/v1')
    expect(text).toContain('sk-tm-abc123')
    expect(text).toContain('claude-sonnet-4.6')
    expect(result.configPath).toBeUndefined()
    expect(result.envVars).toBeUndefined()
    expect(text).not.toContain('{') // no fabricated JSON, same as cline
  })
})
