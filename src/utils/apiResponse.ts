type ApiPayload = Record<string, unknown>

export async function readApiResponse<T extends ApiPayload = ApiPayload>(response: Response): Promise<T> {
  const raw = await response.text()
  let data: ApiPayload = {}

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed as ApiPayload
    } catch {
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      throw new Error(`The server returned an invalid response (${response.status}). Please try again.`)
    }
  }

  if (!response.ok) {
    const detail = typeof data.error === 'string' ? data.error : typeof data.message === 'string' ? data.message : ''
    throw new Error(detail || `Request failed (${response.status})`)
  }

  return data as T
}
