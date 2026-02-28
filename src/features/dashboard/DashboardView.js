// src/features/dashboard/DashboardView.js
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
                    grid.appendChild(this.createCard(user, feature, stats));
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
        card.className = "bg-white/90 backdrop-blur-sm py-4 px-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full overflow-hidden";
        
        // 1. Header (Icona + Titolo) - Comune a tutte
        const headerHtml = `
            <div class="flex items-center gap-4 mb-3 border-b border-gray-100 pb-2">
                <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-10 h-10 object-contain">
                <h3 class="text-lg font-bold text-blue-900 tracking-tight">${feature.title}</h3>
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
        card.onclick = () => window.location.hash = `#${feature.id}`;
        
        return card;
    }

    // --- METODI PRIVATI DI SUPPORTO (PULIZIA) ---

    /** Corpo Card School Config (Le 3 righe) */
    static _renderConfigBody(schoolStats) {
        const rows = [
            { label: 'Current Year', value: schoolStats.currentYear, icon: '📅', target: 'year' },
            { label: 'Active Rooms', value: schoolStats.activeRoomsCount, icon: '🚪', target: 'rooms' },
            { label: 'Active Subjects', value: schoolStats.totalSubjectsCount, icon: '📚', target: 'subjects' }
        ];

        return `
            <div class="flex flex-col gap-1">
                ${rows.map(row => `
                    <div class="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50/50 hover:bg-blue-50 transition-colors group" 
                         onclick="event.stopPropagation(); window.location.hash='#config/${row.target}'">
                        <div class="flex items-center gap-3">
                            <span class="text-sm">${row.icon}</span>
                            <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">${row.label}</span>
                        </div>
                        <span class="text-base font-black text-blue-900">${row.value || 0}</span>
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
}