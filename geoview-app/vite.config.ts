import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
	  vuetify({ autoImport: true }), // <--- aggiungi questa riga
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      '/geoserver': {
        target: 'https://geoplatform.tools4msp.eu',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/geoserver/, '/geoserver')
       },
      // '/wms': {
      //   target: 'https://www.sid.mit.gov.it/ppsm2',
      //   changeOrigin: true,
      //   rewrite: path => path.replace(/^\/wms/, '/wms' )
      // },
      '/wfs': {
        target: 'https://www.sid.mit.gov.it/ppsm2',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/wfs/, '/wfs' )
      }

      
    }
  }

})