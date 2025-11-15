import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                // 0.0.0.0
    port: 5173,
    strictPort: false,          // échoue s'il ne peut pas utiliser 5173
    hmr: { clientPort: 5173 },
    allowedHosts: ['.loca.lt', '.ngrok-free.dev'],  // Autorise localtunnel et ngrok
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})

