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

function unwrap<T>(resp: { data?: { code?: number; message?: string; data?: T } }): T {
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
