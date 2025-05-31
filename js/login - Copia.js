// js/login.js

// SOSTITUISCI CON L'URL DEL TUO BACKEND RENDER
const BACKEND_BASE_URL = 'https://google-api-backend-biu7.onrender.com';

// Elementi UI
const googleSignInButton = document.querySelector('.g_id_signin');
const mainLogoutButton = document.getElementById('main-logout-button');
const navbarLogoutButton = document.getElementById('navbar-logout-button'); // Nuovo bottone logout nella navbar
const spinner = document.getElementById('spinner');
const resultDiv = document.getElementById('result');
const welcomeMessageDiv = document.getElementById('welcome-message'); // Messaggio di benvenuto nel contenuto protetto
const authenticatedContent = document.getElementById('authenticated-content'); // Contenuto visibile solo dopo login
const mainNavbar = document.getElementById('main-navbar'); // La navbar
const navbarUserInfo = document.getElementById('navbar-user-info'); // Info utente nella navbar
const themeToggleButton = document.getElementById('theme-toggle'); // Bottone tema

// Funzione per aggiornare la UI in base allo stato di login
function updateUIForLoginState(isLoggedIn, userData = null) {
    if (isLoggedIn) {
        // Nasconde il bottone Google e mostra il contenuto autenticato
        googleSignInButton.style.display = 'none';
        authenticatedContent.style.display = 'block';
        mainLogoutButton.style.display = 'none'; // Il bottone principale di logout non serve se c'è la navbar

        // Aggiorna la navbar
        mainNavbar.classList.remove('hidden'); // Rende visibile la navbar
        if (userData) {
            navbarUserInfo.textContent = `${userData.name} (${userData.profile})`;
            navbarUserInfo.classList.remove('hidden'); // Mostra info utente
            welcomeMessageDiv.textContent = `Benvenuto, ${userData.name} (${userData.profile})`;
        }
        navbarLogoutButton.style.display = 'block'; // Mostra bottone logout nella navbar

    } else {
        // Mostra il bottone Google e nasconde il contenuto autenticato
        googleSignInButton.style.display = 'inline-block'; // Torna a inline-block per il bottone Google
        authenticatedContent.style.display = 'none';
        mainLogoutButton.style.display = 'none'; // Nasconde il bottone principale di logout

        // Nasconde la navbar
        mainNavbar.classList.add('hidden');
        navbarUserInfo.classList.add('hidden');
        navbarUserInfo.textContent = '';
        navbarLogoutButton.style.display = 'none';

        welcomeMessageDiv.textContent = '';
        resultDiv.innerHTML = ''; // Pulisce il div dei risultati
    }
    spinner.style.display = 'none'; // Assicurati che lo spinner sia nascosto
}

// Funzione di callback per Google Identity Services
async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Ricevuto idToken da Google:", idToken);

    spinner.style.display = 'block';
    resultDiv.innerHTML = ''; // Pulisce il contenuto precedente

    try {
        // Invia l'idToken al backend nell'header Authorization
        const res = await fetch(`${BACKEND_BASE_URL}/api/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}` // Invia come Bearer token
            }
        });

        const data = await res.json();
        console.log('Risposta backend:', data);

        if (data.success) {
            resultDiv.innerHTML = `<p class="text-green-600 font-semibold">Accesso riuscito!</p>`;
            // Memorizza lo stato di login e i dati utente
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(data.user));
            updateUIForLoginState(true, data.user); // Aggiorna la UI
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Accesso negato: ${data.message}</p>`;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            updateUIForLoginState(false); // Aggiorna la UI
        }
    } catch (error) {
        console.error('Errore nel contattare il backend:', error);
        resultDiv.innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        updateUIForLoginState(false); // Aggiorna la UI
    } finally {
        spinner.style.display = 'none'; // Nasconde lo spinner in ogni caso
    }
}

// Funzione per gestire il logout
async function logout() {
    try {
        // Invalida la sessione lato backend (cancella il cookie)
        const res = await fetch(`${BACKEND_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        console.log('Risposta logout backend:', data);

        if (data.success) {
            console.log('Logout backend riuscito.');
        } else {
            console.error('Errore nel logout backend:', data.message);
        }
    } catch (error) {
        console.error('Errore durante la richiesta di logout al backend:', error);
    } finally {
        // Cancella lo stato locale indipendentemente dal successo del backend (per consistenza UI)
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');

        // Aggiorna la UI per lo stato di non loggato
        updateUIForLoginState(false);

        // Funzionalità opzionale: Disabilita l'auto-selezione di Google
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
            console.log('Google auto-select disabilitato.');
        }
    }
}

// Inizializzazione all'avvio della pagina
window.onload = () => {
    // Controlla lo stato di login all'avvio
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let userData = null;
    if (isLoggedIn) {
        try {
            userData = JSON.parse(localStorage.getItem('userData'));
        } catch (e) {
            console.error("Errore nel parsing di userData da localStorage:", e);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            isLoggedIn = false; // Forza il logout se i dati sono corrotti
        }
    }
    updateUIForLoginState(isLoggedIn, userData);

    // Associa l'evento al bottone di logout (sia quello principale che quello nella navbar)
    mainLogoutButton.addEventListener('click', logout);
    navbarLogoutButton.addEventListener('click', logout);

    // Gestione del tema chiaro/scuro
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Gestione dello sfondo della navbar al passaggio del mouse
    mainNavbar.addEventListener('mouseenter', () => {
        if (mainNavbar.classList.contains('bg-transparent')) {
            mainNavbar.classList.remove('bg-transparent');
            mainNavbar.classList.add('bg-gray-800', 'bg-opacity-90'); // Sfondo grigio semi-trasparente
        }
    });

    mainNavbar.addEventListener('mouseleave', () => {
        if (mainNavbar.classList.contains('bg-gray-800')) {
            mainNavbar.classList.remove('bg-gray-800', 'bg-opacity-90');
            mainNavbar.classList.add('bg-transparent');
        }
    });
};








/*
async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Ricevuto idToken:", idToken);

    // Mostra lo spinner
    const spinner = document.getElementById('spinner');
    const resultDiv = document.getElementById('result');
    spinner.style.display = 'block';
    resultDiv.innerHTML = ''; // Pulisce il contenuto precedente

    try {
        const backendUrl = 'https://google-api-backend-biu7.onrender.com/auth';
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        const data = await res.json();
        console.log('Risposta backend:', data);

        // Nasconde lo spinner
        spinner.style.display = 'none';

        if (data.success) {
            resultDiv.innerHTML = `<h2>Benvenuto, ${data.name}</h2><p>Profilo: ${data.profile}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Accesso negato: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Errore:', error);
        spinner.style.display = 'none'; // Nasconde lo spinner in caso di errore
        resultDiv.innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
    }

}
*/
