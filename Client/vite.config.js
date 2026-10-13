import { spawn } from 'node:child_process'
import net from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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

function accountServer() {
  return {
    name: 'account-server',
    async configureServer(server) {
      if (await portOpen(8787)) {
        console.log('계정 서버가 127.0.0.1:8787에서 이미 실행 중이라 새로 띄우지 않습니다.')
        return
      }
      const serverPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'Server', 'index.js')
      const child = spawn(process.execPath, [serverPath], {
        stdio: 'inherit',
        env: { ...process.env, PORT: '8787' }
      })
      const stop = () => {
        if (child.exitCode === null && !child.killed) child.kill()
      }
      server.httpServer?.on('close', stop)
      process.on('exit', stop)
    }
  }
}

export default defineConfig({
  plugins: [vue(), accountServer()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:8787'
    }
  }
})
