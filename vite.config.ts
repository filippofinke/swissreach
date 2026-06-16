import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The app is fully static and can be hosted on GitHub Pages under a sub-path.
// Set BASE_PATH (e.g. "/swissreach/") in CI to deploy under a repository sub-path.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
  },
});
