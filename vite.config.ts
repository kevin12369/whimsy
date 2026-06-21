import { defineConfig } from 'vite';

export default defineConfig({
  base: './',  // relative paths for GitHub Pages subpath
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});