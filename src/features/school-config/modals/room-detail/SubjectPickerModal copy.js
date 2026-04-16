import { SubjectService } from '../../../subject/service/SubjectService.js';
//import { TeacherAssignmentService } from '../../../../teacher-assignment/services/TeacherAssignmentService.js';
import { ToastView } from '../../../../core/ToastView.js';

export const SubjectPickerModal = {
    /**
     * Mostra il selettore delle materie disponibili filtrato dal backend
     */
    show(yearRoomId, onRefresh) {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'subject-picker-overlay';
        modalOverlay.className = "fixed inset-0 z-[150] flex items-center justify-center bg-blue-950/20 backdrop-blur-md p-4 animate-in fade-in duration-200";

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">Add Subject</h3>
                        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Select a subject to add to staffing</p>
                    </div>
                    <button id="close-subject-picker" class="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-slate-100">
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="p-4 border-b border-slate-100">
                    <div class="relative">
                        <input type="text" id="subject-search" placeholder="Search subject..." 
                            class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <div id="subjects-list-container" class="max-h-[400px] overflow-y-auto p-2 min-h-[200px]">
                    <div class="flex items-center justify-center py-10">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._loadAvailableSubjects(yearRoomId, onRefresh);
        this._setupEvents(modalOverlay);
    },

    async _loadAvailableSubjects(yearRoomId, onRefresh) {
        // Chiamata al nuovo endpoint filtrato nel backend
        const result = await SubjectService.getAvailableForRoom(yearRoomId);
        
        const container = document.getElementById('subjects-list-container');
        if (result.success && result.data.length > 0) {
            this._allSubjects = result.data;
            this._renderList(result.data, yearRoomId, onRefresh);
        } else {
            container.innerHTML = `
                <div class="py-10 text-center px-6">
                    <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-tight">No subjects available</p>
                    <p class="text-[10px] text-slate-400 mt-1">All active subjects are already assigned to this room.</p>
                </div>`;
        }
    },

    _renderList(subjects, yearRoomId, onRefresh) {
        const container = document.getElementById('subjects-list-container');
        container.innerHTML = subjects.map(s => `
            <button class="subject-item group w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-50 transition-all text-left border border-transparent hover:border-blue-100 mb-1" 
                data-id="${s.id}" data-name="${s.subjectNameEng}">
                <div class="w-12 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all uppercase">
                    ${s.subjectAbbr || '??'}
                </div>
                <div>
                    <p class="text-sm font-bold text-slate-700 group-hover:text-blue-700">${s.subjectNameEng}</p>
                    <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tight">${s.subjectNameKsw || ''}</p>
                </div>
            </button>
        `).join('');

        container.querySelectorAll('.subject-item').forEach(btn => {
            btn.onclick = async () => {
                const subjectId = btn.dataset.id;
                const subjectName = btn.dataset.name;
                
                // Assegnazione automatica senza docente (null)
                const { TeacherAssignmentService } = await import('../../../../teacher-assignment/services/TeacherAssignmentService.js');
                const res = await TeacherAssignmentService.assignSubjectTeacher(yearRoomId, subjectId, null);

                if (res.success) {
                    ToastView.show(`${subjectName} added successfully`, "success");
                    document.getElementById('subject-picker-overlay').remove();
                    if (onRefresh) onRefresh();
                } else {
                    ToastView.show(res.message, "error");
                }
            };
        });
    },

    _setupEvents(overlay) {
        document.getElementById('close-subject-picker').onclick = () => overlay.remove();
        
        const searchInput = document.getElementById('subject-search');
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this._allSubjects.filter(s => 
                s.subjectNameEng.toLowerCase().includes(term) || 
                s.subjectAbbr.toLowerCase().includes(term)
            );
            this._renderList(filtered);
        };
    }
};