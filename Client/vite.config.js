import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function accountServer() {
  return {
    name: 'account-server',
    configureServer(server) {
      const serverPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'Server', 'index.js')
      const child = spawn(process.execPath, [serverPath], {
        stdio: 'inherit',
        env: { ...process.env, PORT: '8787' }
      })
      const stop = () => {
        if (!child.killed) child.kill()
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
