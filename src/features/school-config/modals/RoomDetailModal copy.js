// src/features/school-config/modals/RoomDetailModal.js
import { ToastView } from '../../../core/ToastView.js';
import { SchoolConfigService } from '../services/SchoolConfigService.js';

export const RoomDetailModal = {
    _currentTab: 'scales', // 'scales' | 'staff' | 'students'
    _data: null,
    _isAuthorized: false,

    async show(yearRoomId, isAuthorized = false) {
        this._isAuthorized = isAuthorized;
        this._currentTab = 'scales'; 

        // 1. (Opzionale) Feedback immediato di caricamento
        // ToastView.show("Loading details...", "info");

        try {
            const result = await SchoolConfigService.getYearRoomDetails(yearRoomId);
            
            // 2. Controllo risposta Service
            if (!result || !result.success) {
                console.error("API Error:", result);
                return ToastView.show(result?.message || "Failed to load room details", "error");
            }

            // 3. Assegnazione dati
            this._data = result.data;

            // 4. Rendering con protezione dai crash
            try {
                this._render();
            } catch (renderError) {
                console.error("Render Error (Check your template variables):", renderError);
                ToastView.show("UI Rendering Error", "error");
            }

        } catch (networkError) {
            // 5. Gestione errore di rete o crash del Service
            console.error("Network/Service Error:", networkError);
            ToastView.show("Connection error with server", "error");
        }
    },

    _render() {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'room-detail-overlay';
        modalOverlay.className = "fixed inset-0 z-[110] flex items-center justify-center bg-blue-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200";

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                <div class="px-8 pt-8 pb-6 bg-gradient-to-br from-white to-slate-50 relative">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 leading-tight">${this._data.roomName}</h3>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">${this._data.formName}</span>
                                    <span class="text-slate-300">•</span>
                                    <span class="text-xs font-medium text-slate-500">${this._data.yearName}</span>
                                </div>
                            </div>
                        </div>
                        <button id="close-detail-modal" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div class="flex gap-3 mb-2">
                        <div class="px-3 py-1.5 bg-slate-100 rounded-full flex items-center gap-2">
                            <svg class="text-slate-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span class="text-[11px] font-bold text-slate-600 uppercase">${this._data.studentCount} Students</span>
                        </div>
                        <div class="px-3 py-1.5 bg-blue-50 rounded-full flex items-center gap-2">
                            <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span class="text-[11px] font-bold text-blue-700 uppercase">CT: ${this._data.classTeacherName}</span>
                        </div>
                    </div>

                    <div class="flex p-1 bg-slate-100 rounded-2xl mt-6 w-fit">
                        ${this._renderTabBtn('scales', 'Assessment')}
                        ${this._renderTabBtn('staff', 'Staffing')}
                        ${this._renderTabBtn('students', 'Enrollment')}
                    </div>
                </div>

                <div id="tab-content" class="px-8 py-6 min-h-[350px] max-h-[500px] overflow-y-auto bg-white">
                    ${this._renderCurrentTab()}
                </div>

                <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button id="cancel-detail" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Close</button>
                    ${this._isAuthorized ? `<button id="save-room-config" class="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Save Changes</button>` : ''}
                </div>
            </div>
        `;

        // Rimuovi vecchio se esiste
        const old = document.getElementById('room-detail-overlay');
        if (old) old.remove();

        document.body.appendChild(modalOverlay);
        this._setupListeners();
    },

    _renderTabBtn(id, label) {
        const isActive = this._currentTab === id;
        return `
            <button data-tab="${id}" class="tab-trigger px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all duration-200 
                ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}">
                ${label}
            </button>
        `;
    },

    _renderCurrentTab() {
        switch (this._currentTab) {
            case 'scales': return this._renderScalesTab();
            case 'staff': return this._renderStaffTab();
            case 'students': return this._renderStudentsTab();
            default: return '';
        }
    },

    _renderScalesTab() {
        return `
            <div class="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <p class="text-sm text-slate-500 mb-4 font-medium">Configure how grades and behavior are calculated for this room.</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    ${this._renderScaleSelect("Grade Scale", "GRADE", this._data.currentScales.gradeScaleName)}
                    ${this._renderScaleSelect("Division Scale", "DIVISION", this._data.currentScales.divisionScaleName)}
                    ${this._renderScaleSelect("Conduct (Alpha)", "CONDUCT_ALPHA", this._data.currentScales.conductAlphaScaleName)}
                    ${this._renderScaleSelect("Conduct (Text)", "CONDUCT_TEXT", this._data.currentScales.conductTextScaleName)}
                </div>
            </div>
        `;
    },

    _renderScaleSelect(label, type, currentName) {
        return `
            <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">${label}</label>
                <div class="relative group">
                    <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none">
                        <option value="">${currentName || 'Select Scale...'}</option>
                    </select>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
            </div>
        `;
    },

    _renderStaffTab() {
        return `
            <div class="animate-in slide-in-from-bottom-2 duration-300">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="text-sm font-black text-slate-800 uppercase tracking-tight">Subject Assignments</h4>
                    <span class="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">${this._data.staffingRatio} Subjects Set</span>
                </div>
                <div class="space-y-3">
                    ${this._data.staffAssignments.map(s => `
                        <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 font-black text-xs text-slate-500">
                                    ${s.subjectName.substring(0, 3).toUpperCase()}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-slate-800">${s.fullName}</div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${s.subjectName}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                ${s.isClassTeacher ? '<span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">Class Teacher</span>' : ''}
                                ${!s.isActive ? '<span class="w-2 h-2 bg-red-400 rounded-full"></span>' : '<span class="w-2 h-2 bg-emerald-400 rounded-full"></span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _renderStudentsTab() {
        return `
            <div class="animate-in slide-in-from-bottom-2 duration-300">
                <div class="grid grid-cols-1 gap-2">
                    ${this._data.enrolledStudents.map((st, index) => `
                        <div class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                            <span class="text-xs font-bold text-slate-300 w-4">${index + 1}</span>
                            <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                ${st.fullName.charAt(0)}
                            </div>
                            <span class="text-sm font-bold text-slate-700 flex-1">${st.fullName}</span>
                            <span class="text-[10px] font-black ${st.isActive ? 'text-emerald-500' : 'text-slate-300'} uppercase italic">
                                ${st.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _setupListeners() {
        const overlay = document.getElementById('room-detail-overlay');
        
        // Chiudi
        document.getElementById('close-detail-modal').onclick = () => overlay.remove();
        document.getElementById('cancel-detail').onclick = () => overlay.remove();

        // Switch Tabs
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            btn.onclick = () => {
                this._currentTab = btn.dataset.tab;
                this._updateTabUI();
            };
        });
    },

    _updateTabUI() {
        // Aggiorna bottoni
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            const isActive = btn.dataset.tab === this._currentTab;
            btn.className = `tab-trigger px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all duration-200 
                ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`;
        });
        // Aggiorna contenuto
        document.getElementById('tab-content').innerHTML = this._renderCurrentTab();
    }
};