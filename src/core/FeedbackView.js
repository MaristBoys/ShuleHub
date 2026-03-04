// src/core/FeedbackView.js

export const FeedbackView = {
    _id: 'global-feedback-popup',

    /**
     * Mostra un modale di feedback (successo o errore)
     * @param {string} type - 'success' o 'error'
     * @param {string} message - Il messaggio da mostrare
     */
    show(type = 'success', message = "", title = "") {
        // Rimuove eventuali feedback precedenti
        this.hide();

        const isError = type === 'error';
        
        // Logica per il titolo dinamico: 
        // Se passato usa 'title', altrimenti usa un default in base a 'isError'
        const displayTitle = title || (isError ? 'Operazione Fallita' : 'Operazione Riuscita');
        
        const overlay = document.createElement('div');
        overlay.id = this._id;
        overlay.className = "fixed inset-0 z-[10000] bg-black/40 backdrop-blur-[3px] flex items-center justify-center transition-opacity duration-300";
        
        overlay.innerHTML = `
            <div class="bg-white p-8 rounded-3xl shadow-2xl border ${isError ? 'border-red-100' : 'border-green-100'} w-80 text-center transform transition-all scale-100">
                <div class="mb-4 flex justify-center">
                    ${isError 
                        ? `<div class="bg-red-100 p-3 rounded-full"><span class="text-3xl">⚠️</span></div>` 
                        : `<div class="bg-green-100 p-3 rounded-full"><span class="text-3xl">✅</span></div>`
                    }
                </div>
                
                <h2 class="text-blue-900 font-bold text-lg mb-2">
                    ${displayTitle}
                </h2>
                
                <p class="text-gray-600 text-sm mb-6 leading-relaxed">
                    ${message}
                </p>

                ${isError 
                    ? `<button id="feedback-close-btn" class="w-full py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors">Close</button>`
                    : `<div class="text-blue-600 font-medium text-xs animate-pulse italic">Waiting...</div>`
                }
            </div>
        `;

        document.body.appendChild(overlay);

        if (isError) {
            document.getElementById('feedback-close-btn').onclick = () => this.hide();
        } else {
            setTimeout(() => this.hide(), 2000);
        }
    },

    hide() {
        const feedback = document.getElementById(this._id);
        if (feedback) {
            feedback.classList.add('opacity-0');
            setTimeout(() => feedback.remove(), 300);
        }
    }
};