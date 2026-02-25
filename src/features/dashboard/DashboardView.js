// js/features/dashboard/DashboardView.js
export class DashboardView {
    static render(user, features) {
        // 1. Aggiorna Header (Benvenuto)
        const header = document.querySelector('header');
        header.querySelector('h1').textContent = `Welcome back, ${user.username}`;
        header.querySelector('p').textContent = `${user.profileName} Area`;

        // 2. Svuota e Popola la Griglia
        const grid = document.getElementById('dashboard-grid');
        grid.innerHTML = '';

        features.forEach(feature => {
            const card = this.createCard(user, feature);
            grid.appendChild(card);
        });
    }

    static createCard(user, feature) {
        const div = document.createElement('div');
        div.className = "bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-transform cursor-pointer flex flex-col items-center text-center";
        
        // Se è il modulo classes, aggiungiamo logica widget
        if (feature.id === 'classes') {
            div.innerHTML = this.renderClassesWidget(user, feature);
        } else {
            // Render Card Standard
            div.innerHTML = `
                <img src="./assets/icons/${feature.icon}" alt="${feature.title}" class="w-16 h-16 mb-4">
                <h3 class="text-xl font-bold text-blue-900">${feature.title}</h3>
                <p class="text-gray-500 text-sm mt-2">Manage ${feature.title.toLowerCase()}</p>
            `;
        }

        div.onclick = () => console.log(`Navigating to ${feature.id}`);
        return div;
    }

    static renderClassesWidget(user, feature) {
        let content = `<img src="./assets/icons/${feature.icon}" alt="Classes" class="w-16 h-16 mb-4">
                       <h3 class="text-xl font-bold text-blue-900 mb-3">${feature.title}</h3>`;

        // A. VISTA GESTIONALE (Per chi non è solo Teacher)
        if (user.profileName !== 'TEACHER') {
            content += `<div class="bg-blue-50 rounded-lg p-3 w-full mb-3">
                            <span class="text-2xl font-bold text-blue-700">All Rooms</span>
                            <p class="text-xs text-blue-500 uppercase">Global Access</p>
                        </div>`;
        }

        // B. VISTA OPERATIVA (Se ha classi assegnate - il "Segretario-Docente")
        if (user.teacherContext?.assignments?.length > 0) {
            content += `<div class="w-full text-left mt-2">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">My Teaching</p>
                <div class="space-y-1">
                    ${user.teacherContext.assignments.slice(0, 4).map(asg => `
                        <div class="flex justify-between items-center bg-gray-50 p-2 rounded border-l-4 ${asg.classTeacher ? 'border-amber-400' : 'border-blue-400'}">
                            <span class="text-xs font-bold text-gray-700">${asg.yearRoomName}</span>
                            <span class="text-[10px] text-gray-500">${asg.subjectName}</span>
                        </div>
                    `).join('')}
                    ${user.teacherContext.assignments.length > 4 ? '<p class="text-[10px] text-center text-blue-500">...and more</p>' : ''}
                </div>
            </div>`;
        }

        return content;
    }
}