import { TeacherAssignmentService } from '../../../teacher-assignment/services/TeacherAssignmentService.js';

export const TeacherPickerModal = {
    show(options = { title: "Select Teacher", onSelect: null, subjectId: null }) {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'teacher-picker-overlay';
        modalOverlay.className = "fixed inset-0 z-[120] flex items-center justify-center bg-blue-950/20 backdrop-blur-md p-4 animate-in fade-in duration-200";

        modalOverlay.innerHTML = `
            <div class=\"bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300\">
                <div class=\"px-6 py-4 border-b border-slate-100 flex justify-between items-center\">
                    <h3 class=\"text-lg font-bold text-slate-800\">${options.title}</h3>
                    <button id=\"close-picker\" class=\"p-2 hover:bg-slate-100 rounded-full transition-colors\">
                        <svg class=\"w-5 h-5 text-slate-500\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path></svg>
                    </button>
                </div>
                
                <div class=\"p-4\">
                    <div class=\"relative mb-4\">
                        <input type=\"text\" id=\"teacher-search\" placeholder=\"Search teacher...\" 
                               class=\"w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500\">
                        <svg class=\"w-4 h-4 text-slate-400 absolute left-3 top-3\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\"></path></svg>
                    </div>

                    <div id=\"teachers-list\" class=\"max-h-[300px] overflow-y-auto space-y-1 pr-2\">
                        <div class=\"p-8 text-center text-slate-400\">Loading teachers...</div>
                    </div>
                </div>
            </div>`;

        document.body.appendChild(modalOverlay);
        this._loadTeachers(options);
        this._setupEvents(modalOverlay, options);
    },

    async _loadTeachers(options) {
        let result;
        if (options.subjectId) {
            result = await TeacherAssignmentService.getEligibleTeachersForSubject(options.subjectId);
        } else {
            result = await TeacherAssignmentService.getEligibleClassTeachers();
        }

        const container = document.getElementById('teachers-list');
        if (result.success && result.data.length > 0) {
            this._allTeachers = result.data;
            this._renderList(result.data, options.onSelect);
        } else {
            container.innerHTML = `<div class="p-8 text-center text-slate-400">No teachers found.</div>`;
        }
    },

    _renderList(teachers, onSelect) {
        const container = document.getElementById('teachers-list');
        container.innerHTML = teachers.map(t => `
            <button class=\"teacher-item w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-3 group\" 
                    data-id=\"${t.employeeId}\" data-name=\"${t.fullName}\">
                <div class=\"w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600\">
                    ${t.fullName.charAt(0)}
                </div>
                <span class=\"text-sm font-medium text-slate-700\">${t.fullName}</span>
            </button>
        `).join('');

        container.querySelectorAll('.teacher-item').forEach(btn => {
            btn.onclick = () => {
                if (onSelect) onSelect(btn.dataset.id, btn.dataset.name);
                document.getElementById('teacher-picker-overlay').remove();
            };
        });
    },

    _setupEvents(overlay, options) {
        document.getElementById('close-picker').onclick = () => overlay.remove();
        
        const searchInput = document.getElementById('teacher-search');
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this._allTeachers.filter(t => t.fullName.toLowerCase().includes(term));
            this._renderList(filtered, options.onSelect);
        };
    }
};