import { describe, it, expect } from 'vitest'
import { ContinueAgent } from '../src/agents/continue.js'

describe('ContinueAgent', () => {
  it('is a config-only agent with no launcher or cleanup', () => {
    expect(ContinueAgent.id).toBe('continue')
    expect(ContinueAgent.installMode).toBe('manual-vscode')
    expect(ContinueAgent.launch).toBeUndefined()
    expect(ContinueAgent.cleanup).toBeUndefined()
  })

  it('prints a ready-to-paste config.yaml with the OpenAI-compatible model', async () => {
    const result = await ContinueAgent.configure(
      'sk-tm-abc123',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    const text = (result.notes ?? []).join('\n')
    // required top-level keys + the verified openai-compatible model block
    expect(text).toContain('name: TokenMix')
    expect(text).toContain('version: 1.0.0')
    expect(text).toContain('schema: v1')
    expect(text).toContain('provider: openai')
    expect(text).toContain("model: 'claude-sonnet-4.6'")
    expect(text).toContain("apiBase: 'https://api.tokenmix.ai/v1'")
    expect(text).toContain("apiKey: 'sk-tm-abc123'")
    expect(result.configPath).toBeUndefined() // we print, never write the file
  })

  it('quotes a model containing YAML-special chars so the pasted snippet stays valid', async () => {
    const result = await ContinueAgent.configure('sk-tm-abc', 'https://api.tokenmix.ai', 'gpt:4#x')
    const text = (result.notes ?? []).join('\n')
    expect(text).toContain("model: 'gpt:4#x'") // ':' and '#' kept inside a quoted scalar
  })

  it('keeps YAML top-level keys at column 0 after agent-runner prefixes notes', async () => {
    // agent-runner prints each non-empty note as `  ${note}` (2-space indent).
    // Replicate that exactly and assert the YAML still parses as top-level - i.e.
    // the leading-'\n' trick keeps name/version/schema/models at column 0.
    const result = await ContinueAgent.configure(
      'sk-tm-abc123',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    const rendered = (result.notes ?? []).map((n) => (n === '' ? '' : `  ${n}`)).join('\n')
    expect(rendered).toMatch(/^name: TokenMix$/m)
    expect(rendered).toMatch(/^version: 1\.0\.0$/m)
    expect(rendered).toMatch(/^schema: v1$/m)
    expect(rendered).toMatch(/^models:$/m)
    expect(rendered).toMatch(/^ {2}- name: TokenMix$/m) // list item under models:
    expect(rendered).toMatch(/^ {4}provider: openai$/m) // 4-space model fields
  })
})
