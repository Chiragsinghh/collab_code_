import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
      },
      '/yjs': {
        target: 'http://localhost:5001',
        ws: true,
      },
    },
  },
})