// Import dei Service di Dominio (Mattoni)
import { SubjectService } from '../subject/SubjectService.js';
import { SchoolStructureService } from '../school-structure/SchoolStructureService.js';
import { IndicatorScaleService } from '../indicator-scale/IndicatorScaleService.js';

// Import del Service di Processo (Orchestratore)
import { SchoolConfigService } from './SchoolConfigService.js';

import { SchoolConfigView } from './SchoolConfigView.js';
import { ToastView } from '../../core/ToastView.js';

export class SchoolConfigController {

    /**
     * Inizializzazione della pagina di configurazione
     */
    static async init() {
        // 1. Carichiamo i dati necessari per la struttura (anni)
        const years = await SchoolStructureService.getYears();
        
        // 2. Troviamo l'anno attivo per caricare la matrice iniziale
        const activeYear = years.find(y => y.yearIsActive) || years[0];
        
        let matrixData = null;
        if (activeYear) {
            matrixData = await SchoolConfigService.getRoomMatrix(activeYear.id);
        }

        // 3. Renderizziamo la vista principale
        SchoolConfigView.render(years, activeYear, matrixData);
    }

    /**
     * Gestisce l'apertura del modale di una stanza (Tab 1)
     */
    static async handleRoomClick(roomId) {
        // Carichiamo i dettagli aggregati (Regista chiama Orchestratore)
        const details = await SchoolConfigService.getRoomDetails(roomId);
        
        // Carichiamo tutte le scale attive per i dropdown (Regista chiama Dominio)
        const allScales = await IndicatorScaleService.getAllActive();

        SchoolConfigView.showRoomModal(details, allScales);
    }

    /**
     * Gestisce il caricamento delle materie (Tab 0)
     */
    static async loadSubjectsTab() {
        const subjects = await SubjectService.getAll();
        SchoolConfigView.renderSubjectsTable(subjects);
    }

    // ... altri metodi per gestire gli eventi (toggle, salvataggi, etc.)
}