import { describe, it, expect, vi, afterEach } from 'vitest'

// Mock the prompts library so we can assert it is NOT invoked in non-interactive mode.
vi.mock('prompts', () => ({ default: vi.fn() }))

import prompts from 'prompts'
import { confirm } from '../src/utils/prompt.js'

const mockedPrompts = prompts as unknown as ReturnType<typeof vi.fn>
const realIsTTY = process.stdin.isTTY

function setTTY(v: boolean) {
  Object.defineProperty(process.stdin, 'isTTY', { value: v, configurable: true })
}

describe('confirm()', () => {
  afterEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', { value: realIsTTY, configurable: true })
    mockedPrompts.mockReset()
  })

  it('non-TTY: returns the default (true) WITHOUT prompting - no silent no-op', async () => {
    setTTY(false)
    expect(await confirm('Install now?', true)).toBe(true)
    expect(mockedPrompts).not.toHaveBeenCalled()
  })

  it('non-TTY: honors an explicit default of false', async () => {
    setTTY(false)
    expect(await confirm('Proceed?', false)).toBe(false)
    expect(mockedPrompts).not.toHaveBeenCalled()
  })

  it('TTY: falls through to the interactive prompt', async () => {
    setTTY(true)
    mockedPrompts.mockResolvedValue({ ok: true })
    expect(await confirm('Install now?', true)).toBe(true)
    expect(mockedPrompts).toHaveBeenCalledTimes(1)
  })

  it('TTY: a declined prompt returns false', async () => {
    setTTY(true)
    mockedPrompts.mockResolvedValue({ ok: false })
    expect(await confirm('Install now?', true)).toBe(false)
  })
})
