// src/features/school-config/modals/room-detail/tabs/ScalesTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';

export const ScalesTab = {
    render(data) {
        const scales = [
            { id: 'grade', label: 'Grade Scale', value: data.currentScales.gradeScaleId, key: 'GRADE' },
            { id: 'division', label: 'Division Scale', value: data.currentScales.divisionScaleId, key: 'DIVISION' },
            { id: 'conduct-alpha', label: 'Conduct (Alpha)', value: data.currentScales.conductAlphaScaleId, key: 'CONDUCT_ALPHA' },
            { id: 'conduct-text', label: 'Conduct (Text)', value: data.currentScales.conductTextScaleId, key: 'CONDUCT_TEXT' }
        ];

        return `
            <div class="grid grid-cols-1 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                ${scales.map(s => `
                    <div class="group p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                        <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">${s.label}</label>
                        <select id="${s.id}-scale-select" class="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer">
                            <option value="${s.value}">${data.currentScales[s.id + 'ScaleName'] || 'Select Scale...'}</option>
                        </select>
                        ${data.suggestedScaleIds[s.key] ? `
                            <p class="mt-2 text-[9px] text-blue-500 font-bold italic uppercase flex items-center gap-1">
                                <span class="w-1 h-1 bg-blue-500 rounded-full"></span>
                                Suggested: ${data.suggestedScaleIds[s.key]}
                            </p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    getData() {
        return {
            gradeScaleId: document.getElementById('grade-scale-select')?.value,
            divisionScaleId: document.getElementById('division-scale-select')?.value,
            conductAlphaScaleId: document.getElementById('conduct-alpha-scale-select')?.value,
            conductTextScaleId: document.getElementById('conduct-text-scale-select')?.value
        };
    },

    // SPOSTATA QUI: La logica di salvataggio specifica per le scale
    async save(yearRoomId, isActive, creationParams = null) {
        const scaleData = {
            ...this.getData(),
            isActive: isActive
        };

        if (yearRoomId) {
            // UPDATE
            return await SchoolConfigService.updateYearRoomScales(yearRoomId, scaleData);
        } else {
            // ACTIVATE (NEW)
            const payload = { ...creationParams, ...scaleData };
            const result = await SchoolConfigService.assignRoom(payload);
            return result; // Ritorniamo l'intero result per gestire il messaggio d'errore nel Modal
        }
    }
};