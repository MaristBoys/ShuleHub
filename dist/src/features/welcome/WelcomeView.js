import { AuthController } from '../auth/AuthController.js';

export const WelcomeView = {
    /**
     * Carica e renderizza la Welcome Section nel main container
     * @param {string} containerId - L'ID del contenitore (default: 'main-content')
     */
    async render(containerId = 'main-content') {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            // 1. Carichiamo il template HTML dalla nuova posizione feature-based
            const response = await fetch('src/features/welcome/welcome.html');
            
            if (!response.ok) throw new Error('Errore nel caricamento del template Welcome');
            
            const html = await response.text();

            // 2. Iniettiamo l'HTML nel contenitore principale
            container.innerHTML = html;

            // 3. Inizializziamo il pulsante Google LOGIN
            // NOTA: Il div 'google-login-btn' ora esiste nel DOM grazie al passo precedente
            this.initLogin();

        } catch (error) {
            console.error("Errore WelcomeView:", error);
            container.innerHTML = `
                <div class="text-center p-10">
                    <p class="text-red-500">Si è verificato un errore nel caricamento della pagina.</p>
                </div>
            `;
        }
    },

    initLogin() {
        const loginBtnContainer = document.getElementById('google-login-btn');
        if (loginBtnContainer) {
            // Chiamiamo l'AuthController per agganciare la logica di Google al div
            AuthController.initGoogleAuth();
        }
    }
};