// src/features/dashboard/DashboardController.js
import { UserModel } from '../auth/UserModel.js';
import { DashboardView } from './DashboardView.js';
import { api } from '../../core/api.js'; // Importiamo il tuo file api.js

export class DashboardController {
    
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
     * Inizializza la dashboard recuperando i dati tramite il sistema api.js
     */
    static async init() {
        const user = UserModel.getCurrentUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        // 1. Logica permessi
        const role = user.profileName?.toUpperCase();
        const userPermissions = new Set(user.permissions || []);
        const filteredFeatures = this.getFeaturesConfig().filter(f => {
            if (role === 'ADMIN') return true;
            return userPermissions.has(f.perm) || 
                (f.id === 'classes' && userPermissions.has('ACCESS_TEACHER_AREA'));
        });

        try {
            // 2. Chiamata API tramite il tuo metodo fetchWithLoader
            // Nota: passiamo il messaggio per il loader automatico
            const response = await api.fetchWithLoader(
                '/api/v1/dashboard/summary', 
                { method: 'GET' },
                'Loading Dashboard...'
            );

            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const result = await response.json();

            // 3. Rendering con dati reali (result.data contiene il DashboardSummaryDTO)
            if (result.success) {
                await DashboardView.render(user, filteredFeatures, result.data);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Dashboard Init Error:', error);
            // Fallback: renderizza comunque la struttura base
            await DashboardView.render(user, filteredFeatures, null);
        }
    }
}