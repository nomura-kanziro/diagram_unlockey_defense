import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './src/app.js'
import { openDatabase } from './src/db.js'

const root = dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || join(root, 'data', 'accounts.sqlite')
const port = Number(process.env.PORT || 8787)
const app = createApp(openDatabase(dbPath))
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`ACCOUNT_SERVER ${server.address().port}`)
})
