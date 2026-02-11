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
          // Allow Vite/Rollup to handle chunking automatically to avoid circular deps
          // or split very specifically if needed later.
          // For now, removing the problematic vendor split.
          if (id.includes('node_modules')) {
            return 'vendor'; // Single huge vendor chunk is safer than circular deps
          }
        }
      }
    },
    // Increase chunk size warning limit since we have large data files
    chunkSizeWarningLimit: 1000,
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
