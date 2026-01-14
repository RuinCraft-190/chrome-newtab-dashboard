import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
      '@newtab': '/src/newtab',
      '@background': '/src/background',
      '@content': '/src/content',
      '@options': '/src/options'
    }
  },
  build: {
    rollupOptions: {
      input: {
        newtab: 'src/newtab/index.html',
        options: 'src/options/index.html',
        background: 'src/background/index.ts',
        content: 'src/content/index.ts'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
