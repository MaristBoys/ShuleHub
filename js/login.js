// js/login.js

// SOSTITUISCI CON L'URL DEL TUO BACKEND RENDER
const BACKEND_BASE_URL = 'https://google-api-backend-biu7.onrender.com';

// Elementi UI (alcuni verranno cercati dopo il caricamento della navbar)
const googleSignInButton = document.querySelector('.g_id_signin');
// Riferimento al wrapper del pulsante Google
const googleButtonWrapper = document.querySelector('.google-button-wrapper'); 

const spinner = document.getElementById('spinner');
const resultDiv = document.getElementById('result');
const welcomeMessageDiv = document.getElementById('welcome-message');
const authenticatedContent = document.getElementById('authenticated-content');
const themeToggleButton = document.getElementById('theme-toggle');

// Nuovi elementi per la simulazione
const simulateLoginButton = document.getElementById('simulate-login-button');
const simulateLogoutButton = document.getElementById('simulate-logout-button');

// Variabili per gli elementi della navbar che verranno inizializzati dopo il caricamento
let mainNavbar;
let navbarUserInfo; // Info utente desktop (rimane per la parte centrale della navbar)

// Elementi del menu universale (dropdown)
let hamburgerIcon;
let mobileMenuOverlay;
let mobileLogoutLink; // Bottone logout mobile
let navbarSpacer;

// Funzione per inizializzare gli event listener della navbar
function initializeNavbarListeners() {
    mainNavbar = document.getElementById('main-navbar');
    navbarUserInfo = document.getElementById('navbar-user-info');
    navbarSpacer = document.getElementById('navbar-spacer');

    // Elementi del menu universale
    hamburgerIcon = document.getElementById('hamburger-icon');
    mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    mobileLogoutLink = document.getElementById('mobile-logout-link'); // Questo è l'unico bottone di logout

    // Associa l'evento al bottone di logout (unico)
    if (mobileLogoutLink) mobileLogoutLink.addEventListener('click', logout);

    // Gestione dello sfondo della navbar al passaggio del mouse
    if (mainNavbar) {
        mainNavbar.addEventListener('mouseenter', () => {
            if (mainNavbar.classList.contains('bg-transparent')) {
                mainNavbar.classList.remove('bg-transparent');
                mainNavbar.classList.add('bg-gray-800', 'bg-opacity-90');
            }
        });

        mainNavbar.addEventListener('mouseleave', () => {
            if (mainNavbar.classList.contains('bg-gray-800')) {
                mainNavbar.classList.remove('bg-gray-800', 'bg-opacity-90');
                mainNavbar.classList.add('bg-transparent');
            }
        });
    }

    // Listener per i pulsanti di simulazione
    if (simulateLoginButton) simulateLoginButton.addEventListener('click', simulateLogin);
    if (simulateLogoutButton) simulateLogoutButton.addEventListener('click', simulateLogout);

    // Listener per l'apertura/chiusura del menu universale (dropdown)
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Impedisce che il click si propaghi al document
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.toggle('hidden'); // Toggle la visibilità
            }
        });
    }

    // Chiudi il dropdown se si clicca fuori
    document.addEventListener('click', (event) => {
        if (mobileMenuOverlay && !mobileMenuOverlay.contains(event.target) && !hamburgerIcon.contains(event.target)) {
            mobileMenuOverlay.classList.add('hidden');
        }
    });
}

