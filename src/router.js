// src/router.js
import { WelcomeView } from './features/welcome/WelcomeView.js';
import { DashboardController } from './features/dashboard/DashboardController.js';
import { UserModel } from './features/auth/UserModel.js';
import { NavbarView } from './features/ui/navbar/NavbarView.js';

export const Router = {
    /**
     * Mappa delle rotte principali.
     * Associano l'hash dell'URL a un Controller o a una View.
     */
    routes: {
        'welcome': WelcomeView,
        'dashboard': DashboardController,
        // Qui aggiungerai le altre in futuro:
        // 'students': StudentsController,
    },

    /**
     * Funzione principale di navigazione
     */
    async navigate() {
        const hash = window.location.hash.replace('#', '') || 'welcome';
        const mainContainer = document.getElementById('main-content');

        // 1. Aggiornamento Navbar (per mostrare/nascondere tasti Login/Logout)
        await NavbarView.render();

        // 2. Logica di protezione (Guard)
        const isLoggedIn = UserModel.isLoggedIn();

        // Se l'utente non è loggato e prova ad andare ovunque tranne che sulla welcome
        if (!isLoggedIn && hash !== 'welcome') {
            window.location.hash = '#welcome';
            return;
        }

        // Se l'utente è loggato e prova a tornare sulla welcome, forzalo sulla dashboard
        if (isLoggedIn && hash === 'welcome') {
            window.location.hash = '#dashboard';
            return;
        }

        // 3. Esecuzione della rotta
        try {
            if (hash === 'dashboard') {
                // Deleghiamo tutto al Controller della Dashboard
                await DashboardController.init();
            } else if (hash === 'welcome') {
                await WelcomeView.render('main-content');
            } else {
                // Rotta non trovata: fallback su dashboard o welcome
                window.location.hash = isLoggedIn ? '#dashboard' : '#welcome';
            }
        } catch (error) {
            console.error(`Errore durante la navigazione verso ${hash}:`, error);
            mainContainer.innerHTML = `<p class="p-10 text-center text-red-500">Something went wrong during navigation.</p>`;
        }
    }
};

// Ascolta i cambiamenti dell'URL (per permettere i tasti avanti/indietro del browser)
window.addEventListener('hashchange', () => Router.navigate());