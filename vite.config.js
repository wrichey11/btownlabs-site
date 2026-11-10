import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        bendword: fileURLToPath(new URL('./bendword/index.html', import.meta.url)),
      },
    },
  },
  plugins: [react(), tailwindcss()],
})