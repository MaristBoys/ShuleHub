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
            <div class="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 class="text-2xl font-black text-blue-900 uppercase tracking-tight">Active Rooms Matrix</h2>
                        <p class="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">School Academic Layout</p>
                    </div>
                    <button id="close-rooms-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="p-8 overflow-auto bg-gray-50/50 flex-1">
                    <table class="w-full border-separate border-spacing-3">
                        <thead>
                            <tr>
                                <th class="w-32"></th> ${streams.map(s => `
                                    <th class="text-center">
                                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stream</span>
                                        <div class="text-lg font-black text-blue-900">${s}</div>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(row => this._renderRow(row, streams, isAuthorized)).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div class="flex gap-4">
                        <div class="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                            <span class="w-3 h-3 bg-blue-600 rounded-sm"></span> Active Room
                        </div>
                        <div class="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                            <span class="w-3 h-3 bg-white border border-dashed border-gray-300 rounded-sm"></span> Available
                        </div>
                    </div>
                    <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Click a cell to manage assignments</p>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._setupListeners(isAuthorized);
    },

    _renderRow(row, streams, isAuthorized) {
        return `
            <tr>
                <td class="pr-4">
                    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <span class="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Level</span>
                        <div class="text-sm font-black text-blue-900 whitespace-nowrap">${row.formName}</div>
                    </div>
                </td>
                ${streams.map(streamNum => {
                    const cell = row.cells[streamNum];
                    return `
                        <td>
                            ${cell.isAssigned 
                                ? this._renderActiveCell(cell) 
                                : this._renderEmptyCell(row.formNum, streamNum, isAuthorized)}
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    },

    _renderActiveCell(cell) {
        return `
            <button class="room-cell w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex flex-col items-center justify-center group"
                data-id="${cell.id}">
                <span class="text-xs font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">${cell.roomName}</span>
                <span class="text-[9px] font-bold mt-1 bg-blue-500 px-2 py-0.5 rounded-full">MANAGE</span>
            </button>
        `;
    },

    _renderEmptyCell(formNum, streamNum, isAuthorized) {
        return `
            <button class="add-room-cell w-full h-20 bg-white border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-300 hover:text-blue-400 rounded-2xl transition-all flex items-center justify-center group"
                data-form="${formNum}" data-stream="${streamNum}" ${!isAuthorized ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="opacity-40 group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        `;
    },

    _setupListeners(isAuthorized) {
        document.getElementById('close-rooms-modal').onclick = () => {
            document.getElementById('rooms-modal-overlay').remove();
        };

        // Click su stanza esistente -> Verso Fase 3 (Dettaglio Room)
        document.querySelectorAll('.room-cell').forEach(btn => {
            btn.onclick = () => {
                const roomId = btn.dataset.id;
                console.log("Opening Room Dashboard for ID:", roomId);
                // Qui chiameremo il prossimo componente della Fase 3
                ToastView.show("Opening Room Dashboard...", "info");
            };
        });

        // Click su cella vuota -> Creazione rapida
        document.querySelectorAll('.add-room-cell').forEach(btn => {
            btn.onclick = () => {
                if(!isAuthorized) return;
                const { form, stream } = btn.dataset;
                console.log(`Creating Room for Form ${form} - Stream ${stream}`);
                // Implementeremo la creazione nel prossimo step
            };
        });
    }
};