// Funzione per aggiornare la UI in base allo stato di login
function updateUIForLoginState(isLoggedIn, userData = null, clearResult = true) {
    // Assicurati che gli elementi della navbar e lo spacer siano disponibili
    if (!mainNavbar || !navbarUserInfo || !navbarSpacer || !mobileLogoutLink || !hamburgerIcon || !googleButtonWrapper) {
        console.warn("Navbar elements or spacer not yet available. Retrying UI update...");
        setTimeout(() => updateUIForLoginState(isLoggedIn, userData, clearResult), 100);
        return;
    }

    if (isLoggedIn) {
        // Nascondi il wrapper del pulsante Google aggiungendo la classe hidden
        googleButtonWrapper.classList.add('hidden'); 
        authenticatedContent.style.display = 'block';
        hamburgerIcon.classList.remove('hidden'); // Mostra l'icona hamburger

        // Aggiorna info utente desktop (parte centrale della navbar)
        if (userData) {
            navbarUserInfo.innerHTML = `
                <img src="${userData.googlePicture}" alt="Profile" class="inline-block h-8 w-8 rounded-full mr-2 border border-gray-300">
                <span>${userData.googleName} (${userData.profile})</span>
            `;
            navbarUserInfo.classList.remove('hidden'); 
            mobileLogoutLink.classList.remove('hidden'); // Mostra il bottone logout nel menu
        } else {
            navbarUserInfo.classList.add('hidden');
            navbarUserInfo.innerHTML = '';
            mobileLogoutLink.classList.add('hidden'); // Nasconde il bottone logout nel menu
        }
        
        welcomeMessageDiv.textContent = 'Benvenuto! Sei loggato.'; 

    } else {
        // Mostra il wrapper del pulsante Google rimuovendo la classe hidden
        googleButtonWrapper.classList.remove('hidden'); 
        authenticatedContent.style.display = 'none';
        hamburgerIcon.classList.add('hidden'); // Nasconde l'icona hamburger
        
        navbarUserInfo.classList.add('hidden');
        navbarUserInfo.innerHTML = '';
        mobileLogoutLink.classList.add('hidden'); // Nasconde il bottone logout nel menu

        welcomeMessageDiv.textContent = '';
    }
    spinner.style.display = 'none';

    // Dopo aver aggiornato la visibilità degli elementi, ricalcola e applica l'altezza della navbar
    if (mainNavbar && navbarSpacer) {
        const navbarHeight = mainNavbar.offsetHeight;
        navbarSpacer.style.height = `${navbarHeight}px`;
    }
}

// Funzione di callback per Google Identity Services
async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Received idToken from Google:", idToken);

    spinner.style.display = 'block';
    resultDiv.innerHTML = ''; // Puliamo il resultDiv qui all'inizio di ogni tentativo

    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        const data = await res.json();
        console.log('Backend response:', data);

        if (data.success) {
            resultDiv.innerHTML = `<p class="text-green-600 font-semibold">Accesso riuscito!</p>`;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(data)); 
            updateUIForLoginState(true, data); 
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Accesso negato: ${data.message}</p>`;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            updateUIForLoginState(false, null, false); 
        }
    } catch (error) {
        console.error('Error contacting backend:', error);
        resultDiv.innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        updateUIForLoginState(false, null, false);
    } finally {
        spinner.style.display = 'none';
    }
}

// Funzione per gestire il logout (reale)
async function logout() {
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        console.log('Backend logout response:', data);

        if (data.success) {
            console.log('Logout backend riuscito.');
        } else {
            console.error('Errore nel logout backend:', data.message);
        }
    } catch (error) {
        console.error('Errore durante la richiesta di logout al backend:', error);
    } finally {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        resultDiv.innerHTML = ''; 
        // Chiudi il menu universale se aperto al logout
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('hidden');
        }
        updateUIForLoginState(false); // Questo rende il wrapper visibile

        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
            console.log('Google auto-select disabilitato.');

            // *** NUOVA LOGICA: Forzare il re-rendering del pulsante Google ***
            const googleButtonContainer = document.querySelector('.g_id_signin');
            if (googleButtonContainer) {
                // Pulisci qualsiasi contenuto esistente che Google potrebbe aver renderizzato (es. iframe)
                googleButtonContainer.innerHTML = ''; 
                google.accounts.id.renderButton(
                    googleButtonContainer, // Il div dove il pulsante dovrebbe essere renderizzato
                    {   // Configurazione del pulsante, deve corrispondere a quella in index.html
                        type: "standard",
                        size: "large",
                        theme: "outline",
                        text: "sign_in_with",
                        shape: "rectangular",
                        logo_alignment: "left"
                    }
                );
                console.log('Google button re-render richiesto.');
            }
        }
    }
}

// Funzione per simulare il login
function simulateLogin() {
    console.log("Simulating login...");
    const mockUserData = {
        name: "Simulato Utente",
        profile: "Teacher",
        googleName: "Simulato Google Name",
        googlePicture: "https://placehold.co/100x100/aabbcc/ffffff?text=SU" // Esempio URL immagine
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(mockUserData));
    resultDiv.innerHTML = `<p class="text-green-600 font-semibold">Simulazione di Accesso Riuscita!</p>`;
    updateUIForLoginState(true, mockUserData);
}

// Funzione per simulare il logout
function simulateLogout() {
    console.log("Simulating logout...");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    resultDiv.innerHTML = `<p class="text-gray-600 font-semibold">Simulazione di Logout Riuscita!</p>`;
    updateUIForLoginState(false);
}

// Inizializzazione principale al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }
});

// Espone la funzione per l'inizializzazione esterna (chiamata da index.html dopo il caricamento della navbar)
window.initializeNavbarElements = initializeNavbarListeners;
