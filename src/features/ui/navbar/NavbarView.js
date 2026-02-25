// src/features/ui/navbar/NavbarView.js
import { UserModel } from '../../auth/UserModel.js';

export const NavbarView = {
    async render() {
        try {
            const response = await fetch('src/features/ui/navbar/navbar.html');
            const html = await response.text();
            
            const placeholder = document.getElementById('navbar-placeholder');
            if (!placeholder) return;
            placeholder.innerHTML = html;

            if (UserModel.isLoggedIn()) {
                const user = UserModel.getCurrentUser();
                this.renderAuthMenu(user);
            } else {
                const container = document.getElementById('auth-container');
                if (container) container.innerHTML = '';
            }
        } catch (error) {
            console.error("Errore nel caricamento della navbar:", error);
        }
    },

    renderAuthMenu(user) {
    const container = document.getElementById('auth-container');
    if (!container) return;

    // 1. Icona di default (quella che l'utente vede subito)
    const defaultIcon = "./assets/icons/navbar_icona_1_32px.png";

    container.innerHTML = `
        <div class="flex items-center space-x-6">
            <div class="flex flex-col text-right hidden md:flex text-blue-900">
                <span class="font-bold leading-tight">${user.username}</span>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">${user.profileName}</span>
            </div>

            <a href="#profile" title="My Profile" class="hover:scale-110 transition-transform relative">
                <img id="navbar-profile-img" 
                     src="${defaultIcon}" 
                     alt="Profilo" 
                     class="w-8 h-8 rounded-full border-2 border-blue-900 object-cover shadow-sm transition-opacity duration-300">
            </a>

            <a href="#dashboard" title="Home" class="hover:scale-110 transition-transform">
                <img src="./assets/icons/navbar_icona_2_32px.png" alt="Home" class="w-8 h-8 object-contain">
            </a>

            <button id="logout-btn" title="Logout" class="hover:scale-110 transition-transform">
                <img src="./assets/icons/navbar_icona_3_32px.png" alt="Logout" class="w-8 h-8 object-contain">
            </button>
        </div>
    `;

    // 2. Gestione asincrona dell'immagine di Google
    if (user.pictureUrl) {
        const imgLoader = new Image(); // Crea un oggetto immagine in memoria
        imgLoader.src = user.pictureUrl;

        imgLoader.onload = () => {
            // L'immagine è stata scaricata con successo!
            const profileImgElement = document.getElementById('navbar-profile-img');
            if (profileImgElement) {
                profileImgElement.style.opacity = '0'; // Effetto dissolvenza
                setTimeout(() => {
                    profileImgElement.src = user.pictureUrl;
                    profileImgElement.style.opacity = '1';
                }, 300);
            }
        };

        imgLoader.onerror = () => {
            console.warn("Impossibile caricare l'immagine di Google, rimango con quella di default.");
        };
    }

        // Listener Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            UserModel.logout();
            window.dispatchEvent(new CustomEvent('app:logout'));
        });
    }
};