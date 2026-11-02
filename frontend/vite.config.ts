import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base = subpath do GitHub Pages (https://ong-alimentar.github.io/Sistema-Girassol/).
// Em dev (npm run dev) usa '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Sistema-Girassol/' : '/',
  plugins: [react()],
}))
