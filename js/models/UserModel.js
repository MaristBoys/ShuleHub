// Il modello gestisce l'identità dell'utente e i suoi permessi, applicando la logica del SessionStorage.

// js/models/UserModel.js
import { storage } from '../core/storage.js';

export const UserModel = {
    /**
     * Inizializza la sessione utente dopo il login.
     * Mappiamo i campi che arrivano dal backend Java (googleName, profile, etc.)
     */
    saveUser(userData) {
        const sessionInfo = {
            username: userData.username,
            // Mapping per la navbar: usiamo googleName come nome principale
            name: userData.googleName || userData.username, 
            profile: userData.profile, // Es: "ADMIN", "TEACHER"
            permissions: userData.permissions || []
        };
        
        storage.setSession('currentUser', sessionInfo);
        storage.setSession('isLoggedIn', true);
    },

    getCurrentUser() {
        return storage.getSession('currentUser');
    },

    isLoggedIn() {
        return storage.getSession('isLoggedIn') === true;
    },

    logout() {
        storage.clearAll();
        window.location.href = '/ShuleHub/index.html';
    }
};