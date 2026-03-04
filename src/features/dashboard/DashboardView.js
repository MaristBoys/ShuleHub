// src/features/dashboard/DashboardView.js

import { YearModal } from '../school-config/modals/YearModal.js';   

export class DashboardView {
    
    static async render(user, features, stats, containerId = 'main-content') {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const response = await fetch('src/features/dashboard/dashboard.html');
            if (!response.ok) throw new Error('Template non trovato');
            
            container.innerHTML = await response.text();
            this.fillHeader(container, user);

            const grid = container.querySelector('#dashboard-grid');
            if (grid) {
                grid.innerHTML = ''; 
                features.forEach(feature => {
                    const card = this.createCard(user, feature, stats);
                    if (feature.id === 'config') this._setupConfigListeners(card); // Funziona subito perché l'oggetto esiste già in memoria
                    grid.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Render Error:', error);
            container.innerHTML = `<div class="p-8 text-red-600">Error loading view</div>`;
        }
    }

    /**
     * Inserisce i dati utente e di sistema nell'header in modo compatto
     */
    static fillHeader(container, user) {
        const welcomeTitle = container.querySelector('#dashboard-welcome-title');
        const profileInfo = container.querySelector('#dashboard-profile-info');
        const dateDisplay = container.querySelector('#current-date');

        // Cambiamo il titolo in qualcosa di operativo (o lo lasciamo statico nell'HTML)
        //if (welcomeTitle) welcomeTitle.textContent = "Operational Overview";
        
        // Etichetta del profilo (es. ADMIN AREA)
        if (profileInfo) profileInfo.textContent = `${user.profileName} Access`;
        
        // Data formattata in modo breve (es. Sat, 28 Feb 2026)
        if (dateDisplay) {
            dateDisplay.textContent = new Date().toLocaleDateString('en-GB', { 
                weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
            });
        }
    }

    /**
     * ORCHESTRATORE CREAZIONE CARD
     * Decide quale tipo di contenuto iniettare in base alla feature
     */
    static createCard(user, feature, stats) {
        const card = document.createElement('div');
        // Classi base per tutte le card (compatte)
        card.className = "bg-white/90 backdrop-blur-sm py-4 px-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all flex flex-col h-full overflow-hidden";
        
        const headerHtml = `
            <div class="dashboard-card-header flex items-center justify-between mb-3 border-b border-gray-100 pb-2 cursor-pointer group">
                <div class="flex items-center gap-4">
                    <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-10 h-10 object-contain group-hover:scale-110 transition-transform">
                    <h3 class="text-lg font-bold text-blue-900 tracking-tight group-hover:text-blue-600">${feature.title}</h3>
                </div>
                <span class="text-gray-300 group-hover:text-blue-500 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
            </div>
        `;

        // 2. Body Dinamico - Delegato a metodi specifici
        let bodyHtml = '';
        
        switch (feature.id) {
            case 'config':
                bodyHtml = stats ? this._renderConfigBody(stats.school) : this._renderPlaceholder(feature);
                break;
            case 'students':
                bodyHtml = stats ? this._renderRegistryBody(stats.students, 'Students', 'text-green-600') : this._renderPlaceholder(feature);
                break;
            case 'employees':
                bodyHtml = stats ? this._renderRegistryBody(stats.employees, 'Staff', 'text-blue-700') : this._renderPlaceholder(feature);
                break;
            case 'classes':
                bodyHtml = this._renderClassesWidgetBody(user);
                break;
            default:
                bodyHtml = this._renderPlaceholder(feature);
        }

        card.innerHTML = headerHtml + bodyHtml;
        
        // Listener solo per l'header
        const header = card.querySelector('.dashboard-card-header');
        header.onclick = () => {
            window.location.hash = `#${feature.id}`;
        };

        return card;
    }

    // --- METODI PRIVATI DI SUPPORTO (PULIZIA) ---

    /** Corpo Card School Config (Le 3 righe) */
    static _renderConfigBody(schoolStats) {
        const rows = [
            { label: 'Current Year', value: schoolStats.currentYear, icon: '📅', type: 'year' },
            { label: 'Active Rooms', value: schoolStats.activeRoomsCount, icon: '🚪', type: 'rooms' },
            { label: 'Active Subjects', value: schoolStats.totalSubjectsCount, icon: '📚', type: 'subjects' }
        ];

        return `
            <div class="flex flex-col gap-2">
                ${rows.map(row => `
                    <div class="config-row-btn flex items-center justify-between 
                                py-3 px-3 rounded-xl 
                                bg-gray-300/20 border border-gray-200
                                hover:bg-blue-50 
                                active:bg-blue-100 active:scale-[0.98]
                                transition-all duration-150 
                                cursor-pointer group"
                        data-type="${row.type}"> <div class="flex items-center gap-3">
                            <span class="text-sm">${row.icon}</span>
                            <span class="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                                ${row.label}
                            </span>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="text-base font-black text-blue-900">
                                ${row.value || 0}
                            </span>
                            <span class="text-gray-500 text-xl font-bold">›</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /** Corpo Card Registry (Students/Employees) */
    static _renderRegistryBody(data, label, colorClass) {
        return `
            <div class="mt-1">
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-black ${colorClass}">${data.activeStudentsCount || data.activeEmployeesCount || 0}</span>
                    <span class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">${label}</span>
                </div>
                ${this._getBadgeHtml(data.enrolledThisYearCount, 'New this year')}
            </div>
        `;
    }

    /** Widget Classi (Docenti) */
    static _renderClassesWidgetBody(user) {
        const assignments = user.teacherContext?.assignments || [];
        if (assignments.length === 0) return `<p class="text-gray-400 text-xs italic mt-2">No active classes</p>`;

        return `
            <div class="space-y-1 mt-1">
                ${assignments.slice(0, 3).map(asg => `
                    <div class="flex justify-between items-center bg-gray-50 p-2 rounded border-l-4 ${asg.classTeacher ? 'border-amber-400' : 'border-blue-400'}">
                        <span class="text-[10px] font-bold text-gray-700">${asg.yearRoomName}</span>
                        <span class="text-[10px] text-gray-500">${asg.subjectName}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static _renderPlaceholder(feature) {
        return `<p class="text-gray-400 text-[11px] mt-2 italic tracking-tight">Manage ${feature.title.toLowerCase()} section</p>`;
    }

    static _getBadgeHtml(count, label) {
        if (!count) return '';
        return `
            <div class="inline-block mt-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold border border-blue-100">
                +${count} ${label}
            </div>
        `;
    }

    static _setupConfigListeners(card) {
    // Cerchiamo le righe con la classe che abbiamo appena aggiunto nel render
        const rows = card.querySelectorAll('.config-row-btn');
        
        rows.forEach(row => {
            row.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const type = row.dataset.type;
                console.log("Config row clicked, type:", type); // Controlla in console se lo vedi!

                switch (type) {
                    case 'year':
                        YearModal.show();
                        break;
                    case 'rooms':
                        console.log("Navigazione verso Matrice Rooms");
                        // window.location.hash = '#config/rooms';
                        break;
                    case 'subjects':
                        console.log("Apertura Modale Subjects");
                        break;
                    default:
                        console.warn("Tipo di riga non riconosciuto:", type);
                }
            };
        });
    }

}