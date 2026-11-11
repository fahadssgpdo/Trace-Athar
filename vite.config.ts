import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Set by the Pages workflow to "/<repo>/"; "/" everywhere else.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
