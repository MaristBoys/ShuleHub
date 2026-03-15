// src/features/auth/AuthController.js
import { api } from '../../core/api.js';
import { UserModel } from './UserModel.js';
import { AuthService } from './AuthService.js';
import { LoaderView } from '../../core/LoaderView.js';
import { FeedbackView } from '../../core/FeedbackView.js';
import { ToastView } from '../../core/ToastView.js'; 
import { Router } from '../../router.js';

export const AuthController = {
    // Avviato all'apertura di index.html per svegliare il server in background
    async initBackgroundWakeup() {
        console.log("Background wakeup initiated...");
        await AuthService.wakeUp();
        console.log("Backend ready!");
    },   
    
    // Inizializza il pulsante Google Sign-In
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

    /**
     * Gestisce la risposta di Google e l'autenticazione con il backend
     */
    async handleCredentialResponse(googleResponse) {
        try {
            // 1. Controllo se il server è sveglio (Render spin-up)
            if (!api.isServerAwake) {
                const waitMsg = "Connecting to the server...";
                LoaderView.show(waitMsg);
                LoaderView.startCountdown(150);
                
                await AuthService.ensureServerIsAwake();
            }

            // 2. Chiamata al login tramite Service
            const response = await AuthService.loginWithGoogle(googleResponse.credential);
            const result = await response.json();

            // 3. Gestione Errori dal Backend
            if (!response.ok) {
                let msg = "Internal server error. Please try again later.";
                
                switch (result.data) {
                    case 'ERR_USER_NOT_FOUND': msg = "Access denied: this email is not registered."; break;
                    case 'ERR_USER_DISABLED':  msg = "Your account has been disabled. Contact admin."; break;
                    case 'ERR_MALFORMED_TOKEN':
                    case 'ERR_INVALID_TOKEN':  msg = "Communication error with Google. Try again."; break;
                    case 'ERR_MISSING_TOKEN':   msg = "Technical issue: token missing. Refresh page."; break;
                }

                FeedbackView.show('error', msg, "Login Failed"); 
                return;
            }
            
            // 4. Successo: Salvataggio e Navigazione
            UserModel.saveUser(result); 

            ToastView.show(`Welcome back, ${result.data.username}!`, 'success', 5000);

            setTimeout(() => {
                Router.navigate();
            }, 1500);
            
        } catch (error) {
            console.error("DEBUG LOGIN ERROR:", error); 
            FeedbackView.show('error', `Connection error: ${error.message}`, "Login Failed");
        }
    },

    /**
     * Gestisce il processo di Logout completo (Backend + Frontend)
     */
    async logout() {
        try {
            console.log("Inizio procedura di logout...");
            await AuthService.logoutRequest();
            console.log("Logout registrato nel database.");
        } catch (error) {
            console.warn("Server non raggiungibile per il logout, procedo localmente:", error);
        } finally {
            UserModel.logout();
            ToastView.show("Logged out successfully. See you soon!", 'info', 3000);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    },
};