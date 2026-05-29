import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios (default export) before importing the client.
vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  AxiosError: class AxiosError extends Error {},
}))

import axios from 'axios'
import { unwrap, ApiError, listPublicModels, fetchWallet } from '../src/api/client.js'

const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>

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
    await expect(listPublicModels({})).rejects.toMatchObject({ status: 401, message: 'unauthorized' })
  })

  it('maps a network failure (no response) to ApiError', async () => {
    mockedGet.mockRejectedValue({ message: 'connect ECONNREFUSED' })
    await expect(listPublicModels({})).rejects.toBeInstanceOf(ApiError)
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
    mockedGet.mockRejectedValue({ response: { status: 401, data: { message: 'invalid or expired token' } } })
    await expect(fetchWallet('sk-tm-bad')).rejects.toMatchObject({ status: 401 })
  })
})
