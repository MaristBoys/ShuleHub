
// js/controllers/AuthController.js

// Questo file coordina la "sveglia" del backend e il login di Google.
//Il controller gestisce il flusso del login.
// Riceve la risposta da Google,
// parla con il backend e decide dove mandare l'utente.

import { api } from '../core/api.js';
import { LoginView } from '../views/LoginView.js';
import { UserModel } from '../models/UserModel.js';
import { DashboardView } from '../views/DashboardView.js';

export const AuthController = {
    async init() {
        // 1. Tenta di svegliare il backend
        const isAwake = await api.wakeUp();
        
        if (isAwake) {
            LoginView.showGoogleButton();
        } else {
            // Se non risponde, avvia il countdown di 90s (come avevi prima)
            LoginView.startCountdown(90, null, () => {
                LoginView.showGoogleButton();
            });
        }
    },

    async handleLogin(googleResponse) {
        try {
            const data = await api.post('/api/auth/google', { idToken: googleResponse.credential });
            UserModel.initSession(data.user);
            this.renderDashboard();
        } catch (error) {
            alert("Errore login: " + error.message);
        }
    },

    renderDashboard() {
        const user = UserModel.getCurrentUser();
        if (user) {
            LoginView.hideLoginSection();
            DashboardView.render(user);
        }
    }
};