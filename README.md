# MwalimuHub
Digital Platform for Mwanza Marist Secondary School teachers to menage document and grades efficiently


## Il tuo flusso è il seguente:

1) Frontend (GitHub Pages): L'utente tenta il login tramite Google (usando Google Identity Services). Ottiene un idToken.
2) Frontend (GitHub Pages): Invia l' idToken al tuo backend Node.js su Render.
3) Backend Node.js (Render):
    a. Riceve e verifica l'idToken per confermare l'identità dell'utente e recuperarne l'email. b. Utilizza un Account di Servizio (le credenziali che hai configurato) per accedere a Google Drive e Google Sheet
    c. Cerca l'email dell'utente autenticato in questo Google Sheet (la whitelist).
    d. Se l'email è trovata, restituisce il nome utente e il profilo corrispondenti.
    e. Se l'email non è trovata, restituisce un false (o un errore di autorizzazione).
