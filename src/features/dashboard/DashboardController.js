// src/features/dashboard/DashboardController.js
import { UserModel } from '../auth/UserModel.js';
import { DashboardView } from './DashboardView.js';

export class DashboardController {
    
    static getFeaturesConfig() {
        return [
            { id: 'config', title: 'School Config', icon: 'config.png', perm: 'ADMIN_CONFIG' },
            { id: 'employees', title: 'Employees', icon: 'employees.png', perm: 'VIEW_EMPLOYEES' },
            { id: 'students', title: 'Students', icon: 'students.png', perm: 'VIEW_STUDENTS' },
            { id: 'classes', title: 'Classes', icon: 'classes.png', perm: 'ACCESS_CLASSES' }, 
            { id: 'reports', title: 'Reports', icon: 'reports.png', perm: 'VIEW_REPORTS' },
            { id: 'archive', title: 'Archive', icon: 'archive.png', perm: 'VIEW_ARCHIVE' }
        ];
    }

    static init() {
        const user = UserModel.getCurrentUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        const features = this.getFeaturesConfig().filter(f => {
            if (user.profileName === 'ADMIN') return true;
            // La card apparirà se ha il permesso specifico o se ha il "tocco di classe" dinamico del backend
            return user.permissions.has(f.perm) || 
                   (f.id === 'classes' && user.permissions.has('ACCESS_TEACHER_AREA'));
        });

        DashboardView.render(user, features);
    }
}