import { api } from '../../../core/api.js';

export const IndicatorScaleService = {
    /**
     * Recupera tutte le scale attive (nuovo metodo backend)
     */
    async getAllActive() {
        try {
            const response = await api.fetchWithLoader('/api/v1/indicator-scales/all-active', { method: 'GET' }, 'Caricamento scale...');
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching all active scales:', error);
            return [];
        }
    },

    /**
     * Recupera scale filtrate per tipo (GRADE, DIVISION, CONDUCT)
     */
    async getByType(type) {
        try {
            const response = await api.fetchWithLoader(`/api/v1/indicator-scales?type=${type}`, { method: 'GET' });
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error(`Error fetching scales for type ${type}:`, error);
            return [];
        }
    }
};