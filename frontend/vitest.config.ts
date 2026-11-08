import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Config dedicada aos testes (jsdom + testing-library). O subpath de produção
// (import.meta.env.BASE_URL) é injetado por teste via vi.stubEnv, não aqui.
// Dev/build continuam usando o vite.config.ts.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
