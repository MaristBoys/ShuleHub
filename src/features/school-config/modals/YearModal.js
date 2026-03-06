// src/features/school-config/modals/YearModal.js
import { ConfigService } from '../services/ConfigService.js';
import { DashboardController } from '../../dashboard/DashboardController.js';
import { FeedbackView } from '../../../core/FeedbackView.js';
import { ConfirmView } from '../../../core/ConfirmView.js';
import { ToastView } from '../../../core/ToastView.js';

export const YearModal = {
    /**
     * Mostra la lista degli anni accademici
     */
    async show() {
        const years = await ConfigService.getYears();
        
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'year-modal-overlay';
        modalOverlay.className = "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-blue-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200";
        
        modalOverlay.innerHTML = `
            <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-black text-blue-900 leading-none text-left">ACADEMIC YEARS</h2>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">System Configuration</p>
                    </div>
                    <button id="close-year-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                    ${years.map(y => this._renderYearRow(y)).join('')}
                </div>

                <div class="p-6 bg-gray-50 border-t border-gray-100">
                    <button id="add-year-btn" class="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                      + Create New Year
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners();
    },

    _renderYearRow(year) {
        const activeClass = year.yearIsActive 
            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/20" 
            : "border-gray-100 bg-white hover:border-blue-200";

        return `
            <div class="group flex items-center justify-between p-4 rounded-2xl border-2 ${activeClass} transition-all duration-200">
                <div class="flex flex-col text-left">
                    <span class="text-xl font-black ${year.yearIsActive ? 'text-blue-600' : 'text-gray-700'}">${year.year}</span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                        ${year.yearDescription || 'Standard Session'}
                    </span>
                </div>
                
                ${year.yearIsActive 
                    ? `<div class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full">
                         <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                         <span class="text-[9px] font-black uppercase tracking-wider">Active</span>
                       </div>`
                    : `<button data-id="${year.id}" data-val="${year.year}" 
                               class="activate-btn px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm">
                         Activate
                       </button>`
                }
            </div>
        `;
    },

    _setupListeners() {
        // 1. Chiusura modale
        document.getElementById('close-year-modal').onclick = () => this._close();
        
        // 2. Listener per attivazione anno (esistente)
        document.querySelectorAll('.activate-btn').forEach(btn => {
            btn.onclick = async () => {
                const yearId = btn.dataset.id;
                const yearVal = btn.dataset.val;

                const confirmed = await ConfirmView.show({
                    title: "Switch Academic Year",
                    message: `You are about to set ${yearVal} as the active session. This will update the data context for all system Users.`,
                    confirmText: "Switch Now",
                    cancelText: "Keep Current",
                    type: 'warning'
                });

                if (confirmed) {
                    try {
                        const result = await ConfigService.activateYear(yearId);
                        if (result.success) {
                            this._close();
                            //FeedbackView.show('success', `Academic year ${yearVal} is now active.`, "System Updated");
                            
                            ToastView.show(`Academic year ${yearVal} is now active.`, 'success', 5000);
                            DashboardController.init();
                        } else {
                            FeedbackView.show('error', result.message, "Update Failed");
                        }
                    } catch (error) {
                        FeedbackView.show('error', "Server communication error.", "System Error");
                    }
                }
            };
        });

        // 3. Listener per "Create New Year" (CORRETTO)
        // Usiamo document.getElementById perché modalOverlay non è visibile qui
        const addBtn = document.getElementById('add-year-btn'); 
        
        if (addBtn) { // Controllo di sicurezza
            addBtn.onclick = async () => {
                const confirmed = await ConfirmView.show({
                    title: "Create New Year",
                    message: "The system will automatically generate the next academic session. Do you want to proceed?",
                    confirmText: "Generate Year",
                    type: 'warning'
                });

                if (confirmed) {
                    try {
                        const result = await ConfigService.createNextYear();
                        
                        if (result) {
                            FeedbackView.show('success', `Next academic year created successfully.`, "Year Generated");
                            
                            // Chiudiamo e riapriamo per aggiornare la lista
                            this._close();
                            // Un piccolo delay per permettere al modale precedente di sparire dal DOM
                            setTimeout(() => this.show(), 100); 
                        }
                    } catch (error) {
                        FeedbackView.show('error', "Could not generate the next year.", "Operation Failed");
                    }
                }
            }; 
        }
    },

    _close() {
        const modal = document.getElementById('year-modal-overlay');
        if (modal) modal.remove();
    }
};