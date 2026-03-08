// src/features/school-config/modals/ActiveRoomsModal.js
import { ConfigService } from '../services/ConfigService.js';
import { ToastView } from '../../../core/ToastView.js';

export const ActiveRoomsModal = {
    _currentYearId: null,

    async show(yearId, isAuthorized = false) {
        this._currentYearId = yearId;
        const result = await ConfigService.getRoomMatrix(yearId);
        
        if (!result.success) {
            return ToastView.show("Error loading room matrix", "error");
        }

        const { streams, rows } = result.data;

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'rooms-modal-overlay';
        modalOverlay.className = "fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200";
        
        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 class="text-2xl font-black text-blue-900 uppercase tracking-tight">Active Rooms Dashboard</h2>
                        <p class="text-slate-500 text-sm font-medium">Manage class assignments</p>
                    </div>
                    <button id="close-rooms-modal" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="flex-1 overflow-auto p-8 bg-slate-50/50">
                    <table class="w-full border-separate border-spacing-4">
                        <thead>
                            <tr>
                                <th class="w-24 px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-widest"></th>
                                ${streams.map(s => `
                                    <th class="px-4 py-2 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">Stream ${s}</th>
                                `).join('')}
                                <th class="w-16"></th> </tr>
                        </thead>
                        <tbody>
                            ${rows.map(row => `
                                <tr>
                                    <td class="align-middle pr-4">
                                        <span class="text-xs font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                                            ${row.formName}
                                        </span>
                                    </td>
                                    ${streams.map(sNum => {
                                        // Trasformiamo sNum in stringa per matchare le chiavi del JSON ("1", "2", etc.)
                                        const room = row.cells[String(sNum)]; 
                                        // Passiamo row.formId se disponibile, altrimenti usiamo row.formNum come riferimento
                                        return `<td>${this._renderCell(room, row.formId || row.formNum, sNum, isAuthorized)}</td>`;
                                    }).join('')}
                                    <td class="opacity-0 hover:opacity-100 transition-opacity">
                                        <button class="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 text-slate-300 flex items-center justify-center">
                                            <small>+</small>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners(isAuthorized);
    },

    /**
     * Renderizza il contenuto della cella (Stanza attiva o Slot vuoto)
     */
    _renderCell(room, formId, streamNum, isAuthorized) {
        // Verifichiamo 'assigned' come appare nel tuo JSON
        if (room && room.assigned === true) {
            return this._renderActiveRoom(room);
        } else {
            return this._renderEmptySlot(formId, streamNum, isAuthorized);
        }
    },

    /**
     * Template per una stanza con dati dashboard
     */
    _renderActiveRoom(room) {
        // Logica colore Staffing Badge
        let staffingClass = "bg-red-100 text-red-700"; // Sotto il 50%
        if (room.staffingPercentage >= 1) {
            staffingClass = "bg-green-100 text-green-700"; // Al completo
        } else if (room.staffingPercentage >= 0.5) {
            staffingClass = "bg-orange-100 text-orange-700"; // Sopra il 50%
        }
    
        return `
            <button data-id="${room.yearRoomId}" class="room-cell group w-full bg-white border-2 border-transparent hover:border-blue-500 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3 text-left">
                
                <div class="flex justify-between items-start">
                    <span class="text-lg font-black text-blue-900">${room.roomName}</span>
                    <span class="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        ${room.studentCount || 0}
                    </span>
                </div>

                <div class="flex items-center gap-2">
                    <div class="p-1.5 rounded-lg ${room.classTeacherId ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span class="text-xs font-bold truncate ${room.classTeacherId ? 'text-slate-700' : 'text-slate-400 italic'}">
                        ${room.classTeacherName || 'No Class Teacher'}
                    </span>
                </div>

                <div class="mt-1 pt-3 border-t border-slate-50 flex justify-between items-center">
                    <span class="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Staffing Ratio</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-black ${staffingClass}">
                        ${room.staffingRatio || '0/0'}
                    </span>
                </div>
            </button>
        `;
    },

    /**
     * Template per uno slot vuoto (Ghost Slot)
     */
    _renderEmptySlot(formId, streamNum, isAuthorized) {
        return `
            <button data-form="${formId}" data-stream="${streamNum}" 
                class="add-room-cell w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                <div class="p-2 rounded-full border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest">Assign Room</span>
            </button>
        `;
    },

    _setupListeners(isAuthorized) {
        document.getElementById('close-rooms-modal').onclick = () => {
            document.getElementById('rooms-modal-overlay').remove();
        };

        // Click su stanza attiva -> Dashboard Dettaglio Room
        document.querySelectorAll('.room-cell').forEach(btn => {
            btn.onclick = () => {
                const roomId = btn.dataset.id;
                console.log("Opening Room Dashboard:", roomId);
                ToastView.show("Loading room dashboard...", "info");
                // Qui chiameremo il componente della Fase 3
            };
        });

        // Click su slot vuoto -> Assegnazione rapida
        document.querySelectorAll('.add-room-cell').forEach(btn => {
            btn.onclick = () => {
                if(!isAuthorized) return ToastView.show("Unauthorized", "warning");
                const { form, stream } = btn.dataset;
                console.log(`Assigning new room to Form ${form} Stream ${stream}`);
                // Qui apriremo il selettore delle stanze fisiche
            };
        });
    }
};