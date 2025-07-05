const fs = require("fs");
const path = require("path");

// Nome del repository GitHub Pages
const repoName = "ShuleHub";  

// 🔹 **Lista dei file da modificare**
const fileList = [
    "index.html",
    "components/navbar.html",
    "css/style.css",
    "js/utils.js",
    "js/prefetch.js",
    "js/login.js",
    "js/index.js",
    "js/upload.js",
    "js/archive.js",
    "pages/upload.html",
    "pages/archive.html"
];

// Percorso della directory principale
const rootFolder = __dirname;

// Funzione per modificare solo i file presenti nella lista
const processFile = (filePath) => {
    console.log(`📂 Scansionando il file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ Il file non esiste: ${filePath}`);
        return; // Evita errori se il file non esiste
    }

    let content = fs.readFileSync(filePath, "utf8");

    // 🔹 **Gestione file HTML** (senza `fetch`)
    if (filePath.endsWith(".html")) {
        content = content.replace(/(src|href)=["']\/(?!${repoName})/g, `$1="/${repoName}/`);
        content = content.replace(/url\(["']\/(?!${repoName})/g, `url('/${repoName}/`);
    }

    // 🔹 **Gestione file CSS** (evita doppia modifica)
    else if (filePath.endsWith(".css")) {
        content = content.replace(/url\(["']\/(?!${repoName})/g, `url("/${repoName}/`);
    }

    // 🔹 **Gestione file JS** (supporta anche backticks!)
    else if (filePath.endsWith(".js")) {
        content = content.replace(/fetch\([`"']\/(?!${repoName}|${BACKEND_BASE_URL})/g, `fetch("/${repoName}/`);
        content = content.replace(/\.href = [`"']\/(?!${repoName})/g, `.href = "/${repoName}/`);
        content = content.replace(/\.replace\([`"']\/(?!${repoName})/g, `.replace("/${repoName}/`);
        // RIGA CORRETTA: Inserisce /${repoName}/
        content = content.replace(/(from\s+['"])\/(js\/)/g, `$1/${repoName}/$2`);
        
    }

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Modificato: ${filePath}`);
};

// 🔹 **Esegui la modifica solo sui file della lista**
fileList.forEach((file) => {
    const filePath = path.join(rootFolder, file);
    console.log(`🔍 Controllando il file: ${filePath}`);
    processFile(filePath);
});

console.log("🚀 Tutte le modifiche sono state applicate ai file specificati!");

