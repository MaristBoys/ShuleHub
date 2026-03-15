// src/features/school-config/modals/ActiveRoomsModal.js
import { ToastView } from '../../../core/ToastView.js';
import { SchoolStructureService } from '../../school-structure/service/SchoolStructureService.js';
import { SchoolConfigService } from '../services/SchoolConfigService.js';
import { RoomDetailModal } from './RoomDetailModal.js';

export const ActiveRoomsModal = {
    _currentYearId: null,

    async show(yearId, isAuthorized = false, yearName = '') {
        this._currentYearId = yearId;
        this._currentYearName = yearName;
        const result = await SchoolConfigService.getRoomMatrix(yearId);
        
        if (!result.success) {
            return ToastView.show("Error loading room matrix", "error");
        }

        const { streams, rows } = result.data;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'rooms-modal-overlay';
       
        modalOverlay.className = "fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-blue-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200";
       
        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-5xl h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                <div class="px-8 py-2 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 class="text-2xl font-black text-blue-900 tracking-tight">Active Rooms ${this._currentYearName}</h2>
                        <p class="text-slate-500 text-sm font-medium">Manage class assignments</p>
                    </div>
                    <button id="close-rooms-modal" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="flex-1 overflow-auto px-4 pb-8 bg-slate-200/60">
                    <table class="w-full border-separate border-spacing-4 table-fixed min-w-[800px]">
                        <thead>
                            <tr>
                               
                            </tr>
    
                        </thead>
                        <tbody>
                            ${rows.map(row => `
                                <tr>
                                    ${streams.map(sNum => {
                                        // Trasformiamo sNum in stringa per matchare le chiavi del JSON ("1", "2", etc.)
                                        const room = row.cells[String(sNum)]; 
                                        // Passiamo row.formId se disponibile, altrimenti usiamo row.formNum come riferimento
                                        // Costruiamo il nome ipotetico (es: "1" + "1" = "11")
                                        const suggestedName = `${row.formNum}${sNum}`; 
                                        return `<td>${this._renderCell(room, row.formId || row.formNum, sNum, isAuthorized, suggestedName)}</td>`;
                                    }).join('')}
                                    <td class="pl-2">
                                        <button class="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group shadow-sm bg-white/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-90 transition-transform duration-300">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <div class="flex gap-6">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span>Active Room</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 border-2 border-dashed border-slate-300 rounded-full"></div>
                            <span>Available Slot</span>
                        </div>
                    </div>
                    <span>${yearName} Structure</span>
                </div>



            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners(isAuthorized);
    },


        async _getYearName(yearId) {
        const years = await SchoolStructureService.getYears(); // Cambiato da ConfigService a SchoolStructureService per coerenza con il nuovo endpoint
        const currentYear = years.find(y => y.id === parseInt(yearId));
        return currentYear ? currentYear.yearName : '';
    },

    /**
     * Renderizza il contenuto della cella (Stanza attiva o Slot vuoto)
     */
        _renderCell(room, formId, streamNum, isAuthorized, suggestedName) {
        if (room && room.assigned === true) {
            return this._renderActiveRoom(room);
        } else {
            // Passiamo il nome suggerito allo slot vuoto
            return this._renderEmptySlot(formId, streamNum, isAuthorized, suggestedName);
        }
    },

    /**
     * Template per una stanza con dati dashboard
     */
    _renderCell(room, formId, sNum, isAuthorized, suggestedName) {
        if (room) {
            const isActive = room.isActive !== false;
            
            // --- Ripristino Logica Colore Staffing Badge ---
            let staffingClass = "bg-red-100 text-red-700"; // Sotto il 50%
            if (room.staffingPercentage >= 1) {
                staffingClass = "bg-green-100 text-green-700"; // Al completo
            } else if (room.staffingPercentage >= 0.5) {
                staffingClass = "bg-orange-100 text-orange-700"; // Sopra il 50%
            }

            // Se la stanza è disattivata, forziamo un colore neutro per coerenza visiva
            const finalStaffingClass = isActive ? staffingClass : "bg-slate-200 text-slate-500";

            return `
                <button 
                    data-id="${room.yearRoomId}"
                    class="room-cell group relative w-full p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start gap-3
                    ${isActive 
                        ? 'bg-white border-white shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1' 
                        : 'bg-slate-100/50 border-dashed border-slate-300 opacity-75 grayscale-[0.3]'}"
                >
                    <div class="flex justify-between items-start w-full">
                        <div class="flex items-center gap-2">
                            <div class="p-2 rounded-xl ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'} group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                            
                            <div class="px-2 py-1 rounded-lg ${finalStaffingClass} text-[10px] font-black tracking-tighter transition-colors">
                                ${room.staffingRatio || '0/0'}
                            </div>
                        </div>
                        
                        ${!isActive ? `
                            <span class="bg-slate-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-tighter uppercase">Inactive</span>
                        ` : ''}
                    </div>

                    <div class="text-left">
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            ${room.formName || 'N/A'}
                        </div>
                        <div class="text-lg font-black ${isActive ? 'text-blue-900' : 'text-slate-600'} leading-none">
                            ${room.roomName}
                        </div>
                    </div>

                    <div class="w-full pt-3 border-t ${isActive ? 'border-slate-50' : 'border-slate-200/50'} flex justify-between items-center">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <div class="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <span class="text-[10px] font-bold ${isActive ? 'text-slate-600' : 'text-slate-400'} truncate">
                                ${room.classTeacherName || 'No Teacher'}
                            </span>
                        </div>
                        
                        <div class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg shrink-0">
                            <span class="text-[11px] font-black ${isActive ? 'text-blue-600' : 'text-slate-400'}">
                                ${room.studentCount || 0}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                    </div>
                </button>
            `;
        }

        return this._renderEmptySlot(formId, sNum, isAuthorized, suggestedName);
    },

    /**
     * Template per uno slot vuoto (Ghost Slot)
     */
     _renderEmptySlot(formId, streamNum, isAuthorized, suggestedName) {
        return `
            <button 
                data-room-num="${suggestedName}" 
                class="add-room-cell w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                <div class="p-2 rounded-full border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-center">
                    Assign<br>Room ${suggestedName}
                </span>
            </button>
        `;
    },


    _setupListeners(isAuthorized) {
        // Chiudi il modale
        const closeBtn = document.getElementById('close-rooms-modal');
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('rooms-modal-overlay').remove();
            };
        }

        // --- AGGANCIO ROOM DETAIL MODAL ---
        // Seleziona tutte le celle delle stanze attive (quelle con la classe .room-cell)
        document.querySelectorAll('.room-cell').forEach(btn => {
            btn.onclick = () => {
                const yearRoomId = btn.dataset.id;
                //console.log("Opening Room Details for ID:", yearRoomId);
                
                // Chiamata al modale di dettaglio (Fase 3)
                RoomDetailModal.show(yearRoomId, isAuthorized);
            };
        });

        // 1. Click su slot vuoto (Ghost Cell) -> Apre il modale in modalità PREVIEW
        document.querySelectorAll('.add-room-cell').forEach(btn => {
            btn.onclick = async () => {
                if(!isAuthorized) return ToastView.show("Unauthorized", "warning");

                // LEGGI roomNum dal dataset che abbiamo appena aggiunto sopra
                const roomNum = btn.dataset.roomNum; 
                const yearId = this._currentYearId;

                console.log("Opening Preview for Room Number:", roomNum, "Year:", yearId);
                
                // Passiamo roomNum nell'oggetto dei parametri
                RoomDetailModal.show(null, isAuthorized, { yearId, roomNum });
            };
        });
    }
};