// js/login.js
import {
    backendLoadingSpinner,
    waitingForBackendMessage,
    googleAuthButtonWrapper,
    serverStatusMessage,
    updateUIForLoginState,
    buildArchivedFilesRequestParams, // <--- NUOVA IMPORTAZIONE
    //menuOverlay,
    triggerNavbarPulse,
    getDeviceInfo
} from '/js/utils.js';
import { fetchAndCacheDropdownData, fetchAndCacheArchivedFiles } from '/js/prefetch.js';

// Variabili per gli elementi DOM specifici della pagina che verranno passati da index.js
// Queste variabili mantengono i riferimenti DOM tra le chiamate delle funzioni di login.js
let googleLoginSectionForUIUpdate = null;
let resultDivForUIUpdate = null;
// NEW: Riferimento per lo spinner di logout
let logoutSpinner = null;

/**
 * Mostra un messaggio di risultato nel div specificato.
 * @param {string} messageHtml - Il messaggio HTML da visualizzare.
 * @param {string} type - Il tipo di messaggio ('info', 'success', 'error').
 */
function displayResult(messageHtml, type = 'info') {
    if (resultDivForUIUpdate) {
        resultDivForUIUpdate.innerHTML = messageHtml;
        resultDivForUIUpdate.classList.remove('hidden'); // Rimuove la classe hidden
        // Pulisci le classi di stato precedenti
        resultDivForUIUpdate.classList.remove('text-green-600', 'text-red-600', 'text-gray-600');
        // Aggiungi le classi appropriate
        if (type === 'success') {
            resultDivForUIUpdate.classList.add('text-green-600');
        } else if (type === 'error') {
            resultDivForUIUpdate.classList.add('text-red-600');
        } else {
            resultDivForUIUpdate.classList.add('text-gray-600');
        }
        // Assicurati che il div sia sempre visibile quando ha contenuto
        if (resultDivForUIUpdate.innerHTML.trim() !== '') {
            resultDivForUIUpdate.classList.remove('hidden');
        }
    }
}



/**
 * Funzione di callback per Google Identity Services. Gestisce la risposta dopo il login di Google.
 * @param {Object} response - L'oggetto risposta delle credenziali da Google.
 */
