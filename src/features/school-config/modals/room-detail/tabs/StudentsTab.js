// src/features/school-config/modals/room-detail/tabs/StudentsTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';

export const StudentsTab = {
    render(data) {
        const students = data.enrolledStudents || [];
        
        // Separiamo attivi da inattivi/dropped per la visualizzazione differenziata
        const activeStudents = students.filter(s => s.active && !s.dropped)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
            
        const inactiveStudents = students.filter(s => !s.active || s.dropped)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        return `
            <div class="flex flex-col h-full">
                ${this._renderHeaderActions()}

                <div class="flex-1 overflow-auto px-1">
                    ${students.length === 0 
                        ? this._renderEmptyState() 
                        : `
                            <div class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
                                ${activeStudents.map((st, i) => this._renderStudentRow(st, i + 1)).join('')}

                                ${inactiveStudents.length > 0 ? `
                                    <div class="mt-8 pt-4 border-t border-slate-100">
                                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Inactive or Dropped Students</h4>
                                        <div class="space-y-2 opacity-60">
                                            ${inactiveStudents.map(st => this._renderStudentRow(st, null)).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `
                    }
                </div>
            </div>
        `;
    },

    _renderHeaderActions() {
        return `
            <div class="mb-4 flex gap-2 justify-center sticky top-0 bg-slate-50/50 backdrop-blur-sm py-2 z-10">
                <button id="btn-add-student" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    Add Student
                </button>
                <button id="btn-smart-copy-students" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    Smart Copy
                </button>
            </div>
        `;
    },

    _renderStudentRow(st, index) {
        const isInactive = !st.active || st.dropped;
        
        return `
            <div class="group relative flex items-center gap-3 p-3 ${isInactive ? 'bg-slate-50/50' : 'bg-white shadow-sm'} border border-slate-100 rounded-2xl transition-all hover:border-blue-200">
                
                <div class="flex-shrink-0 w-8 h-8 rounded-full ${isInactive ? 'bg-slate-200' : 'bg-blue-50'} flex items-center justify-center">
                    <span class="text-[11px] font-black ${isInactive ? 'text-slate-400' : 'text-blue-600'}">
                        ${index ? index : '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"></path></svg>'}
                    </span>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-800 truncate uppercase tracking-tight">
                            ${st.fullName}
                        </span>
                        ${st.dropped ? `<span class="bg-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase">Dropped</span>` : ''}
                    </div>
                    
                    <div class="flex items-center gap-3 mt-0.5">
                        <div class="flex items-center gap-1">
                            <span class="text-[9px] font-bold text-slate-400 uppercase">PREM:</span>
                            <span class="text-[10px] font-mono font-medium text-slate-600">${st.premNumber || 'N/A'}</span>
                        </div>
                        <div class="w-px h-2 bg-slate-200"></div>
                        <div class="flex items-center gap-1">
                            <span class="text-[10px] font-black ${st.gender === 'M' ? 'text-blue-400' : 'text-pink-400'}">${st.gender}</span>
                        </div>
                        ${st.droppedDate ? `
                            <div class="w-px h-2 bg-slate-200"></div>
                            <span class="text-[9px] text-slate-400 italic">Since ${new Date(st.droppedDate).toLocaleDateString()}</span>
                        ` : ''}
                    </div>
                </div>

                <div class="flex-shrink-0">
                    ${!isInactive ? `
                        <button data-student-id="${st.studentId}" class="btn-move-student p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Move to another room">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    _renderEmptyState() {
        return `
            <div class="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No students assigned</p>
                <p class="text-[10px] text-slate-400 mt-1">Add students manually or use Smart Copy from previous year.</p>
            </div>
        `;
    },

    postRender(container, yearRoomId, onRefresh) {
        // 1. LISTENER MOVE TO (Apre il RoomPickerModal)
        container.querySelectorAll('.btn-move-student').forEach(btn => {
            btn.onclick = async (e) => {
                const studentId = e.currentTarget.dataset.studentId;
                const studentName = e.currentTarget.closest('.group').querySelector('.text-xs').textContent;
                
                // Import dinamico del modale che creeremo
                const { RoomPickerModal } = await import('../RoomPickerModal.js');
                RoomPickerModal.show({
                    studentId,
                    studentName,
                    currentYearRoomId: yearRoomId,
                    onSuccess: () => {
                        ToastView.show("Student moved successfully", "success");
                        if (onRefresh) onRefresh();
                    }
                });
            };
        });

        // 2. LISTENER ADD STUDENT  --DA FARE
        const addBtn = container.querySelector('#btn-add-student');
//        if (addBtn) {
//            addBtn.onclick = async () => {
//                const { StudentPickerModal } = await import('../StudentPickerModal.js');
//                StudentPickerModal.show(yearRoomId, onRefresh);
//            };
//        }

        // 3. LISTENER SMART COPY
        const copyBtn = container.querySelector('#btn-smart-copy-students');
        if (copyBtn) {
            copyBtn.onclick = () => {
                ToastView.show("Smart Copy feature coming soon", "info");
            };
        }
    }
};