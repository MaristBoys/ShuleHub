// src/features/dashboard/components/ConfigCardView.js
import { YearModal } from '../../school-config/modals/YearModal.js';
import { SubjectModal } from '../../school-config/modals/SubjectModal.js';
import { ToastView } from '../../../core/ToastView.js';

export const ConfigCardView = {
    /**
     * @param {Object} stats - Dati dal backend
     * @param {Object} feature - Dati della card (titolo, icona)
     * @param {Set} userPermissions - Set dei permessi dell'utente
     * @param {Boolean} hasAllAccess - Flag per il permesso ALL_ACCESS
     * @param {Boolean} hasAllView - Flag per il permesso ALL_VIEW  
     */
    render(stats, feature, userPermissions, hasAllAccess, hasAllView) {
        const card = document.createElement('div');
        card.className = "bg-white/90 backdrop-blur-sm py-4 px-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all flex flex-col h-full overflow-hidden animate-in fade-in duration-500";
        
        const schoolData = stats?.school || {};
        
        // Mappatura permessi micro per riga
        const rows = [
            { 
                id: 'year', label: 'Current Year', value: schoolData.currentYear, icon: '📅', 
                perm: 'CONFIG_EDIT_YEAR' 
            },
            { 
                id: 'rooms', label: 'Active Rooms', value: schoolData.activeRoomsCount, icon: '🚪', 
                perm: 'CONFIG_ACCESS_ROOMS' 
            },
            { 
                id: 'subjects', label: 'Active Subjects', value: schoolData.totalSubjectsCount, icon: '📚', 
                perm: 'CONFIG_EDIT_SUBJECTS' 
            }
        ];
        
        // insert rows into card HTML
        card.innerHTML = `
            <div class="dashboard-card-header flex items-center mb-3 border-b border-gray-100 pb-2">
                <div class="flex items-center gap-4">
                    <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-10 h-10 object-contain">
                    <h3 class="text-lg font-bold text-blue-900 tracking-tight">${feature.title}</h3>
                </div>
            </div>
            

            <div class="flex-1 flex flex-col justify-center space-y-2">
                ${rows.map(row => this._renderRow(row, userPermissions, hasAllAccess, hasAllView)).join('')}
            </div>
        `;

        // Passiamo i permessi ai listener per gestire i click
        this._setupListeners(card, userPermissions, hasAllAccess);
        return card;
    },

    /**
     * Renderizza una riga della card con logica dei lucchetti (Livello 2)
     */
    _renderRow(row, userPermissions, hasAllAccess, hasAllView) {
        // Una riga è cliccabile se l'utente ha ALL_VIEW (per vedere) o il permesso specifico (per editare)
        // o ovviamente se ha ALL_ACCESS
        const isClickable = hasAllAccess || hasAllView || userPermissions.has(row.perm);
        
        return `
            <div data-type="${row.id}" data-clickable="${isClickable}" 
                 class="group/row flex items-center justify-between p-2.5 rounded-xl transition-all border border-transparent
                 ${isClickable ? 'hover:bg-blue-50 hover:border-blue-100 cursor-pointer' : 'opacity-80 cursor-default'}">
                
                <div class="flex items-center gap-3">
                    <span class="text-lg">${row.icon}</span>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none">${row.label}</span>
                        <span class="text-sm font-black text-blue-900 mt-0.5 tracking-tight">${row.value || 0 }</span>
                    </div>
                </div>

                <div class="flex items-center">
                    ${isClickable 
                        ? `<div class="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center group-hover/row:bg-blue-600 transition-colors">
                                <span class="text-blue-600 group-hover/row:text-white text-sm font-bold mb-0.5">›</span>
                           </div>` 
                        : `<div class="text-gray-300 pr-1">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                             </svg>
                           </div>`
                    }
                </div>
            </div>
        `;
    },

    _setupListeners(card, userPermissions, hasAllAccess) {
        card.querySelectorAll('[data-type]').forEach(row => {
            row.onclick = (e) => {
                e.stopPropagation();
                const { type, clickable } = row.dataset;
                
                // Se non è cliccabile (nemmeno in sola lettura), facciamo l'animazione shake
                if (clickable !== "true") {
                    row.classList.add('animate-shake');
                    setTimeout(() => row.classList.remove('animate-shake'), 400);
                    ToastView.show("Access restricted: Permissions required", "warning");
                    return;
                }

                // Apertura Modali con passaggio permessi di scrittura (Livello 3)
                if (type === 'year') {
                    // Passiamo i flag che serviranno allo YearModal per abilitare/disabilitare i bottoni di modifica
                    const canEditYear = userPermissions.has('CONFIG_EDIT_YEAR');
                    YearModal.show(hasAllAccess, canEditYear);
                }
                
                if (type === 'rooms') {
                    // Implementazione futura per Rooms
                    ToastView.show("Rooms management coming soon", "info");
                }

                if (type === 'subjects') {
                    // Passiamo i flag di autorizzazione al nuovo modale Subjects
                    const canEditSubjects = userPermissions.has('CONFIG_EDIT_SUBJECTS');
                    SubjectModal.show(hasAllAccess, canEditSubjects);
                }
            };
        });
    }
};