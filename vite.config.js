import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // On Netlify, we serve from root. On GitHub Pages, we serve from /matheusdanoite/
  // This also prevents Netlify from flagging the base path as a leakage of the "LASTFM_USERNAME" secret
  base: process.env.NETLIFY ? '/' : (command === 'build' ? '/matheusdanoite/' : '/'),
}))
