import { defineConfig } from 'vite'
import VueMacros from 'unplugin-vue-macros/vite'
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: vue(),
        vueJsx: vueJsx(),
      }
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true,
  }
})
