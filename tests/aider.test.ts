import { describe, it, expect } from 'vitest'
import { userSelectedModel } from '../src/agents/aider.js'

describe('userSelectedModel', () => {
  it('detects an explicit --model in either form', () => {
    expect(userSelectedModel(['--model', 'openai/gpt-5.5'])).toBe(true)
    expect(userSelectedModel(['--model=openai/gpt-5.5'])).toBe(true)
  })

  it('detects aider built-in model alias flags', () => {
    expect(userSelectedModel(['--sonnet'])).toBe(true)
    expect(userSelectedModel(['--opus'])).toBe(true)
    expect(userSelectedModel(['--deepseek', '--yes'])).toBe(true)
  })

  it('is false when no model was chosen (we should inject our default)', () => {
    expect(userSelectedModel([])).toBe(false)
    expect(userSelectedModel(['--yes', '/path/to/file.py'])).toBe(false)
    expect(userSelectedModel(['--map-tokens', '1024'])).toBe(false)
  })
})
