// js/login.js

// SOSTITUISCI CON L'URL DEL TUO BACKEND RENDER
const BACKEND_BASE_URL = 'https://google-api-backend-biu7.onrender.com';

// Elementi UI (alcuni verranno cercati dopo il caricamento della navbar)
const googleSignInButton = document.querySelector('.g_id_signin');
const mainLogoutButton = document.getElementById('main-logout-button');
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
let navbarLogoutButton;
let navbarUserInfo;
let desktopNavLinks;
let navbarSpacer; // Nuovo elemento spacer

// Funzione per inizializzare gli event listener della navbar
function initializeNavbarListeners() {
    mainNavbar = document.getElementById('main-navbar');
    navbarLogoutButton = document.getElementById('navbar-logout-button');
    navbarUserInfo = document.getElementById('navbar-user-info');
    desktopNavLinks = document.getElementById('desktop-nav-links');
    navbarSpacer = document.getElementById('navbar-spacer'); // Inizializza il nuovo spacer

    // Associa gli eventi ai bottoni di logout
    if (mainLogoutButton) mainLogoutButton.addEventListener('click', logout);
    if (navbarLogoutButton) navbarLogoutButton.addEventListener('click', logout);

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
}

// Funzione per aggiornare la UI in base allo stato di login
function updateUIForLoginState(isLoggedIn, userData = null) {
    // Assicurati che gli elementi della navbar e lo spacer siano disponibili
    if (!mainNavbar || !navbarUserInfo || !navbarLogoutButton || !desktopNavLinks || !navbarSpacer) { 
        console.warn("Navbar elements or spacer not yet available. Retrying UI update...");
        setTimeout(() => updateUIForLoginState(isLoggedIn, userData), 100);
        return;
    }

    if (isLoggedIn) {
        googleSignInButton.style.display = 'none';
        authenticatedContent.style.display = 'block';
        mainLogoutButton.style.display = 'none'; // Questo bottone non dovrebbe essere visibile ora

        if (userData) {
            // COSTRUISCI LA STRINGA HTML CON IMMAGINE, NOME GOOGLE E PROFILO DA SHEETS
            navbarUserInfo.innerHTML = `
                <img src="${userData.googlePicture}" alt="Profile" class="inline-block h-8 w-8 rounded-full mr-2 border border-gray-300">
                <span>${userData.googleName} (${userData.profile})</span>
            `;
            navbarUserInfo.classList.remove('hidden'); 
        } else {
            navbarUserInfo.classList.add('hidden');
            navbarUserInfo.innerHTML = ''; // Usa innerHTML anche qui per coerenza
        }
        
        desktopNavLinks.classList.remove('hidden');
        navbarLogoutButton.style.display = 'block';

        welcomeMessageDiv.textContent = 'Benvenuto! Sei loggato.'; 

    } else {
        googleSignInButton.style.display = 'inline-block';
        authenticatedContent.style.display = 'none';
        mainLogoutButton.style.display = 'none'; // Questo bottone non dovrebbe essere visibile ora
        
        desktopNavLinks.classList.add('hidden');
        navbarLogoutButton.style.display = 'none';

        navbarUserInfo.classList.add('hidden');
        navbarUserInfo.innerHTML = ''; // Usa innerHTML anche qui
        welcomeMessageDiv.textContent = '';
        resultDiv.innerHTML = '';
    }
    spinner.style.display = 'none';

    // Dopo aver aggiornato la visibilità degli elementi, ricalcola e applica l'altezza della navbar
    // Questo è cruciale per evitare il "salto"
    if (mainNavbar && navbarSpacer) {
        const navbarHeight = mainNavbar.offsetHeight; // Ottiene l'altezza calcolata della navbar
        navbarSpacer.style.height = `${navbarHeight}px`; // Imposta l'altezza dello spacer
    }
}

// Funzione di callback per Google Identity Services
async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Received idToken from Google:", idToken);

    spinner.style.display = 'block';
    resultDiv.innerHTML = '';

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
            updateUIForLoginState(false);
        }
    } catch (error) {
        console.error('Error contacting backend:', error);
        resultDiv.innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        updateUIForLoginState(false);
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
        updateUIForLoginState(false);
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
            console.log('Google auto-select disabilitato.');
        }
    }
}

// Funzione per simulare il login
function simulateLogin() {
    console.log("Simulating login...");
    const mockUserData = {
        name: "Simulato Utente", // Questo non verrà usato direttamente nella navbar aggiornata
        profile: "Teacher", // Questo verrà usato nella navbar
        googleName: "Simulato Google Name", // Questo verrà usato nella navbar
        googlePicture: "https://lh3.googleusercontent.com/a/ACg8ocKw_NnQZ2Q_C9d2n9Z_q_x_y_z_a_b_c_d_e=s96-c" // Esempio URL immagine
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(mockUserData));
    updateUIForLoginState(true, mockUserData);
    resultDiv.innerHTML = `<p class="text-green-600 font-semibold">Simulazione di Accesso Riuscita!</p>`;
}

