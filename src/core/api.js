
// js/core/api.js

// Il Cuore del Sistema:
// Iniziamo recuperando la logica di wakeUpBackend (la "sveglia" del server)
// e la configurazione dell'URL.
// Questo file gestirà tutte le comunicazioni con Render.

// js/core/api.js
import { LoaderView } from './LoaderView.js';

const BACKEND_BASE_URL = 'https://shulehub-j-backend.onrender.com';

export const api = {
    // Flag per sapere se il server è già pronto
    isServerAwake: false,

    async wakeUp() {
        try {
            // Aggiungiamo le credenziali anche qui per il controllo sessione automatico
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/wakeup`, {
                credentials: 'include'
            });
            
            if (response.ok) this.isServerAwake = true;
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    /**
     * Chiamata generica che mostra automaticamente il loader e gestisce i cookie
     */
    async fetchWithLoader(endpoint, options = {}, loadingMessage) {
        if (loadingMessage) LoaderView.show(loadingMessage);
        
        // Forza l'invio dei cookie per ogni chiamata fatta con questo metodo
        options.credentials = 'include';

        try {
            const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, options);
            return response;
        } finally {
            if (loadingMessage) LoaderView.hide();
        }
    }


};