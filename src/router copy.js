// src/router.js

import { WelcomeView } from './features/welcome/WelcomeView.js';
// import { DashboardView } from './features/dashboard/DashboardView.js';
// import { ProfileView } from './features/profile/ProfileView.js';
import { UserModel } from './features/auth/UserModel.js';
import { NavbarView } from './features/ui/navbar/NavbarView.js';

export const Router = {
    // Mappa delle rotte
    routes: {
        'welcome': WelcomeView,
        // 'dashboard': DashboardView,
        // 'students': StudentsView,
    },

    async navigate() {
        const mainContainer = document.getElementById('main-content');
        // AGGIORNAMENTO DINAMICO: Ogni volta che navighiamo, 
        // la Navbar deve ricontrollare se l'utente è loggato.
        await NavbarView.render();

        // Logica di protezione: se non sei loggato, vai sempre alla welcome
        if (!UserModel.isLoggedIn()) {
            return await WelcomeView.render('main-content');
        }

        // Se sei loggato, decidiamo cosa mostrare (per ora solo placeholder)
        mainContainer.innerHTML = `
            <div class="p-10 text-center animate-fade-in">
                <h1 class="text-2xl font-black text-blue-900">SHULEHUB DASHBOARD</h1>
                <p class="text-gray-500">Welcome back, ${UserModel.getCurrentUser().username}</p>
                <div class="mt-4 p-4 bg-blue-50 rounded-xl inline-block">
                    Status: <span class="text-green-600 font-bold">Authenticated</span>
                </div>
            </div>
        `;
    }
};