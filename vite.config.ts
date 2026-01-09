import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web';
  
  return {
    plugins: [react()],
    clearScreen: false,
    server: {
      port: isWeb ? 3000 : 1420,
      strictPort: false,
      open: isWeb, // Automatski otvori browser za web verziju
      proxy: isWeb ? {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      } : undefined,
    },
    envPrefix: ["VITE_", "TAURI_"],
    build: {
      target: ["es2021", "chrome100", "safari13"],
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      sourcemap: !!process.env.TAURI_DEBUG,
      outDir: isWeb ? "dist-web" : "dist",
    },
  };
});
