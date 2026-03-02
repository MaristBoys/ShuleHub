// Il modello gestisce l'identità dell'utente e i suoi permessi, applicando la logica del SessionStorage.

// js/models/UserModel.js
import { storage } from '../../core/storage.js';

export const UserModel = {
    /**
     * Inizializza la sessione utente dopo il login.
     * Mappiamo i campi che arrivano dal backend Java (googleName, profile, etc.)
     */
    saveUser(apiResponse) {
        // NOTA: userData è il contenuto di "data" nell'ApiResponse del backend
        const userData = apiResponse.data; 

        const sessionInfo = { //mappato come il DTO che arriva dal Backend
            userId: userData.userId,         
            username: userData.username,     
            email: userData.email,           
            profileId: userData.profileId,   
            profileName: userData.profileName,
            pictureUrl: userData.pictureUrl,
            googleName: userData.googleName, 
            permissions: userData.permissions || [],
            teacherContext: userData.teacherContext || null
        };
        
        storage.setSession('currentUser', sessionInfo);
        storage.setSession('isLoggedIn', true);
        
        // Opzionale: stampa per debug
        console.log("Sessione salvata nel SessionStorage:", sessionInfo);
    },

    getCurrentUser() {
        return storage.getSession('currentUser');
    },

    isLoggedIn() {
        return storage.getSession('isLoggedIn') === true;
    },

    logout() {
        storage.clearAll();
        // Lanciamo un evento globale per notificare il resto dell'app che l'utente ha effettuato il logout
        // esempio alla navbar che deve aggiornare i tasti, o al router che deve reindirizzare alla welcome
        window.dispatchEvent(new CustomEvent('app:logout'));
    }
};