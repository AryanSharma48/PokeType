import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base:"/The-Typist/", // Removed for Vercel deployment, as it deploys to the root by default
  resolve:{
    alias:{
      "@": path.resolve(__dirname,"./src"),
    },
  },
})
