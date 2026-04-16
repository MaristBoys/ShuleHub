// src/features/subject/service/SubjectService.js
import { api } from '../../../core/api.js';

export const SubjectService = {
    /**
     * Recupera tutte le materie (Tabella amministrativa)
     */
    async getAll() {
        try {
            const response = await api.fetchWithLoader('/api/v1/subjects', { method: 'GET' }, 'Caricamento materie...');
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching all subjects:', error);
            return [];
        }
    },

    /**
     * Recupera solo le materie attive (Dropdown/Assegnazioni)
     */
    async getActive() {
        try {
            const response = await api.fetchWithLoader('/api/v1/subjects/active', { method: 'GET' }, 'Caricamento materie attive...');
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching active subjects:', error);
            return [];
        }
    },

    async create(subjectData) {
        const response = await api.fetchWithLoader('/api/v1/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subjectData)
        }, 'Creazione materia...');
        return await response.json();
    },

    async update(id, subjectData) {
        const response = await api.fetchWithLoader(`/api/v1/subjects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subjectData)
        }, 'Aggiornamento materia...');
        return await response.json();
    },

    async toggleStatus(id) {
        const response = await api.fetchWithLoader(`/api/v1/subjects/${id}/toggle`, {
            method: 'PATCH'
        }, 'Cambio stato...');
        return await response.json();
    },


    /**
     * Recupera le materie attive che NON sono ancora presenti nella stanza specifica.
     * Collegato all'endpoint: GET /api/v1/subjects/available-for-room/{yearRoomId}
     */
    async getAvailableForRoom(yearRoomId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/subjects/available-for-room/${yearRoomId}`, 
                { method: 'GET' }, 
                'Checking available subjects...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching available subjects for room:', error);
            return { success: false, message: "Connection error while fetching subjects" };
        }
    },

};