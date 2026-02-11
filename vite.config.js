import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  base: '/',
  build: {
    // Split vendor libraries for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
          }
        }
      }
    },
    // Increase chunk size warning limit since Three.js (lazy) is slightly over 1MB
    chunkSizeWarningLimit: 1100,
    // Minify with esbuild for faster builds
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'styled-components']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      }
    }
  }
}))
