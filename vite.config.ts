import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    allowedHosts: ['expiration-trackbacks-responsible-conflicts.trycloudflare.com'],
    proxy: {
      '/api': {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      },
      '/render': {  // ← AGREGAR ESTO
        target: 'ws://localhost:8080',
        ws: true,
      },
      '/minio': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ''),
      }


    },
  },
})