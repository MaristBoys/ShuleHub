// src/features/school-config/services/ConfigService.js
import { api } from '../../../core/api.js';

export const ConfigService = {
    
    
    /* ***************************************************************************************************
    YEARS 
    **************************************************************************************************** */
    
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
            if (!response.ok) return []; // Se c'è un errore (403, 500, etc) restituisci array vuoto
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
    },

    /* ***************************************************************************************************
    SUBJECTS  Aggiunte a ConfigService.js per la gestione delle materie (simile a years)
    **************************************************************************************************** */
   
    /**
     * Recupera la lista completa di tutte le materie
     * @returns {Promise<Array>}
     */
    async getSubjects() {
        try {
            const response = await api.fetchWithLoader(
                '/api/v1/school-config/subjects',
                { method: 'GET' },
                'Fetching subjects...'
            );
            if (!response.ok) return [];
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching subjects:', error);
            return [];
        }
    },

    /**
     * Crea una nuova materia
     * @param {Object} subjectData - I dati della materia (nomi, abbreviazione, etc)
     */
    async createSubject(subjectData) {
        try {
            const response = await api.fetchWithLoader(
                '/api/v1/school-config/subjects',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subjectData)
                },
                'Creating subject...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error creating subject:', error);
            return { success: false, message: 'Connection error' };
        }
    },

    /**
     * Aggiorna i dettagli di una materia esistente
     * @param {number} id - ID della materia
     * @param {Object} subjectData - Dati aggiornati
     */
    async updateSubject(id, subjectData) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/subjects/${id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subjectData)
                },
                'Updating subject...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error updating subject:', error);
            return { success: false, message: 'Connection error' };
        }
    },

    /**
     * Cambia rapidamente lo stato attivo/disattivo di una materia
     * @param {number} id - ID della materia
     */
    async toggleSubjectStatus(id) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/subjects/${id}/toggle`,
                { method: 'PATCH' },
                'Toggling status...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error toggling subject status:', error);
            return { success: false, message: 'Connection error' };
        }
    }



};