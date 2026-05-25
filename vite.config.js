import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/upload': 'http://127.0.0.1:8000',
      '/status': 'http://127.0.0.1:8000',
      '/download': 'http://127.0.0.1:8000',
      '/subtitle': 'http://127.0.0.1:8000',
      '/login': 'http://127.0.0.1:8000',
      '/register': 'http://127.0.0.1:8000',
      '/send-otp': 'http://127.0.0.1:8000',
      '/verify-otp': 'http://127.0.0.1:8000',
      '/user': 'http://127.0.0.1:8000',
      '/static': 'http://127.0.0.1:8000',
      '/history': 'http://127.0.0.1:8000',
      '/download-history': 'http://127.0.0.1:8000',
    }
  }
})