export async function handleCredentialResponse(response) {

    if (!response.credential) {
        displayResult('Error: Credential not found in response.', 'error');
        console.error('LOGIN.JS: Credential not found in response.');
        return;
    }

    const idToken = response.credential;
    console.log("Received idToken from Google:", idToken.substring(0, 20));

    // Per decodificare il payload lato frontend:
    try {
        const parts = idToken.split('.');
        const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))); // atob è per Base64, le replace sono per Base64Url-safe

        console.log("Payload dell'ID Token di Google decodificato lato frontend:", decodedPayload);
    } catch (error) {
        console.error("Errore durante la decodifica dell'ID Token lato frontend:", error);
    }


    // Assicurati che il div result sia visibile durante il processo
    displayResult('<p class="text-gray-600">Received ID Token from Google. Logging in...</p>', 'info');

    try {
        // Mostra lo spinner e il messaggio di attesa
        if (googleAuthButtonWrapper) googleAuthButtonWrapper.classList.add('hidden');
        if (backendLoadingSpinner) backendLoadingSpinner.classList.remove('hidden');
        if (waitingForBackendMessage) waitingForBackendMessage.classList.remove('hidden');

       

        // --- Ottieni Timezone, DateLocal e TimeLocal ---
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Es. "Europe/Rome"
        // Formatta la data e l'ora locali
        const dateLocal = now.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }); // Es. "07/06/2025"
        const timeLocal = now.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }); // Es. "23:25:03"

        // --- NUOVO: Recupera le informazioni sul dispositivo usando getDeviceInfo ---
        const deviceInfo = getDeviceInfo();
        console.log("LOGIN.JS: Device Info:", deviceInfo);
        


        // --- CONSOLE.LOG PER TRACCIARE LA CHIAMATA DI LOGIN ---
        console.log(`LOGIN.JS: Effettuo chiamata al backend per il login: ${window.BACKEND_BASE_URL}/api/google-login`);
        console.log(`LOGIN.JS: ID Token inviato (primi 20 caratteri): ${response.credential.substring(0, 20)}...`);

        // Invia l'ID token al backend per la verifica e l'autorizzazione
        const res = await fetch(`${window.BACKEND_BASE_URL}/api/auth/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            // --- NUOVO: Aggiungi i dati nel corpo della richiesta JSON ---
            body: JSON.stringify({
                timeZone: timeZone,
                dateLocal: dateLocal,
                timeLocal: timeLocal,
                deviceInfo: deviceInfo, // Aggiungi le informazioni sul dispositivo
            }),
            credentials: 'include' // Include i cookie per il token JWT
        });

        const data = await res.json();
        console.log('Backend response:', data);

        // Nascondi spinner e messaggio di attesa indipendentemente dal risultato
        if (backendLoadingSpinner) backendLoadingSpinner.classList.add('hidden');
        if (waitingForBackendMessage) waitingForBackendMessage.classList.add('hidden');

        if (data.success) {
            displayResult(`<p class="font-semibold">Login successful! Welcome ${data.googleName}.</p>`, 'success');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(data));
            // Passa gli elementi specifici della pagina come parametri alla funzione di utilità
            updateUIForLoginState(true, data, googleLoginSectionForUIUpdate);
            // TRIGGER NUOVA FUNZIONE: Attiva la pulsazione della navbar subito dopo il login
            triggerNavbarPulse();
            // Avvia il pre-fetching dei dati dopo un login riuscito (simultaneamente alla pulsazione)
            ///await fetchAndCacheDropdownData(); non so perchè await
            await fetchAndCacheDropdownData();

            // Avvia il pre-fetching dei file archiviati per l'autore
            console.log('Login.js: Pre-fetching archive data after successful login...');
            // La funzione `buildArchivedFilesRequestParams` gestirà questo correttamente
            // impostando il filtro a `all` per Admin/Headmaster/Deputy/Staff
            // e usando `googleName` per Teacher.
            const { cacheKey, postBody } = buildArchivedFilesRequestParams(data, ''); // Passa 'data' come userData e una stringa vuota per il filtro manuale
            // Esegue la chiamata solo se la cacheKey è stata costruita (per prevenire chiamate con profili non validi)
            // La funzione buildArchivedFilesRequestParams già gestisce i casi di userData non valido.
            await fetchAndCacheArchivedFiles(cacheKey, 'drive/list', postBody);

        } else {
            console.warn('LOGIN.JS: Login fallito:', data.message);
            displayResult(`<p>Login failed: ${data.message}</p>`, 'error');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            localStorage.clear(); // Pulisce eventuali dati residui
            updateUIForLoginState(false, null, googleLoginSectionForUIUpdate);
        }
    } catch (error) {
        console.error('Error contacting backend:', error);
        displayResult(`<p>Error contacting Server: ${error.message || error}</p>`, 'error');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.clear(); // Pulisce eventuali dati residui
        updateUIForLoginState(false, null, googleLoginSectionForUIUpdate);
    } finally {
        if (backendLoadingSpinner) backendLoadingSpinner.classList.add('hidden');
        if (waitingForBackendMessage) waitingForBackendMessage.classList.add('hidden');
       
        // Non nascondere il bottone se il login non è riuscito
        if (!localStorage.getItem('isLoggedIn') && googleAuthButtonWrapper) {
            googleAuthButtonWrapper.classList.remove('hidden');
        }
        if (serverStatusMessage) serverStatusMessage.innerHTML = ''; // Pulisci il messaggio di stato del server   
    }
}

/**
 * Gestisce il processo di logout dell'utente.
 */
export async function logout() {
    // NEW: Mostra lo spinner e il messaggio di logout
    if (logoutSpinner) logoutSpinner.classList.remove('hidden');
    displayResult('<p class="text-gray-600">Logging out...</p>', 'info'); // Mostra subito il messaggio di logout
    // CONSOLE.LOG PER TRACCIARE LA CHIAMATA DI LOGOUT DAL FRONTEBD
    console.log(`LOGIN.JS: Effettuo chiamata al backend per il logout: ${window.BACKEND_BASE_URL}/api/logout`);

    /// NEW: Reindirizza immediatamente --> no fatto dopo
    // Sposta questa riga qui per un reindirizzamento più rapido, no perchè non riesce a passare i dati al logout
    //window.location.replace("/index.html");

    try {
        // Recupera i dati dell'utente dal localStorage prima di rimuoverli
        const userData = JSON.parse(localStorage.getItem('userData'));

        const userEmail = userData.email;
        const userName = userData.googleName || 'Unknown User'; // Usa il nome da userData o un fallback
        const userProfile = userData.profile || 'Unknown Profile'; // Usa il profilo da userData o un fallback

        console.log(`LOGIN.JS: Dati di logout inviati: Email=${userEmail}, Nome=${userName}, Profilo=${userProfile}`);

        // --- Ottieni Timezone, DateLocal e TimeLocal anche per il Logout ---
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Es. "Europe/Rome"
        const dateLocal = now.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }); // Es. "07/06/2025"
        const timeLocal = now.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }); // Es. "23:25:03"


         // --- NUOVO: Recupera le informazioni sul dispositivo usando getDeviceInfo ---
        const deviceInfo = getDeviceInfo();
        console.log("LOGIN.JS: Device Info:", deviceInfo);

        // Invia una richiesta al backend per loggare l'attività di logout
        // Non è necessario inviare l'idToken qui, solo i dati per il log
        const res = await fetch(`${window.BACKEND_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                name: userName,
                profile: userProfile,
                timeZone: timeZone, // Aggiunto
                dateLocal: dateLocal, // Aggiunto
                timeLocal: timeLocal, // Aggiunto
                deviceInfo: deviceInfo, // Aggiungi le informazioni sul dispositivo
            }) // Invia nome, email e profilo
        });
        // Gestione della risposta del backend
        const data = await res.json();
        console.log('Backend logout response:', data);

        if (data.success) {
            displayResult('<p class="font-semibold">Server Logout Successful.</p>', 'success');
            console.log('Logout backend riuscito.');
        } else {
            displayResult(`<p>Server logout error: ${data.message}</p>`, 'error');
            console.error('Errore nel logout backend:', data.message);
        }
    } catch (error) {
        console.error('Errore durante la richiesta di logout al backend:', error);
        displayResult(`<p>Error while requesting logout to server: ${error.message || error}</p>`, 'error');
    } finally {
        // Indipendentemente dall'esito della richiesta al backend,
        // pulizia dello stato locale e della cache
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('dropdownData');
        localStorage.removeItem('dropdownDataTimestamp');
        localStorage.clear(); // Pulisce eventuali dati residui
        console.log('Stato locale e cache puliti dopo il logout.');
      
        // Aggiorna lo stato UI dopo il logout
        updateUIForLoginState(false, null, googleLoginSectionForUIUpdate);

        // Disabilita auto-select di Google Identity Services e re-renderizza il pulsante
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
            console.log('Google auto-select disabilitato.');
            // Il messaggio qui verrà sovrascritto dal reindirizzamento
            // displayResult('Google auto-select disabilitato.', 'info'); 
        }
        // Reindirizza alla pagina index.html dopo un breve ritardo per permettere di vedere il messaggio di logout
        // lo fa subito, ma il messaggio di logout viene mostrato prima del reindirizzamento.
        setTimeout(() => {
            window.location.replace("/index.html");
        }, 1500); // Ritardo di 1.5 secondi
        
        // NEW: Nascondi spinner e messaggio di logout una volta completata la pulizia
        if (logoutSpinner) logoutSpinner.classList.add('hidden');
    }
}

