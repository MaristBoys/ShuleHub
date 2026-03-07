// src/features/school-config/modals/SubjectDetailModal.js
import { ConfigService } from '../services/ConfigService.js';
import { FeedbackView } from '../../../core/FeedbackView.js';
import { ToastView } from '../../../core/ToastView.js';

export const SubjectDetailModal = {
    /**
     * Mostra il form di dettaglio per una materia
     * @param {Object|null} subject - L'oggetto subject da modificare o null per nuova
     * @param {Boolean} isAuthorized - Se l'utente può salvare
     * @param {Function} onSaveSuccess - Callback per aggiornare la lista sottostante
     */
    show(subject = null, isAuthorized = false, onSaveSuccess) {
        const isEdit = !!subject;
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'subject-detail-overlay';
        // z-[110] per stare sopra il SubjectModal (che è z-[100])
        modalOverlay.className = "fixed inset-0 z-[110] flex items-center justify-center bg-blue-950/20 backdrop-blur-md p-4 animate-in fade-in duration-200";

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-black text-blue-900 uppercase leading-none">
                            ${isEdit ? 'Edit Subject' : 'New Subject'}
                        </h2>
                        <p class="text-[10px] text-gray-400 font-bold tracking-widest mt-1 uppercase">
                            ${isEdit ? 'Update details' : 'Add to catalog'}
                        </p>
                    </div>
                    <button id="close-detail-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form id="subject-form" class="p-6 space-y-4">
                    <input type="hidden" name="id" value="${subject?.id || ''}">
                    
                    <div>
                        <label class="block text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1 ml-1">English Name</label>
                        <input type="text" name="subjectNameEng" required 
                            value="${subject?.subjectNameEng || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-bold"
                            placeholder="e.g. Mathematics" ${!isAuthorized ? 'disabled' : ''}>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1 ml-1">Swahili Name (KSW)</label>
                        <input type="text" name="subjectNameKsw" required 
                            value="${subject?.subjectNameKsw || ''}"
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-bold"
                            placeholder="e.g. Hisabati" ${!isAuthorized ? 'disabled' : ''}>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1 ml-1">Abbreviation</label>
                            <input type="text" name="subjectAbbr" maxlength="10" required 
                                value="${subject?.subjectAbbr || ''}"
                                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-bold uppercase"
                                placeholder="MATH" ${!isAuthorized ? 'disabled' : ''}>
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1 ml-1">Initial Status</label>
                            <div class="flex items-center h-[46px] px-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span class="text-xs font-bold ${subject?.subjectIsActive !== false ? 'text-green-600' : 'text-gray-400'}">
                                    ${subject?.subjectIsActive !== false ? '● Active' : '○ Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1 ml-1">Description (Optional)</label>
                        <textarea name="subjectDescription" rows="2" 
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium"
                            placeholder="Brief description of the subject..." ${!isAuthorized ? 'disabled' : ''}>${subject?.subjectDescription || ''}</textarea>
                    </div>

                    <div class="pt-4 flex gap-3">
                        <button type="button" id="cancel-detail" class="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all">
                            Cancel
                        </button>
                        ${isAuthorized ? `
                            <button type="submit" class="flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                                Save Subject
                            </button>
                        ` : ''}
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners(isAuthorized, onSaveSuccess);
    },

    _setupListeners(isAuthorized, onSaveSuccess) {
        const close = () => {
            const el = document.getElementById('subject-detail-overlay');
            if (el) el.remove();
        };

        document.getElementById('close-detail-modal').onclick = close;
        document.getElementById('cancel-detail').onclick = close;

        const form = document.getElementById('subject-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            if (!isAuthorized) return;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Gestione booleana dello stato (default true se nuovo)
            data.subjectIsActive = form.querySelector('input[name="id"]').value ? true : true; 

            let result;
            if (data.id) {
                result = await ConfigService.updateSubject(data.id, data);
            } else {
                result = await ConfigService.createSubject(data);
            }

            if (result.success) {
                ToastView.show(`Subject ${isAuthorized ? 'saved' : 'updated'} successfully`, 'success');
                close();
                if (onSaveSuccess) onSaveSuccess();
            } else {
                FeedbackView.show('error', result.message || "Operation failed", "Error");
            }
        };
    }
};