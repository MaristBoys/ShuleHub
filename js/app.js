// L'Inizializzatore Globale:
// Questo è l'unico file richiamato dall'HTML. 

// js/app.js
import { AuthController } from './controllers/AuthController.js';
import { UserModel } from './models/UserModel.js';

/**
 * Inizializzazione dell'applicazione al caricamento del DOM
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log("ShuleHub: App inizializzata.");

    // 1. Configurazione Google Identity Services (GSI)
    // Inizializziamo la libreria Google e passiamo il callback al nostro Controller
    if (window.google) {
        google.accounts.id.initialize({
            client_id: "651622332732-hqg898c50786ii5rpa4iieo43gb6kmc8.apps.googleusercontent.com",
            callback: (response) => AuthController.handleLogin(response)
        });

        // Chiediamo a Google di disegnare il pulsante nel contenitore che abbiamo in index.html
        const buttonWrapper = document.getElementById("google-auth-button-wrapper");
        if (buttonWrapper) {
            google.accounts.id.renderButton(buttonWrapper, {
                type: "standard",
                size: "large",
                theme: "outline",
                text: "sign_in_with",
                shape: "rectangular",
                logo_alignment: "left"
            });
        }
    }

    // 2. Controllo dello stato di navigazione
    // Se l'utente è già loggato (troviamo i dati in SessionStorage), mostriamo la Dashboard.
    // Altrimenti, facciamo partire la procedura di "sveglia" del backend.
    if (UserModel.isLoggedIn()) {
        console.log("Utente già loggato. Caricamento dashboard...");
        AuthController.renderDashboard();
    } else {
        console.log("Nessuna sessione attiva. Avvio procedura login...");
        AuthController.init();
    }
});