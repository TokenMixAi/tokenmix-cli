import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { ClaudeCodeAgent } from '../src/agents/claude.js'
import { OpenCodeAgent } from '../src/agents/opencode.js'

// Isolate config writes to a temp home so configure()/cleanup() never touch the
// real machine. os.homedir() reads $HOME on POSIX and %USERPROFILE% on Windows;
// OpenCode reads XDG_CONFIG_HOME. We override all three for cross-platform safety.
let tmp: string
const saved: Record<string, string | undefined> = {}

function setEnv(key: string, value: string): void {
  if (!(key in saved)) saved[key] = process.env[key]
  process.env[key] = value
}

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tokenmix-cleanup-'))
  setEnv('HOME', tmp)
  setEnv('USERPROFILE', tmp)
  setEnv('XDG_CONFIG_HOME', path.join(tmp, '.config'))
})

afterEach(async () => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  for (const k of Object.keys(saved)) delete saved[k]
  await fs.remove(tmp)
})

describe('ClaudeCodeAgent.cleanup', () => {
  const settingsPath = () => path.join(tmp, '.claude', 'settings.json')

  it('reverts the injected ANTHROPIC_* env but preserves other settings', async () => {
    await fs.ensureDir(path.dirname(settingsPath()))
    await fs.writeJson(settingsPath(), { theme: 'dark', env: { FOO: 'bar' } })

    await ClaudeCodeAgent.configure('sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    let s = await fs.readJson(settingsPath())
    expect(s.env.ANTHROPIC_API_KEY).toBe('sk-tm-secret')
    expect(s.env.FOO).toBe('bar')

    const res = await ClaudeCodeAgent.cleanup!()
    expect(res.reverted).toBe(true)

    s = await fs.readJson(settingsPath())
    expect(s.env.ANTHROPIC_API_KEY).toBeUndefined()
    expect(s.env.ANTHROPIC_BASE_URL).toBeUndefined()
    expect(s.env.FOO).toBe('bar') // user env survives
    expect(s.theme).toBe('dark') // other settings survive
  })

  it('drops the env block entirely when it only held our keys', async () => {
    await ClaudeCodeAgent.configure('sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    await ClaudeCodeAgent.cleanup!()
    const s = await fs.readJson(settingsPath())
    expect(s.env).toBeUndefined()
  })

  it('is a no-op (does not clobber) a user-owned non-tokenmix key', async () => {
    await fs.ensureDir(path.dirname(settingsPath()))
    await fs.writeJson(settingsPath(), {
      env: { ANTHROPIC_API_KEY: 'sk-ant-user', ANTHROPIC_BASE_URL: 'https://api.anthropic.com' },
    })
    const res = await ClaudeCodeAgent.cleanup!()
    expect(res.reverted).toBe(false)
    const s = await fs.readJson(settingsPath())
    expect(s.env.ANTHROPIC_API_KEY).toBe('sk-ant-user')
  })

  it('returns reverted:false when no settings file exists', async () => {
    expect((await ClaudeCodeAgent.cleanup!()).reverted).toBe(false)
  })

  it('restores the user original Anthropic key/base after an overwrite', async () => {
    await fs.ensureDir(path.dirname(settingsPath()))
    await fs.writeJson(settingsPath(), {
      theme: 'dark',
      env: { ANTHROPIC_API_KEY: 'sk-ant-user', ANTHROPIC_BASE_URL: 'https://api.anthropic.com' },
    })
    await ClaudeCodeAgent.configure('sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    let s = await fs.readJson(settingsPath())
    expect(s.env.ANTHROPIC_API_KEY).toBe('sk-tm-secret') // ours injected

    const res = await ClaudeCodeAgent.cleanup!()
    expect(res.reverted).toBe(true)

    s = await fs.readJson(settingsPath())
    expect(s.env.ANTHROPIC_API_KEY).toBe('sk-ant-user') // RESTORED, not lost
    expect(s.env.ANTHROPIC_BASE_URL).toBe('https://api.anthropic.com') // RESTORED
    expect(s.theme).toBe('dark') // other settings survive
    expect(s.tokenmix).toBeUndefined() // backup bookkeeping cleaned up
  })

  it('on restore, removes a base URL we added when the user had none', async () => {
    await fs.ensureDir(path.dirname(settingsPath()))
    await fs.writeJson(settingsPath(), { env: { ANTHROPIC_API_KEY: 'sk-ant-user' } })
    await ClaudeCodeAgent.configure('sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    await ClaudeCodeAgent.cleanup!()
    const s = await fs.readJson(settingsPath())
    expect(s.env.ANTHROPIC_API_KEY).toBe('sk-ant-user') // restored
    expect(s.env.ANTHROPIC_BASE_URL).toBeUndefined() // we added it; removed on restore
    expect(s.tokenmix).toBeUndefined()
  })

  it('captures no backup when re-run over its own config, then removes cleanly', async () => {
    await ClaudeCodeAgent.configure('sk-tm-one', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    await ClaudeCodeAgent.configure('sk-tm-two', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    let s = await fs.readJson(settingsPath())
    expect(s.tokenmix).toBeUndefined() // never backs up our own key
    expect((await ClaudeCodeAgent.cleanup!()).reverted).toBe(true)
    s = await fs.readJson(settingsPath())
    expect(s.env).toBeUndefined() // clean removal, nothing to restore
  })
})

describe('ClaudeCodeAgent.configure overwrite warning', () => {
  const settingsPath = () => path.join(tmp, '.claude', 'settings.json')
  const TM = ['sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6'] as const

  it('warns when replacing a user-owned (non-tokenmix) Anthropic config', async () => {
    await fs.ensureDir(path.dirname(settingsPath()))
    await fs.writeJson(settingsPath(), {
      env: { ANTHROPIC_API_KEY: 'sk-ant-user', ANTHROPIC_BASE_URL: 'https://api.anthropic.com' },
    })
    const res = await ClaudeCodeAgent.configure(...TM)
    expect(res.notes?.some((n) => n.includes('Replaced your existing Anthropic settings'))).toBe(
      true,
    )
  })

  it('does not warn on a clean machine', async () => {
    const res = await ClaudeCodeAgent.configure(...TM)
    expect(res.notes?.some((n) => n.includes('Replaced'))).toBe(false)
  })

  it('does not warn when re-running over its own tokenmix config', async () => {
    await ClaudeCodeAgent.configure(...TM)
    const res = await ClaudeCodeAgent.configure(
      'sk-tm-secret2',
      'https://api.tokenmix.ai',
      'claude-sonnet-4.6',
    )
    expect(res.notes?.some((n) => n.includes('Replaced'))).toBe(false)
  })

  it('warns about subscription bypass when ~/.claude/.credentials.json exists and no env key', async () => {
    await fs.ensureDir(path.join(tmp, '.claude'))
    await fs.writeJson(path.join(tmp, '.claude', '.credentials.json'), {
      claudeAiOauth: { accessToken: 'x' },
    })
    const res = await ClaudeCodeAgent.configure(...TM)
    expect(res.notes?.some((n) => n.includes('subscription'))).toBe(true)
  })

  it('shows the replace warning (not the OAuth one) when an env key is also present', async () => {
    await fs.ensureDir(path.join(tmp, '.claude'))
    await fs.writeJson(path.join(tmp, '.claude', '.credentials.json'), {
      claudeAiOauth: { accessToken: 'x' },
    })
    await fs.writeJson(settingsPath(), { env: { ANTHROPIC_API_KEY: 'sk-ant-user' } })
    const res = await ClaudeCodeAgent.configure(...TM)
    expect(res.notes?.some((n) => n.includes('Replaced'))).toBe(true)
    expect(res.notes?.some((n) => n.includes('subscription'))).toBe(false)
  })
})

describe('OpenCodeAgent.cleanup', () => {
  const cfgPath = () => path.join(tmp, '.config', 'opencode', 'opencode.json')

  it('removes the tokenmix provider and our default model pin', async () => {
    await OpenCodeAgent.configure('sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    let c = await fs.readJson(cfgPath())
    expect(c.provider.tokenmix).toBeTruthy()
    expect(c.model).toBe('tokenmix/claude-sonnet-4.6')

    const res = await OpenCodeAgent.cleanup!()
    expect(res.reverted).toBe(true)

    c = await fs.readJson(cfgPath())
    expect(c.provider).toBeUndefined() // only provider was tokenmix → dropped
    expect(c.model).toBeUndefined()
  })

  it('keeps a user-chosen model and other providers', async () => {
    await fs.ensureDir(path.dirname(cfgPath()))
    await fs.writeJson(cfgPath(), {
      model: 'anthropic/claude-x',
      provider: { anthropic: { name: 'Anthropic' } },
    })

    await OpenCodeAgent.configure('sk-tm-secret', 'https://api.tokenmix.ai', 'claude-sonnet-4.6')
    await OpenCodeAgent.cleanup!()

    const c = await fs.readJson(cfgPath())
    expect(c.model).toBe('anthropic/claude-x') // user model untouched
    expect(c.provider.anthropic).toBeTruthy() // other provider survives
    expect(c.provider.tokenmix).toBeUndefined() // ours removed
  })
})
