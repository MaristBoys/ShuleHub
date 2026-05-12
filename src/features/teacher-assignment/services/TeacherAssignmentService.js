import { api } from '../../../core/api.js';

export const TeacherAssignmentService = {
    
    /**
     * Recupera la lista di tutti i docenti attivi per la scelta del Class Teacher
     * Endpoint: /api/v1/teacher-assignments/eligible-class-teachers
     */
    async getEligibleClassTeachers() {
        try {
            const response = await api.fetchWithLoader(
                '/api/v1/teacher-assignments/eligible-class-teachers',
                { method: 'GET' },
                'Loading eligible teachers...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching eligible class teachers:', error);
            return { success: false, message: "Connection error" };
        }
    },

    /**
     * Recupera i docenti abilitati per una specifica materia
     * Endpoint: /api/v1/teacher-assignments/eligible-teachers?subjectId={id}
     */
    async getEligibleTeachersForSubject(subjectId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/eligible-teachers?subjectId=${subjectId}`,
                { method: 'GET' },
                'Loading subject specialists...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching subject teachers:', error);
            return { success: false, message: "Connection error" };
        }
    },

    /**
     * Salva l'assegnazione del Class Teacher per una YearRoom
     * Endpoint: /api/v1/teacher-assignments/year-rooms/{id}/class-teacher
     */
    async assignClassTeacher(yearRoomId, employeeId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${yearRoomId}/class-teacher`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    // employeeId sarà null se vogliamo rimuovere il docente
                    body: JSON.stringify({ employeeId })
                },
                employeeId ? 'Assigning Class Teacher...' : 'Removing Class Teacher...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error assigning class teacher:', error);
            return { success: false, message: "Connection error" };
        }
    },

    /**
     * Assegna un docente a una materia specifica (Staffing).
     * Allineato con il Controller Java: usa PATCH e invia l'employeeId nel Body.
     */
    async assignSubjectTeacher(yearRoomId, subjectId, employeeId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${yearRoomId}/subjects/${subjectId}`,
                { 
                    method: 'PATCH', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Inviamo un oggetto JSON come richiesto da @RequestBody TeacherSelectionRequest
                    body: JSON.stringify({ employeeId: employeeId }) 
                },
                'Updating teacher assignment...'
            );

            // Verifichiamo se la risposta è ok prima di provare a parsare il JSON
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    message: errorData.message || `Server error: ${response.status}` 
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Error assigning teacher:', error);
            return { 
                success: false, 
                message: "Connection error: check your internet or server status" 
            };
        }
    },

    /**
     * Esegue la copia intelligente da un altro anno
     */
    async smartCopy(yearRoomId, payload) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${yearRoomId}/smart-copy`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                },
                'Copying configuration...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error in smart copy:', error);
            return { success: false, message: "Connection error" };
        }
    },



    /**
     * Recupera le stanze potenziali sorgenti per lo Smart Copy 
     * (Stesso Form, anno corrente e precedente)
     */
    async getEligibleSourceRooms(targetYearRoomId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${targetYearRoomId}/eligible-sources`,
                { method: 'GET' },
                'Fetching source rooms...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching source rooms:', error);
            return { success: false, message: "Connection error" };
        }
    },

    /**
     * COPIA MASSIVA (Smart Copy) DA STANZA A STANZA
     */
    async smartCopy(targetYearRoomId, options) {
        try {
            const payload = {
                sourceYearRoomId: options.sourceYearRoomId, // ID della stanza sorgente scelta
                copyTeachers: options.copyTeachers || false,
                copyClassTeacher: options.includeClassTeacher || false
            };

            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${targetYearRoomId}/smart-copy`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                },
                'Performing smart copy...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error during smart copy:', error);
            return { success: false, message: "Connection error" };
        }
    }, 

    /**
     * Aggiunge una materia a una stanza (senza docente inizialmente)
     */
    async addSubjectToRoom(yearRoomId, subjectId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${yearRoomId}/subjects/${subjectId}`,
                { method: 'POST' },
                'Adding subject...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error adding subject:', error);
            return { success: false, message: "Connection error" };
        }
    },

    /**
     * Aggiunge in blocco più materie a una stanza (usato nello SubjectPickerModal per aggiunta multipla)
     */
    async bulkAssignSubjects(yearRoomId, subjectIds) {
        const response = await api.fetchWithLoader(
            `/api/v1/teacher-assignments/bulk-assign?yearRoomId=${yearRoomId}`, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjectIds)
            }, 
            'Adding subjects...'
        );
        return await response.json();
    },
 
    /**
     * Cambia lo stato attivo/inattivo di un'assegnazione.
     * Invia la PATCH all'endpoint year-rooms/{id}/subjects/{id}/toggle
     */
    async toggleAssignmentStatus(yearRoomId, subjectId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${yearRoomId}/subjects/${subjectId}/toggle`,
                { 
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                },
                'Updating status...'
            );

            // Se il server risponde con un errore (es. 403, 404, 500)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    message: errorData.message || `Error: ${response.status}` 
                };
            }

            // Leggiamo l'ApiResponse inviato dal backend (String message e boolean success)
            return await response.json();
            
        } catch (error) {
            console.error('Error toggling status:', error);
            return { 
                success: false, 
                message: "Connection error: il server non risponde" 
            };
        }
    },

    /**
     * Rimuove un'assegnazione tramite il suo ID univoco.
     * Gestisce sia la rimozione fisica che il soft delete fatto nel backend.
     */
    async removeAssignment(assignmentId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/${assignmentId}`, 
                { method: 'DELETE' },
                'Removing assignment...'
            );

            // Se la risposta è OK, leggiamo il JSON per ottenere il messaggio del backend
            if (response.ok) {
                return await response.json();
            }

            // Gestione errori (es. 403, 404, 500)
            const errorData = await response.json().catch(() => ({}));
            return { 
                success: false, 
                message: errorData.message || `Error: ${response.status}` 
            };
            
        } catch (error) {
            console.error('Error removing assignment:', error);
            return { success: false, message: "Connection error" };
        }
    }



};