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
                'Loading Rooms...'
            );
            const result = await response.json();
            return result.success ? result : null;
        } catch (error) {
            console.error('Error fetching room matrix:', error);
            return null;
        }
    },

    // prepara i dati per la preview del modale di dettaglio della room 
    // quando si vuole creare una nuova room nell'anno
    // a seguito del clic sulla ghost cell
    //  Include: info stanza da creare (nome e anno), scale suggerite, il resto null
    async getRoomPreview(yearId, roomNum) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/rooms/preview?yearId=${yearId}&roomNum=${roomNum}`,
                { method: 'GET' },
                'Generating preview...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching preview:', error);
            return { success: false };
        }
    },

/**
     * Recupera i dati aggregati per il modale di dettaglio di una stanza
     * Include: info stanza, scale attuali e suggerimenti.
     * Endpoint: /api/v1/school-config/rooms/{id}/details
     
    async getYearRoomDetails(roomId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/rooms/${roomId}/details`,
                { method: 'GET' },
                'Loading Room details...'
            );
            return await response.json();
            
        } catch (error) {
            console.error('Error fetching room details:', error);
            return null;
        }
    },
*/
    /**
     * Recupera i dettagli completi per il modale (sia per stanze esistenti che Ghost Cells).
     * @param {number|null} yearRoomId - ID della configurazione (se esiste)
     * @param {number|null} roomId - ID della stanza fisica (per ghost cell)
     * @param {number|null} yearId - ID dell'anno (per ghost cell)
     */
    async getYearRoomDetails(yearRoomId, roomNum = null, yearId = null) {
        try {
            let url;
            let loaderMsg = 'Loading details...';

            if (yearRoomId) {
                // CASO A: Stanza esistente (Cella Blu)
                url = `/api/v1/school-config/rooms/${yearRoomId}/details`;
            } else {
                // CASO B: Ghost Cell (Cella Grigia)
                url = `/api/v1/school-config/rooms/details/preview?roomNum=${roomNum}&yearId=${yearId}`;
                loaderMsg = 'Generating preview...';
            }

            const response = await api.fetchWithLoader(
                url,
                { method: 'GET' },
                loaderMsg
            );
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching room details:', error);
            return { success: false, message: "Connection error" };
        }
    },

    /**
     * Attiva o disattiva una YearRoom specifica
     * Endpoint: /api/v1/school-config/rooms/{id}/status
     */
    async toggleRoomStatus(yearRoomId, isActive) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/school-config/rooms/${yearRoomId}/status?active=${isActive}`,
                { method: 'PATCH' },
                isActive ? 'Activating room...' : 'Deactivating room...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error toggling room status:', error);
            return { success: false, message: "Connection error" };
        }
    },



    /**
     * Salva l'assegnazione delle scale di valutazione a una stanza
     * Endpoint: /api/v1/school-config/rooms/{id}/scales
     */
/*
    async updateYearRoomScales(roomId, scaleIds) {
        const response = await api.fetchWithLoader(
            `/api/v1/school-config/rooms/${roomId}/scales`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scaleIds)
            },
            'Saving scales...'
        );
        return await response.json();
    },
*/
    async updateYearRoomScales(roomId, scaleData) {
        // Usiamo il destructuring per separare isActive dal resto delle scale
        // scaleIds conterrà solo GRADE, DIVISION, CONDUCT_ALPHA, CONDUCT_TEXT
        const { isActive, ...scaleIds } = scaleData; 

        const response = await api.fetchWithLoader(
            `/api/v1/school-config/rooms/${roomId}/scales`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scaleIds) // Invia solo la mappa Map<String, Short>
            },
            'Saving scales...'
        );
        return await response.json();
    },



    /**
     * Recupera tutte le scale di valutazione attive
     * Endpoint: /api/v1/indicator-scales/all-active
     */
    async getAllActiveScales() {
        try {
            const response = await api.fetchWithLoader(
                '/api/v1/indicator-scales/all-active',
                { method: 'GET' },
                'Loading scales configuration...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching all scales:', error);
            return { success: false, data: [] };
        }
    },


    async assignRoom(payload) {
        const response = await api.fetchWithLoader(
            `/api/v1/school-config/rooms/assign`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            },
            'Activating room...'
        );
        return await response.json();
    },
};