import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // En producción nunca dejar `debugger` (pausaría Chrome/DevTools al usuario).
  esbuild: {
    drop: mode === "production" ? ["debugger"] : [],
  },
  build: {
    sourcemap: false,
  },
}))
