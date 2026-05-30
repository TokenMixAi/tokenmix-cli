import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../src/config/store.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/config/store.js')>()
  return { ...actual, readConfig: vi.fn() }
})

import { welcomeCommand } from '../src/commands/welcome.js'
import { readConfig } from '../src/config/store.js'

const rendered = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.map((c) => c.join(' ')).join('\n')

describe('welcomeCommand', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the 3-step get-started guide when NOT logged in', async () => {
    vi.mocked(readConfig).mockResolvedValue({})
    const out = vi.spyOn(console, 'log').mockImplementation(() => {})
    await welcomeCommand()
    const text = rendered(out)
    expect(text).toContain('tokenmix login')
    expect(text).toContain('tokenmix list')
    expect(text).toContain('tokenmix opencode')
    // the differentiation hook (faithful routing + transparent billing) is always shown
    expect(text).toContain('billed at real usage')
  })

  it('shows the launch hint (not the login step) when logged in', async () => {
    vi.mocked(readConfig).mockResolvedValue({ apiKey: 'sk-tm-x' })
    const out = vi.spyOn(console, 'log').mockImplementation(() => {})
    await welcomeCommand()
    const text = rendered(out)
    expect(text).toContain('tokenmix opencode')
    expect(text).not.toContain('1. tokenmix login')
  })
})
