import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Relative asset paths, so the build works from any location: the root of a domain
  // (Netlify, Vercel) or a sub-path (GitHub Pages project sites at /<repo>/). This is safe
  // because the app uses hash routing and never needs server-side route handling.
  base: './',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
