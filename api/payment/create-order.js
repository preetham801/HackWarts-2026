import { app } from '../../server/index.js'

export default function handler(request, response) {
  const requestUrl = request.url || '/'
  if (!requestUrl.split('?')[0].startsWith('/api/')) {
    const query = requestUrl.includes('?') ? requestUrl.slice(requestUrl.indexOf('?')) : ''
    request.url = `/api/payment/create-order${query}`
  }
  return app(request, response)
}
