import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/final_compiled code poooja*/**',
        '**/venv/**',
        '**/scratch_repo/**',
        '**/server/**',
        '**/.git/**',
        '**/node_modules/**',
      ],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
