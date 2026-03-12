import { api } from '../../../core/api.js';

export const SchoolStructureService = {
    /**
     * Recupera tutti gli anni accademici
     */
    async getYears() {
        try {
            const response = await api.fetchWithLoader('/api/v1/school-structure/years', { method: 'GET' }, 'Caricamento anni...');
            if (!response.ok) return [];
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching years:', error);
            return [];
        }
    },

    /**
     * Crea il prossimo anno accademico
     */
    async createNextYear() {
        const response = await api.fetchWithLoader('/api/v1/school-structure/years', { method: 'POST' }, 'Generazione nuovo anno...');
        return await response.json();
    },

    /**
     * Attiva un anno specifico
     */
    async activateYear(yearId) {
        const response = await api.fetchWithLoader(`/api/v1/school-structure/years/${yearId}/activate`, { 
            method: 'PATCH' 
        }, 'Attivazione anno...');
        return await response.json();
    }
};