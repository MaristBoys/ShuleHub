// Questo file è il gestore unico della memoria del browser.
// src/core/storage.js

export const storage = {
    // --- LocalStorage (Cache a lungo termine) ---
    setCache(key, data) {
        const item = {
            value: data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    getCache(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data).value : null;
    },

    // --- SessionStorage (Dati sessione e UI) ---
    setSession(key, data) {
        sessionStorage.setItem(key, JSON.stringify(data));
    },

    getSession(key) {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    clearAll() {
        localStorage.clear();
        sessionStorage.clear();
    }
};