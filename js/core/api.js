
// js/core/api.js

// Il Cuore del Sistema:
// Iniziamo recuperando la logica di wakeUpBackend (la "sveglia" del server)
// e la configurazione dell'URL.
// Questo file gestirà tutte le comunicazioni con Render.

const BACKEND_BASE_URL = 'https://shulehub-j-backend.onrender.com';

export const api = {
    async wakeUp() {
        try {
            // Usiamo l'endpoint base /api/auth. 
            // Nota: Il backend deve avere un metodo GET su /api/auth per non dare errore 405.
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/test`, { method: 'GET' });
            return true; 
        } catch (error) {
            return false;
        }
    },

    async post(endpoint, data) {
        const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            // FONDAMENTALE: permette l'invio e la ricezione dei Cookie HttpOnly
            credentials: 'include' 
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.error || `Errore API: ${response.status}`);
        }
        return await response.json();
    }
};
