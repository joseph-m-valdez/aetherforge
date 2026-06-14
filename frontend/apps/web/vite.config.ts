import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Cesium's static runtime assets are copied into public/cesium by
    // scripts/copy-cesium.mjs (run via the predev/prebuild npm scripts), so
    // Vite serves them at /cesium in both dev and production.
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
})
