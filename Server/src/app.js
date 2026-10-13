import express from 'express'
import { accountRouter } from './accounts.js'

export function createApp(store) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))
  app.use('/api', accountRouter(store))
  app.use((req, res) => {
    res.status(404).json({ error: '없는 주소입니다.' })
  })
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      next(err)
      return
    }
    const status = err.status || err.statusCode || 500
    res.status(status).json({ error: status === 500 ? '서버 오류가 났습니다.' : err.message })
  })
  return app
}
