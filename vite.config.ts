import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact(),visualizer({
      open: true,
      gzipSize: true,
    })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          syntax: ["react-syntax-highlighter"],
        },
      },
    },
  },
  
  server: {
    port: 60015,
    allowedHosts: ['paintbloatware.online'],
    proxy: {
      '/api': {
        target: "http://localhost:60014",
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