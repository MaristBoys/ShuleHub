// src/core/ConfirmView.js

export const ConfirmView = {
    _id: 'global-confirm-popup',

    /**
     * Mostra un modale di conferma e restituisce una Promise (true/false)
     * @param {Object} options - Configurazione del modale
     */
    show({ 
        title = "Are you sure?", 
        message = "This action cannot be undone.", 
        confirmText = "Confirm", 
        cancelText = "Cancel",
        type = 'warning' // 'warning' o 'danger'
    }) {
        return new Promise((resolve) => {
            this.hide(); // Rimuove eventuali istanze precedenti

            const isDanger = type === 'danger';
            const accentColor = isDanger ? 'bg-red-600' : 'bg-amber-500';

            const overlay = document.createElement('div');
            overlay.id = this._id;
            // Overlay con sfocatura e animazione
            overlay.className = "fixed inset-0 z-[10001] bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200";
            
            overlay.innerHTML = `
                <div class="bg-white w-full max-w-sm rounded-t-[2.5rem] rounded-b-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300">
                    <div class="p-8 text-center">
                        <div class="mb-4 flex justify-center">
                            <div class="${isDanger ? 'bg-red-100' : 'bg-amber-100'} p-4 rounded-full">
                                <span class="text-3xl">${isDanger ? '⚠️' : '❓'}</span>
                            </div>
                        </div>
                        
                        <h2 class="text-blue-900 font-black text-xl mb-2 uppercase tracking-tight">
                            ${title}
                        </h2>
                        
                        <p class="text-gray-500 text-sm leading-relaxed mb-8">
                            ${message}
                        </p>

                        <div class="flex flex-col gap-3">
                            <button id="confirm-yes-btn" class="w-full py-4 ${accentColor} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
                                ${confirmText}
                            </button>
                            <button id="confirm-no-btn" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all">
                                ${cancelText}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Listener per la conferma
            document.getElementById('confirm-yes-btn').onclick = () => {
                this.hide();
                resolve(true);
            };

            // Listener per l'annullamento
            document.getElementById('confirm-no-btn').onclick = () => {
                this.hide();
                resolve(false);
            };
            
            // Chiusura cliccando sull'overlay
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    this.hide();
                    resolve(false);
                }
            };
        });
    },

    hide() {
        const popup = document.getElementById(this._id);
        if (popup) popup.remove();
    }
};