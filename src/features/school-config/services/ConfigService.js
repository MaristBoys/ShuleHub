// src/features/school-config/services/ConfigService.js
import { api } from '../../../core/api.js';

export const ConfigService = {
    /**
     * Recupera la lista di tutti gli anni accademici (ordinati per anno DESC)
     */
    async getYears() {
        try {
            const response = await api.fetchWithLoader(
                '/api/v1/school-config/years',
                { method: 'GET' },
                'Fetching years...'
            );
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching years:', error);
            return [];
        }
    },

    /**
     * Attiva un anno scolastico specifico
     * @param {number} yearId - L'ID dell'anno da impostare come attivo
     */
    async activateYear(yearId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/years/${yearId}/activate`,
                { method: 'PATCH' },
                'Updating system year...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error activating year:', error);
            return { success: false, message: 'Connection error' };
        }
    },

     /**
      * Crea un nuovo anno scolastico (incrementando l'ultimo presente)
      */

    async createNextYear() {
        // Usiamo il caricatore globale già configurato in api.js
        return await api.fetchWithLoader('/api/v1/school-config/years', {
            method: 'POST'
        });
    }
};