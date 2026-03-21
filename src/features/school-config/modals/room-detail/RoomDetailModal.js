// src/features/school-config/modals/room-detail/RoomDetailModal.js
import { ToastView } from '../../../../core/ToastView.js';
import { SchoolConfigService } from '../../services/SchoolConfigService.js';
import { DashboardController } from '../../../dashboard/DashboardController.js';
import { ScalesTab } from './tabs/ScalesTab.js';
import { StaffTab } from './tabs/StaffTab.js';
import { StudentsTab } from './tabs/StudentsTab.js';

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

        if (result?.success) {
            this._data = result.data;
            this._render();
        } else {
            ToastView.show("Data not avaible", "error");
        }
    },

    _render() {
        const isNew = !this._yearRoomId;
        const isActive = isNew ? true : (this._data.isActive !== false);

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'room-detail-overlay';
        // Layout drawer mobile (items-end) e centrato desktop (sm:items-center)
        modalOverlay.className = 'fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200';

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-300">
                
                <div class="px-6 py-5 border-b border-gray-100 bg-white">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-black text-blue-900 tracking-tighter uppercase leading-none">${this._data.roomName}</h2>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${this._data.formName} • ${this._data.yearName}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2 pr-3 border-r border-slate-100">
                                <span id="status-label" class="text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}">${isActive ? 'Active' : 'Inactive'}</span>
                                <div class="relative inline-flex items-center w-9 h-5 cursor-pointer">
                                    <input type="checkbox" id="room-status-toggle" class="peer absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" ${isActive ? 'checked' : ''} ${!this._isAuthorized ? 'disabled' : ''}>
                                    <div class="w-9 h-5 bg-slate-200 rounded-full transition-all duration-300 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
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
                                
                                <div class="flex items-baseline gap-1.5 min-w-0">
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0 leading-none">CT:</span>
                                    <span class="text-xs font-bold text-slate-700 truncate max-w-[140px] leading-none">
                                        ${this._data.classTeacherName || 'Not Assigned'}
                                    </span>
                                </div>

                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 shrink-0">
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

                <div class="px-6 py-2 bg-white">
                    <div class="flex bg-slate-100 p-1 rounded-2xl">
                        ${['scales', 'staff', 'students'].map(tab => {
                            const isDisabled = isNew && tab !== 'scales';
                            const isActiveTab = this._currentTab === tab;
                            return `
                                <button data-tab="${tab}" ${isDisabled ? 'disabled' : ''} 
                                    class="tab-trigger flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : isActiveTab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
                                    ${tab === 'staff' ? 'Staffing' : tab}
                                </button>`;
                        }).join('')}
                    </div>
                </div>

                <div id="modal-tab-content" class="flex-1 overflow-auto p-6 bg-slate-50/50">
                    ${this._getTabContent()}
                </div>

                <div class="p-6 bg-white border-t border-gray-100">
                    <button id="save-room-config" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-[0.98]">
                        ${isNew ? 'Activate Room' : 'Update Scales'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners();
    },

    _getTabContent() {
        switch(this._currentTab) {
            case 'scales': return ScalesTab.render(this._data);
            case 'staff': return StaffTab.render(this._data);
            case 'students': return StudentsTab.render(this._data);
            default: return '';
        }
    },

    _setupListeners() {
        const overlay = document.getElementById('room-detail-overlay');
        
        document.getElementById('close-detail-modal').onclick = () => overlay.remove();

        // Toggle stato
        const statusToggle = document.getElementById('room-status-toggle');
        if (statusToggle) {
            statusToggle.onchange = async (e) => {
                const newStatus = e.target.checked;
                
                // Se la stanza è nuova (non ha ID), cambiamo solo il dato locale
                if (!this._yearRoomId) {
                    this._data.isActive = newStatus;
                    this._updateStatusUI(newStatus);
                    return;
                }

                // Se la stanza esiste già, chiamiamo il backend
                const result = await SchoolConfigService.toggleRoomStatus(this._yearRoomId, newStatus);

                if (result && result.success) {
                    this._data.isActive = newStatus;
                    this._updateStatusUI(newStatus);
                    ToastView.show(`Room ${newStatus ? 'activated' : 'deactivated'}`, "success");
                    
                    // rinfresca la griglia sotto se presente
                    if (window.ActiveRoomsModal) window.ActiveRoomsModal.refresh();
                    
                    // ricarica la dashboard
                    DashboardController.init(); 
                } else {
                    // ROLLBACK: se il server fallisce, riportiamo il toggle allo stato precedente
                    e.target.checked = !newStatus;
                    ToastView.show(result?.message || "Failed to update status", "error");
                }
            };
        }

        // Cambio Tab
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            btn.onclick = () => {
                this._currentTab = btn.dataset.tab;
                document.getElementById('modal-tab-content').innerHTML = this._getTabContent();
                this._updateTabUI();
            };
        });

        // Click su CT nell'header apre tab Staffing
        document.getElementById('header-teacher-edit').onclick = () => {
            const btn = document.querySelector('[data-tab="staff"]');
            if (btn && !btn.disabled) btn.click();
        };

        // SAVE DISPATCHER
        document.getElementById('save-room-config').onclick = async () => {
            if (!this._isAuthorized) return;
            
            let success = false;
            switch(this._currentTab) {
                case 'scales':
                    const result = await ScalesTab.save(this._yearRoomId, this._data.isActive, this._creationParams);
                    success = result?.success !== undefined ? result.success : result;
                    break;
                case 'staff':
                    success = await StaffTab.save(this._yearRoomId);
                    break;
                case 'students':
                    success = await StudentsTab.save(this._yearRoomId);
                    break;
            }

            if (success) {
                ToastView.show("Saved successfully", "success");
                overlay.remove();
                if (window.ActiveRoomsModal) window.ActiveRoomsModal.refresh();
            }
        };
    },



    // metodo utility per il listener del toggle
    _updateStatusUI(isActive) {
        const label = document.getElementById('status-label');
        if (label) {
            label.textContent = isActive ? 'Active' : 'Inactive';
            label.className = `text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`;
            //DashboardController.init();
        }
    },

    _updateTabUI() {
        document.querySelectorAll('.tab-trigger').forEach(btn => {
            const isActive = btn.dataset.tab === this._currentTab;
            btn.classList.toggle('bg-white', isActive);
            btn.classList.toggle('text-blue-600', isActive);
            btn.classList.toggle('shadow-sm', isActive);
            btn.classList.toggle('text-slate-500', !isActive);
        });
        const saveBtn = document.getElementById('save-room-config');
        const labels = { scales: (!this._yearRoomId ? 'Activate Room' : 'Update Scales'), staff: 'Save Staffing', students: 'Save Student List' };
        saveBtn.textContent = labels[this._currentTab];
    }
};