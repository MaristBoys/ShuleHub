// src/features/auth/AuthService.js
import { api } from '../../core/api.js';

export const AuthService = {
    // Spostato da initBackgroundWakeup
    async wakeUp() {
        return await api.wakeUp();
    },

    // Spostato da handleCredentialResponse (Logica tecnica del loop)
    async ensureServerIsAwake() {
        while (!api.isServerAwake) {
            await api.wakeUp();
            if (!api.isServerAwake) {
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    },

    // Spostato da handleCredentialResponse (Chiamata login)
    async loginWithGoogle(credential) {
        return await api.fetchWithLoader('/api/v1/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: credential })
        }, "Verifying your credentials...");
    },

    // Spostato da logout (Chiamata logout)
    async logoutRequest() {
        return await api.fetchWithLoader('/api/v1/auth/logout', { 
            method: 'POST'
        }, "Logging out...");
    }
};