import axios, { AxiosError } from 'axios'
import { readConfig, apiBaseUrl, UserConfig } from '../config/store.js'

// Public, unauthenticated model listing returned by /api/models.
// Mirrors only the fields we render; backend returns more.
export interface ApiModel {
  model_id: string
  short_id: string
  name: string
  vendor_id?: number
  model_type: 'chat' | 'embedding' | 'image' | 'audio' | 'video' | 'completion'
  input_price?: number
  output_price?: number
  image_price?: number
  video_price?: number
  context_length?: number
  status?: number
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function unwrap<T>(resp: { data?: { code?: number; message?: string; data?: T } }): T {
  const body = resp.data
  if (body && typeof body.code === 'number' && body.code !== 0) {
    throw new ApiError(0, body.message || 'API error')
  }
  return (body?.data as T) ?? (body as unknown as T)
}

function handleAxios(err: unknown): never {
  const e = err as AxiosError<{ message?: string; error?: { message?: string } }>
  if (e.response) {
    const msg =
      e.response.data?.message ||
      e.response.data?.error?.message ||
      e.message
    throw new ApiError(e.response.status, msg)
  }
  throw new ApiError(0, e.message || 'network error')
}

// Public endpoint, no auth required.
// Note: backend pagination uses `per_page` (NOT `page_size`); max 500 (anything >500 falls back to 20).
// 162 active models today, so per_page=500 fetches all in one round-trip.
export async function listPublicModels(cfg?: UserConfig): Promise<ApiModel[]> {
  const c = cfg || (await readConfig())
  try {
    const r = await axios.get(`${apiBaseUrl(c)}/api/models`, {
      params: { per_page: 500 },
      timeout: 15000,
    })
    const list = unwrap<{ list?: ApiModel[] } | ApiModel[]>(r)
    return Array.isArray(list) ? list : list?.list ?? []
  } catch (err) {
    handleAxios(err)
  }
}

// Verify the API key works by calling the OpenAI-compatible /v1/models endpoint.
// A 200 implies the key is valid and not revoked/expired/over-quota.
export async function verifyApiKey(apiKey: string, baseUrl?: string): Promise<boolean> {
  try {
    const r = await axios.get(`${baseUrl || 'https://api.tokenmix.ai'}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 15000,
    })
    return r.status === 200
  } catch {
    return false
  }
}

// ============================================================
// OAuth 2.0 Device Authorization Grant (RFC 8628)
//
// Lets the CLI obtain an API key through a browser flow instead of having
// the user paste sk-tm-... manually. Backend endpoints:
//   POST /api/auth/device/code   → device_code + user_code + verification_uri
//   POST /api/auth/device/token  → polled until approved → access_token (API Key)
// ============================================================

export interface DeviceAuthorization {
  device_code: string
  user_code: string
  verification_uri: string
  verification_uri_complete: string
  expires_in: number  // seconds
  interval: number    // recommended polling interval in seconds
}

export interface DeviceTokenResult {
  apiKey: string
  apiKeyId: number
  userEmail?: string
}

export class DeviceFlowError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

export async function startDeviceAuthorization(
  baseUrl: string,
  clientName: string = 'tokenmix-cli',
): Promise<DeviceAuthorization> {
  try {
    const r = await axios.post(
      `${baseUrl}/api/auth/device/code`,
      { client_name: clientName },
      { timeout: 15000 },
    )
    return unwrap<DeviceAuthorization>(r)
  } catch (err) {
    handleAxios(err)
  }
}

interface DeviceTokenBackend {
  access_token: string
  token_type: string
  api_key_id: number
  user_email?: string
}

// Poll until approved, denied, or expired. Returns the API key when approved.
// Throws DeviceFlowError with code ∈ {expired_token, access_denied, api_key_limit_reached, timeout} on terminal failures.
// onTick is called once per polling iteration with the seconds remaining (for progress display).
export async function pollDeviceToken(
  baseUrl: string,
  auth: DeviceAuthorization,
  onTick?: (secondsRemaining: number) => void,
): Promise<DeviceTokenResult> {
  let intervalMs = Math.max(1, auth.interval) * 1000
  const deadline = Date.now() + auth.expires_in * 1000

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs))
    if (onTick) {
      onTick(Math.max(0, Math.round((deadline - Date.now()) / 1000)))
    }
    try {
      const r = await axios.post(
        `${baseUrl}/api/auth/device/token`,
        { device_code: auth.device_code },
        { timeout: 15000, validateStatus: () => true },
      )
      if (r.status === 200 && r.data?.code === 0) {
        const body = r.data.data as DeviceTokenBackend
        return {
          apiKey: body.access_token,
          apiKeyId: body.api_key_id,
          userEmail: body.user_email,
        }
      }
      // backend uses `message` to carry the OAuth-standard error code
      const code = String(r.data?.message ?? '').trim()
      switch (code) {
        case 'authorization_pending':
          continue
        case 'slow_down': {
          const ra = parseInt(String(r.headers['retry-after'] ?? '5'), 10)
          if (Number.isFinite(ra) && ra > 0) intervalMs = ra * 1000
          continue
        }
        case 'expired_token':
          throw new DeviceFlowError('expired_token', 'Authorization expired. Run `tokenmix login` again.')
        case 'access_denied':
          throw new DeviceFlowError('access_denied', 'Authorization was denied or the code is invalid.')
        case 'api_key_limit_reached':
          throw new DeviceFlowError(
            'api_key_limit_reached',
            'You have reached the 20 API keys per account limit. Delete unused keys at https://tokenmix.ai/dashboard/keys',
          )
        default:
          throw new DeviceFlowError(code || 'unknown', `Unexpected device token response: ${code || r.status}`)
      }
    } catch (err) {
      if (err instanceof DeviceFlowError) throw err
      // Network glitch — retry on next iteration unless we're past the deadline.
      if (Date.now() >= deadline) {
        throw new DeviceFlowError('timeout', 'Authorization timed out. Run `tokenmix login` again.')
      }
      continue
    }
  }
  throw new DeviceFlowError('timeout', 'Authorization timed out before the user approved. Run `tokenmix login` again.')
}
