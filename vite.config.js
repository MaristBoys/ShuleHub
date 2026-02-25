import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // Mantiene i percorsi relativi, essenziale per il deploy su Vercel/GitHub Pages
  base: './',
  
  server: {
    port: 5173,
    // Permette l'accesso da localhost e altri dispositivi in rete
    host: true 
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          // Copia la cartella degli asset (immagini, loghi, icone)
          src: 'assets/**/*',
          dest: 'assets'
        },
//        {
//          // Preserva la tua struttura dei componenti HTML
//          src: 'components/**/*.html',
//          dest: 'components',
//          allowEmpty: true
//        },
       {
          // Prendi solo i file HTML dentro src/features
          src: 'src/features/*',
          // La destinazione base nella cartella dist
          dest: 'src/features',
          // FONDAMENTALE: mantiene la struttura delle sottocartelle 
          // SENZA duplicare la cartella radice 'src/features' nella destinazione
          //flatten: false
      }
      ]
    })
  ]
});