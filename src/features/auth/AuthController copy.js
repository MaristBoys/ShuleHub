// js/features/auth/AuthController.js
import { api } from '../../core/api.js';
import { UserModel } from './UserModel.js';
import { LoaderView } from '../../core/LoaderView.js';
import { FeedbackView } from '../../core/FeedbackView.js'; // Assicurati che l'import sia corretto
import { ToastView } from '../../core/ToastView.js'; 
import { Router } from '../../router.js';

export const AuthController = {
    // Avviato all'apertura di index.html per svegliare il server in background
    async initBackgroundWakeup() {
        console.log("Background wakeup initiated...");
        await api.wakeUp();
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
                LoaderView.startCountdown(120); // Avvia il countdown grafico
                
                // Loop di attesa finché il server non risponde
                while (!api.isServerAwake) {
                    await api.wakeUp();
                    if (!api.isServerAwake) {
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
            }

            // 2. Chiamata al login con spinner automatico
            const response = await api.fetchWithLoader('/api/auth/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleResponse.credential })
            }, "Verifying your credentials...");

            const result = await response.json();

            // 3. Gestione Errori dal Backend
            if (!response.ok) {
                let msg = "Internal server error. Please try again later.";
                
                // Mappatura codici errore definiti nel backend
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
            // Salviamo il DTO utente contenuto in result.data il data lo estrae il metodo saveUser
            UserModel.saveUser(result); 

            // Mostriamo il messaggio di benvenuto
            //FeedbackView.show('success', `Welcome back, ${result.data.username}!`, "Login Successful");
            ToastView.show(`Welcome back, ${result.data.username}!`, 'success', 5000);
            // Navigazione ritardata per permettere la lettura del feedback
            setTimeout(() => {
                Router.navigate();
            }, 1500);
            
        } catch (error) {
            // STAMPA L'ERRORE REALE IN CONSOLE (F12)
            console.error("DEBUG LOGIN ERROR:", error); 
    
            // Mostra un messaggio più specifico nel modale
            FeedbackView.show('error', `Connection error: ${error.message}`, "Login Failed");
        }
    },


    /**
     * Gestisce il processo di Logout completo (Backend + Frontend)
     */
    async logout() {
        try {
            console.log("Inizio procedura di logout...");
            
            // 1. Chiamata al backend per invalidare la sessione e registrare l'Audit Log
            // Usiamo api.fetch (senza loader, o con un loader veloce se preferisci)
            // USA fetchWithLoader per essere sicuro che vada al backend corretto con i cookie
            await api.fetchWithLoader('/api/auth/logout', { 
                method: 'POST'
            // credentials: 'include' viene aggiunto automaticamente da api.js
            }, "Logging out..."); // Un messaggio veloce per l'utente
            
            console.log("Logout registrato nel database.");
        } catch (error) {
            // Se il server non risponde (es. sessione già scaduta), procediamo comunque
            console.warn("Server non raggiungibile per il logout, procedo localmente:", error);
        } finally {
            // 2. Pulizia locale dei dati (UserModel)
            UserModel.logout();

            // 3. Feedback visivo all'utente
            //FeedbackView.show('success', "Logged out successfully. See you soon!", "Logout");
            ToastView.show("Logged out successfully. See you soon!", 'info', 3000);
            // 4. Reindirizzamento alla pagina di login dopo 1 secondo
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    },
};