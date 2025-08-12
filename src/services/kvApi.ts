export type KvValueType = 'text' | 'json'

export interface KvSetRequestBody {
  key: string
  value: unknown
  as?: KvValueType
  ttl?: number
  metadata?: Record<string, unknown>
}

export interface KvGetResponse<T = unknown> {
  value: T
  metadata?: Record<string, unknown>
}

export interface KvListResponse {
  keys: Array<{ name: string; expiration?: number; metadata?: Record<string, unknown> | null }>
  list_complete: boolean
  cursor?: string
}

export async function kvSet(body: KvSetRequestBody): Promise<{ message: string } | { error: string }> {
  const response = await fetch('/api/kv/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error((data && (data.message || data.error)) || `HTTP ${response.status}`)
  }
  return data
}

export async function kvGet<T = unknown>(key: string, type: KvValueType): Promise<KvGetResponse<T>> {
  const response = await fetch(`/api/kv/get/${encodeURIComponent(key)}?type=${type}`)
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error((data && (data.message || data.error)) || `Get failed: ${response.status}`)
  }
  return response.json()
}

export async function kvDelete(key: string): Promise<{ message: string } | { error: string }> {
  const response = await fetch(`/api/kv/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error((data && (data.message || data.error)) || `HTTP ${response.status}`)
  }
  return data
}

export async function kvList(params: { prefix?: string; limit?: number; cursor?: string }): Promise<KvListResponse> {
  const query = new URLSearchParams()
  if (params.prefix) query.set('prefix', params.prefix)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.cursor) query.set('cursor', params.cursor)
  const response = await fetch(`/api/kv/list?${query.toString()}`)
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error((data && (data.message || data.error)) || `List failed: ${response.status}`)
  }
  return response.json()
}


