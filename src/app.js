import { AuthController } from './features/auth/AuthController.js';
import { NavbarView } from './features/ui/navbar/NavbarView.js';
import { Router } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Navbar sempre presente
    await NavbarView.render();

    // 2. Avvia i servizi Google/Firebase
    AuthController.initBackgroundWakeup();

    // 3. Carica la pagina corretta
    await Router.navigate();
});

// Il regista ascolta l'evento e decide cosa fare
window.addEventListener('app:logout', () => {
    Router.navigate();
});