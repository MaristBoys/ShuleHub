window.handleCredentialResponse = function(response) {
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyS249iv_O3nnTjbHkHb6WNN7-ZmPegjMZUZbSYS4lgXEAWQQYNZzsNHGF9P2-cry_3Mw/exec";

  const idToken = response.credential;

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: idToken })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Benvenuto ${data.user.name} (${data.user.email})!`);
      // Qui puoi caricare la tabella filtrata ecc.
    } else {
      alert('Accesso negato: ' + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert('Errore di comunicazione');
  });
}
