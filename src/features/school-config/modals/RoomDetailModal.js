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
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'room-detail-overlay';
        modalOverlay.className = 'fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4';

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div class="bg-slate-900 p-6 text-white relative">
                    <div class="flex justify-between items-center">
                        <div class="flex gap-6 items-center">
                            <div>
                                <h2 class="text-2xl font-black tracking-tighter">${this._data.roomName}</h2>
                                <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                    ${this._data.formName} • ${this._data.yearName}
                                </p>
                            </div>
                            
                            <div class="h-10 w-px bg-slate-700"></div>

                            <div class="flex gap-8">
                                <div>
                                    <p class="text-slate-500 text-[9px] uppercase font-black tracking-tighter mb-0.5 text-center">Students</p>
                                    <p class="text-sm font-bold text-blue-400 text-center">${this._data.studentCount || 0}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 text-[9px] uppercase font-black tracking-tighter mb-0.5">Class Teacher</p>
                                    <p class="text-sm font-bold ${this._data.classTeacherName === 'Not Assigned' ? 'text-amber-500 italic' : 'text-slate-200'}">
                                        ${this._data.classTeacherName || 'Not Assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button id="close-detail-modal" class="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>

                <div class="p-6">
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

                    <div id="modal-tab-content" class="min-h-[350px] max-h-[500px] overflow-y-auto pr-2">
                        ${this._getTabContent()}
                    </div>

                    <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button id="cancel-detail" class="px-6 py-2.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                            Cancel
                        </button>
                        <button id="save-room-detail" 
                            class="px-8 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            ${isNew ? 'Activate Room' : 'Update Scales'}
                        </button>
                    </div>
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
        return `<div class="p-8 text-center text-slate-400 text-xs italic font-medium uppercase">Student list functionality coming soon...</div>`;
    },

    _setupListeners() {
        const overlay = document.getElementById('room-detail-overlay');
        
        document.getElementById('close-detail-modal').onclick = () => overlay.remove();
        document.getElementById('cancel-detail').onclick = () => overlay.remove();

        document.querySelectorAll('.tab-trigger').forEach(btn => {
            btn.onclick = () => {
                this._currentTab = btn.dataset.tab;
                this._renderTabContent(); // Aggiorna solo il contenuto interno
                this._updateTabButtons();
            };
        });

        document.getElementById('save-room-detail').onclick = async () => {
            if (!this._isAuthorized) return;
            const scaleData = {
                gradeScaleId: document.getElementById('grade-scale-select').value,
                divisionScaleId: document.getElementById('division-scale-select').value,
                conductAlphaScaleId: document.getElementById('conduct-alpha-scale-select').value,
                conductTextScaleId: document.getElementById('conduct-text-scale-select').value
            };

            if (this._yearRoomId) {
                // UPDATE
                const success = await SchoolConfigService.updateYearRoomScales(this._yearRoomId, scaleData);
                if (success) {
                    ToastView.show("Configuration updated", "success");
                    overlay.remove();
                }
            } else {
                // ACTIVATE (NEW)
                const payload = { ...this._creationParams, ...scaleData };
                const result = await SchoolConfigService.assignRoom(payload);
                if (result && result.success) {
                    ToastView.show("Room activated!", "success");
                    overlay.remove();
                    if (window.ActiveRoomsModal) window.ActiveRoomsModal.refresh();
                } else {
                    ToastView.show(result?.message || "Error", "error");
                }
            }
        };
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