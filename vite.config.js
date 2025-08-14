import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort =
    process.env.BACKEND_PORT || env.BACKEND_PORT ||
    process.env.VITE_BACKEND_PORT || env.VITE_BACKEND_PORT ||
    '5002'

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            charts: ['apexcharts', 'react-apexcharts', 'recharts'],
            state: ['zustand', '@tanstack/react-query'],
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          // Backend portu .env(.local) veya ortamdan okunur
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => console.error('Proxy Error:', err.message))
          }
        },
        // Socket.IO WebSocket proxy (frontend origin üzerinden /socket.io istekleri backend'e yönlenir)
        '/socket.io': {
          target: `http://localhost:${backendPort}`,
          ws: true,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
