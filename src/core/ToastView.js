// src/core/ToastView.js

export const ToastView = {
    _id: 'global-toast-container',

    /**
     * Mostra un piccolo messaggio non invasivo
     * @param {string} message - Testo da mostrare
     * @param {string} type - 'info', 'warning', o 'error'
     * @param {number} duration - Durata in millisecondi (default 3000)
     */
    show(message, type = 'info', duration = 3000) {
        // 1. Assicuriamoci che esista un contenitore per i toast
        let container = document.getElementById(this._id);
        if (!container) {
            container = document.createElement('div');
            container.id = this._id;
            // Posizionamento in basso a destra, sopra tutto
            //container.className = "fixed bottom-6 right-6 z-[11000] flex flex-col gap-3 pointer-events-none";
            // Per centrare in alto invece, usa:
            container.className = "fixed top-6 left-1/2 -translate-x-1/2 z-[11000] flex flex-col gap-3 pointer-events-none";
            
            document.body.appendChild(container);
        }

        // 2. Definizione stili e icone in base al tipo
        const configs = {
            info: { bg: 'bg-green-400', icon: 'ℹ️' },
            warning: { bg: 'bg-amber-500', icon: '⚠️' },
            error: { bg: 'bg-red-600', icon: '🚫' }
        };
        const config = configs[type] || configs.info;

        // 3. Creazione dell'elemento Toast
        const toast = document.createElement('div');
        // Pointer-events-auto permette di cliccare il toast se volessimo chiuderlo a mano
        toast.className = `
            flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white 
            ${config.bg} transform transition-all duration-300 translate-y-10 opacity-0 pointer-events-auto
            cursor-pointer min-w-[240px] max-w-sm border border-white/10
        `;
        
        toast.innerHTML = `
            <span class="text-lg">${config.icon}</span>
            <p class="text-[11px] font-bold uppercase tracking-wider">${message}</p>
        `;

        // 4. Aggiunta al contenitore
        container.appendChild(toast);

        // 5. Animazione di entrata (piccolo delay per permettere al browser di registrare l'elemento)
        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);

        // 6. Funzione di rimozione
        const removeToast = () => {
            toast.classList.add('translate-y-2', 'opacity-0', 'scale-95');
            setTimeout(() => toast.remove(), 300);
        };

        // Rimuovi al click o dopo il timeout
        toast.onclick = removeToast;
        setTimeout(removeToast, duration);
    }
};