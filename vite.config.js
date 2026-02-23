import { defineConfig } from 'vite';

export default defineConfig({
  // FONDAMENTALE per GitHub Pages e per la struttura delle cartelle
  base: '/ShuleHub/', 
  server: {
    port: 5173,
    // Questo aiuta a risolvere i problemi di accesso da localhost
    host: true 
  }
});