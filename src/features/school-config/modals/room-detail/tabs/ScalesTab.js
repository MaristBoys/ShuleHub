// src/features/school-config/modals/room-detail/tabs/ScalesTab.js
import { SchoolConfigService } from '../../../services/SchoolConfigService.js';
import { ToastView } from '../../../../../core/ToastView.js';

export const ScalesTab = {
    _allScales: [],

    async render(data) {
        this._data = data; // Salviamo i dati per poterli usare in postRender e save

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

        const isNew = !data.yearRoomId;
        const btnLabel = isNew ? 'Activate Room' : 'Update Scales';

        return `
            <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${configs.map(conf => this._renderScaleRow(conf)).join('')}
                </div>
                
                <div class="flex justify-center pt-4 border-t border-slate-100">
                    <button id="btn-save-scales-internal" 
                            class="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        ${btnLabel}
                    </button>
                </div>
            </div>
      
            <div id="scale-popover-overlay" class="hidden fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[130]"></div>
            <div id="scale-popover" class="hidden fixed z-[140] bg-white rounded-3xl shadow-2xl w-[90%] max-w-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-slate-200">
                <div id="popover-content" class="p-5 text-[10px]"></div>
                <button id="close-popover" class="w-full py-4 bg-slate-50 text-slate-500 font-black text-[10px] uppercase border-t border-slate-100">Close Preview</button>
            </div>
        `;
    },


    postRender(overlay, onSaveSuccess) {
        // 1. Attiva i popover (Preview)
        this.initEvents(overlay);
        
        // 2. Attiva il bottone di salvataggio interno
        const saveBtn = overlay.querySelector('#btn-save-scales-internal');
        if (saveBtn) {
            saveBtn.onclick = async () => {
                
                const yearRoomId = this._data?.yearRoomId; // Recuperiamo l'ID della stanza (se esiste)
                const creationParams = this._data?.creationParams; // Recuperiamo creationParams che abbiamo iniettato nel render
                              
                // Eseguiamo il salvataggio
                // Passiamo true come isActive perché l'utente sta cliccando "Activate Room"
                const res = await this.save(yearRoomId, true, creationParams);
                if (res && res.success) {
                    ToastView.show(yearRoomId ? "Scales updated" : "Room activated!", "success");
                    if (onSaveSuccess) onSaveSuccess(res.data);
                } else {
                    ToastView.show(res?.message || "Error during save", "error");
                }
            };
        }  
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

    initEvents(overlay) {
        
        const popoverOverlay = overlay.querySelector('#scale-popover-overlay');
        const popover = overlay.querySelector('#scale-popover');
        const content = overlay.querySelector('#popover-content');       

        if (!overlay || !popover) return;

        // Listener sulle icone "i" (info-trigger)
        overlay.querySelectorAll('.info-trigger').forEach(trigger => {
            trigger.onclick = (e) => {
                const selectId = e.currentTarget.dataset.selectId;
                const selectElement = overlay.querySelector(`#${selectId}`);
                const scaleId = selectElement ? selectElement.value : null;
                if (!scaleId) return ToastView.show("Select a scale first", "info");

                const scale = this._allScales.find(sc => sc.id == scaleId);
                if (scale) this._showPopover(scale, popoverOverlay, popover, content);
            };
        });

        // Funzione per chiudere
        const hide = () => { 
            popoverOverlay.classList.add('hidden'); 
            popover.classList.add('hidden'); 
        };
        
        popoverOverlay.onclick = hide;
        const closeBtn = overlay.querySelector('#close-popover');
        if (closeBtn) closeBtn.onclick = hide;
    },

    _showPopover(scale, overlay, popover, content) {
    // 1. Generiamo le righe della tabella
        const ranges = scale.ranges || [];
        
        const rangesHtml = ranges.length > 0 
            ? ranges.map(r => `
                <tr class="border-b border-slate-50 last:border-0 text-[11px]">
                    <td class="py-3 font-black text-blue-600">${r.textValue || '-'}</td>
                    <td class="py-3 text-slate-500 font-medium">${r.attribute || '-'}</td>
                    <td class="py-3 text-center text-slate-700 font-bold">${r.minValue ?? 0}-${r.maxValue ?? 0}%</td>
                    <td class="py-3 text-right font-black text-slate-400">${r.points ?? 0}</td>
                </tr>`).join('')
            : '<tr><td colspan="4" class="py-8 text-center text-slate-400 italic">No details available</td></tr>';

        // 2. Costruiamo l'intero contenuto del popover
        content.innerHTML = `
            <div class="mb-4 flex items-center justify-between">
                <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider">${scale.scaleName || 'Scale Detail'}</h4>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-500 text-[8px] font-black rounded-lg uppercase">${scale.indicatorType || ''}</span>
            </div>
            
            <div class="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <table class="w-full text-left border-collapse">
                    <thead class="sticky top-0 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                        <tr class="text-[9px] uppercase text-slate-400 font-black tracking-widest">
                            <th class="pb-2">Value</th>
                            <th class="pb-2">Label</th>
                            <th class="pb-2 text-center">Range</th>
                            <th class="pb-2 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${rangesHtml}
                    </tbody>
                </table>
            </div>
        `;

        // 3. Mostriamo gli elementi
        overlay.classList.remove('hidden');
        popover.classList.remove('hidden');
        
        // 4. Reset dello scroll del contenuto (se l'utente lo aveva scrollato prima)
        const scrollContainer = content.querySelector('.overflow-y-auto');
        if (scrollContainer) scrollContainer.scrollTop = 0;
    },

    getData() {
        return {
            // Cambiamo i nomi delle chiavi per farle combaciare con il Service Java
            "GRADE": document.getElementById('grade-scale-select')?.value || null,
            "DIVISION": document.getElementById('division-scale-select')?.value || null,
            "CONDUCT_ALPHA": document.getElementById('conduct-alpha-scale-select')?.value || null,
            "CONDUCT_TEXT": document.getElementById('conduct-text-scale-select')?.value || null
        };
    },

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