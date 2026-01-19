import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Αυτό είναι σημαντικό για το Docker
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true, // Αυτό βοηθάει στα Windows να βλέπουν τις αλλαγές
    }
  }
})