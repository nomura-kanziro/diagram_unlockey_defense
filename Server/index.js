import net from 'node:net'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let settled = false
    const done = (open) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(open)
    }
    const timer = setTimeout(() => done(false), 300)
    socket.once('connect', () => {
      clearTimeout(timer)
      done(true)
    })
    socket.once('error', () => {
      clearTimeout(timer)
      done(false)
    })
    socket.connect(port, '127.0.0.1')
  })
}

const root = dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || join(root, 'data', 'accounts.sqlite')
const port = Number(process.env.PORT || 8787)
if (await portOpen(port)) {
  console.error(`ACCOUNT_SERVER 127.0.0.1:${port} 포트가 이미 사용 중입니다.`)
  process.exit(1)
}
const { createApp } = await import('./src/app.js')
const { openDatabase } = await import('./src/db.js')
const app = createApp(openDatabase(dbPath))
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`ACCOUNT_SERVER ${server.address().port}`)
})
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ACCOUNT_SERVER 127.0.0.1:${port} 포트가 이미 사용 중입니다.`)
    process.exit(1)
  }
  console.error(err)
  process.exit(1)
})
