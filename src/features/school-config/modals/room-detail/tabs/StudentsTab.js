// src/features/school-config/modals/room-detail/tabs/StudentsTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';

export const StudentsTab = {
    /**
     * Renderizza la lista degli studenti iscritti nella stanza
     * Estratto dalla logica _renderStudents di RoomDetailModal
     */
    render(data) {
        if (!data.enrolledStudents || data.enrolledStudents.length === 0) {
            return `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No students enrolled in this room</p>
                </div>
            `;
        }

        return `
            <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div class="grid grid-cols-1 gap-2">
                    ${data.enrolledStudents.map((st, index) => `
                        <div class="flex items-center gap-4 p-3 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-100 group">
                            <span class="text-[10px] font-black text-slate-300 w-4">${index + 1}</span>
                            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-500 border border-blue-100">
                                ${this._getInitials(st.fullName)}
                            </div>
                            <div class="flex-1 min-w-0">
                                <span class="text-xs font-bold text-slate-700 truncate block">${st.fullName}</span>
                            </div>
                            <span class="text-[9px] font-black ${st.isActive ? 'text-emerald-500' : 'text-slate-300'} uppercase italic shrink-0">
                                ${st.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Helper per estrarre le iniziali
     */
    _getInitials(name) {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
    },

    /**
     * Raccoglie i dati degli studenti (es. se ci sono checkbox per iscrizione/disiscrizione)
     */
    getData() {
        // Logica futura per raccogliere modifiche alla lista studenti
        return [];
    },

    /**
     * Gestisce il salvataggio degli studenti (Tabella cfg_yearroom_student)
     * Estratto da _handleStudentsSave
     */
    async save(yearRoomId) {
        console.log("Saving Students to cfg_yearroom_student for room:", yearRoomId);
        
        // Placeholder per la logica YearRoomStudent.java:
        // const studentData = this.getData();
        // return await SchoolConfigService.saveStudents(yearRoomId, studentData);

        ToastView.show("Student assignment not implemented yet", "info");
        return false;
    }
};