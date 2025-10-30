import { defineConfig } from 'vite';
import { resolve } from 'path';
import incrementBuild from './vite-plugin-increment-build.mjs';

export default defineConfig({
  plugins: [incrementBuild()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'CRCalculator',
      formats: ['es'],
      fileName: () => 'main.js'
    },
    outDir: 'scripts',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true
      }
    },
    target: 'es2022',
    minify: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
