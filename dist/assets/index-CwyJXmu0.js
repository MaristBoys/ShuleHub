(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const u={_id:"global-dynamic-loader",show(t="Caricamento in corso..."){if(document.getElementById(this._id)){this.updateMessage(t);return}const e=document.createElement("div");e.id=this._id,e.className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300",e.innerHTML=`
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
        `,document.body.appendChild(e)},updateMessage(t){const e=document.getElementById("loader-message");e&&(e.textContent=t)},hide(){const t=document.getElementById(this._id);t&&(t.classList.add("opacity-0"),setTimeout(()=>t.remove(),300))}},f="https://shulehub-j-backend.onrender.com",i={isServerAwake:!1,async wakeUp(){try{const t=await fetch(`${f}/api/auth/wakeup`,{credentials:"include"});return t.ok&&(this.isServerAwake=!0),t.ok}catch{return!1}},async fetchWithLoader(t,e={},n){n&&u.show(n),e.credentials="include";try{return await fetch(`${f}${t}`,e)}finally{n&&u.hide()}}},c={setCache(t,e){const n={value:e,timestamp:Date.now()};localStorage.setItem(t,JSON.stringify(n))},getCache(t){const e=localStorage.getItem(t);return e?JSON.parse(e).value:null},setSession(t,e){sessionStorage.setItem(t,JSON.stringify(e))},getSession(t){const e=sessionStorage.getItem(t);return e?JSON.parse(e):null},clearAll(){localStorage.clear(),sessionStorage.clear()}},l={saveUser(t){const e=t.data,n={userId:e.userId,username:e.username,email:e.email,profileId:e.profileId,profileName:e.profileName,pictureUrl:e.pictureUrl,googleName:e.googleName,permissions:e.permissions||[],teacherContext:e.teacherContext||null};c.setSession("currentUser",n),c.setSession("isLoggedIn",!0),console.log("Sessione salvata nel SessionStorage:",n)},getCurrentUser(){return c.getSession("currentUser")},isLoggedIn(){return c.getSession("isLoggedIn")===!0},logout(){c.clearAll(),window.dispatchEvent(new CustomEvent("app:logout"))}},y={async render(){try{const e=await(await fetch("src/features/ui/navbar/navbar.html")).text(),n=document.getElementById("navbar-placeholder");if(!n)return;if(n.innerHTML=e,l.isLoggedIn()){const r=l.getCurrentUser();this.renderAuthMenu(r)}else{const r=document.getElementById("auth-container");r&&(r.innerHTML="")}}catch(t){console.error("Errore nel caricamento della navbar:",t)}},renderAuthMenu(t){const e=document.getElementById("auth-container");if(!e)return;const n="./assets/icons/navbar_icona_1_32px.png";if(e.innerHTML=`
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
    `,t.pictureUrl){const r=new Image;r.src=t.pictureUrl,r.onload=()=>{const o=document.getElementById("navbar-profile-img");o&&(o.style.opacity="0",setTimeout(()=>{o.src=t.pictureUrl,o.style.opacity="1"},300))},r.onerror=()=>{console.warn("Impossibile caricare l'immagine di Google, rimango con quella di default.")}}document.getElementById("logout-btn").addEventListener("click",()=>{l.logout(),window.dispatchEvent(new CustomEvent("app:logout"))})}},b={async render(t="main-content"){const e=document.getElementById(t);if(e)try{const n=await fetch("src/features/welcome/welcome.html");if(!n.ok)throw new Error("Errore nel caricamento del template Welcome");const r=await n.text();e.innerHTML=r,this.initLogin()}catch(n){console.error("Errore WelcomeView:",n),e.innerHTML=`
                <div class="text-center p-10">
                    <p class="text-red-500">Si è verificato un errore nel caricamento della pagina.</p>
                </div>
            `}},initLogin(){document.getElementById("google-login-btn")&&v.initGoogleAuth()}};class S{static async render(e,n,r="main-content"){const o=document.getElementById(r);if(o)try{const s=await fetch("src/features/dashboard/dashboard.html");if(!s.ok)throw new Error("Impossibile caricare il template della Dashboard");const a=await s.text();o.innerHTML=a;const g=o.querySelector("#dashboard-welcome-title"),p=o.querySelector("#dashboard-profile-info"),h=o.querySelector("#current-date");g&&(g.textContent=`Welcome back, ${e.username}`),p&&(p.textContent=`${e.profileName} Area`),h&&(h.textContent=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));const m=o.querySelector("#dashboard-grid");m&&(m.innerHTML="",n.forEach(x=>{const E=this.createCard(e,x);m.appendChild(E)}))}catch(s){console.error("Dashboard Render Error:",s),o.innerHTML=`
                <div class="p-8 text-center text-red-600">
                    <p class="font-bold">Error loading Dashboard</p>
                    <p class="text-sm">${s.message}</p>
                </div>
            `}}static createCard(e,n){const r=document.createElement("div");return r.className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-transform cursor-pointer flex flex-col items-center text-center",n.id==="classes"?r.innerHTML=this.renderClassesWidget(e,n):r.innerHTML=`
                <img src="./assets/icons/${n.icon}" alt="${n.title}" class="w-16 h-16 mb-4">
                <h3 class="text-xl font-bold text-blue-900">${n.title}</h3>
                <p class="text-gray-500 text-sm mt-2">Manage ${n.title.toLowerCase()}</p>
            `,r.onclick=()=>{console.log(`Navigating to ${n.id}`)},r}static renderClassesWidget(e,n){var s;let r=`
            <img src="./assets/icons/${n.icon}" alt="Classes" class="w-16 h-16 mb-4">
            <h3 class="text-xl font-bold text-blue-900 mb-3">${n.title}</h3>
        `;e.profileName!=="TEACHER"&&(r+=`
                <div class="bg-blue-50 rounded-lg p-3 w-full mb-3">
                    <span class="text-2xl font-bold text-blue-700">All Rooms</span>
                    <p class="text-[10px] text-blue-500 uppercase font-bold">Global Access</p>
                </div>
            `);const o=((s=e.teacherContext)==null?void 0:s.assignments)||[];return o.length>0?r+=`
                <div class="w-full text-left mt-2">
                    <p class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">My Teaching</p>
                    <div class="space-y-1">
                        ${o.slice(0,4).map(a=>`
                            <div class="flex justify-between items-center bg-gray-50 p-2 rounded border-l-4 ${a.classTeacher?"border-amber-400":"border-blue-400"}">
                                <span class="text-xs font-bold text-gray-700">${a.yearRoomName}</span>
                                <span class="text-[10px] text-gray-500">${a.subjectName}</span>
                            </div>
                        `).join("")}
                        ${o.length>4?'<p class="text-[10px] text-center text-blue-500 mt-1">...and more</p>':""}
                    </div>
                </div>
            `:e.profileName==="TEACHER"&&(r+='<p class="text-xs text-gray-400 italic mt-2">No classes assigned yet</p>'),r}}class w{static getFeaturesConfig(){return[{id:"config",title:"School Config",icon:"config.png",perm:"ADMIN_CONFIG"},{id:"employees",title:"Employees",icon:"employees.png",perm:"VIEW_EMPLOYEES"},{id:"students",title:"Students",icon:"students.png",perm:"VIEW_STUDENTS"},{id:"classes",title:"Classes",icon:"classes.png",perm:"ACCESS_CLASSES"},{id:"reports",title:"Reports",icon:"reports.png",perm:"VIEW_REPORTS"},{id:"archive",title:"Archive",icon:"archive.png",perm:"VIEW_ARCHIVE"}]}static async init(){var s;const e=l.getCurrentUser();if(!e){window.location.hash="#login";return}const n=(s=e.profileName)==null?void 0:s.toUpperCase(),r=new Set(e.permissions||[]),o=this.getFeaturesConfig().filter(a=>n==="ADMIN"?!0:r.has(a.perm)||a.id==="classes"&&r.has("ACCESS_TEACHER_AREA"));console.log("Features for Admin:",o),await S.render(e,o)}}const d={routes:{welcome:b,dashboard:w},async navigate(){const t=window.location.hash.replace("#","")||"welcome",e=document.getElementById("main-content");await y.render();const n=l.isLoggedIn();if(!n&&t!=="welcome"){window.location.hash="#welcome";return}if(n&&t==="welcome"){window.location.hash="#dashboard";return}try{t==="dashboard"?await w.init():t==="welcome"?await b.render("main-content"):window.location.hash=n?"#dashboard":"#welcome"}catch(r){console.error(`Errore durante la navigazione verso ${t}:`,r),e.innerHTML='<p class="p-10 text-center text-red-500">Something went wrong during navigation.</p>'}}};window.addEventListener("hashchange",()=>d.navigate());const v={async initBackgroundWakeup(){console.log("Sveglia backend avviata in background..."),await i.wakeUp(),console.log("Backend pronto!")},initGoogleAuth(){typeof google<"u"&&(google.accounts.id.initialize({client_id:"651622332732-hqg898c50786ii5rpa4iieo43gb6kmc8.apps.googleusercontent.com",callback:t=>this.handleCredentialResponse(t),use_fedcm_for_prompt:!1}),google.accounts.id.renderButton(document.getElementById("google-login-btn"),{theme:"outline",size:"large",shape:"pill"}))},async handleCredentialResponse(t){try{if(!i.isServerAwake)for(u.show("Connecting to the server... up to 90s");!i.isServerAwake;)await i.wakeUp(),i.isServerAwake||await new Promise(r=>setTimeout(r,2e3));const e=await i.fetchWithLoader("/api/auth/google-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t.credential})},"Verifying your credentials...");if(!e.ok)throw new Error("Errore login server");const n=await e.json();l.saveUser(n),d.navigate()}catch(e){console.error("Errore durante il login:",e),alert("Errore di autenticazione: "+e.message)}}};document.addEventListener("DOMContentLoaded",async()=>{await y.render(),v.initBackgroundWakeup(),await d.navigate()});window.addEventListener("app:logout",()=>{d.navigate()});
