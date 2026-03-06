// src/features/dashboard/components/ConfigCardView.js
import { YearModal } from '../../school-config/modals/YearModal.js';
import { ToastView } from '../../../core/ToastView.js';

export const ConfigCardView = {
    /**
     * @param {Object} stats - Dati dal backend
     * @param {Object} feature - Dati della card (titolo, icona)
     * @param {Set} userPermissions - Set dei permessi dell'utente
     * @param {Boolean} hasAllAccess - Flag per il permesso ALL_ACCESS
     */
    render(stats, feature, userPermissions, hasAllAccess) {
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

        // Rimosso chevron dal titolo e rimosso cursore pointer/listener dal titolo
        card.innerHTML = `
            <div class="dashboard-card-header flex items-center mb-3 border-b border-gray-100 pb-2">
                <div class="flex items-center gap-4">
                    <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-10 h-10 object-contain">
                    <h3 class="text-lg font-bold text-blue-900 tracking-tight">${feature.title}</h3>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                ${rows.map(row => {
                    // LOGICA ALL_ACCESS: Se true, cliccabile a prescindere dal permesso specifico
                    const isClickable = hasAllAccess || (userPermissions && userPermissions.has(row.perm));
                    return this._generateRowHtml(row, isClickable);
                }).join('')}
            </div>
        `;

        this._setupListeners(card);
        return card;
    },

    _generateRowHtml(row, isClickable) {
        const baseClass = "flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-150";
        const stateClass = isClickable 
            ? "bg-gray-300/10 border border-gray-100 hover:bg-blue-50 cursor-pointer active:scale-[0.98] group/row" 
            : "bg-gray-50 border border-transparent opacity-75 cursor-default";

        return `
            <div class="${baseClass} ${stateClass}" data-type="${row.id}" data-clickable="${isClickable}">
                <div class="flex items-center gap-3">
                    <span class="text-sm ${!isClickable ? 'grayscale opacity-50' : ''}">${row.icon}</span>
                    <span class="text-[12px] font-semibold ${isClickable ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider">
                        ${row.label}
                    </span>
                </div>

                <div class="flex items-center gap-2">
                    <span class="text-base font-black ${isClickable ? 'text-blue-900' : 'text-gray-500'}">
                        ${row.value || 0}
                    </span>
                    ${isClickable 
                        ? `<div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center group-hover/row:bg-blue-600 transition-colors">
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

    _setupListeners(card) {
        card.querySelectorAll('[data-type]').forEach(row => {
            row.onclick = (e) => {
                e.stopPropagation();
                const { type, clickable } = row.dataset;
                
                if (clickable !== "true") {
                    row.classList.add('animate-shake');
                    setTimeout(() => row.classList.remove('animate-shake'), 400);
                    ToastView.show("Access restricted", "warning");
                    return;
                }

                if (type === 'year') YearModal.show();
                if (type === 'rooms') console.log("Matrice Rooms");
                if (type === 'subjects') console.log("Apertura Subjects");
            };
        });
    }
};