// src/features/dashboard/DashboardService.js
import { api } from '../../core/api.js';

export const DashboardService = {
    /**
     * Recupera i dati di riepilogo per la dashboard
     */
    async getDashboardSummary() {
        const response = await api.fetchWithLoader(
            '/api/v1/dashboard/summary', 
            { method: 'GET' },
            'Loading Dashboard...'
        );

        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        return await response.json();
    }
};