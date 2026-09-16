import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Mermaid's diagram engines are large but lazy-loaded only on pages with diagrams.
    chunkSizeWarningLimit: 1600,
  },
})
