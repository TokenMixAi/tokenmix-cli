import { describe, it, expect } from 'vitest'
import { ClineAgent } from '../src/agents/cline.js'

describe('ClineAgent', () => {
  it('is a config-only agent with no launcher or cleanup (like kilo)', () => {
    expect(ClineAgent.id).toBe('cline')
    expect(ClineAgent.installMode).toBe('manual-vscode')
    expect(ClineAgent.launch).toBeUndefined()
    expect(ClineAgent.cleanup).toBeUndefined()
  })

  it('installCheck always proceeds - the CLI cannot install a VSCode extension', async () => {
    const status = await ClineAgent.installCheck()
    expect(status.installed).toBe(true)
    expect(status.hint).toBeTruthy()
  })

  it('configure prints the OpenAI-Compatible settings to enter in Cline', async () => {
    const result = await ClineAgent.configure(
      'sk-tm-abc123',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    const text = (result.notes ?? []).join('\n')
    expect(text).toContain('OpenAI Compatible')
    expect(text).toContain('https://api.tokenmix.ai/v1') // base URL carries /v1
    expect(text).toContain('sk-tm-abc123')
    expect(text).toContain('claude-sonnet-4.6')
  })

  it('writes no file, sets no env, and fabricates no JSON snippet', async () => {
    // Cline exposes no documented settings.json import, so - unlike kilo - we must
    // NOT print a JSON blob a user might paste somewhere it is never read.
    const result = await ClineAgent.configure(
      'sk-tm-abc123',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    const text = (result.notes ?? []).join('\n')
    expect(result.configPath).toBeUndefined()
    expect(result.envVars).toBeUndefined()
    expect(text).not.toContain('{')
  })
})
