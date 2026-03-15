// src/features/school-config/modals/RoomDetailModal.js
import { ToastView } from '../../../core/ToastView.js';
import { SchoolConfigService } from '../services/SchoolConfigService.js';

export const RoomDetailModal = {
    _currentTab: 'scales',
    _data: null,
    _isAuthorized: false,
    _yearRoomId: null,
    _creationParams: null,

    async show(yearRoomId, isAuthorized = false, previewParams = null) {
        this._isAuthorized = isAuthorized;
        this._currentTab = 'scales';
        this._yearRoomId = yearRoomId;
        this._creationParams = previewParams;

        let result;
        if (yearRoomId) {
            result = await SchoolConfigService.getYearRoomDetails(yearRoomId);
        } else if (previewParams) {
            result = await SchoolConfigService.getRoomPreview(previewParams.yearId, previewParams.roomNum);
        }

        if (result && result.success) {
            this._data = result.data;
            console.log(result.data)
            this._render();
        } else {
            ToastView.show("Impossibile caricare i dati", "error");
        }
    },


    _render() {
        const isNew = !this._yearRoomId;
        const isActive = isNew ? true : (this._data.isActive !== false);

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'room-detail-overlay';
        modalOverlay.className = 'fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200';

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom sm:zoom-in duration-300">
                
                <div class="px-6 py-5 border-b border-gray-100 bg-white">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-black text-blue-900 tracking-tighter uppercase leading-none">
                                ${this._data.roomName}
                            </h2>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                ${this._data.formName} • ${this._data.yearName}
                            </span>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2 pr-3 border-r border-slate-100">
                                <span class="text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}">
                                    ${isActive ? 'Active' : 'Inactive'}
                                </span>
                                <div class="relative inline-flex items-center w-9 h-5 cursor-pointer">
                                    <input type="checkbox" id="room-status-toggle" class="peer absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" 
                                        ${isActive ? 'checked' : ''} ${!this._isAuthorized ? 'disabled' : ''}>
                                    <div class="w-9 h-5 bg-slate-200 rounded-full transition-all duration-300 peer-checked:bg-blue-600 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                        after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4">
                                    </div>
                                </div>
                            </div>
                            <button id="close-detail-modal" class="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <button id="header-teacher-edit" class="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 h-10 rounded-xl transition-all border border-slate-100 group shrink-0">
                            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            
                            <div class="flex items-center gap-1.5 min-w-0">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0">CT:</span>
                                <span class="text-xs font-bold text-slate-700 truncate max-w-[140px]">
                                    ${this._data.classTeacherName || 'Not Assigned'}
                                </span>
                            </div>

                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 shrink-0">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>

                        <div class="flex items-center gap-2 bg-blue-50/50 px-3 h-10 rounded-xl border border-blue-100/50 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500 shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span class="text-xs font-black text-blue-700 whitespace-nowrap">
                                ${this._data.studentCount || 0} 
                                <span class="text-[9px] uppercase tracking-tighter ml-1 opacity-70 font-bold">Students</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex bg-slate-100 p-1 rounded-2xl mb-6">
                        ${['scales', 'staff', 'students'].map(tab => {
                            const isDisabled = isNew && tab !== 'scales';
                            const isActive = this._currentTab === tab;
                            return `
                                <button data-tab="${tab}" ${isDisabled ? 'disabled' : ''}
                                    class="tab-trigger flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200
                                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                                    ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
                                    ${tab === 'staff' ? 'Staffing' : tab}
                                </button>
                            `;
                        }).join('')}
                </div>

                <div id="modal-tab-content" class="flex-1 overflow-auto p-6 bg-slate-50/50">
                    ${this._getTabContent()}
                </div>

                <div class="p-6 bg-white border-t border-gray-100">
                    <button id="save-room-config" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                        ${isNew ? 'Activate Room' : 'Update Scales'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners();
    },

    _getTabContent() {
        if (this._currentTab === 'scales') return this._renderScales();
        if (this._currentTab === 'staff') return this._renderStaff();
        if (this._currentTab === 'students') return this._renderStudents();
    },

    _renderScales() {
        const scales = [
            { id: 'grade', label: 'Grade Scale', value: this._data.currentScales.gradeScaleId, key: 'GRADE' },
            { id: 'division', label: 'Division Scale', value: this._data.currentScales.divisionScaleId, key: 'DIVISION' },
            { id: 'conduct-alpha', label: 'Conduct (Alpha)', value: this._data.currentScales.conductAlphaScaleId, key: 'CONDUCT_ALPHA' },
            { id: 'conduct-text', label: 'Conduct (Text)', value: this._data.currentScales.conductTextScaleId, key: 'CONDUCT_TEXT' }
        ];

        return `
            <div class="grid grid-cols-1 gap-5">
                ${scales.map(s => `
                    <div class="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                        <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">${s.label}</label>
                        <select id="${s.id}-scale-select" class="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none">
                            <option value="${s.value}">${this._data.currentScales[s.id + 'ScaleName'] || 'Select Scale...'}</option>
                            </select>
                        ${this._data.suggestedScaleIds[s.key] ? `
                            <p class="mt-2 text-[9px] text-blue-500 font-bold italic uppercase">
                                Suggested: ${this._data.suggestedScaleIds[s.key]}
                            </p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    _renderStaff() {
        return `
            <div class="space-y-2">
                ${this._data.staffAssignments.map(sa => `
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100 group">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                                ${sa.subjectName.substring(0, 3)}
                            </div>
                            <div>
                                <p class="text-xs font-black text-slate-700 uppercase tracking-tighter">${sa.subjectName}</p>
                                ${sa.isClassTeacher ? '<span class="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Class Teacher</span>' : ''}
                            </div>
                        </div>
                        
                        <div class="text-right">
                            <button class="text-xs font-bold transition-colors ${sa.teacherId ? 'text-slate-600' : 'text-blue-500 hover:text-blue-700 underline underline-offset-4 decoration-blue-200'}">
                                ${sa.fullName || 'Assign Teacher'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

   _renderStudents() {
        return `
            <div class="animate-in slide-in-from-bottom-2 duration-300">
                <div class="grid grid-cols-1 gap-2">
                    ${this._data.enrolledStudents.map((st, index) => `
                        <div class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                            <span class="text-xs font-bold text-slate-300 w-4">${index + 1}</span>
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
        if (!overlay) return;

        // 1. CHIUSURA MODALE
        const closeBtn = document.getElementById('close-detail-modal');
        if (closeBtn) closeBtn.onclick = () => overlay.remove();

        // 2. TOGGLE STATO (ACTIVE/INACTIVE)
        const statusToggle = document.getElementById('room-status-toggle');
        if (statusToggle) {
            statusToggle.onchange = (e) => {
                const isChecked = e.target.checked;
                this._data.isActive = isChecked;
                
                // Aggiornamento visivo immediato della label
                const label = statusToggle.parentElement.previousElementSibling;
                if (label) {
                    label.textContent = isChecked ? 'Active' : 'Inactive';
                    label.className = `text-[9px] font-black uppercase tracking-widest transition-colors ${isChecked ? 'text-blue-600' : 'text-slate-400'}`;
                }
            };
        }

        // 3. CAMBIO TAB
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            btn.onclick = () => {
                if (btn.disabled) return;
                this._currentTab = btn.dataset.tab;
                this._renderTabContent(); 
                this._updateTabButtons();
                // Ad ogni cambio tab, il pulsante footer cambierà testo/funzione nel render
                this._refreshFooterButton(); 
            };
        });

        // 4. CLICK EDIT TEACHER NELL'HEADER (Shortcut per tab Staff)
        const teacherEditBtn = document.getElementById('header-teacher-edit');
        if (teacherEditBtn) {
            teacherEditBtn.onclick = () => {
                const staffTabBtn = document.querySelector('[data-tab="staff"]');
                if (staffTabBtn && !staffTabBtn.disabled) staffTabBtn.click();
            };
        }

        // 5. GESTORE UNICO SALVATAGGIO (DISPATCHER)
        const saveBtn = document.getElementById('save-room-config');
        if (saveBtn) {
            saveBtn.onclick = async () => {
                if (!this._isAuthorized) return ToastView.show("Non autorizzato", "warning");

                switch (this._currentTab) {
                    case 'scales':
                        await this._handleScalesSave(overlay);
                        break;
                    case 'staff':
                        await this._handleStaffSave(overlay);
                        break;
                    case 'students':
                        await this._handleStudentsSave(overlay);
                        break;
                }
            };
        }
    },

    // --- GESTORI SPECIFICI PER TAB ---

    async _handleScalesSave(overlay) {
        const scaleData = {
            isActive: this._data.isActive, // Includiamo lo stato del toggle
            gradeScaleId: document.getElementById('grade-scale-select').value,
            divisionScaleId: document.getElementById('division-scale-select').value,
            conductAlphaScaleId: document.getElementById('conduct-alpha-scale-select').value,
            conductTextScaleId: document.getElementById('conduct-text-scale-select').value
        };

        if (this._yearRoomId) {
            // CASO A: Update Stanza Esistente
            const success = await SchoolConfigService.updateYearRoomScales(this._yearRoomId, scaleData);
            if (success) {
                ToastView.show("Scales updated", "success");
                overlay.remove();
                if (window.ActiveRoomsModal) window.ActiveRoomsModal.refresh();
            }
        } else {
            // CASO B: Attivazione Nuova Stanza (Ghost Cell)
            const payload = { ...this._creationParams, ...scaleData };
            const result = await SchoolConfigService.assignRoom(payload);
            if (result && result.success) {
                ToastView.show("Room activated!", "success");
                overlay.remove();
                if (window.ActiveRoomsModal) window.ActiveRoomsModal.refresh();
            } else {
                ToastView.show(result?.message || "Error activating room", "error");
            }
        }
    },

    async _handleStaffSave(overlay) {
        console.log("Saving Staffing to cfg_yearroom_subject_teacher...");
        // Prevedere qui la raccolta dati dalla tabella staffing
        // const staffData = this._collectStaffingData();
        // await SchoolConfigService.saveStaffing(this._yearRoomId, staffData);
        ToastView.show("Staffing save not implemented yet", "info");
    },

    async _handleStudentsSave(overlay) {
        console.log("Saving Students to cfg_yearroom_student...");
        // Prevedere qui la logica per YearRoomStudent.java
        ToastView.show("Student assignment not implemented yet", "info");
    },

    // Utility per aggiornare il testo del bottone footer senza ri-renderizzare tutto
    _refreshFooterButton() {
        const saveBtn = document.getElementById('save-room-config');
        if (!saveBtn) return;

        const isNew = !this._yearRoomId;
        const labels = {
            scales: isNew ? 'Activate Room' : 'Update Scales',
            staff: 'Save Staffing',
            students: 'Save Student List'
        };
        saveBtn.textContent = labels[this._currentTab] || 'Save';
    },

    _renderTabContent() {
        document.getElementById('modal-tab-content').innerHTML = this._getTabContent();
    },

    _updateTabButtons() {
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            const isActive = btn.dataset.tab === this._currentTab;
            btn.className = `tab-trigger flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200
                ${btn.disabled ? 'opacity-30 cursor-not-allowed' : ''}
                ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`;
        });
    }
};