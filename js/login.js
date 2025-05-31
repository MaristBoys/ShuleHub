async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Ricevuto idToken:", idToken);

    // Mostra lo spinner
    const spinner = document.getElementById('spinner');
    const resultDiv = document.getElementById('result');
    spinner.style.display = 'block';
    resultDiv.innerHTML = ''; // Pulisce il contenuto precedente

    try {
        const backendUrl = 'https://google-api-backend-biu7.onrender.com/auth';
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        const data = await res.json();
        console.log('Risposta backend:', data);

        // Nasconde lo spinner
        spinner.style.display = 'none';

        if (data.success) {
            resultDiv.innerHTML = `<h2>Benvenuto, ${data.name}</h2><p>Profilo: ${data.profile}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Accesso negato: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Errore:', error);
        spinner.style.display = 'none'; // Nasconde lo spinner in caso di errore
        resultDiv.innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
    }

}
