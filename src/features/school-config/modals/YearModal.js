// src/features/school-config/modals/YearModal.js
import { DashboardController } from '../../dashboard/DashboardController.js';
import { SchoolStructureService } from '../../school-structure/service/SchoolStructureService.js';
import { FeedbackView } from '../../../core/FeedbackView.js';
import { ConfirmView } from '../../../core/ConfirmView.js';
import { ToastView } from '../../../core/ToastView.js';

export const YearModal = {
    // Stato interno per gestire il refresh mantenendo i permessi
    _currentPerms: { hasAllAccess: false, canEditYear: false },

    /**
     * Mostra la lista degli anni accademici
     * @param {Boolean} hasAllAccess - Permesso ALL_ACCESS
     * @param {Boolean} canEditYear - Permesso specifico CONFIG_EDIT_YEAR
     */
    async show(hasAllAccess = false, canEditYear = false) {
        // Memorizziamo i permessi per i refresh successivi (es. dopo creazione)
        this._currentPerms = { hasAllAccess, canEditYear };
        
        // Un utente è autorizzato se ha l'accesso totale o il permesso specifico di editing
        const isAuthorized = hasAllAccess || canEditYear;
        
        const years = await SchoolStructureService.getYears();
        
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'year-modal-overlay';
        modalOverlay.className = "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-blue-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200";
        
        modalOverlay.innerHTML = `
            <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-black text-blue-900 leading-none text-left uppercase">Academic Years</h2>
                        <p class="text-[10px] text-gray-400 font-bold tracking-widest mt-1 uppercase">System Configuration</p>
                    </div>
                    <button id="close-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="p-4 max-h-[60vh] overflow-y-auto bg-white">
                    <div class="space-y-3">
                        ${years.length > 0 
                            ? years.map(y => this._renderYearRow(y, isAuthorized)).join('')
                            : '<p class="text-center text-gray-400 py-10 text-sm italic">No academic years found.</p>'
                        }
                    </div>
                </div>

                <div class="p-6 bg-gray-50 border-t border-gray-100">
                    <button id="add-year-btn" 
                        data-clickable="${isAuthorized}"
                        class="w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3
                        ${isAuthorized 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95' 
                            : 'bg-gray-200 text-gray-400 cursor-default'}">
                        ${isAuthorized ? '' : this._getLockIcon()}
                        Generate Next Year
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners(isAuthorized);
    },

    /**
     * Renderizza la singola riga dell'anno
     */
    _renderYearRow(year, isAuthorized) {
        const isActive = year.yearIsActive;
        return `
            <div class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all 
                ${isActive ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white shadow-sm'}">
                <div class="text-left">
                    <span class="block text-lg font-black ${isActive ? 'text-blue-900' : 'text-gray-700'}">${year.year}</span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">${year.yearDescription || 'Academic Session'}</span>
                </div>
                
                ${isActive 
                    ? `<span class="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>`
                    : `<button class="activate-btn px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                        ${isAuthorized 
                            ? 'bg-white border-2 border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600 active:scale-95' 
                            : 'bg-gray-100 text-gray-300 cursor-default'}"
                        data-id="${year.id}" 
                        data-year="${year.year}"
                        data-clickable="${isAuthorized}">
                        ${isAuthorized ? '' : this._getLockIcon(12)}
                        Activate
                      </button>`
                }
            </div>
        `;
    },

    /**
     * Icona lucchetto per azioni disabilitate
     */
    _getLockIcon(size = 16) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    },

    /**
     * Configura i listener degli eventi
     */
    _setupListeners(isAuthorized) {
        // Chiusura
        document.getElementById('close-modal').onclick = () => this._close();

        // Bottone Genera Nuovo Anno
        const addBtn = document.getElementById('add-year-btn');
        if (addBtn) {
            addBtn.onclick = () => this._handleAction(addBtn, () => this._handleCreateYear());
        }

        // Bottoni Attivazione
        document.querySelectorAll('.activate-btn').forEach(btn => {
            btn.onclick = () => this._handleAction(btn, () => this._handleActivateYear(btn.dataset.id, btn.dataset.year));
        });
    },

    /**
     * Gestore universale delle azioni con controllo permessi e feedback (Toast/Shake)
     */
    async _handleAction(element, actionCallback) {
        if (element.dataset.clickable !== "true") {
            element.classList.add('animate-shake');
            setTimeout(() => element.classList.remove('animate-shake'), 400);
            ToastView.show("Read-only access: Permissions required to modify", "warning");
            return;
        }
        await actionCallback();
    },

    /**
     * Logica di creazione nuovo anno
     */
    async _handleCreateYear() {
        const confirmed = await ConfirmView.show({
            title: "Generate New Year",
            message: "The system will automatically create the next academic session based on the last one. Proceed?",
            confirmText: "Generate",
            type: 'warning'
        });

        if (confirmed) {
            try {
                const result = await SchoolStructureService.createNextYear();
                if (result) {
                    //FeedbackView.show('success', `Year ${result.year} generated successfully.`, "Success");
                    ToastView.show(`Year ${result.data.year} generated successfully.`, 'success', 5000);
                    this._refresh();
                }
            } catch (error) {
                FeedbackView.show('error', "Could not generate the next year.", "Operation Failed");
            }
        }
    },

    /**
     * Logica di attivazione anno
     */
    async _handleActivateYear(id, yearLabel) {
        const confirmed = await ConfirmView.show({
            title: `Activate ${yearLabel}?`,
            message: "This will set the selected year as the active session for system Users.",
            confirmText: "Activate Now",
            type: 'warning'
        });

        if (confirmed) {
            try {
                const result = await SchoolStructureService.activateYear(id);
                if (result.success) {
                    //FeedbackView.show('success', `Academic year ${yearLabel} is now active.`, "System Updated");
                    ToastView.show(`Academic year ${yearLabel} is now active.`, 'success', 5000);
                    DashboardController.init(); // Aggiorniamo l'intero dashboard per riflettere il cambio di anno (es. nei dati delle card)
                    this._close(); // Chiudiamo il modale dopo l'attivazione
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                FeedbackView.show('error', "Failed to update the active year.", "Update Error");
                console.error('Activation Error:', error);
            }
        }
    },

    /**
     * Aggiorna il modale ricaricando i dati ma mantenendo i permessi correnti
     */
    _refresh() {
        this._close();
        setTimeout(() => this.show(this._currentPerms.hasAllAccess, this._currentPerms.canEditYear), 100);
    },

    /**
     * Chiude il modale rimuovendolo dal DOM
     */
    _close() {
        const modal = document.getElementById('year-modal-overlay');
        if (modal) modal.remove();
    }
};