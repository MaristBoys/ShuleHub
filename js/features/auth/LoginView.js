//La Gestione Login
// Qui recuperiamo lo spinner, il countdown e la gestione del pulsante Google

// js/views/LoginView.js
export const LoginView = {
    // Gestisce il countdown per svegliare Render
    startCountdown(seconds, onTick, onComplete) {
        let remaining = seconds;
        const timerElement = document.getElementById('countdown-timer');
        
        const interval = setInterval(() => {
            remaining--;
            timerElement.textContent = `${remaining}s`;
            if (remaining <= 0) {
                clearInterval(interval);
                onComplete();
            }
        }, 1000);
    },

    showGoogleButton() {
        document.getElementById('waiting-for-backend').classList.add('hidden');
        document.getElementById('google-auth-button-wrapper').classList.remove('hidden');
    },

    hideLoginSection() {
        document.getElementById('google-login-section').classList.add('hidden');
    }
};