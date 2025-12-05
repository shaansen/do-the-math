import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get base path from environment variable, default to empty string (root)
// For GitHub Pages, set this to your repository name (e.g., '/split-app/')
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base: base,
})

