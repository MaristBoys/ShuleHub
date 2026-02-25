// js/features/ui/LoaderView.js
// è il componente che mostra un modale di caricamento con messaggio personalizzato e animazione
export const LoaderView = {
    _id: 'global-dynamic-loader',

    /**
     * Inietta e mostra il modale nel DOM
     * @param {string} message - Il messaggio da mostrare
     */
    show(message = "Caricamento in corso...") {
        // Se esiste già, aggiorna solo il messaggio e torna
        if (document.getElementById(this._id)) {
            this.updateMessage(message);
            return;
        }

        // Creazione dell'overlay con Tailwind (sfocatura e opacità)
        const overlay = document.createElement('div');
        overlay.id = this._id;
        overlay.className = "fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300";
        
        // HTML del rettangolo centrale (Modale)
        overlay.innerHTML = `
            <div class="bg-white p-6 rounded-2xl shadow-2xl border border-blue-50 w-72 text-center transform scale-100 transition-transform">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-900 border-t-transparent mb-4"></div>
                <h2 id="loader-message" class="text-blue-900 font-semibold text-sm mb-2">${message}</h2>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div id="loader-bar" class="bg-blue-600 h-full w-1/3 animate-[loading_2s_infinite_linear]"></div>
                </div>
            </div>
            <style>
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            </style>
        `;

        document.body.appendChild(overlay);
    },

    updateMessage(message) {
        const label = document.getElementById('loader-message');
        if (label) label.textContent = message;
    },

    hide() {
        const loader = document.getElementById(this._id);
        if (loader) {
            loader.classList.add('opacity-0');
            setTimeout(() => loader.remove(), 300); // Rimuove fisicamente dal DOM
        }
    }
};