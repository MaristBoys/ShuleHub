// src/features/dashboard/DashboardController.js
import { UserModel } from '../auth/UserModel.js';
import { DashboardView } from './DashboardView.js';

export class DashboardController {
    
    /**
     * Configurazione statica delle funzionalità disponibili nella dashboard.
     * Ogni feature è legata a un permesso specifico.
     */
    static getFeaturesConfig() {
        return [
            { id: 'config', title: 'School Config', icon: 'config.png', perm: 'ADMIN_CONFIG' },
            { id: 'employees', title: 'Employees', icon: 'employees.png', perm: 'VIEW_EMPLOYEES' },
            { id: 'students', title: 'Students', icon: 'students.png', perm: 'VIEW_STUDENTS' },
            { id: 'classes', title: 'Classes', icon: 'classes.png', perm: 'ACCESS_CLASSES' }, 
            { id: 'reports', title: 'Reports', icon: 'reports.png', perm: 'VIEW_REPORTS' },
            { id: 'archive', title: 'Archive', icon: 'archive.png', perm: 'VIEW_ARCHIVE' }
        ];
    }

    /**
     * Inizializza la logica della dashboard.
     * Gestisce il controllo accessi e coordina il rendering della view.
     */
    // src/features/dashboard/DashboardController.js
    static async init() {
        const user = UserModel.getCurrentUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        // Trasformiamo in maiuscolo per sicurezza
        const role = user.profileName?.toUpperCase();
        
        // Creiamo il Set dei permessi solo se esistono, altrimenti Set vuoto
        const userPermissions = new Set(user.permissions || []);

        const filteredFeatures = this.getFeaturesConfig().filter(f => {
            // 1. Se è ADMIN vede tutto
            if (role === 'ADMIN') return true;

            // 2. Altrimenti controllo permessi
            return userPermissions.has(f.perm) || 
                (f.id === 'classes' && userPermissions.has('ACCESS_TEACHER_AREA'));
        });

        console.log("Features for Admin:", filteredFeatures); // Debug: guarda la console!

        await DashboardView.render(user, filteredFeatures);
    }
}