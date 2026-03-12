// src/features/dashboard/DashboardController.js
import { UserModel } from '../auth/UserModel.js';
import { DashboardView } from './DashboardView.js';
import { api } from '../../core/api.js';

export class DashboardController {
    
    /**
     * Definizione delle card della Dashboard con i relativi permessi di visualizzazione (Livello 1)
     */
    static getFeaturesConfig() {
        return [
            { id: 'config',    title: 'School Config', icon: 'config.png',    perm: 'DASHBOARD_VIEW_CONFIG' },
            { id: 'employees', title: 'Employees',     icon: 'employees.png', perm: 'DASHBOARD_VIEW_EMPLOYEES' },
            { id: 'students',  title: 'Students',      icon: 'students.png',  perm: 'DASHBOARD_VIEW_STUDENTS' },
            { id: 'classes',   title: 'Classes',       icon: 'classes.png',   perm: 'DASHBOARD_VIEW_CLASSES' },
            { id: 'reports',   title: 'Reports',       icon: 'reports.png',   perm: 'DASHBOARD_VIEW_REPORTS' },
            { id: 'archive',   title: 'Archive',       icon: 'archive.png',   perm: 'DASHBOARD_VIEW_ARCHIVE' }
        ];
    }

    /**
     * Inizializza la dashboard gestendo l'autorizzazione tramite permessi
     */
    static async init() {
        const user = UserModel.getCurrentUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        const userPermissions = new Set(user.permissions || []);
        
        // --- DEFINIZIONE PASSEPARTOUT ---
        const hasAllAccess = userPermissions.has('ALL_ACCESS'); // Il potere assoluto (Sblocca TUTTO nel sistema)
        const hasAllView = userPermissions.has('ALL_VIEW'); // Vede tutte le card, ma non sblocca i lucchetti interni (EDIT) nelle card
        const hasViewAllDashboard = userPermissions.has('DASHBOARD_VIEW_ALL'); // Vede tutte le card della dashboard, ma non sblocca i lucchetti (EDIT) interni delle card
        
        // --- LIVELLO 1: Visibilità Card ---
        // Una card è visibile se l'utente ha un potere superiore 
        // o il permesso specifico della card
        const filteredFeatures = this.getFeaturesConfig().filter(f => 
            hasAllAccess || // Sblocca tutto
            hasAllView || // Vede tutto nell'app
            hasViewAllDashboard || // Vede tutte le card della dashboard
            userPermissions.has(f.perm) // Permesso specifico della card
            
        );

        try {
            const response = await api.fetchWithLoader(
                '/api/v1/dashboard/summary', 
                { method: 'GET' },
                'Loading Dashboard...'
            );

            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            const result = await response.json();

            if (result.success) {
                // --- LIVELLO 2: Rendering ---
                // Passiamo hasAllAccess separatamente perché serve a sbloccare i lucchetti (EDIT)
                // nelle card, indipendentemente dal fatto che l'utente veda la card per DASHBOARD_VIEW_ALL
                // passiamo anche hasAllView per sbloccare la visualizzazione completa e non far apparire i lucchetti di accesso negato   
                await DashboardView.render(
                    user, 
                    filteredFeatures, 
                    result.data, 
                    userPermissions, 
                    hasAllAccess,
                    hasAllView
                );
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Dashboard Init Error:', error);
            await DashboardView.render(user, filteredFeatures, null, userPermissions, hasAllAccess, hasAllView);
        }
    }
}