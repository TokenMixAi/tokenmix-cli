import { describe, it, expect, vi, afterEach } from 'vitest'
import { logger } from '../src/utils/logger.js'

// Locks the stdout/stderr contract documented in logger.ts: progress (step) and
// errors go to stderr; everything that carries command OUTPUT stays on stdout.
describe('logger output streams', () => {
  afterEach(() => vi.restoreAllMocks())

  it('sends progress (step) and errors to stderr', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const out = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.step('Configuring…')
    logger.error('boom')
    expect(err).toHaveBeenCalledTimes(2)
    expect(out).not.toHaveBeenCalled()
  })

  it('keeps user-facing output (success/info/warn/dim) on stdout so it stays pipeable', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const out = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.success('Available $5.00')
    logger.info('a hint')
    logger.warn('not installed')
    logger.dim('subtle note')
    expect(out).toHaveBeenCalledTimes(4)
    expect(err).not.toHaveBeenCalled()
  })
})
