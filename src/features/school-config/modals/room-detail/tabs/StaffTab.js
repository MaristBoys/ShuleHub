// src/features/school-config/modals/room-detail/tabs/StaffTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';
import { TeacherAssignmentService } from '../../../../teacher-assignment/services/TeacherAssignmentService.js';


export const StaffTab = {
    /**
     * Renderizza la lista dei docenti assegnati alle materie della stanza
     * Estratto dalla logica _renderStaff di RoomDetailModal
     */
    /**
     * Renderizza la UI del tab Staffing
     */
    render(data) {
        const assignments = data.staffAssignments || [];

        if (assignments.length === 0) {
            return `
                ${this._renderFooter()}
                <div class="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No subjects assigned yet</p>
                    <p class="text-[10px] text-slate-400 mt-1">Use the buttons below to add subjects or copy from another room.</p>
                </div>
                
            `;
        }

        return `
            ${this._renderFooter()}
            <div class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                ${assignments.map((sa, i) => this._renderSubjectRow(sa, i)).join('')}
            </div>
            
        `;
    },

    /**
     * Renderizza la singola riga della materia
     */
    _renderSubjectRow(sa, index) {
        const isActive = sa.assignmentActive !== false; 
        const opacityClass = isActive ? 'opacity-100' : 'opacity-50 grayscale-[0.5]';
        
        const teacherName = sa.fullName || 'Assign Teacher';
        const isAssigned = !!sa.teacherId;

        return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-100 transition-all group ${opacityClass}">
                
                <div class="flex items-center flex-1 min-w-0 gap-3">
                    <div class="relative flex-shrink-0">
                        <div class="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            ${index + 1}
                        </div>
                    
                    
                        <div class="w-10 h-10 sm:w-12 sm:h-10 flex-shrink-0 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-100 font-black text-white text-[10px] uppercase">
                            ${sa.subjectAbbr}
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">        
                        <p class="text-[12px] font-bold text-slate-700 leading-tight break-words">
                            ${sa.subjectName}
                        </p>
                        <div class="sm:hidden mt-0.5">
                             <button class="js-assign-teacher inline-flex items-center gap-1.5 text-[11px] font-bold ${isAssigned ? 'text-slate-500' : 'text-blue-500'}" 
                                    data-subject-id="${sa.subjectId}" 
                                    data-subject-name="${sa.subjectName}">
                                <span class="border-b border-dashed ${isAssigned ? 'border-slate-300' : 'border-blue-300'}">${teacherName}</span>
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="hidden sm:block flex-1 px-4 text-right">
                    <button class="js-assign-teacher group/btn inline-flex items-center gap-2 text-xs font-bold transition-all ${isAssigned ? 'text-slate-600 hover:text-blue-600' : 'text-blue-500 hover:text-blue-700'}" 
                            data-subject-id="${sa.subjectId}" 
                            data-subject-name="${sa.subjectName}">
                        <span class="border-b border-dashed ${isAssigned ? 'border-slate-300 group-hover/btn:border-blue-400' : 'border-blue-300 group-hover/btn:border-blue-500'} pb-0.5">
                            ${teacherName}
                        </span>
                        <svg class="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                </div>

                <div class="flex items-center justify-end gap-2 pt-2 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-50">
                    ${sa.hasMarks ? `
                        <div class="p-2 text-amber-500 bg-amber-50 rounded-lg" title="Contains marks">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                    ` : ''}
                                       
                    <div class="flex items-center gap-2 mr-1">
                        <div class="w-10 text-right">
                            <span class="text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-slate-400'}">
                                ${isActive ? 'Active' : 'Off'}
                            </span>
                        </div>
                        <button class="js-toggle-status relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-slate-200'}" 
                                data-subject-id="${sa.subjectId}"
                                role="switch" 
                                aria-checked="${isActive}">
                            <span aria-hidden="true" class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}"></span>
                        </button>
                    </div>



                    <button class="js-remove-assignment p-2.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                            data-subject-id="${sa.subjectId}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Renderizza il footer interno con i bottoni d'azione
     */
    _renderFooter() {
        return `
            <div class="mb-3 flex gap-2 justify-center">
                <button id="btn-add-subject" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Subject
                </button>
                <button id="btn-smart-copy" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    Smart Copy
                </button>
            </div>
        `;
    },


    /**
     * Aggancia gli eventi agli elementi renderizzati.
     * @param {HTMLElement} container - L'elemento che contiene il tab
     * @param {Number} yearRoomId - L'ID della stanza corrente
     * @param {Function} onRefresh - Callback per ricaricare i dati del modale principale
     */
    postRender(container, yearRoomId, onRefresh) {
        // 1. ASSEGNAZIONE DOCENTE (Teacher Picker)
        container.querySelectorAll('.js-assign-teacher').forEach(btn => {
            btn.onclick = () => {
                const { subjectId, subjectName } = btn.dataset;

                // Importazione dinamica o riferimento globale al Picker
                import('../TeacherPickerModal.js').then(({ TeacherPickerModal }) => {
                    TeacherPickerModal.show({
                        title: `Assign Teacher: ${subjectName}`,
                        subjectId: subjectId, // Passando questo, il picker caricherà i docenti per la materia
                        onSelect: async (employeeId, fullName) => {
                            const { TeacherAssignmentService } = await import('../../../../teacher-assignment/services/TeacherAssignmentService.js');
                            const res = await TeacherAssignmentService.assignSubjectTeacher(yearRoomId, subjectId, employeeId);

                            if (res.success) {
                                ToastView.show(`Assigned ${fullName || 'None'} to ${subjectName}`, "success");
                                if (onRefresh) onRefresh();
                            } else {
                                ToastView.show(res.message, "error");
                            }
                        }
                    });
                });
            };
        });

        // 2. TOGGLE STATUS (Icona Occhio)
        container.querySelectorAll('.js-toggle-status').forEach(btn => {
            btn.onclick = async () => {
                const { subjectId } = btn.dataset;
                const { TeacherAssignmentService } = await import('../../../../teacher-assignment/services/TeacherAssignmentService.js');
                
                const res = await TeacherAssignmentService.toggleAssignmentStatus(yearRoomId, subjectId);
                if (res.success) {
                    ToastView.show("Status updated", "success");
                    if (onRefresh) onRefresh();
                }
            };
        });

        // 3. RIMOZIONE MATERIA (Cestino)
        container.querySelectorAll('.js-remove-assignment').forEach(btn => {
            btn.onclick = async () => {
                const { subjectId } = btn.dataset;
                if (!confirm("Are you sure you want to remove this subject?")) return;

                const { TeacherAssignmentService } = await import('../../../../teacher-assignment/services/TeacherAssignmentService.js');
                const res = await TeacherAssignmentService.removeAssignment(yearRoomId, subjectId);
                
                if (res.success) {
                    ToastView.show("Subject removed", "success");
                    if (onRefresh) onRefresh();
                } else {
                    ToastView.show(res.message, "error");
                }
            };
        });

        // 4. BOTTONE SMART COPY
        const copyBtn = container.querySelector('#btn-smart-copy');
        if (copyBtn) {
            copyBtn.onclick = () => {
                // Qui chiameremo il modale dello Smart Copy che svilupperemo dopo
                console.log("Opening Smart Copy for Room:", yearRoomId);
                // SmartCopyModal.show(yearRoomId, onRefresh);
            };
        }

        // 5. BOTTONE ADD SUBJECT
        const addBtn = container.querySelector('#btn-add-subject');
        if (addBtn) {
            addBtn.onclick = () => {
                // Path corretto al nuovo file
                import('../SubjectPickerModal.js').then(({ SubjectPickerModal }) => {
                    console.log("Opening Subject Picker for Room:", yearRoomId);
                    SubjectPickerModal.show(yearRoomId, onRefresh);
                });
            };
        }
    }







};