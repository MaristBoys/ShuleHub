// src/features/school-config/modals/room-detail/RoomPickerModal.js
import { SchoolConfigService } from '../../services/SchoolConfigService.js';
import { ToastView } from '../../../../core/ToastView.js';

export const RoomPickerModal = {
    /**
     * Mostra il modale per spostare uno studente in un'altra stanza
     */
    async show({ studentId, studentName, currentYearRoomId, onSuccess }) {
        // Recuperiamo l'anno corrente dalla selezione globale (fallback a 1 se non definito)
        const currentYearId = window.currentYearSelected || 1;
        
        // Carichiamo la matrice delle stanze per avere la lista aggiornata delle destinazioni
        const matrixData = await SchoolConfigService.getRoomMatrix(currentYearId);

        if (!matrixData || !matrixData.success) {
            ToastView.show("Could not load destination rooms", "error");
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'room-picker-overlay';
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300';
        
        overlay.innerHTML = this._render(studentName, matrixData.data.grades, currentYearRoomId);
        document.body.appendChild(overlay);

        this._setupListeners(overlay, studentId, onSuccess);
    },

    _render(studentName, grades, currentYearRoomId) {
        return `
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-6 border-b border-slate-100 bg-white">
                    <div class="flex justify-between items-center mb-1">
                        <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight">Move Student</h3>
                        <button id="close-room-picker" class="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <p class="text-[11px] text-slate-500 font-medium">
                        Target destination for <span class="text-blue-600 font-bold">${studentName}</span>
                    </p>
                </div>

                <div class="p-4 max-h-[60vh] overflow-auto bg-slate-50">
                    <div class="space-y-6">
                        ${grades.map(grade => `
                            <div>
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
                                    ${grade.gradeName}
                                </h4>
                                <div class="grid grid-cols-2 gap-2">
                                    ${grade.rooms.map(room => {
                                        const isCurrent = room.yearRoomId === currentYearRoomId;
                                        const isGhost = !room.yearRoomId; // La stanza esiste nel database ma non è attiva per l'anno

                                        return `
                                            <button 
                                                data-yearroom-id="${room.yearRoomId}"
                                                ${(isCurrent || isGhost) ? 'disabled' : ''}
                                                class="room-dest-card group p-3 rounded-2xl border text-left transition-all
                                                ${isCurrent ? 'border-blue-200 bg-blue-50 opacity-60 cursor-not-allowed' : 
                                                  isGhost ? 'border-slate-200 bg-slate-100 opacity-40 cursor-not-allowed' : 
                                                  'border-white bg-white hover:border-blue-400 hover:shadow-md shadow-sm active:scale-[0.98]'}"
                                            >
                                                <div class="text-xs font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-700'}">
                                                    ${room.roomName}
                                                </div>
                                                <div class="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">
                                                    ${isCurrent ? 'Current' : isGhost ? 'Inactive' : 'Available'}
                                                </div>
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="p-4 bg-white border-t border-slate-100">
                    <div class="flex items-start gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                        <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p class="text-[10px] text-blue-700 leading-tight">
                            Moving a student will transfer all their academic records to the new room for the current year.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    _setupListeners(overlay, studentId, onSuccess) {
        // Chiudi il modale
        const closeBtn = overlay.querySelector('#close-room-picker');
        const close = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 200);
        };

        closeBtn.onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };

        // Selezione della stanza di destinazione
        overlay.querySelectorAll('.room-dest-card:not([disabled])').forEach(btn => {
            btn.onclick = async () => {
                const targetYearRoomId = btn.dataset.yearroomId;
                
                try {
                    // Chiamata al service per lo spostamento
                    const res = await SchoolConfigService.moveStudent(studentId, targetYearRoomId);
                    
                    if (res && res.success) {
                        ToastView.show("Student moved successfully", "success");
                        overlay.remove();
                        if (onSuccess) onSuccess();
                    } else {
                        ToastView.show(res?.message || "Error moving student", "error");
                    }
                } catch (error) {
                    console.error("Move error:", error);
                    ToastView.show("An unexpected error occurred", "error");
                }
            };
        });
    }
};