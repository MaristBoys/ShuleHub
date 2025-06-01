// js/upload.js

// Assicurati che BACKEND_BASE_URL sia definito. Se non lo è, prendilo da login.js o definiscilo qui.
const BACKEND_BASE_URL = 'https://google-api-backend-biu7.onrender.com';

// Riferimenti agli elementi del form e dello spinner
const uploadForm = document.getElementById('upload-form');
const uploadButton = document.getElementById('upload-button');
const uploadSpinner = document.getElementById('upload-spinner');
const uploadStatus = document.getElementById('upload-status'); // Per messaggi di stato

document.addEventListener('DOMContentLoaded', async () => {
    // Carica la navbar (riutilizzando la funzione da login.js)
    if (window.loadNavbar) {
        await window.loadNavbar();
    } else {
        console.error("loadNavbar function not found. Ensure login.js is loaded correctly.");
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (navbarPlaceholder) {
            navbarPlaceholder.innerHTML = '<nav id="main-navbar" class="bg-gray-800 text-white p-4 fixed w-full top-0 z-50">Loading Navbar...</nav>';
        }
    }

    // Inizialmente disabilita il form e mostra lo spinner per il caricamento dei dropdown
    if (uploadForm) uploadForm.disabled = true;
    if (uploadButton) uploadButton.disabled = true;
    if (uploadSpinner) {
        uploadSpinner.classList.remove('hidden');
        uploadSpinner.style.display = 'block';
    }
    if (uploadStatus) uploadStatus.textContent = 'Loading form data...';
    
    // Popola i campi del form
    prefillAuthor();
    await populateDropdowns();

    // Una volta caricati i dropdown, riabilita il form e nascondi lo spinner
    if (uploadForm) uploadForm.disabled = false;
    if (uploadButton) uploadButton.disabled = false;
    if (uploadSpinner) {
        uploadSpinner.classList.add('hidden');
        uploadSpinner.style.display = 'none';
    }
    if (uploadStatus) uploadStatus.textContent = ''; // Pulisci il messaggio di caricamento iniziale

    // Aggiungi listener per il submit del form
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
});

// Funzione per pre-riempire il campo Author
function prefillAuthor() {
    const authorInput = document.getElementById('author');
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (authorInput && userData && userData.googleName) {
        authorInput.value = userData.googleName;
    } else {
        authorInput.value = 'Unknown Author'; // Fallback
    }
}

// Funzione per popolare tutti i menu a tendina
async function populateDropdowns() {
    const yearSelect = document.getElementById('year');
    const subjectSelect = document.getElementById('subject');
    const formSelect = document.getElementById('form');
    const roomSelect = document.getElementById('room');
    const documentTypeSelect = document.getElementById('documentType');

    // Funzione helper per recuperare e popolare un singolo dropdown
    const fetchAndPopulate = async (selectElement, endpoint, loadingText, errorText) => {
        selectElement.innerHTML = `<option value="">${loadingText}</option>`;
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            selectElement.innerHTML = '<option value="">Select an option</option>'; // Reset dopo il caricamento
            if (data && data.length > 0) {
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item;
                    option.textContent = item;
                    selectElement.appendChild(option);
                });
            } else {
                selectElement.innerHTML = `<option value="">No options available</option>`;
            }
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            selectElement.innerHTML = `<option value="">${errorText}</option>`;
        }
    };

    // Popola i dropdown in parallelo
    await Promise.all([
        fetchAndPopulate(yearSelect, 'drive/years', 'Loading Years...', 'Error loading Years'),
        fetchAndPopulate(subjectSelect, 'sheets/subjects', 'Loading Subjects...', 'Error loading Subjects'),
        fetchAndPopulate(formSelect, 'sheets/forms', 'Loading Forms...', 'Error loading Forms'),
        fetchAndPopulate(roomSelect, 'sheets/rooms', 'Loading Rooms...', 'Error loading Rooms'),
        fetchAndPopulate(documentTypeSelect, 'sheets/types', 'Loading Document Types...', 'Error loading Document Types')
    ]);
}

// Funzione per gestire l'upload del file
async function handleUpload(event) {
    event.preventDefault(); // Impedisce il submit standard del form

    // Disabilita il pulsante e mostra lo spinner per l'upload
    uploadButton.disabled = true;
    uploadSpinner.classList.remove('hidden');
    uploadSpinner.style.display = 'block';
    uploadStatus.textContent = 'Uploading...';
    uploadStatus.className = 'ml-4 text-sm font-semibold text-blue-600';

    const formData = new FormData();
    const fileInput = document.getElementById('file');

    // Verifica se un file è stato selezionato
    if (!fileInput.files || fileInput.files.length === 0) {
        uploadStatus.textContent = 'Upload Failed: Please select a file.';
        uploadStatus.className = 'ml-4 text-sm font-semibold text-red-600';
        uploadButton.disabled = false;
        uploadSpinner.classList.add('hidden');
        uploadSpinner.style.display = 'none';
        return; // Esci dalla funzione
    }

    // Raccogli tutti i dati del form per la descrizione
    const metadata = {
        year: document.getElementById('year').value,
        author: document.getElementById('author').value,
        subject: document.getElementById('subject').value,
        form: document.getElementById('form').value,
        room: document.getElementById('room').value,
        documentType: document.getElementById('documentType').value
    };

    // Aggiungi il file e la descrizione come stringa JSON
    formData.append('file', fileInput.files[0]);
    formData.append('description', JSON.stringify(metadata)); // Invia i metadati come stringa JSON nella descrizione

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData // FormData viene gestito automaticamente con Content-Type: multipart/form-data
        });

        const result = await response.json();

        if (response.ok && result.success) {
            uploadStatus.textContent = 'Upload Successful!';
            uploadStatus.className = 'ml-4 text-sm font-semibold text-green-600';
            document.getElementById('upload-form').reset(); // Resetta il form
            prefillAuthor(); // Pre-riempi di nuovo l'autore dopo il reset
        } else {
            const errorMessage = result.message || 'Unknown error occurred.';
            uploadStatus.textContent = `Upload Failed: ${errorMessage}`;
            uploadStatus.className = 'ml-4 text-sm font-semibold text-red-600';
        }
    } catch (error) {
        console.error('Error during upload:', error);
        uploadStatus.textContent = `Upload Failed: ${error.message}`;
        uploadStatus.className = 'ml-4 text-sm font-semibold text-red-600';
    } finally {
        uploadButton.disabled = false;
        uploadSpinner.classList.add('hidden');
        uploadSpinner.style.display = 'none';
    }
}