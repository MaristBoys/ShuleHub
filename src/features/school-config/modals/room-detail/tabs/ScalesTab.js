// src/features/school-config/modals/room-detail/tabs/ScalesTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';

export const ScalesTab = {
    _allScales: [],

    async render(data) {
        // 1. Carichiamo le scale tramite il Service se non le abbiamo in cache
        if (this._allScales.length === 0) {
            const result = await SchoolConfigService.getAllActiveScales();
            if (result && result.success) {
                this._allScales = result.data || [];
            }
        }

        const current = data.currentScales || {};
        
        // Configurazione dei 4 blocchi
        const configs = [
            { id: 'grade', label: 'Grade Scale', value: current.gradeScaleId, type: 'GRADE' },
            { id: 'division', label: 'Division Scale', value: current.divisionScaleId, type: 'DIVISION' },
            { id: 'conduct-alpha', label: 'Conduct Scale (Single Criteria)', value: current.conductAlphaScaleId, type: 'CONDUCT_ALPHA' },
            { id: 'conduct-text', label: 'Conduct Scale (General)', value: current.conductTextScaleId, type: 'CONDUCT_TEXT' }
        ];

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                ${configs.map(s => this._renderScaleRow(s)).join('')}
            </div>

            <div id="scale-popover-overlay" class="hidden fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[130]"></div>
            <div id="scale-popover" class="hidden fixed z-[140] bg-white rounded-3xl shadow-2xl w-[90%] max-w-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-slate-200">
                <div id="popover-content" class="p-5"></div>
                <button id="close-popover" class="w-full py-4 bg-slate-50 text-slate-500 font-black text-[10px] uppercase border-t border-slate-100">Close Preview</button>
            </div>
        `;
    },

    _renderScaleRow(s) {
        const options = this._allScales.filter(opt => opt.indicatorType === s.type);
        
        return `
            <div class="group p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm flex flex-col justify-center">
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        ${s.label}
                    </label>
                    <button type="button" class="info-trigger p-1 text-slate-300 hover:text-blue-500 transition-colors" data-select-id="${s.id}-scale-select">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                </div>

                <div class="relative">
                    <select id="${s.id}-scale-select" 
                        class="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none transition-all">
                        ${options.map(opt => `
                            <option value="${opt.id}" ${opt.id == s.value ? 'selected' : ''}>
                                ${opt.scaleName}
                            </option>
                        `).join('')}
                    </select>
                    
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    },

    initEvents() {
        const overlay = document.getElementById('scale-popover-overlay');
        const popover = document.getElementById('scale-popover');
        const content = document.getElementById('popover-content');
        if (!overlay || !popover) return;

        document.querySelectorAll('.info-trigger').forEach(trigger => {
            trigger.onclick = (e) => {
                const selectId = e.currentTarget.dataset.selectId;
                const scaleId = document.getElementById(selectId).value;
                if (!scaleId) return ToastView.show("Select a scale first", "info");

                const scale = this._allScales.find(sc => sc.id == scaleId);
                if (scale) this._showPopover(scale, overlay, popover, content);
            };
        });

        const hide = () => { overlay.classList.add('hidden'); popover.classList.add('hidden'); };
        overlay.onclick = hide;
        document.getElementById('close-popover').onclick = hide;
    },

    _showPopover(scale, overlay, popover, content) {
        const rangesHtml = scale.ranges?.length > 0 
            ? scale.ranges.map(r => `
                <tr class="border-b border-slate-50 last:border-0 text-xs">
                    <td class="py-2 font-bold text-blue-600">${r.textValue || '-'}</td>
                    <td class="py-2 text-slate-500">${r.attribute || '-'}</td>
                    <td class="py-2 text-center text-slate-700">${r.minValue}-${r.maxValue}</td>
                    <td class="py-2 text-right font-bold text-slate-600">${r.points}</td>
                </tr>`).join('')
            : '<tr><td colspan="4" class="py-4 text-center text-slate-400 text-xs">No details available</td></tr>';

        content.innerHTML = `
            <h4 class="text-sm font-black uppercase text-slate-800 mb-4">${scale.scaleName}</h4>
            <div class="max-h-[250px] overflow-y-auto">
                <table class="w-full text-left">
                    <thead class="text-[8px] uppercase text-slate-400 border-b border-slate-100">
                        <tr><th class="pb-2">Value</th><th class="pb-2">Attr</th><th class="pb-2 text-center">Range</th><th class="pb-2 text-right">Pts</th></tr>
                    </thead>
                    <tbody>${rangesHtml}</tbody>
                </table>
            </div>`;
        overlay.classList.remove('hidden');
        popover.classList.remove('hidden');
    },

/*    getData() {
        return {
            gradeScaleId: document.getElementById('grade-scale-select')?.value || null,
            divisionScaleId: document.getElementById('division-scale-select')?.value || null,
            conductAlphaScaleId: document.getElementById('conduct-alpha-scale-select')?.value || null,
            conductTextScaleId: document.getElementById('conduct-text-scale-select')?.value || null
        };
    },
*/

    getData() {
        return {
            // Cambiamo i nomi delle chiavi per farle combaciare con il Service Java
            "GRADE": document.getElementById('grade-scale-select')?.value || null,
            "DIVISION": document.getElementById('division-scale-select')?.value || null,
            "CONDUCT_ALPHA": document.getElementById('conduct-alpha-scale-select')?.value || null,
            "CONDUCT_TEXT": document.getElementById('conduct-text-scale-select')?.value || null
        };
    },

/*
    async save(yearRoomId, isActive, creationParams = null) {
        const scaleData = { ...this.getData(), isActive };
        return yearRoomId 
            ? await SchoolConfigService.updateYearRoomScales(yearRoomId, scaleData)
            : await SchoolConfigService.assignRoom({ ...creationParams, ...scaleData });
    }
*/
    async save(yearRoomId, isActive, creationParams = null) {
        // Recuperiamo le chiavi corrette (GRADE, DIVISION, ecc.)
        const scaleIds = this.getData();
        
        if (yearRoomId) {
            // Per l'UPDATE, il tuo controller Java accetta una Map<String, Short>
            // Attenzione: non inviare isActive qui se il controller aspetta solo la mappa delle scale
            return await SchoolConfigService.updateYearRoomScales(yearRoomId, scaleIds);
        } else {
            // Per la CREAZIONE (Activate Room), inviamo tutto insieme
            return await SchoolConfigService.assignRoom({ 
                ...creationParams, 
                ...scaleIds, 
                isActive 
            });
        }
    }





};