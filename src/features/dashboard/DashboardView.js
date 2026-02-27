// src/features/dashboard/DashboardView.js
export class DashboardView {
    /**
     * Carica il template HTML e renderizza i componenti dinamici
     * @param {Object} user - Dati dell'utente dal UserModel
     * @param {Array} features - Lista delle funzionalità filtrate dal Controller
     * @param {string} containerId - ID del contenitore principale (default: 'main-content')
     */
    static async render(user, features, containerId = 'main-content') {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            // 1. Caricamento asincrono del template (Strategia Ibrida)
            // Il percorso deve essere relativo alla root del progetto servita da Vite
            const response = await fetch('src/features/dashboard/dashboard.html');
            
            if (!response.ok) {
                throw new Error('Impossibile caricare il template della Dashboard');
            }
            
            const html = await response.text();
            container.innerHTML = html;

            // 2. Popolamento Header Dinamico
            const welcomeTitle = container.querySelector('#dashboard-welcome-title');
            const profileInfo = container.querySelector('#dashboard-profile-info');
            const dateDisplay = container.querySelector('#current-date');

            if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${user.username}`;
            if (profileInfo) profileInfo.textContent = `${user.profileName} Area`;
            if (dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });

            // 3. Renderizzazione delle Card nella Griglia
            const grid = container.querySelector('#dashboard-grid');
            if (grid) {
                grid.innerHTML = ''; // Pulizia di sicurezza
                features.forEach(feature => {
                    const card = this.createCard(user, feature);
                    grid.appendChild(card);
                });
            }

        } catch (error) {
            console.error('Dashboard Render Error:', error);
            container.innerHTML = `
                <div class="p-8 text-center text-red-600">
                    <p class="font-bold">Error loading Dashboard</p>
                    <p class="text-sm">${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Crea l'elemento DOM per una singola card
     */
    static createCard(user, feature) {
        const div = document.createElement('div');
        // Classi Tailwind originali per mantenere lo stile
        div.className = "bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-transform cursor-pointer flex flex-col items-center text-center";
        
        // Logica specifica per il widget Classes o Card Standard
        if (feature.id === 'classes') {
            div.innerHTML = this.renderClassesWidget(user, feature);
        } else {
            div.innerHTML = `
                <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-16 h-16 mb-4">
                <h3 class="text-xl font-bold text-blue-900">${feature.title}</h3>
                <p class="text-gray-500 text-sm mt-2">Manage ${feature.title.toLowerCase()}</p>
            `;
        }

        // Event listener per la navigazione
        div.onclick = () => {
            console.log(`Navigating to ${feature.id}`);
            // Qui potrai inserire: window.location.hash = `#${feature.id}`;
        };

        return div;
    }

    /**
     * Genera l'HTML interno per il widget delle classi (Docenti/Admin)
     */
    static renderClassesWidget(user, feature) {
        let content = `
            <img src="./assets/icons/${feature.icon}" alt="Classes" class="w-16 h-16 mb-4">
            <h3 class="text-xl font-bold text-blue-900 mb-3">${feature.title}</h3>
        `;

        // A. VISTA GESTIONALE (Per chi non è solo TEACHER)
        if (user.profileName !== 'TEACHER') {
            content += `
                <div class="bg-blue-50 rounded-lg p-3 w-full mb-3">
                    <span class="text-2xl font-bold text-blue-700">All Rooms</span>
                    <p class="text-[10px] text-blue-500 uppercase font-bold">Global Access</p>
                </div>
            `;
        }

        // B. VISTA OPERATIVA (Se ha classi assegnate)
        const assignments = user.teacherContext?.assignments || [];
        if (assignments.length > 0) {
            content += `
                <div class="w-full text-left mt-2">
                    <p class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">My Teaching</p>
                    <div class="space-y-1">
                        ${assignments.slice(0, 4).map(asg => `
                            <div class="flex justify-between items-center bg-gray-50 p-2 rounded border-l-4 ${asg.classTeacher ? 'border-amber-400' : 'border-blue-400'}">
                                <span class="text-xs font-bold text-gray-700">${asg.yearRoomName}</span>
                                <span class="text-[10px] text-gray-500">${asg.subjectName}</span>
                            </div>
                        `).join('')}
                        ${assignments.length > 4 ? '<p class="text-[10px] text-center text-blue-500 mt-1">...and more</p>' : ''}
                    </div>
                </div>
            `;
        } else if (user.profileName === 'TEACHER') {
            // Caso docente senza classi assegnate
            content += `<p class="text-xs text-gray-400 italic mt-2">No classes assigned yet</p>`;
        }

        return content;
    }
}