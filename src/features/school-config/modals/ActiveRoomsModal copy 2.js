// src/features/school-config/modals/ActiveRoomsModal.js
import { ToastView } from '../../../core/ToastView.js';
import { SchoolConfigService } from '../services/SchoolConfigService.js';
import { RoomDetailModal } from './RoomDetailModal.js';

export const ActiveRoomsModal = {
    _currentYearId: null,
    _currentYearName: '',

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
            <div class="bg-white w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-[95vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Academic Year Matrix</h3>
                        <p class="text-sm text-slate-500 font-medium">Rooms Configuration for ${yearName}</p>
                    </div>
                    <button id="close-rooms-modal" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="flex-1 overflow-auto p-6 bg-slate-50/50">
                    <div class="min-w-max">
                        <table class="w-full border-separate border-spacing-3">
                            <thead>
                                <tr>
                                    <th class="p-2"></th>
                                    ${streams.map(s => `
                                        <th class="p-3 text-center">
                                            <span class="px-4 py-1.5 bg-white shadow-sm border border-slate-200 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Stream ${s}
                                            </span>
                                        </th>
                                    `).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(row => `
                                    <tr>
                                        <td class="pr-4 py-2">
                                            <div class="flex items-center justify-end">
                                                <span class="text-sm font-black text-slate-400 uppercase tracking-tighter">Form ${row.formNum}</span>
                                                <div class="h-8 w-1 bg-blue-500 rounded-full ml-3"></div>
                                            </div>
                                        </td>
                                        ${streams.map(streamId => {
                                            // Recuperiamo la cella dalla mappa usando l'ID dello stream come chiave
                                            const cell = row.cells ? row.cells[streamId] : null;
                                            
                                            return `
                                                <td class="p-0">
                                                    ${(cell && cell.assigned)
                                                        ? this._renderActiveCell(cell) 
                                                        : this._renderEmptyCell(row.formNum, streamId, isAuthorized)}
                                                </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
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

    _renderActiveCell(cell) {
        return `
            <button data-id="${cell.yearRoomId}" 
                class="room-cell group w-40 h-24 bg-white hover:bg-blue-600 border border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-blue-200/50 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3 overflow-hidden relative">
                
                <div class="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                    <svg class="text-blue-600 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-xs font-black text-slate-700 group-hover:text-white uppercase tracking-tight truncate w-full text-center">
                        ${cell.roomName}
                    </span>
                    <span class="text-[9px] font-bold text-slate-400 group-hover:text-blue-200 uppercase">
                        ${cell.studentCount} Students
                    </span>
                </div>
            </button>
        `;
    },

    _renderEmptyCell(formNum, streamId, isAuthorized) {
        const suggestedName = `${formNum}${streamId}`;
        return `
            <button data-form="${formNum}" data-stream="${streamId}" data-suggested="${suggestedName}"
                class="add-room-cell w-40 h-24 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-1 group">
                <div class="w-7 h-7 rounded-full border-2 border-slate-200 group-hover:border-blue-400 transition-all flex items-center justify-center">
                    <svg class="text-slate-300 group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 text-center transition-colors leading-tight">
                    Assign<br>Room ${suggestedName}
                </span>
            </button>
        `;
    },

    _setupListeners(isAuthorized) {
        const overlay = document.getElementById('rooms-modal-overlay');
        const closeBtn = document.getElementById('close-rooms-modal');

        if(closeBtn) closeBtn.onclick = () => overlay.remove();
        
        document.querySelectorAll('.room-cell').forEach(btn => {
            btn.onclick = () => {
                const yearRoomId = btn.dataset.id;
                RoomDetailModal.show(yearRoomId, isAuthorized);
            };
        });

        document.querySelectorAll('.add-room-cell').forEach(btn => {
            btn.onclick = async () => {
                if(!isAuthorized) return ToastView.show("Unauthorized action", "warning");
                const { form, stream, suggested } = btn.dataset;
                const result = await SchoolConfigService.assignRoom(this._currentYearId, form, stream);
                if (result.success) {
                    ToastView.show(`Room ${suggested} assigned`, "success");
                    overlay.remove();
                    this.show(this._currentYearId, isAuthorized, this._currentYearName);
                }
            };
        });
    }
};