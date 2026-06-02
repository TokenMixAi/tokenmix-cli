import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// In-memory fake filesystem so we can drive claude.configure with arbitrary
// (including malformed) settings.json contents without touching the real disk.
let files: Record<string, string> = {}
vi.mock('fs-extra', () => ({
  default: {
    readFile: vi.fn(async (p: string) => {
      if (p in files) return files[p]
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    }),
    writeFile: vi.fn(async (p: string, data: string) => {
      files[p] = data
    }),
    rename: vi.fn(async (from: string, to: string) => {
      files[to] = files[from]
      delete files[from]
    }),
    chmod: vi.fn(async () => {}),
    remove: vi.fn(async (p: string) => {
      delete files[p]
    }),
    ensureDir: vi.fn(async () => {}),
    pathExists: vi.fn(async () => false),
  },
}))

import { ClaudeCodeAgent } from '../src/agents/claude.js'
import os from 'os'
import path from 'path'

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json')

describe('claude configure - malformed settings.json guards (BUG-1)', () => {
  beforeEach(() => {
    files = {}
  })
  afterEach(() => vi.restoreAllMocks())

  it('does NOT crash when settings.json is the JSON literal `null`', async () => {
    files[settingsPath] = 'null'
    // Previously threw: Cannot read properties of null (reading 'env')
    const r = await ClaudeCodeAgent.configure('sk-tm-abc', 'https://api.tokenmix.ai', 'm')
    expect(r.configPath).toBe(settingsPath)
    expect(JSON.parse(files[settingsPath]).env.ANTHROPIC_API_KEY).toBe('sk-tm-abc')
  })

  it('treats an array settings.json as start-fresh without crashing', async () => {
    files[settingsPath] = '[1,2,3]'
    await ClaudeCodeAgent.configure('sk-tm-abc', 'https://api.tokenmix.ai', 'm')
    expect(JSON.parse(files[settingsPath]).env.ANTHROPIC_API_KEY).toBe('sk-tm-abc')
  })

  it('preserves a valid existing settings object and its other env keys', async () => {
    files[settingsPath] = JSON.stringify({ theme: 'dark', env: { FOO: 'bar' } })
    await ClaudeCodeAgent.configure('sk-tm-abc', 'https://api.tokenmix.ai', 'm')
    const written = JSON.parse(files[settingsPath])
    expect(written.theme).toBe('dark')
    expect(written.env.FOO).toBe('bar')
    expect(written.env.ANTHROPIC_API_KEY).toBe('sk-tm-abc')
  })
})
