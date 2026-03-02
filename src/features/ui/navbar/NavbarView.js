// src/features/ui/navbar/NavbarView.js
import { UserModel } from '../../auth/UserModel.js';
import { AuthController } from '../../auth/AuthController.js'; // Importa il controller per gestire il logout

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

        const defaultIcon = "./assets/icons/navbar_icona_1_32px.png";
        
        container.innerHTML = `
            <div class="flex items-center space-x-6">
                <div class="flex flex-col text-right hidden md:flex text-blue-900">
                    <span class="font-bold leading-tight">${user.username}</span>
                    <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">${user.profileName}</span>
                </div>

                <a href="#profile" title="My Profile" class="hover:scale-110 transition-transform">
                    <div class="relative w-8 h-8">
                        <img src="${defaultIcon}" 
                            class="w-8 h-8 rounded-full border-2 border-blue-900 object-cover absolute top-0 left-0">
                        
                        <img id="navbar-profile-img" 
                            src="" 
                            alt="Profilo" 
                            class="w-8 h-8 rounded-full border-2 border-blue-900 object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-500 ease-in-out">
                    </div>
                </a>
                
		        <a href="#dashboard" title="Home" class="hover:scale-110 transition-transform">
                	<img src="./assets/icons/navbar_icona_2_32px.png" alt="Home" class="w-8 h-8 object-contain">
            	</a>

            	<button id="logout-btn" title="Logout" class="hover:scale-110 transition-transform">
                	<img src="./assets/icons/navbar_icona_3_32px.png" alt="Logout" class="w-8 h-8 object-contain">
            	</button>

                </div>
        `;

        this.loadProfileImage(user.pictureUrl);
        
        document.getElementById('logout-btn').onclick = async (e) => {
            e.preventDefault(); // Evita scroll o ricariche strane
    
            // Importante: assicurati che AuthController sia importato in cima al file NavbarView
            await AuthController.logout();
        };

    },

    loadProfileImage(url) {
        if (!url) return;

        const imgElement = document.getElementById('navbar-profile-img');
        if (!imgElement) return;

        // Creiamo un oggetto Image per pre-caricare il file
        const tempImg = new Image();
        tempImg.src = url;

        tempImg.onload = () => {
            // Solo quando l'immagine è scaricata dalla cache o da Google:
            imgElement.src = url;
            imgElement.classList.remove('opacity-0');
            imgElement.classList.add('opacity-100');
        };

        tempImg.onerror = () => {
            console.warn("Immagine Google non disponibile, rimango con default.");
            // Non facciamo nulla: l'immagine di default è già lì sotto!
        };
    }

};