import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { ClaudeCodeAgent } from '../src/agents/claude.js'
import { OpenCodeAgent } from '../src/agents/opencode.js'

// Isolate config writes to a temp HOME so configure()/cleanup() never touch the
// real machine. os.homedir() honors $HOME on POSIX; OpenCode reads XDG_CONFIG_HOME.
let tmp: string
const origHome = process.env.HOME
const origXdg = process.env.XDG_CONFIG_HOME

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tokenmix-cleanup-'))
  process.env.HOME = tmp
  process.env.XDG_CONFIG_HOME = path.join(tmp, '.config')
})

afterEach(async () => {
  if (origHome === undefined) delete process.env.HOME
  else process.env.HOME = origHome
  if (origXdg === undefined) delete process.env.XDG_CONFIG_HOME
  else process.env.XDG_CONFIG_HOME = origXdg
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