// Funzione per simulare il logout
function simulateLogout() {
    console.log("Simulating logout...");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    updateUIForLoginState(false);
    resultDiv.innerHTML = `<p class="text-gray-600 font-semibold">Simulazione di Logout Riuscita!</p>`;
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


/*
// js/login.js

// SOSTITUISCI CON L'URL DEL TUO BACKEND RENDER
const BACKEND_BASE_URL = 'https://google-api-backend-biu7.onrender.com';

// Elementi UI (alcuni verranno cercati dopo il caricamento della navbar)
const googleSignInButton = document.querySelector('.g_id_signin');
const mainLogoutButton = document.getElementById('main-logout-button');
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
let navbarLogoutButton;
let navbarUserInfo;
let desktopNavLinks;
let navbarSpacer; // Nuovo elemento spacer

// Funzione per inizializzare gli event listener della navbar
function initializeNavbarListeners() {
    mainNavbar = document.getElementById('main-navbar');
    navbarLogoutButton = document.getElementById('navbar-logout-button');
    navbarUserInfo = document.getElementById('navbar-user-info');
    desktopNavLinks = document.getElementById('desktop-nav-links');
    navbarSpacer = document.getElementById('navbar-spacer'); // Inizializza il nuovo spacer

    // Associa gli eventi ai bottoni di logout
    if (mainLogoutButton) mainLogoutButton.addEventListener('click', logout);
    if (navbarLogoutButton) navbarLogoutButton.addEventListener('click', logout);

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
}

// Funzione per aggiornare la UI in base allo stato di login
function updateUIForLoginState(isLoggedIn, userData = null) {
    // Assicurati che gli elementi della navbar e lo spacer siano disponibili
    if (!mainNavbar || !navbarUserInfo || !navbarLogoutButton || !desktopNavLinks || !navbarSpacer) { 
        console.warn("Navbar elements or spacer not yet available. Retrying UI update...");
        setTimeout(() => updateUIForLoginState(isLoggedIn, userData), 100);
        return;
    }

    if (isLoggedIn) {
        googleSignInButton.style.display = 'none';
        authenticatedContent.style.display = 'block';
        mainLogoutButton.style.display = 'none';

        if (userData) {
            navbarUserInfo.textContent = `${userData.name} (${userData.profile})`;
            navbarUserInfo.classList.remove('hidden'); 
        } else {
            navbarUserInfo.classList.add('hidden');
            navbarUserInfo.textContent = '';
        }
        
        desktopNavLinks.classList.remove('hidden');
        navbarLogoutButton.style.display = 'block';

        welcomeMessageDiv.textContent = 'Benvenuto! Sei loggato.'; 

    } else {
        googleSignInButton.style.display = 'inline-block';
        authenticatedContent.style.display = 'none';
        mainLogoutButton.style.display = 'none';
        
        desktopNavLinks.classList.add('hidden');
        navbarLogoutButton.style.display = 'none';

        navbarUserInfo.classList.add('hidden');
        navbarUserInfo.textContent = '';

        welcomeMessageDiv.textContent = '';
        resultDiv.innerHTML = '';
    }
    spinner.style.display = 'none';

    // Dopo aver aggiornato la visibilità degli elementi, ricalcola e applica l'altezza della navbar
    // Questo è cruciale per evitare il "salto"
    if (mainNavbar && navbarSpacer) {
        const navbarHeight = mainNavbar.offsetHeight; // Ottiene l'altezza calcolata della navbar
        navbarSpacer.style.height = `${navbarHeight}px`; // Imposta l'altezza dello spacer
    }
}

// Funzione di callback per Google Identity Services
async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Received idToken from Google:", idToken);

    spinner.style.display = 'block';
    resultDiv.innerHTML = '';

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
            localStorage.setItem('userData', JSON.stringify(data.user));
            updateUIForLoginState(true, data.user);
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Accesso negato: ${data.message}</p>`;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            updateUIForLoginState(false);
        }
    } catch (error) {
        console.error('Error contacting backend:', error);
        resultDiv.innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        updateUIForLoginState(false);
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
        updateUIForLoginState(false);
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
            console.log('Google auto-select disabilitato.');
        }
    }
}

// Funzione per simulare il login
function simulateLogin() {
    console.log("Simulating login...");
    const mockUserData = {
        name: "Simulato Utente",
        email: "simulato.utente@marist.school",
        profile: "Teacher" // o "Admin" per testare diversi profili
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(mockUserData));
    updateUIForLoginState(true, mockUserData);
    resultDiv.innerHTML = `<p class="text-green-600 font-semibold">Simulazione di Accesso Riuscita!</p>`;
}

// Funzione per simulare il logout
function simulateLogout() {
    console.log("Simulating logout...");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    updateUIForLoginState(false);
    resultDiv.innerHTML = `<p class="text-gray-600 font-semibold">Simulazione di Logout Riuscita!</p>`;
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


*/