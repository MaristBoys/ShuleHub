// L'Inizializzatore Globale:
// Questo è l'unico file richiamato dall'HTML. 

// app.js - Il Controller principale
import { api } from './core/api.js';
import { UserModel } from './models/UserModel.js';

// 1. Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', async () => {
    console.log("ShuleHub App Inizializzata");

    // "Sveglia" il backend su Render immediatamente
    api.wakeUp();

    // Carica la Navbar e inizializza la logica di autenticazione
    await initNavbar();
});

/**
 * Carica il componente Navbar e decide cosa mostrare (Login o Profilo)
 */
async function initNavbar() {
    try {
        const response = await fetch('components/navbar.html');
        const html = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = html;

        // Una volta caricata la navbar, controlliamo lo stato dell'utente
        const user = UserModel.getCurrentUser();

        if (user && UserModel.isLoggedIn()) {
            renderAuthMenu(user);
        } else {
            renderLoginButton();
        }
    } catch (error) {
        console.error("Errore nel caricamento della navbar:", error);
    }
}

/**
 * Se l'utente è loggato, inietta nome, profilo e icone
 */
function renderAuthMenu(user) {
    const container = document.getElementById('auth-container');
    if (!container) return;

    // Qui iniettiamo i dati nel modo che chiedevi all'inizio
    container.innerHTML = `
        <div class="flex items-center space-x-6">
            <a href="index.html" title="Home" class="text-2xl">🏠</a>
            
            <div class="flex flex-col text-right">
                <a href="pages/scheda-utente.html" class="font-bold text-blue-900 hover:text-blue-700">
                    ${user.name}
                </a>
                <span class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    ${user.profile}
                </span>
            </div>

            <button id="logout-btn" title="Logout" class="text-2xl hover:opacity-70 transition">
                🚪
            </button>
        </div>
    `;

    // Aggancia l'evento di logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        UserModel.logout();
    });
}

/**
 * Se l'utente non è loggato, prepara il contenitore per il tasto Google
 */
function renderLoginButton() {
    const container = document.getElementById('auth-container');
    if (!container) return;

    container.innerHTML = `<div id="google-login-btn"></div>`;
    initGoogleAuth();
}

/**
 * Configurazione ufficiale Google Identity Services
 */
function initGoogleAuth() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "651622332732-hqg898c50786ii5rpa4iieo43gb6kmc8.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: false
        });

        google.accounts.id.renderButton(
            document.getElementById("google-login-btn"),
            { theme: "outline", size: "large", shape: "pill" }
        );
    }
}

/**
 * Callback eseguita dopo che l'utente ha scelto l'account Google
 */
async function handleCredentialResponse(googleResponse) {
    try {
        // Chiamata pulita tramite il core API
        const userData = await api.post('/api/auth/google', { 
            token: googleResponse.credential 
        });

        // Salvataggio tramite il Model
        UserModel.saveUser(userData);

        // Feedback visivo e ricarica
        console.log("Login effettuato con successo!");
        window.location.reload();
        
    } catch (error) {
        console.error("Errore durante il login:", error.message);
        alert("Errore di autenticazione: " + error.message);
    }
}

// Esponiamo la callback globalmente per Google
window.handleCredentialResponse = handleCredentialResponse;