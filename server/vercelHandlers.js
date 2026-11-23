function requestQuery(request, removePath = false) {
  const requestUrl = request.url || '/'
  const queryIndex = requestUrl.indexOf('?')
  const params = new URLSearchParams(queryIndex >= 0 ? requestUrl.slice(queryIndex + 1) : '')

  if (queryIndex < 0) {
    for (const [key, value] of Object.entries(request.query || {})) {
      if (key === 'path' || value == null) continue
      for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item))
    }
  }

  if (removePath) params.delete('path')
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function createApiHandler(app, endpoint) {
  return function handler(request, response) {
    request.url = `${endpoint}${requestQuery(request)}`
    return app(request, response)
  }
}

export function createApiCatchAllHandler(app) {
  return function handler(request, response) {
    const parsedUrl = new URL(request.url || '/', 'http://localhost')
    const pathParameter = request.query?.path ?? (parsedUrl.searchParams.has('path') ? parsedUrl.searchParams.getAll('path') : undefined)
    if (pathParameter !== undefined) {
      const segments = (Array.isArray(pathParameter) ? pathParameter : String(pathParameter).split('/'))
        .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
      const endpoint = segments.length ? `/api/${segments.join('/')}` : '/api'
      const query = new URLSearchParams(parsedUrl.search)
      query.delete('path')
      for (const [key, value] of Object.entries(request.query || {})) {
        if (key === 'path' || value == null || parsedUrl.searchParams.has(key)) continue
        for (const item of Array.isArray(value) ? value : [value]) query.append(key, String(item))
      }
      const queryString = query.toString()
      request.url = `${endpoint}${queryString ? `?${queryString}` : ''}`
    } else {
      const pathname = parsedUrl.pathname
      const endpoint = pathname.startsWith('/api/') || pathname === '/api'
        ? pathname
        : `/api${pathname.startsWith('/') ? pathname : `/${pathname}`}`
      request.url = `${endpoint}${requestQuery(request)}`
    }

    return app(request, response)
  }
}
