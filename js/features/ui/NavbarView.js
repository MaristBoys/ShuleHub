// js/features/ui/NavbarView.js
import { UserModel } from '../auth/UserModel.js';

export const NavbarView = {
    async render() {
        try {
            const response = await fetch('components/navbar.html');
            const html = await response.text();
            document.getElementById('navbar-placeholder').innerHTML = html;

            const user = UserModel.getCurrentUser();
            if (user && UserModel.isLoggedIn()) {
                this.renderAuthMenu(user);
            } else {
                this.renderLoginButton();
            }
        } catch (error) {
            console.error("Errore nel caricamento della navbar:", error);
        }
    },

    renderAuthMenu(user) {
        const container = document.getElementById('auth-container');
        if (!container) return;

        // Se l'immagine di Google non c'è, usiamo l'icona profile di default
        const userImage = user.pictureUrl 
        ? `<img src="${user.pictureUrl}" alt="Profilo" class="w-8 h-8 rounded-full border-2 border-blue-900 object-cover shadow-sm">`
        : `<img src="./assets/navbar_icona_1_32px.png" alt="Home" class="w-8 h-8 object-contain">`;

        container.innerHTML = `
        <div class="flex items-center space-x-6">
            <div class="flex flex-col text-right">
                <a href="pages/scheda-utente.html" class="font-bold text-blue-900 hover:text-blue-700 transition-colors">
                    ${user.username}
                </a>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    ${user.profileName}
                </span>
            </div>

            <a href="pages/scheda-utente.html" title="My Profile" class="hover:scale-110 transition-transform">
                ${userImage}
            </a>

            <a href="index.html" title="Home" class="hover:scale-110 transition-transform">
                <img src="./assets/navbar_icona_2_32px.png" alt="Home" class="w-8 h-8 object-contain">
            </a>

            <button id="logout-btn" title="Logout" class="hover:scale-110 transition-transform focus:outline-none">
                <img src="./assets/navbar_icona_3_32px.png" alt="Logout" class="w-8 h-8 object-contain">
            </button>
        </div>
    `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            UserModel.logout();
            window.location.reload(); 
        });
    },

    renderLoginButton() {
        const container = document.getElementById('auth-container');
        if (!container) return;
        container.innerHTML = `<div id="google-login-btn"></div>`;
        
        // Chiamiamo il controller per inizializzare il pulsante Google
        // Import dinamico per evitare dipendenze circolari
        import('../auth/AuthController.js').then(m => m.AuthController.initGoogleAuth());
    }
};