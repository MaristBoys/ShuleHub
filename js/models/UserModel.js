// Il modello gestisce l'identità dell'utente e i suoi permessi, applicando la logica del SessionStorage.

// js/models/UserModel.js
import { storage } from '../core/storage.js';

export const UserModel = {
    // Salva i dati utente e permessi (ma non il token, che è nel Cookie)
    initSession(userData) {
        const sessionInfo = {
            username: userData.username,
            googleName: userData.googleName,
            profile: userData.profile,
            permissions: userData.permissions || []
        };
        storage.setSession('currentUser', sessionInfo);
        storage.setSession('isLoggedIn', true);
    },

    getCurrentUser() {
        return storage.getSession('currentUser');
    },

    hasPermission(permission) {
        const user = this.getCurrentUser();
        return user ? user.permissions.includes(permission) : false;
    },

    logout() {
        storage.clearAll();
        window.location.href = '/index.html';
    }
};