import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  
  /* proxy server */
  server: {
    proxy: {
      "/api/v1/" :{
        // location of backend server
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  plugins: [react(), tailwindcss(),
  ],

})
