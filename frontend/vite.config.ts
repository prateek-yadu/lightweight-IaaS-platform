import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    /* proxy server */
    server: {
      proxy: {
        "/api/v1/": {
          // location of backend server
          target: env.BACKEND_URL || "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],

    // shadcn config
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
