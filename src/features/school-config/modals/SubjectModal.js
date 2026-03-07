// src/features/school-config/modals/SubjectModal.js
import { DashboardController } from '../../dashboard/DashboardController.js';
import { ConfigService } from '../services/ConfigService.js';
import { FeedbackView } from '../../../core/FeedbackView.js';
import { ToastView } from '../../../core/ToastView.js';
import { SubjectDetailModal } from './SubjectDetailModal.js'; // Importante: importa il dettaglio

export const SubjectModal = {
    _currentPerms: { hasAllAccess: false, canEditSubjects: false },

    async show(hasAllAccess = false, canEditSubjects = false) {
        this._currentPerms = { hasAllAccess, canEditSubjects };
        const isAuthorized = hasAllAccess || canEditSubjects;
        
        // Rimuoviamo eventuali residui se il modale fosse già aperto
        this._close();

        const subjects = await ConfigService.getSubjects();
        
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'subject-modal-overlay';
        modalOverlay.className = "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-blue-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200";
        
        modalOverlay.innerHTML = `
            <div class="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 class="text-xl font-black text-blue-900 leading-none text-left uppercase">School Subjects</h2>
                        <p class="text-[10px] text-gray-400 font-bold tracking-widest mt-1 uppercase">Academic Catalog</p>
                    </div>
                    <button id="close-subject-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div id="subjects-list-container" class="p-4 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                    <div class="grid grid-cols-1 gap-3">
                        ${this._renderList(subjects, isAuthorized)}
                    </div>
                </div>

                <div class="p-6 bg-white border-t border-gray-100">
                    <button id="add-subject-btn" 
                        class="w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3
                        ${isAuthorized 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95' 
                            : 'bg-gray-200 text-gray-400 cursor-default'}">
                        ${isAuthorized ? '' : this._getLockIcon()}
                        Create New Subject
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners(isAuthorized);
    },

    // Funzione helper per renderizzare solo la lista (utile per il refresh)
    _renderList(subjects, isAuthorized) {
        if (subjects.length === 0) return '<p class="text-center text-gray-400 py-10 text-sm italic">No subjects configured.</p>';
        return subjects.map(s => this._renderSubjectRow(s, isAuthorized)).join('');
    },

    _renderSubjectRow(subject, isAuthorized) {
    const active = subject.subjectIsActive;
    return `
        <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200">
            <div class="text-left overflow-hidden flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-black text-blue-900 truncate">${subject.subjectNameEng}</span>
                </div>
                <span class="px-1.5 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-tighter">
                    ${subject.subjectAbbr}
                </span>
            </div>    
            
            <div class="flex items-center gap-3 ml-4">
                <div class="relative inline-flex items-center w-11 h-6 cursor-pointer">
                    <input type="checkbox" class="peer absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer toggle-status" 
                        data-id="${subject.id}" 
                        data-name="${subject.subjectNameEng}"
                        ${active ? 'checked' : ''} 
                        ${!isAuthorized ? 'disabled' : ''}>
                    
                    <div class="w-11 h-6 bg-gray-200 rounded-full transition-all duration-300
                        peer-checked:bg-blue-600 
                        ${!isAuthorized ? 'opacity-50' : ''}
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:h-5 after:w-5 after:transition-all duration-300
                        peer-checked:after:translate-x-full peer-checked:after:border-white">
                    </div>
                </div>

                <button class="detail-btn p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    data-id="${subject.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
},

    _setupListeners(isAuthorized) {
        // Chiusura
        const closeBtn = document.getElementById('close-subject-modal');
        if (closeBtn) closeBtn.onclick = () => this._close();

        // Create New
        const addBtn = document.getElementById('add-subject-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                if (!isAuthorized) return this._showRestrictedFeedback(addBtn);
                this._openDetail(null);
            };
        }

        // Detail Buttons
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.onclick = () => this._openDetail(btn.dataset.id);
        });

        // Toggle Status (PATCH)
        document.querySelectorAll('.toggle-status').forEach(toggle => {
            toggle.onclick = async (e) => {
                e.stopPropagation();

                if (!isAuthorized) {
                    e.preventDefault();
                    return this._showRestrictedFeedback(toggle.parentElement);
                }

                const id = toggle.dataset.id;
                const name = toggle.dataset.name;
                const isChecked = toggle.checked; // Stato dopo il click

                try {
                    const result = await ConfigService.toggleSubjectStatus(id);
                    
                    if (result.success) {
                        ToastView.show(`${name} is now ${isChecked ? 'Active' : 'Inactive'}`, 'success');
                        
                        // PUNTO 2: Aggiorniamo la Dashboard per riflettere il nuovo conteggio 
                        // (Active Subjects Count nella card)
                        DashboardController.init(); 

                    } else {
                        // Revert se il server fallisce
                        toggle.checked = !isChecked;
                        FeedbackView.show('error', result.message || "Update failed", "Error");
                    }
                } catch (error) {
                    toggle.checked = !isChecked;
                    console.error("Toggle error:", error);
                }
            };
        });

        // Listener per i dettagli
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.onclick = () => this._openDetail(btn.dataset.id);
        });
    },

    async _openDetail(subjectId) {
        let subject = null;
        const isAuthorized = this._currentPerms.hasAllAccess || this._currentPerms.canEditSubjects;

        if (subjectId) {
            const subjects = await ConfigService.getSubjects();
            subject = subjects.find(s => s.id == subjectId);
        }

        // Chiamata al modale di dettaglio
        SubjectDetailModal.show(subject, isAuthorized, () => {
            this._refreshList(); // Ricarica la lista dopo il salvataggio
        });
    },

    // Metodo per rinfrescare la lista senza chiudere il modale intero
    async _refreshList() {
        const isAuthorized = this._currentPerms.hasAllAccess || this._currentPerms.canEditSubjects;
        const subjects = await ConfigService.getSubjects();
        const container = document.querySelector('#subjects-list-container .grid');
        
        if (container) {
            container.innerHTML = this._renderList(subjects, isAuthorized);
            this._setupListeners(isAuthorized); // Re-aggancia i listener ai nuovi elementi!
        }
    },

    _getLockIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    },

    _showRestrictedFeedback(element) {
        element.classList.add('animate-shake');
        setTimeout(() => element.classList.remove('animate-shake'), 400);
        ToastView.show("Read-only access: Permissions required", "warning");
    },

    _close() {
        const modal = document.getElementById('subject-modal-overlay');
        if (modal) modal.remove();
    }
};