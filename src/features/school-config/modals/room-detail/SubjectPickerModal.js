import { SubjectService } from '../../../subject/service/SubjectService.js';
import { TeacherAssignmentService } from '../../../teacher-assignment/services/TeacherAssignmentService.js';
import { ToastView } from '../../../../core/ToastView.js';

export const SubjectPickerModal = {
    _selectedIds: new Set(),
    _allSubjects: [],

    show(yearRoomId, onRefresh) {
        this._selectedIds.clear(); // Reset selezione
        
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'subject-picker-overlay';
        modalOverlay.className = "fixed inset-0 z-[150] flex items-center justify-center bg-blue-950/20 backdrop-blur-md p-4 animate-in fade-in duration-200";

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">Select Subjects</h3>
                        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Multiple selection enabled</p>
                    </div>
                    <button id="close-subject-picker" class="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-slate-100">
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="p-4 border-b border-slate-100 flex-shrink-0">
                    <div class="relative">
                        <input type="text" id="subject-search" placeholder="Search subject..." 
                            class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <div id="subjects-list-container" class="overflow-y-auto p-2 flex-grow min-h-[300px] bg-slate-50/30">
                    <div class="flex items-center justify-center py-10">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                </div>

                <div class="p-4 border-t border-slate-100 bg-white flex-shrink-0">
                    <button id="btn-add-selected" disabled 
                        class="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400 transition-all flex items-center justify-center gap-2">
                        <span>Add Selected</span>
                        <span id="selected-count" class="bg-blue-500 text-[10px] px-2 py-0.5 rounded-full hidden">0</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this._loadAvailableSubjects(yearRoomId, onRefresh);
        this._setupEvents(modalOverlay, yearRoomId, onRefresh);
    },

    async _loadAvailableSubjects(yearRoomId, onRefresh) {
        const result = await SubjectService.getAvailableForRoom(yearRoomId);
        const container = document.getElementById('subjects-list-container');
        
        if (result.success && result.data.length > 0) {
            this._allSubjects = result.data;
            this._renderList(result.data);
        } else {
            container.innerHTML = `<div class="py-10 text-center px-6 text-slate-400 text-sm">No subjects available</div>`;
        }
    },

    _renderList(subjects) {
        const container = document.getElementById('subjects-list-container');
        container.innerHTML = subjects.map(s => {
            const isSelected = this._selectedIds.has(s.id.toString());
            return `
                <div class="subject-item group w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border mb-1 ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200'}" 
                    data-id="${s.id}">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all uppercase ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}">
                            ${s.subjectAbbr || '??'}
                        </div>
                        <div>
                            <p class="text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}">${s.subjectNameEng}</p>
                            <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tight">${s.subjectNameKsw || ''}</p>
                        </div>
                    </div>
                    
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-transparent'}">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                </div>
            `;
        }).join('');

        // Gestione click sulla riga per toggle
        container.querySelectorAll('.subject-item').forEach(item => {
            item.onclick = () => {
                const id = item.dataset.id;
                if (this._selectedIds.has(id)) {
                    this._selectedIds.delete(id);
                } else {
                    this._selectedIds.add(id);
                }
                this._updateFooter();
                this._renderList(this._currentFilteredSubjects || this._allSubjects);
            };
        });
    },

    _updateFooter() {
        const btn = document.getElementById('btn-add-selected');
        const countBadge = document.getElementById('selected-count');
        const count = this._selectedIds.size;

        if (count > 0) {
            btn.disabled = false;
            countBadge.innerText = count;
            countBadge.classList.remove('hidden');
        } else {
            btn.disabled = true;
            countBadge.classList.add('hidden');
        }
    },

    _setupEvents(overlay, yearRoomId, onRefresh) {
        document.getElementById('close-subject-picker').onclick = () => overlay.remove();
        
        const searchInput = document.getElementById('subject-search');
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            this._currentFilteredSubjects = this._allSubjects.filter(s => 
                s.subjectNameEng.toLowerCase().includes(term) || 
                s.subjectAbbr.toLowerCase().includes(term)
            );
            this._renderList(this._currentFilteredSubjects);
        };
/*
        const addBtn = document.getElementById('btn-add-selected');
        addBtn.onclick = async () => {
            const ids = Array.from(this._selectedIds);
            addBtn.disabled = true;
            addBtn.innerText = `Adding ${ids.length} subjects...`;

            try {
                // Eseguiamo tutte le assegnazioni in parallelo
                const { TeacherAssignmentService } = await import('../../../../teacher-assignment/services/TeacherAssignmentService.js');
                const promises = ids.map(id => TeacherAssignmentService.assignSubjectTeacher(yearRoomId, id, null));
                await Promise.all(promises);
                
                ToastView.show(`${ids.length} subjects added to staffing`, "success");
                overlay.remove();
                if (onRefresh) onRefresh();
            } catch (error) {
                ToastView.show("Error during bulk add", "error");
                this._updateFooter();
            }
        };

*/

        // Implementazione con Bulk Endpoint
        const addBtn = document.getElementById('btn-add-selected');
        addBtn.onclick = async () => {
            const ids = Array.from(this._selectedIds).map(id => parseInt(id));
            addBtn.disabled = true;
            addBtn.innerHTML = `<div class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> Adding...`;

            try {
                //const { TeacherAssignmentService } = await import('../../../../teacher-assignment/services/TeacherAssignmentService.js');
                const res = await TeacherAssignmentService.bulkAssignSubjects(yearRoomId, ids);
                
                if (res.success) {
                    ToastView.show(`${ids.length} subjects added successfully`, "success");
                    overlay.remove();
                    if (onRefresh) onRefresh();
                } else {
                    throw new Error(res.message);
                }
            } catch (error) {
                ToastView.show(error.message || "Error during bulk add", "error");
                this._updateFooter();
            }
        };






    }
};