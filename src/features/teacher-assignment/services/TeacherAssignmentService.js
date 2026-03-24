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
     * Salva l'assegnazione di un docente a una materia (Staffing)
     * Endpoint: /api/v1/teacher-assignments/year-rooms/{id}/subjects/{subjectId}
     */
    async assignSubjectTeacher(yearRoomId, subjectId, employeeId) {
        try {
            const response = await api.fetchWithLoader(
                `/api/v1/teacher-assignments/year-rooms/${yearRoomId}/subjects/${subjectId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ employeeId })
                },
                'Updating staffing...'
            );
            return await response.json();
        } catch (error) {
            console.error('Error assigning subject teacher:', error);
            return { success: false, message: "Connection error" };
        }
    }
};