/**
 * Imposta i riferimenti DOM specifici della pagina che le funzioni di login.js useranno.
 * Deve essere chiamata dallo script della pagina (es. index.js) all'inizializzazione.
 * @param {HTMLElement} googleLoginSection - Riferimento alla sezione di login di Google.
 * @param {HTMLElement} resultDiv - Riferimento al div per i messaggi di risultato.
 */
export function setPageSpecificUIElements(googleLoginSection, resultDiv, spinner) {
    googleLoginSectionForUIUpdate = googleLoginSection;
    resultDivForUIUpdate = resultDiv;
    logoutSpinner = spinner; // NEW: Assegna il riferimento allo spinner di logout
    }

// Espone le funzioni di login e logout globalmente per l'uso con Google Identity Services
// e per retrocompatibilità con eventuali handler onclick nell'HTML.
window.handleCredentialResponse = handleCredentialResponse;
window.logout = logout;




/***********INIZIO PER SIMULAZIONE LOGINE E LOGOUT ***********/

// Simula un login utente per scopi di test.
export function simulateLogin() {
    const message = "Simulating login...";
    console.log(message);

    if (backendLoadingSpinner) backendLoadingSpinner.classList.remove('hidden');
    if (waitingForBackendMessage) waitingForBackendMessage.classList.remove('hidden');
    if (serverStatusMessage) serverStatusMessage.innerHTML = 'Simulating login...';
    if (googleAuthButtonWrapper) googleAuthButtonWrapper.classList.add('hidden');

    displayResult(`<p class="text-gray-600">Simulating login...</p>`, 'info');

    const mockUserData = {
        name: "Simulated User",
        profile: "Teachers",
        googleName: "Simulated Google Name",
        googlePicture: "https://placehold.co/100x100/aabbcc/ffffff?text=SU",
        email: "simulated.user@example.com"
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(mockUserData));
    const successMessage = `<p class="text-green-600 font-semibold">Simulated Login Successful!</p>`;
    displayResult(`<p class="font-semibold">Simulated Login Successful!</p>`, 'success');
    console.log(successMessage);
    // Passa gli elementi specifici della pagina come parametri alla funzione di utilità
    updateUIForLoginState(true, mockUserData, googleLoginSectionForUIUpdate);

    // TRIGGER NUOVA FUNZIONE: Attiva la pulsazione della navbar subito dopo il login simulato
    triggerNavbarPulse();

    // Avvia il pre-fetching dei dati dopo un login simulato (simultaneamente alla pulsazione)
    fetchAndCacheDropdownData();
    fetchAndCacheNewData('myOtherData', 'my-new-endpoint');

    if (backendLoadingSpinner) backendLoadingSpinner.classList.add('hidden');
    if (waitingForBackendMessage) waitingForBackendMessage.classList.add('hidden');
    if (serverStatusMessage) serverStatusMessage.innerHTML = '';
    if (googleAuthButtonWrapper) googleAuthButtonWrapper.classList.remove('hidden');
}


