// src/features/school-config/modals/room-detail/RoomDetailModal.js
import { ToastView } from '../../../../core/ToastView.js';
import { SchoolConfigService } from '../../services/SchoolConfigService.js';
import { DashboardController } from '../../../dashboard/DashboardController.js';
import { ScalesTab } from './tabs/ScalesTab.js';
import { StaffTab } from './tabs/StaffTab.js';
import { StudentsTab } from './tabs/StudentsTab.js';

import { TeacherPickerModal } from './TeacherPickerModal.js';
import { TeacherAssignmentService } from '../../../teacher-assignment/services/TeacherAssignmentService.js';

export const RoomDetailModal = {
    _currentTab: 'scales',
    _data: null,
    _isAuthorized: false,
    _yearRoomId: null,
    _creationParams: null,

    async show(yearRoomId, isAuthorized = false, previewParams = null) {
        // Rimuovi eventuali residui rimasti appesi per errore, quando chiudu e riapri lo stesso modale
        const oldOverlay = document.getElementById('room-detail-overlay');
        if (oldOverlay) oldOverlay.remove();
        
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
        const isNew = !this._yearRoomId;  // Booleano per capire se è una Ghost Cell
        
        // Logica: se è nuova = Inactive (false). Se esiste = valore dal DB.
        const isActive = isNew ? false : (this._data.isActive ?? false);

        const statusLabelText = isActive ? 'Active' : 'Inactive';
        const statusLabelColor = isActive ? 'text-blue-600' : 'text-slate-400';

        // Toggle states
        const toggleChecked = isActive ? "checked" : "";
        const toggleDisabled = isNew ? "disabled" : "";
        
        // Se è nuova, il cursore deve indicare il divieto, altrimenti la manina
        const cursorClass = isNew ? "cursor-not-allowed" : "cursor-pointer";

        const teacherClickClass = isNew ? "opacity-50 cursor-not-allowed" : "hover:bg-white/50 cursor-pointer hover:border-white/80";


        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'room-detail-overlay';
        // Layout drawer mobile (items-end) e centrato desktop (sm:items-center)
        modalOverlay.className = 'fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200';

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
                                <span id="status-label" class="text-[9px] font-black uppercase tracking-widest ${statusLabelColor}">${statusLabelText}</span>
                                <label class="relative inline-flex items-center w-9 h-5 ${cursorClass}">
                                    <input type="checkbox" id="room-status-toggle" class="sr-only peer" ${toggleChecked} ${toggleDisabled}>
                                    <div class="w-9 h-5 bg-slate-200 rounded-full transition-all duration-300 peer-checked:bg-blue-600 peer-disabled:opacity-50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                </label>
                            </div>
                            <button id="close-detail-modal" class="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button id="header-teacher-edit" class="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border border-transparent group ${teacherClickClass}">

                            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                                
                            <div class="flex items-baseline gap-1.5 min-w-0">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0 leading-none">CT:</span>
                                <span id="header-teacher-name" class="text-xs font-bold text-slate-700 truncate max-w-[140px] leading-none">
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
        // IMPORTANTE: Passa il nuovo overlay appena creato ai listener, (aggancia i listener all'Overlay appena creato)
        this._setupListeners(modalOverlay);
    },

    _getTabContent() {
        switch(this._currentTab) {
            case 'scales': return ScalesTab.render(this._data);
            case 'staff': return StaffTab.render(this._data);
            case 'students': return StudentsTab.render(this._data);
            default: return '';
        }
    },

    _setupListeners(overlay) {
        //const overlay = document.getElementById('room-detail-overlay');
        // Invece di usare document.getElementById ovunque, usa overlay.querySelector
        // Questo garantisce che stai prendendo l'elemento DENTRO il modale attuale


        //document.getElementById('close-detail-modal').onclick = () => overlay.remove();
        const closeBtn = overlay.querySelector('#close-detail-modal');
        if (closeBtn) closeBtn.onclick = () => overlay.remove();

        const isNew = !this._yearRoomId; //per identificare la ghost cell

        // Toggle stato
        const statusToggle =  overlay.querySelector('#room-status-toggle');
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
                    //chiude il modale
                    //overlay.remove()
                } else {
                    // ROLLBACK: se il server fallisce, riportiamo il toggle allo stato precedente
                    e.target.checked = !newStatus;
                    ToastView.show(result?.message || "Failed to update status", "error");
                    //chiude il modale
                    //overlay.remove()
                }
            };
        }

        // Cambio Tab - CORRETTO
        overlay.querySelectorAll('.tab-trigger').forEach(btn => {
            btn.onclick = () => {
                // 1. Aggiorna lo stato interno
                this._currentTab = btn.dataset.tab;
                
                // 2. Cerca il contenitore del contenuto SOLO dentro questo modale
                const contentContainer = overlay.querySelector('#modal-tab-content');
                if (contentContainer) {
                    contentContainer.innerHTML = this._getTabContent();
                }
                
                // 3. Aggiorna l'interfaccia dei tab (passando l'overlay)
                this._updateTabUI(overlay);
                
                // 4. Se hai logiche specifiche per i contenuti dei tab (es. riagganciare listener interni)
                this._renderTabContent(overlay);
            };
        });

        // Click su CT nell'header apre tab Staffing
        const teacherEditBtn = overlay.querySelector('#header-teacher-edit');
        if (teacherEditBtn && this._isAuthorized && !isNew) {
            teacherEditBtn.onclick = () => {
                TeacherPickerModal.show({
                    title: `Assign Class Teacher for ${this._data.roomName}`,
                    onSelect: async (employeeId, fullName) => {
                        const res = await TeacherAssignmentService.assignClassTeacher(this._yearRoomId, employeeId);
                        if (res.success) {
                            // Aggiorniamo la UI locale
                            const nameElement = overlay.querySelector('#header-teacher-name');
                            if (nameElement) {
                                nameElement.textContent = fullName;
                            }
                            this._data.classTeacherName = fullName; // aggiorniamo i dati interni
                            ToastView.show("Class Teacher assigned", "success");
                            
                            // Se necessario, refresh della vista principale
                            if (window.ActiveRoomsModal) window.ActiveRoomsModal.refresh();

                            //chiude il modale
                            //overlay.remove()
                        }
                    }
                });
            };
        } else if (teacherEditBtn) {
        // Se è una nuova stanza, ci assicuriamo che non faccia nulla al click
        teacherEditBtn.onclick = null;
        }

        // SAVE DISPATCHER
        const saveBtn = overlay.querySelector('#save-room-config');

        if (saveBtn) {
            saveBtn.onclick = async () => {

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
        }
    },


    // metodo utility per il listener del toggle
    _updateStatusUI(isActive, overlay) {
        // Cerchiamo l'elemento solo all'interno del modale attivo
        const scope = overlay || document.getElementById('room-detail-overlay');
        if (!scope) return;

        const label = scope.querySelector('#status-label');
        if (label) {
            label.textContent = isActive ? 'Active' : 'Inactive';
            label.className = `text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`;
        }
    },

    _updateTabUI(overlay) {
        // Usa l'overlay passato o cercalo nel documento se non passato (fallback)
        const scope = overlay || document.getElementById('room-detail-overlay');
        if (!scope) return;

        scope.querySelectorAll('.tab-trigger').forEach(btn => {
            const isActive = btn.dataset.tab === this._currentTab;
            btn.classList.toggle('bg-white', isActive);
            btn.classList.toggle('text-blue-600', isActive);
            btn.classList.toggle('shadow-sm', isActive);
            btn.classList.toggle('text-slate-500', !isActive);
        });
        const saveBtn = scope.querySelector('#save-room-config');
        const labels = { scales: (!this._yearRoomId ? 'Activate Room' : 'Update Scales'), staff: 'Save Staffing', students: 'Save Student List' };
        saveBtn.textContent = labels[this._currentTab];
    }
};