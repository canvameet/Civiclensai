import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Express backend (civiclens/backend) runs on :5000.
// Proxying keeps the browser on one origin, so no CORS and no absolute URLs in code.
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/uploads': { target: BACKEND, changeOrigin: true },
    },
  },
})