// Simula un logout utente per scopi di test.
export function simulateLogout() {
    const message = "Simulating logout...";
    console.log(message);
    displayResult(`<p class="text-gray-600">Simulating logout...</p>`, 'info');

    // Pulisci lo stato locale e la cache
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('dropdownData');
    localStorage.removeItem('dropdownDataTimestamp');
    localStorage.clear(); // Pulisce eventuali dati residui

    displayResult(`<p class="font-semibold">Simulated Logout Successful!</p>`, 'success');
    console.log(successMessage);
    // Aggiorna lo stato UI dopo il logout simulato
    updateUIForLoginState(false, null, googleLoginSectionForUIUpdate);

    if (backendLoadingSpinner) backendLoadingSpinner.classList.add('hidden');
    if (waitingForBackendMessage) waitingForBackendMessage.classList.add('hidden');
    if (serverStatusMessage) serverStatusMessage.innerHTML = '';
    if (googleAuthButtonWrapper) googleAuthButtonWrapper.classList.remove('hidden');
}


// TOGLIAMO I LISTENER DI SIMULAZIONE PERCHE NON UTILIZZATI PIU
/// Attacca i listener per i pulsanti di simulazione (se presenti nell'HTML di login.html).
/// Idealmente, questi listener dovrebbero essere gestiti dallo script principale della pagina (index.js).
/// Li manteniamo qui per retrocompatibilità se login.js venisse usato in una pagina che li definisce direttamente.
//document.addEventListener('DOMContentLoaded', () => {
//    const simulateLoginButton = document.getElementById('simulate-login-button');
//    const simulateLogoutButton = document.getElementById('simulate-logout-button');

//    if (simulateLoginButton) simulateLoginButton.addEventListener('click', simulateLogin);
//    if (simulateLogoutButton) simulateLogoutButton.addEventListener('click', logout); // Il logout simulato usa la funzione di logout vera
//});

/***********FINE PER SIMULAZIONE LOGINE E LOGOUT ***********/





