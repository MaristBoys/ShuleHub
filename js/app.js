// js/app.js
import { AuthController } from './features/auth/AuthController.js';
import { NavbarView } from './features/ui/NavbarView.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carica la Navbar (immediato)
    NavbarView.render();

    // 2. Avvia la sveglia del server in background (non blocca la UI)
    AuthController.initBackgroundWakeup();
});