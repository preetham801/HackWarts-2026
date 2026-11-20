import { app } from '../server/index.js'
import { createApiHandler } from '../server/vercelHandlers.js'

export default createApiHandler(app, '/api/register')
