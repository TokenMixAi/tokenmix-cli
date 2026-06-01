import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock axios (default export) before importing the client.
vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  AxiosError: class AxiosError extends Error {},
}))

import axios from 'axios'
import { unwrap, ApiError, listPublicModels, fetchWallet, verifyApiKey } from '../src/api/client.js'

const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>

// withRetry's backoff uses setTimeout — run its callbacks instantly so retry tests
// don't actually wait out the exponential backoff.
beforeEach(() => {
  vi.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
    fn()
    return 0 as unknown as ReturnType<typeof setTimeout>
  }) as typeof setTimeout)
})
afterEach(() => vi.restoreAllMocks())

describe('unwrap', () => {
  it('returns the inner data on the success envelope (code 0)', () => {
    expect(unwrap({ data: { code: 0, data: [1, 2, 3] } })).toEqual([1, 2, 3])
  })

  it('returns nested objects untouched', () => {
    expect(unwrap({ data: { code: 0, data: { list: [{ a: 1 }] } } })).toEqual({ list: [{ a: 1 }] })
  })

  it('throws ApiError with the backend message on a non-zero code', () => {
    expect(() => unwrap({ data: { code: 1, message: 'boom' } })).toThrowError(ApiError)
    try {
      unwrap({ data: { code: 1, message: 'boom' } })
    } catch (e) {
      expect((e as ApiError).message).toBe('boom')
    }
  })

  it('passes a code-less body straight through', () => {
    expect(unwrap({ data: [1, 2] as unknown as { code?: number } })).toEqual([1, 2])
  })
})

describe('listPublicModels', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('requests per_page=500 and returns a bare array', async () => {
    mockedGet.mockResolvedValue({ data: { code: 0, data: [{ short_id: 'x' }] } })
    const models = await listPublicModels({})
    expect(models).toEqual([{ short_id: 'x' }])
    expect(mockedGet).toHaveBeenCalledWith(
      'https://api.tokenmix.ai/api/models',
      expect.objectContaining({ params: { per_page: 500 } }),
    )
  })

  it('unwraps a paginated { list } payload', async () => {
    mockedGet.mockResolvedValue({ data: { code: 0, data: { list: [{ short_id: 'y' }] } } })
    expect(await listPublicModels({})).toEqual([{ short_id: 'y' }])
  })

  it('maps an HTTP error response to ApiError with its status', async () => {
    mockedGet.mockRejectedValue({ response: { status: 401, data: { message: 'unauthorized' } } })
    await expect(listPublicModels({})).rejects.toMatchObject({
      status: 401,
      message: 'unauthorized',
    })
  })

  it('maps a network failure (no response) to ApiError', async () => {
    mockedGet.mockRejectedValue({ message: 'connect ECONNREFUSED' })
    await expect(listPublicModels({})).rejects.toBeInstanceOf(ApiError)
  })

  it('retries a transient transport failure, then succeeds', async () => {
    mockedGet
      .mockRejectedValueOnce({ message: 'ETIMEDOUT' })
      .mockResolvedValueOnce({ data: { code: 0, data: [{ short_id: 'z' }] } })
    expect(await listPublicModels({})).toEqual([{ short_id: 'z' }])
    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  it('does NOT retry an HTTP error response (it is a real answer)', async () => {
    mockedGet.mockRejectedValue({ response: { status: 500, data: {} } })
    await expect(listPublicModels({})).rejects.toBeInstanceOf(ApiError)
    expect(mockedGet).toHaveBeenCalledTimes(1)
  })
})

describe('fetchWallet', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('GETs /v1/wallet with a Bearer key and unwraps the wallet', async () => {
    const wallet = {
      balance: 31129663,
      frozen: 0,
      gift_balance: 3823,
      total_used: 10986627,
      total_topup: 40120000,
      currency: 'USD',
    }
    mockedGet.mockResolvedValue({ data: { code: 0, data: wallet } })

    const result = await fetchWallet('sk-tm-xyz', 'https://api.tokenmix.ai')
    expect(result).toEqual(wallet)
    expect(mockedGet).toHaveBeenCalledWith(
      'https://api.tokenmix.ai/v1/wallet',
      expect.objectContaining({ headers: { Authorization: 'Bearer sk-tm-xyz' } }),
    )
  })

  it('maps a 401 to ApiError', async () => {
    mockedGet.mockRejectedValue({
      response: { status: 401, data: { message: 'invalid or expired token' } },
    })
    await expect(fetchWallet('sk-tm-bad')).rejects.toMatchObject({ status: 401 })
  })
})

describe('verifyApiKey', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('returns true on HTTP 200', async () => {
    mockedGet.mockResolvedValue({ status: 200 })
    expect(await verifyApiKey('sk-tm-x', 'https://api.tokenmix.ai')).toBe(true)
  })

  it('returns false (not a throw) on HTTP 401 — a genuinely invalid/revoked key', async () => {
    mockedGet.mockResolvedValue({ status: 401 })
    expect(await verifyApiKey('sk-tm-bad')).toBe(false)
  })

  it('passes validateStatus so axios does not throw on non-2xx', async () => {
    mockedGet.mockResolvedValue({ status: 403 })
    await verifyApiKey('sk-tm-x')
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/v1/models'),
      expect.objectContaining({ validateStatus: expect.any(Function) }),
    )
  })

  it('THROWS ApiError on a transport failure (offline/DNS) so callers can tell it apart from a bad key', async () => {
    mockedGet.mockRejectedValue({ message: 'getaddrinfo EAI_AGAIN api.tokenmix.ai' })
    await expect(verifyApiKey('sk-tm-x')).rejects.toBeInstanceOf(ApiError)
  })
})
