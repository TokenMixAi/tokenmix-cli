import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  AxiosError: class AxiosError extends Error {},
}))

import axios from 'axios'
import { pollDeviceToken, DeviceFlowError } from '../src/api/client.js'
import type { DeviceAuthorization } from '../src/api/client.js'

const mockedPost = axios.post as unknown as ReturnType<typeof vi.fn>

const AUTH: DeviceAuthorization = {
  device_code: 'dc',
  user_code: 'ABCD-2345',
  verification_uri: 'https://tokenmix.ai/device',
  verification_uri_complete: 'https://tokenmix.ai/device?user_code=ABCD-2345',
  expires_in: 300,
  interval: 1,
}

describe('pollDeviceToken', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedPost.mockReset()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps polling on authorization_pending, then returns the key once approved', async () => {
    mockedPost
      .mockResolvedValueOnce({ status: 200, data: { code: 1, message: 'authorization_pending' } })
      .mockResolvedValueOnce({
        status: 200,
        data: { code: 0, data: { access_token: 'sk-tm-abc', api_key_id: 7, user_email: 'a@b.c' } },
      })

    const p = pollDeviceToken('http://api', AUTH)
    await vi.advanceTimersByTimeAsync(1000) // first poll → pending
    await vi.advanceTimersByTimeAsync(1000) // second poll → approved
    const res = await p

    expect(res).toEqual({ apiKey: 'sk-tm-abc', apiKeyId: 7, userEmail: 'a@b.c' })
    expect(mockedPost).toHaveBeenCalledTimes(2)
  })

  it('throws a DeviceFlowError on access_denied', async () => {
    mockedPost.mockResolvedValueOnce({ status: 200, data: { code: 1, message: 'access_denied' } })

    const p = pollDeviceToken('http://api', AUTH)
    const settled = p.catch((e) => e)
    await vi.advanceTimersByTimeAsync(1000)
    const err = await settled

    expect(err).toBeInstanceOf(DeviceFlowError)
    expect((err as DeviceFlowError).code).toBe('access_denied')
  })

  it('backs off using retry-after when told to slow_down', async () => {
    mockedPost
      .mockResolvedValueOnce({
        status: 200,
        data: { code: 1, message: 'slow_down' },
        headers: { 'retry-after': '3' },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { code: 0, data: { access_token: 'sk-tm-z', api_key_id: 1 } },
      })

    const p = pollDeviceToken('http://api', AUTH)

    await vi.advanceTimersByTimeAsync(1000) // first poll → slow_down (interval now 3s)
    expect(mockedPost).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000) // +1s: still inside the 3s backoff → no poll yet
    expect(mockedPost).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(2000) // reach 3s → second poll → approved
    expect((await p).apiKey).toBe('sk-tm-z')
  })

  it('retries through a transient network error and still succeeds', async () => {
    mockedPost
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockResolvedValueOnce({
        status: 200,
        data: { code: 0, data: { access_token: 'sk-tm-ok', api_key_id: 2 } },
      })

    const p = pollDeviceToken('http://api', AUTH)
    await vi.advanceTimersByTimeAsync(1000) // first poll throws → swallowed, retry
    await vi.advanceTimersByTimeAsync(1000) // second poll → approved
    expect((await p).apiKey).toBe('sk-tm-ok')
  })
})
