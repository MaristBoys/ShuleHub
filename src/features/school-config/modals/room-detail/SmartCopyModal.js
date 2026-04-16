import { SchoolConfigService } from '../../services/SchoolConfigService.js';
import { TeacherAssignmentService } from '../../../teacher-assignment/services/TeacherAssignmentService.js';
import { ToastView } from '../../../../core/ToastView.js';

export const SmartCopyModal = {
    async show(targetYearRoomId, currentYearId, onComplete) {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'smart-copy-overlay';
        modalOverlay.className = "fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200";

        // Recuperiamo le stanze disponibili per la copia (es. dall'anno precedente o corrente)
        // Per ora semplifichiamo chiedendo al service le stanze dell'anno selezionato
        const rooms = await SchoolConfigService.getRoomMatrix(currentYearId);
        const roomOptions = rooms?.data?.flat().filter(r => r && r.yearRoomId !== targetYearRoomId) || [];

        modalOverlay.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 class="text-lg font-bold text-slate-800">Smart Copy</h3>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Clone staffing configuration</p>
                </div>

                <div class="p-6 space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Source Room</label>
                        <select id="source-room-select" class="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Select a room to copy from...</option>
                            ${roomOptions.map(r => `<option value="${r.yearRoomId}">${r.roomName} (${r.yearName})</option>`).join('')}
                        </select>
                    </div>

                    <div class="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" id="copy-subjects" checked disabled class="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500">
                            <span class="text-xs font-bold text-slate-700 group-hover:text-blue-700">Copy Subjects Structure</span>
                        </label>
                        
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" id="copy-teachers" class="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-700 group-hover:text-blue-700">Include Assigned Teachers</span>
                                <span class="text-[9px] text-slate-400 font-medium">Keep the same staff if possible</span>
                            </div>
                        </label>

                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" id="include-ct" class="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500">
                            <span class="text-xs font-bold text-slate-700 group-hover:text-blue-700">Include Class Teacher</span>
                        </label>
                    </div>
                </div>

                <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button id="cancel-copy" class="flex-1 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-copy" class="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        Copy Configuration
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Eventi
        document.getElementById('cancel-copy').onclick = () => modalOverlay.remove();
        
        document.getElementById('confirm-copy').onclick = async () => {
            const sourceId = document.getElementById('source-room-select').value;
            if (!sourceId) {
                ToastView.show("Please select a source room", "warning");
                return;
            }

            const payload = {
                sourceYearRoomId: parseInt(sourceId),
                copyTeachers: document.getElementById('copy-teachers').checked,
                includeClassTeacher: document.getElementById('include-ct').checked
            };

            const res = await TeacherAssignmentService.smartCopy(targetYearRoomId, payload);
            
            if (res.success) {
                ToastView.show("Configuration copied successfully", "info");
                modalOverlay.remove();
                if (onComplete) onComplete();
            } else {
                ToastView.show(res.message || "Error during copy", "error");
            }
        };
    }
};