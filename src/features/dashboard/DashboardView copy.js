// src/features/dashboard/DashboardView.js
export class DashboardView {
    /**
     * Carica il template HTML e renderizza i componenti dinamici
     * @param {Object} user - Dati dell'utente
     * @param {Array} features - Funzionalità filtrate
     * @param {Object|null} stats - Dati dal backend (DashboardSummaryDTO)
     */
    static async render(user, features, stats, containerId = 'main-content') {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            // 1. Caricamento del template
            const response = await fetch('src/features/dashboard/dashboard.html');
            if (!response.ok) throw new Error('Template non trovato');
            
            const html = await response.text();
            container.innerHTML = html;

            // 2. Popolamento Header (Username e Ruolo)
            this.fillHeader(container, user);

            // 3. Renderizzazione delle Card con i dati reali
            const grid = container.querySelector('#dashboard-grid');
            if (grid) {
                grid.innerHTML = ''; 
                features.forEach(feature => {
                    // Passiamo le statistiche specifiche alla card
                    const card = this.createCard(user, feature, stats);
                    grid.appendChild(card);
                });
            }

        } catch (error) {
            console.error('Render Error:', error);
            container.innerHTML = `<div class="p-8 text-red-600">Error loading view</div>`;
        }
    }

    /**
     * Inserisce i dati utente nell'header
     */
    static fillHeader(container, user) {
        const welcomeTitle = container.querySelector('#dashboard-welcome-title');
        const profileInfo = container.querySelector('#dashboard-profile-info');
        const dateDisplay = container.querySelector('#current-date');

        if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${user.username}`;
        if (profileInfo) profileInfo.textContent = `${user.profileName} Area`;
        if (dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('en-GB', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    }

    /**
     * Crea la card inserendo i contatori se disponibili
     */
    static createCard(user, feature, stats) {
        const div = document.createElement('div');
        // Layout compatto: bianco, bordi arrotondati, padding ridotto, allineamento a sinistra
        div.className = "bg-white/90 backdrop-blur-sm py-4 px-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full";
       
        // Header della Card: Icona e Titolo uno accanto all'altro
        const headerHtml = `
            <div class="flex items-center gap-4 mb-3 border-b border-gray-100 pb-2">
                <div class="flex items-center justify-center">
                    <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-10 h-10 object-contain">
                </div>
                <h3 class="text-lg font-bold text-blue-900 tracking-tight">${feature.title}</h3>
            </div>
        `;

        // Logica specifica per School Config (Tre righe cliccabili)
        if (feature.id === 'config' && stats) {
            div.innerHTML = headerHtml + this.renderSchoolConfigRows(stats.school);
            return div;
        }
       
       
        // Se è la card delle classi, usiamo il widget esistente
        if (feature.id === 'classes') {
            div.innerHTML = this.renderClassesWidget(user, feature);
            return div;
        }

        // Recuperiamo i dati specifici dal DTO globale
        let dynamicContent = `<p class="text-gray-500 text-sm mt-2">Manage ${feature.title.toLowerCase()}</p>`;

        if (stats) {
            if (feature.id === 'students') {
                dynamicContent = this.getStatHtml(stats.students.activeStudentsCount, 'Active Students', 'text-green-600');
                dynamicContent += this.getBadgeHtml(stats.students.enrolledThisYearCount, 'New this year');
            } else if (feature.id === 'employees') {
                dynamicContent = this.getStatHtml(stats.employees.activeEmployeesCount, 'Active Staff', 'text-blue-700');
                dynamicContent += this.getBadgeHtml(stats.employees.enrolledThisYearCount, 'Hired this year');
            } else if (feature.id === 'config') {
                dynamicContent = this.getStatHtml(stats.school.activeRoomsCount, 'Rooms', 'text-amber-600');
                dynamicContent += `<p class="text-[10px] font-bold text-gray-400 mt-1 uppercase">Current Year: ${stats.school.currentYear}</p>`;
            }
        }

        div.innerHTML = `
            <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-16 h-16 mb-4">
            <h3 class="text-xl font-bold text-blue-900">${feature.title}</h3>
            ${dynamicContent}
        `;

        div.onclick = () => window.location.hash = `#${feature.id}`;
        return div;
    }

    // Helper per il numero principale (Active)
    static getStatHtml(count, label, colorClass) {
        return `
            <div class="mt-4 w-full border-t border-gray-100 pt-3">
                <span class="text-3xl font-black ${colorClass}">${count}</span>
                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">${label}</p>
            </div>
        `;
    }

    // Helper per il badge (Nuovi dell'anno)
    static getBadgeHtml(count, label) {
        if (count === 0) return '';
        return `
            <div class="mt-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">
                +${count} ${label}
            </div>
        `;
    }

    /**
     * Widget classi per docenti
     */
    static renderClassesWidget(user, feature) {
        // ... (Mantieni la logica esistente nel tuo DashboardView.js per assignments)
        // [Riproduzione logica originale dal file caricato]
        let content = `
            <img src="./assets/icons/${feature.icon}" alt="Classes" class="w-16 h-16 mb-4">
            <h3 class="text-xl font-bold text-blue-900 mb-3">${feature.title}</h3>
        `;
        // ... resto del codice identico a DashboardView.js
        return content; 
    }


    // In DashboardView.js - Nuovo metodo helper

static renderSchoolConfigRows(schoolStats) {
    // Definizione dei tre dati richiesti
    const rows = [
        { label: 'Current Year', value: schoolStats.currentYear, icon: '📅', target: 'year' },
        { label: 'Active Rooms', value: schoolStats.activeRoomsCount, icon: '🚪', target: 'rooms' },
        { label: 'Active Subjects', value: schoolStats.totalSubjectsCount, icon: '📚', target: 'subjects' }
    ];

    return `
        <div class="flex flex-col gap-2">
            ${rows.map(row => `
                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-blue-50 hover:text-blue-700 transition-colors group" 
                     onclick="event.stopPropagation(); window.location.hash='#config/${row.target}'">
                    <div class="flex items-center gap-3">
                        <span class="text-sm">${row.icon}</span>
                        <span class="text-xs font-semibold text-gray-500 group-hover:text-blue-600 uppercase tracking-wider">${row.label}</span>
                    </div>
                    <span class="text-lg font-black text-blue-900 group-hover:text-blue-700">${row.value || 0}</span>
                </div>
            `).join('')}
        </div>
    `;
}
}