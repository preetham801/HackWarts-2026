import 'dotenv/config'
import app from './app.js'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT) || 3001

export { app }

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectExecution) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`HackWarts API listening on port ${port}.`)
  })
}
