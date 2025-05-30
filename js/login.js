async function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Ricevuto idToken:", idToken);

    try {
        const backendUrl = 'https://google-api-backend-biu7.onrender.com/auth';
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        const data = await res.json();
        console.log('Risposta backend:', data);

        const resultDiv = document.getElementById('result');
        if (data.success) {
            resultDiv.innerHTML = `<h2>Benvenuto, ${data.name}</h2><p>Profilo: ${data.profile}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Accesso negato: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Errore:', error);
        document.getElementById('result').innerHTML = `<p style="color:red;">Errore nel contattare il backend</p>`;
    }
}
