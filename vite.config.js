import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';


export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'json-ts-mapper',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/index.d.ts',
          dest: ''
        }
      ]
    })
  ]
});
