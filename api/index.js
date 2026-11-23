import { app } from '../server/index.js'
import { createApiCatchAllHandler } from '../server/vercelHandlers.js'

export default createApiCatchAllHandler(app)
