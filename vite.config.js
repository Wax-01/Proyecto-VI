import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En dev local, el backend sigue corriendo aparte (`npm run server`);
    // en producción (Vercel) /api/* lo resuelve la función serverless.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
