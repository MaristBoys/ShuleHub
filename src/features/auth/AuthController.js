// js/features/auth/AuthController.js
import { api } from '../../core/api.js';
import { UserModel } from './UserModel.js';
import { NavbarView } from '../ui/navbar/NavbarView.js';
import { LoaderView } from '../../core/LoaderView.js';
import { Router } from '../../router.js';

export const AuthController = {
    // Avviato all'apertura di index.html
    async initBackgroundWakeup() {
        console.log("Sveglia backend avviata in background...");
        await api.wakeUp();
        console.log("Backend pronto!");
    },   
    
    initGoogleAuth() {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: "651622332732-hqg898c50786ii5rpa4iieo43gb6kmc8.apps.googleusercontent.com",
                callback: (resp) => this.handleCredentialResponse(resp),
                use_fedcm_for_prompt: false
            });

            google.accounts.id.renderButton(
                document.getElementById("google-login-btn"),
                { theme: "outline", size: "large", shape: "pill" }
            );
        }
    },

    async handleCredentialResponse(googleResponse) {
        try {
            // Se il server non è ancora sveglio (background wakeup non finito)
            if (!api.isServerAwake) {
                LoaderView.show("Connecting to the server... up to 90s");
                // Loop di attesa finché non risponde 200
                while (!api.isServerAwake) {
                    await api.wakeUp();
                    if (!api.isServerAwake) await new Promise(r => setTimeout(r, 2000));
                }
            }

            // Chiamata al login con spinner automatico
            const response = await api.fetchWithLoader('/api/auth/google-login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleResponse.credential }) 
            }, "Verifying your credentials...");

            if (!response.ok) throw new Error("Errore login server");
            
            const userData = await response.json();
            UserModel.saveUser(userData);
            
            // Aggiorniamo la UI invece di ricaricare
            Router.navigate();
            //NavbarView.renderAuthMenu(UserModel.getCurrentUser());
            
        } catch (error) {
            console.error("Errore durante il login:", error);
            alert("Errore di autenticazione: " + error.message);
        }
    }
};