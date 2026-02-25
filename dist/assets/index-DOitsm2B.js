(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();const d={_id:"global-dynamic-loader",show(t="Caricamento in corso..."){if(document.getElementById(this._id)){this.updateMessage(t);return}const e=document.createElement("div");e.id=this._id,e.className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300",e.innerHTML=`
            <div class="bg-white p-6 rounded-2xl shadow-2xl border border-blue-50 w-72 text-center transform scale-100 transition-transform">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-900 border-t-transparent mb-4"></div>
                <h2 id="loader-message" class="text-blue-900 font-semibold text-sm mb-2">${t}</h2>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div id="loader-bar" class="bg-blue-600 h-full w-1/3 animate-[loading_2s_infinite_linear]"></div>
                </div>
            </div>
            <style>
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            </style>
        `,document.body.appendChild(e)},updateMessage(t){const e=document.getElementById("loader-message");e&&(e.textContent=t)},hide(){const t=document.getElementById(this._id);t&&(t.classList.add("opacity-0"),setTimeout(()=>t.remove(),300))}},g="https://shulehub-j-backend.onrender.com",i={isServerAwake:!1,async wakeUp(){try{const t=await fetch(`${g}/api/auth/wakeup`,{credentials:"include"});return t.ok&&(this.isServerAwake=!0),t.ok}catch{return!1}},async fetchWithLoader(t,e={},n){n&&d.show(n),e.credentials="include";try{return await fetch(`${g}${t}`,e)}finally{n&&d.hide()}}},l={setCache(t,e){const n={value:e,timestamp:Date.now()};localStorage.setItem(t,JSON.stringify(n))},getCache(t){const e=localStorage.getItem(t);return e?JSON.parse(e).value:null},setSession(t,e){sessionStorage.setItem(t,JSON.stringify(e))},getSession(t){const e=sessionStorage.getItem(t);return e?JSON.parse(e):null},clearAll(){localStorage.clear(),sessionStorage.clear()}},s={saveUser(t){const e=t.data,n={userId:e.userId,username:e.username,email:e.email,profileId:e.profileId,profileName:e.profileName,pictureUrl:e.pictureUrl,permissions:e.permissions||[],teacherContext:e.teacherContext||null};l.setSession("currentUser",n),l.setSession("isLoggedIn",!0),console.log("Sessione salvata nel SessionStorage:",n)},getCurrentUser(){return l.getSession("currentUser")},isLoggedIn(){return l.getSession("isLoggedIn")===!0},logout(){l.clearAll(),window.dispatchEvent(new CustomEvent("app:logout"))}},p={async render(){try{const e=await(await fetch("src/features/ui/navbar/navbar.html")).text(),n=document.getElementById("navbar-placeholder");if(!n)return;if(n.innerHTML=e,s.isLoggedIn()){const o=s.getCurrentUser();this.renderAuthMenu(o)}else{const o=document.getElementById("auth-container");o&&(o.innerHTML="")}}catch(t){console.error("Errore nel caricamento della navbar:",t)}},renderAuthMenu(t){const e=document.getElementById("auth-container");if(!e)return;const n="./assets/icons/navbar_icona_1_32px.png";if(e.innerHTML=`
        <div class="flex items-center space-x-6">
            <div class="flex flex-col text-right hidden md:flex text-blue-900">
                <span class="font-bold leading-tight">${t.username}</span>
                <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">${t.profileName}</span>
            </div>

            <a href="#profile" title="My Profile" class="hover:scale-110 transition-transform relative">
                <img id="navbar-profile-img" 
                     src="${n}" 
                     alt="Profilo" 
                     class="w-8 h-8 rounded-full border-2 border-blue-900 object-cover shadow-sm transition-opacity duration-300">
            </a>

            <a href="#dashboard" title="Home" class="hover:scale-110 transition-transform">
                <img src="./assets/icons/navbar_icona_2_32px.png" alt="Home" class="w-8 h-8 object-contain">
            </a>

            <button id="logout-btn" title="Logout" class="hover:scale-110 transition-transform">
                <img src="./assets/icons/navbar_icona_3_32px.png" alt="Logout" class="w-8 h-8 object-contain">
            </button>
        </div>
    `,t.pictureUrl){const o=new Image;o.src=t.pictureUrl,o.onload=()=>{const r=document.getElementById("navbar-profile-img");r&&(r.style.opacity="0",setTimeout(()=>{r.src=t.pictureUrl,r.style.opacity="1"},300))},o.onerror=()=>{console.warn("Impossibile caricare l'immagine di Google, rimango con quella di default.")}}document.getElementById("logout-btn").addEventListener("click",()=>{s.logout(),window.dispatchEvent(new CustomEvent("app:logout"))})}},m={async render(t="main-content"){const e=document.getElementById(t);if(e)try{const n=await fetch("src/features/welcome/welcome.html");if(!n.ok)throw new Error("Errore nel caricamento del template Welcome");const o=await n.text();e.innerHTML=o,this.initLogin()}catch(n){console.error("Errore WelcomeView:",n),e.innerHTML=`
                <div class="text-center p-10">
                    <p class="text-red-500">Si è verificato un errore nel caricamento della pagina.</p>
                </div>
            `}},initLogin(){document.getElementById("google-login-btn")&&f.initGoogleAuth()}},u={routes:{welcome:m},async navigate(){const t=document.getElementById("main-content");if(await p.render(),!s.isLoggedIn())return await m.render("main-content");t.innerHTML=`
            <div class="p-10 text-center animate-fade-in">
                <h1 class="text-2xl font-black text-blue-900">SHULEHUB DASHBOARD</h1>
                <p class="text-gray-500">Welcome back, ${s.getCurrentUser().username}</p>
                <div class="mt-4 p-4 bg-blue-50 rounded-xl inline-block">
                    Status: <span class="text-green-600 font-bold">Authenticated</span>
                </div>
            </div>
        `}},f={async initBackgroundWakeup(){console.log("Sveglia backend avviata in background..."),await i.wakeUp(),console.log("Backend pronto!")},initGoogleAuth(){typeof google<"u"&&(google.accounts.id.initialize({client_id:"651622332732-hqg898c50786ii5rpa4iieo43gb6kmc8.apps.googleusercontent.com",callback:t=>this.handleCredentialResponse(t),use_fedcm_for_prompt:!1}),google.accounts.id.renderButton(document.getElementById("google-login-btn"),{theme:"outline",size:"large",shape:"pill"}))},async handleCredentialResponse(t){try{if(!i.isServerAwake)for(d.show("Connecting to the server... up to 90s");!i.isServerAwake;)await i.wakeUp(),i.isServerAwake||await new Promise(o=>setTimeout(o,2e3));const e=await i.fetchWithLoader("/api/auth/google-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t.credential})},"Verifying your credentials...");if(!e.ok)throw new Error("Errore login server");const n=await e.json();s.saveUser(n),u.navigate()}catch(e){console.error("Errore durante il login:",e),alert("Errore di autenticazione: "+e.message)}}};document.addEventListener("DOMContentLoaded",async()=>{await p.render(),f.initBackgroundWakeup(),await u.navigate()});window.addEventListener("app:logout",()=>{u.navigate()});
