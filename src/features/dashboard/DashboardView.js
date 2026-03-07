// src/features/dashboard/DashboardView.js

import { YearModal } from '../school-config/modals/YearModal.js';
import { ConfigCardView } from './components/ConfigCardView.js';   

export class DashboardView {
    
    /**
     * @param {Object} user - Utente corrente
     * @param {Array} features - Card filtrate dal Controller (Livello 1)
     * @param {Object} stats - Dati dal backend
     * @param {Set} userPermissions - Set di stringhe dei permessi (Livello 2)
     * @param {Boolean} hasAllAccess - Flag per il permesso ALL_ACCESS
     * @param {Boolean} hasAllView - Flag per il permesso ALL_VIEW
     */
    static async render(user, features, stats, userPermissions, hasAllAccess, hasAllView, containerId = 'main-content') {
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
                    let card;

                    // Gestione differenziata: Card Spacchettate vs Card Standard
                    if (feature.id === 'config') {
                        // Passiamo i permessi e il jolly al componente specializzato
                        card = ConfigCardView.render(stats, feature, userPermissions, hasAllAccess, hasAllView);
                    } else {
                        // Per le altre card usiamo il vecchio creatore generico (da spacchettare in futuro)
                        card = this.createCard(user, feature, stats); 
                    }
                    
                    grid.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Render Error:', error);
            container.innerHTML = `<div class="p-8 text-red-600">Error loading view</div>`;
        }
    }

    /**
     * Inserisce i dati utente e di sistema nell'header
     */
    static fillHeader(container, user) {
        const profileInfo = container.querySelector('#dashboard-profile-info');
        const dateDisplay = container.querySelector('#current-date');

        if (profileInfo) profileInfo.textContent = `${user.profileName} Access`;
        
        if (dateDisplay) {
            dateDisplay.textContent = new Date().toLocaleDateString('en-GB', { 
                weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
            });
        }
    }

    /**
     * Creatore generico per le card non ancora migrate ai componenti esterni
     */
    static createCard(user, feature, stats) {
        const card = document.createElement('div');
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

        let bodyHtml = '';
        
        switch (feature.id) {
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
        
        const header = card.querySelector('.dashboard-card-header');
        header.onclick = () => {
            window.location.hash = `#${feature.id}`;
        };

        return card;
    }

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