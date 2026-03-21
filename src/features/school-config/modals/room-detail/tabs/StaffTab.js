// src/features/school-config/modals/room-detail/tabs/StaffTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';

export const StaffTab = {
    /**
     * Renderizza la lista dei docenti assegnati alle materie della stanza
     * Estratto dalla logica _renderStaff di RoomDetailModal
     */
    render(data) {
        if (!data.staffAssignments || data.staffAssignments.length === 0) {
            return `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No subjects defined for this form</p>
                </div>
            `;
        }

        return `
            <div class="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                ${data.staffAssignments.map(sa => `
                    <div class="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md hover:shadow-slate-100 transition-all border border-slate-100 group">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black uppercase shadow-sm shrink-0">
                                ${sa.subjectName.substring(0, 3)}
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs font-black text-slate-700 uppercase tracking-tighter truncate">${sa.subjectName}</p>
                                ${sa.isClassTeacher ? 
                                    '<span class="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase inline-block mt-0.5">Class Teacher</span>' 
                                    : ''}
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

    /**
     * Raccoglie i dati dalla tabella staff (da implementare quando avremo i selettori attivi)
     */
    getData() {
        // Al momento ritorna un array vuoto o la logica di scraping della tabella
        // Sarà collegata alla tabella cfg_yearroom_subject_teacher
        return []; 
    },

    /**
     * Gestisce il salvataggio dello Staffing
     * Estratto da _handleStaffSave
     */
    async save(yearRoomId) {
        console.log("Saving Staffing to cfg_yearroom_subject_teacher for room:", yearRoomId);
        
        // Placeholder per la logica futura:
        // const staffData = this.getData();
        // return await SchoolConfigService.saveStaffing(yearRoomId, staffData);
        
        ToastView.show("Staffing save not implemented yet", "info");
        return false; 
    }
};