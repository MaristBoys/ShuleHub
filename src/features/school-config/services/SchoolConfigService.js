import { api } from '../../../core/api.js';

export const SchoolConfigService = {
    
    /**
     * Recupera la matrice delle stanze per un determinato anno (3xN)
     * Endpoint: /api/v1/school-config/rooms/matrix/{yearId}
     */
    async getRoomMatrix(yearId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/rooms/matrix/${yearId}`,
                { method: 'GET' },
                'Caricamento matrice stanze...'
            );
            const result = await response.json();
            return result.success ? result : null;
        } catch (error) {
            console.error('Error fetching room matrix:', error);
            return null;
        }
    },

    /**
     * Recupera i dati aggregati per il modale di dettaglio di una stanza
     * Include: info stanza, scale attuali e suggerimenti.
     * Endpoint: /api/v1/school-config/rooms/{id}/details
     */
    async getRoomDetails(roomId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/rooms/${roomId}/details`,
                { method: 'GET' },
                'Caricamento dettagli stanza...'
            );
            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error fetching room details:', error);
            return null;
        }
    },

    /**
     * Salva l'assegnazione delle scale di valutazione a una stanza
     * Endpoint: /api/v1/school-config/rooms/{id}/scales
     */
    async updateRoomScales(roomId, scaleIds) {
        const response = await api.fetchWithLoader(
            `/api/v1/school-config/rooms/${roomId}/scales`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scaleIds)
            },
            'Salvataggio scale...'
        );
        return await response.json();
    }
};