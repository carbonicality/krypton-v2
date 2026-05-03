lucide.createIcons();
let games=[];
let fGames=[];
let aGames=[];

const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";
const CKV_URL = "https://raw.githack.com/carbonicality/ChickenKingsVault/main";
const CKV_ICONS_URL = "https://cdn.jsdelivr.net/gh/carbonicality/ChickenKingsVault@main";
const HYDRA_URL = "https://cdn.jsdelivr.net/gh/Hydra-Network/hydra-assets@main";
const GN_URL = "https://cdn.jsdelivr.net/gh/freebuisness/";
const ELITE_URL = "https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/";
const SEA_URL = "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/";
const UGS_URL = "https://cdn.jsdelivr.net/gh/tharun9772/";
const SERAPH_URL = "https://cdn.jsdelivr.net/gh/a456pur/seraph@main/";
const CCPORTED_URL = "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/";

let currProvider = localStorage.getItem('krypton_provider') || 'ckv';
let cardObserver = null;
let luminReady = false;

console.log('sw controlled:',!!navigator.serviceWorker.controller);
if (navigator.serviceWorker.controller) {
    console.log('sw controlling from',navigator.serviceWorker.controller.scriptURL);
}

async function fetchGames() {
    try {
        if (!luminReady) {
            await Lumin.init({
                headless:true,
                onReady:()=>console.log('lumin ready'),
                onError:(err)=>console.log('lumin error',err),
            });
        }
        const result=await Lumin.getGames({limit:999});
        const imgUrls=await Promise.all(
            result.games.map(g=>Lumin.getImageUrl(g.image_token))
        );
        games=result.games.map((g,i)=>({
            name:g.name,
            icon:'',
            url:g.id,
            image_token:g.image_token,
        }));
        localStorage.setItem('krypton_games_list',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
        games.forEach(async (game)=>{
            try {
                const url=await Lumin.getImageUrl(game.image_token);
                game.icon=url;
                const card=document.querySelector(`.gcard[data-name="${CSS.escape(game.name)}"]`);
                if (card) {
                    card.dataset.icon=url;
                    if (card.dataset.loaded) {
                        const gicon=card.querySelector('.gicon');
                        gicon.innerHTML='';
                        const img=document.createElement('img');
                        img.alt=game.name;
                        img.src=url;
                        img.addEventListener('error',()=>{gicon.innerHTML=genFallback(game.name);});
                        gicon.appendChild(img);
                    }
                }
            } catch (e) {}
        });
    } catch (error) {
        console.error('failed to load lumin games',error);
        const cachedGames=localStorage.getItem('krypton_games_list');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

async function fetchGNGames() {
    try {
        const r = await fetch('https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json');
        const d = await r.json();

        games = d
            .filter(g => g.id !== -1 && !g.name.startsWith("[!]"))
            .map(g => ({
                name: g.name,
                icon: GN_URL + 'covers@main/' + g.cover.replace('{COVER_URL}',''),
                url: '/app-viewer/gn-math/?gn-id=' + g.id
            }));
        
        localStorage.setItem('krypton_games_list_gn',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load GN games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_gn');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

async function fetchEliteGames() {
    try {
        const r = await fetch("https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/games.json");
        const d = await r.json();

        games = d.map(g => ({
            name: g.title,
            icon: ELITE_URL + g.image,
            url: '/app-viewer/elite-gamez?url=' + encodeURIComponent(g.url)
        }));

        localStorage.setItem('krypton_games_list_elite',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load elite games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_elite');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

async function fetchSeaGames() {
    try {
        const r = await fetch("https://cdn.jsdelivr.net/gh/sea-bean-unblocked/sde@main/zzz.json");
        const d = await r.json();

        games = d.map(g => {
            const cover = (g.cover || "").replace("{COVER_URL}/", "");

            return {
                name: g.name || "Unknown",
                icon: cover.startsWith("http")
                    ? cover
                    : SEA_URL + 'Singlemile@main/Icon/' + cover,
                url: '/app-viewer/sea-bean?view=' + encodeURIComponent(g.id)
            };
        });

        localStorage.setItem('krypton_games_list_sea',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load sea games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_sea');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

async function fetchUGSGames() {
    try {
        const repos = [
            "tharun9772/ugs-1",
            "tharun9772/ugs-2",
            "tharun9772/ugs-3"
        ];

        let allGames = [];

        for(const repo of repos){
            try{
                const r = await fetch(`https://api.github.com/repos/${repo}/contents/`);
                const d = await r.json();

                d.forEach(f => {
                    if(f.type === "file" && f.name.startsWith("cl") && f.name.endsWith(".html")){
                        allGames.push({
                            name: f.name.replace(/^cl/,"").replace(".html",""),
                            icon: UGS_URL + "game-assets@main/5968517.png",
                            url: '/app-viewer/ugs-files?view=' + encodeURIComponent(f.name)
                        });
                    }
                });
            }catch(e){
                console.warn("UGS repo failed:", repo);
            }
        }

        games = allGames;
        localStorage.setItem('krypton_games_list_ugs',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load ugs games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_ugs');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

async function fetchSeraphGames() {
    try {
        const r = await fetch("https://cdn.jsdelivr.net/gh/DominumNetwork/dominum@main/src/assets/libraries/seraph/games.json");
        const d = await r.json();

        const BASE = "https://cdn.jsdelivr.net/gh/a456pur/seraph@main/games/";

        games = d.map(g => {
            const remaining = g.url.replace(BASE, "");
            return {
                name: g.name,
                icon: g.img,
                url: '/app-viewer/seraph/?view=' + remaining
            };
        });

        localStorage.setItem('krypton_games_list_seraph',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load seraph games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_seraph');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

function loadProvider(provider) {
    currProvider = provider;
    localStorage.setItem('krypton_provider',provider);
    games = [];fGames=[];aGames=[];
    
    const providers = {
        'ckv': { label: 'CKV', fetch: fetchCKVGames },
        'gn': { label: 'GN Math', fetch: fetchGNGames },
        'elite': { label: 'Elite', fetch: fetchEliteGames },
        'sea': { label: 'Sea Bean', fetch: fetchSeaGames },
        'ugs': { label: 'UGS', fetch: fetchUGSGames },
        'ccported': { label: 'CC Ported', fetch: fetchCCPortedGames },
        'hydra': { label: 'Hydra', fetch: fetchHydraGames },
        'lumin': { label: 'Lumin', fetch: fetchGames }
    };
    
    const badge  = document.getElementById('provBadge');
    const provData = providers[provider];
    if (badge && provData) badge.textContent = provData.label;
    
    document.querySelectorAll('.prov-option').forEach(el => {
        el.classList.toggle('active',el.dataset.provider===provider);
    });
    
    if (provData?.fetch) {
        provData.fetch();
    }
}

function updateDropdownPosition() {
    const btn = document.getElementById('provBtn');
    const dropdown = document.getElementById('provDropdown');
    
    if (!btn || !dropdown) return;
    
    const rect = btn.getBoundingClientRect();
    const dropdownWidth = 200;
    const padding = 12;
    let left = rect.left + rect.width / 2 - dropdownWidth / 2;
    const maxLeft = window.innerWidth - dropdownWidth - padding;
    left = Math.max(padding, Math.min(left, maxLeft));
    
    dropdown.style.top = (rect.bottom + 8) + 'px';
    dropdown.style.left = left + 'px';
}

function initProvSel() {
    const wrapper = document.querySelector('.search-sec');
    const searchBox = document.querySelector('.search-box');
    if (!wrapper || !searchBox) return;
    
    const providers = [
        { id: 'ckv', label: 'CKV' },
        { id: 'hydra', label: 'Hydra' },
        { id: 'gn', label: 'GN Math' },
        { id: 'elite', label: 'Elite' },
        { id: 'sea', label: 'Sea Bean' },
        { id: 'ugs', label: 'UGS' },
        { id: 'ccported', label: 'CC Ported' },
        { id: 'lumin', label: 'Lumin' }
    ];
    
    const optionsHTML = providers.map(p => 
        `<div class="prov-option ${currProvider === p.id?'active':''}" data-provider="${p.id}">
            <span class="prov-dot"></span>
            ${p.label}
        </div>`
    ).join('');
    
    const providerEl = document.createElement('div');
    providerEl.className = 'prov-sel';
    providerEl.id = 'providerWrapper';
    providerEl.innerHTML = `
    <div class="prov-btn" id="provBtn">
        <i data-lucide="layers"></i>
        <span id="provBadge" class="prov-badge">${
            providers.find(p => p.id === currProvider)?.label || 'CKV'
        }</span>
        <i data-lucide="chevron-down" class="prov-chevron"></i>
    </div>`;
    
    wrapper.insertBefore(providerEl, searchBox);
    
    const dropdown = document.createElement('div');
    dropdown.className = 'prov-dropdown';
    dropdown.id = 'provDropdown';
    dropdown.innerHTML = optionsHTML;
    document.body.appendChild(dropdown);
    
    const btn = document.getElementById('provBtn');
    
    btn.addEventListener('click',(e)=>{
        e.stopPropagation();
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) {
            updateDropdownPosition();
        }
    });
    
    document.addEventListener('click',(e)=>{
        if (!providerEl.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
    window.addEventListener('scroll', () => {
        if (dropdown.classList.contains('open')) {
            updateDropdownPosition();
        }
    }, { passive: true });
    
    window.addEventListener('resize', () => {
        if (dropdown.classList.contains('open')) {
            updateDropdownPosition();
        }
    }, { passive: true });
    
    dropdown.querySelectorAll('.prov-option').forEach(el=>{
        el.addEventListener('click',(e)=>{
            e.stopPropagation();
            loadProvider(el.dataset.provider);
            dropdown.classList.remove('open');
        });
    });
    lucide.createIcons();
}

async function fetchCKVGames() {
    try {
        const iconMap = {};
        try {
            const iconRes = await fetch(`${CKV_ICONS_URL}/games.json?t=${Date.now()}`);
            const iconJson = await iconRes.json();
            iconJson.forEach(g => {
                const key = g.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                iconMap[key] = `${CKV_ICONS_URL}/gameimages/${g.img}`;
            });
        } catch (e) {
            console.log('couldnt load icon map');
        }
        const apiUrl = `https://api.github.com/repos/carbonicality/ChickenKingsVault/contents/gamefiles/`;
        const res = await fetch(apiUrl);
        const json = await res.json();
        let htmlFiles = json.filter(f => f.type==='file'&&f.name.endsWith('.html') && f.name !=='index.html');
        const prettyFiles = htmlFiles.filter(f => /[A-Z\s]/.test(f.name));
        if (prettyFiles.length > 0) htmlFiles = prettyFiles;
        games = htmlFiles.map(f => {
            const normKey = f.name.replace('.html','').toLowerCase().replace(/[^a-z0-9]/g, '');
            const icon = iconMap[normKey]||'';
            return {
                name:f.name.replace('.html',''),
                icon:icon,
                url:`${CKV_URL}/gamefiles/${f.name}`
            };
        });
        localStorage.setItem('krypton_games_list_ckv',JSON.stringify(games));
        aGames = [...games];
        fGames = [...games];
        renderGames();
    } catch (error) {
        console.error('failed to load CKV games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_ckv');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            if (!navigator.onLine) {
                checkGames().then(cachedUrls => {
                    aGames=games.filter(game=>cachedUrls.includes(game.url));
                    fGames=[...aGames];
                    renderGames();
                });
            } else {
                aGames=[...games];
                fGames=[...games];
                renderGames();
            }
        }
    }
}

async function fetchHydraGames() {
    try {
        const res=await fetch(`${HYDRA_URL}/gmes.json?t=${Date.now()}`);
        const json=await res.json();
        games = json.map(g => ({
            name: g.title,
            icon: `${HYDRA_URL}/${g.thumb}`,
            url: `${HYDRA_URL}/gmes/${g.file_name}`
        }));
        localStorage.setItem('krypton_games_list_hydra',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load hydra games:',error);
        const cachedGames= localStorage.getItem('krypton_games_list_hydra');
        if (cachedGames) {
            games=JSON.parse(cachedGames);
            if (!navigator.onLine) {
                checkGames().then(cachedUrls => {
                    aGames=games.filter(game=>cachedUrls.includes(game.url));
                    fGames=[...aGames];
                    renderGames();
                });
            } else {
                aGames=[...games];
                fGames=[...games];
                renderGames();
            }
        }
    }
}

async function fetchCCPortedGames() {
    try {
        const r = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/ccported-stupid-game-lib.json");
        const d = await r.json();

        games = d.map(g => {
            if(!g.base || !g.Id) return null;

            return {
                name: g.name && g.name.trim() ? g.name : "Game " + g.Id,
                icon: g.base + "/thumb.jpg",
                url: "/app-viewer/ccported/?view=" + g.Id
            };
        }).filter(Boolean);

        localStorage.setItem('krypton_games_list_ccported',JSON.stringify(games));
        aGames=[...games];
        fGames=[...games];
        renderGames();
    } catch (error) {
        console.error('failed to load ccported games:',error);
        const cachedGames = localStorage.getItem('krypton_games_list_ccported');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames=[...games];
            fGames=[...games];
            renderGames();
        }
    }
}

async function checkGames() {
    try {
        const cache = await caches.open('krypton-v5');
        const requests  =await cache.keys();
        const cachedUrls = requests.map(req => req.url);
        return cachedUrls;
    } catch (err) {
        console.error('error checking cache',err);
        return [];
    }
}

function genFallback(name) {
    const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `<div style="width:100%;height:100%;background:linear-gradient(180deg,#60a5fa,#93c5fd);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:white;text-shadow:0 2px 4px rgba(0,0,0,0.3)">${initials}</div>`;
}

function createGC(game) {
    const card = document.createElement('div');
    card.className = 'gcard';
    if (localStorage.getItem('krypton_anims') === 'false') {
        card.style.transition = 'none';
    }
    card.dataset.icon=game.icon||'';
    card.dataset.name=game.name;
    card.innerHTML=`
    <div class="gicon"></div>
    <div class="game-nm">${game.name}</div>`;
    card.addEventListener('click',()=>openGame(game));
    return card;
}

async function openGame(game) {
    console.log('zone frame',document.getElementById('zoneFrame'));
    console.log('close game',document.getElementById('closeGame'));
    try {
        if (currProvider==='lumin') {
            Lumin.loadGame(game.url);
            return;
        }
        const res = await fetch(game.url);
        const html = await res.text();
        const frame = document.getElementById('zoneFrame');
        if (!frame) {
            console.error('zoneFrame not found');
            return;
        }
        frame.style.display = 'block';
        frame.contentDocument.open();
        frame.contentDocument.write(html);
        frame.contentDocument.close();
        document.querySelector('.gametainer').style.display='none';
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom=[];
        }
        
        if (frame.contentDocument.body){
            frame.contentDocument.body.style.backgroundColor = '#0a0a0a';
            //ad block!
            const removeAds = frame.contentDocument.createElement('script');
            removeAds.textContent=`
            function removeAds() {
                ['sidebarad1','sidebarad2'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.remove();
                });
            }
            removeAds();
            const observer = new MutationObserver(removeAds);
            observer.observe(document.body,{childList:true,subtree:true});`;
            frame.contentDocument.body.appendChild(removeAds);
        }
        
        const closeBtn = document.getElementById('closeGame');
        if (closeBtn) {
            closeBtn.style.display='block';
        }
        document.getElementById('fsBtn').style.display='block';
        lucide.createIcons();
    } catch (err) {
        console.error('error fetching game',err);
        const frame = document.getElementById('zoneFrame');
        if (!frame || frame.style.display!=='block') {
            frame.style.display='none';
            document.querySelector('.gametainer').style.display='block';
            document.getElementById('closeGame').style.display='none';
            document.getElementById('fsBtn').style.display='none';
            console.log('(potentially) failed to load game!');
        }
    }
}

function closeGame() {
    const frame = document.getElementById('zoneFrame');
    if (window.saveIDBFS) {
        window.saveIDBFS().then(()=>{
            console.log('game saves captured');
        }).catch(e=>console.warn('save failed',e));
    }
    frame.remove();
    const nFrame = document.createElement('iframe');
    nFrame.id='zoneFrame';
    nFrame.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:9999;';
    document.body.appendChild(nFrame);
    document.getElementById('closeGame').style.display='none';
    document.getElementById('fsBtn').style.display='none';
    document.querySelector('.gametainer').style.display='block';
    initParticles();
}

function tglFullscreen() {
    const iframe = document.getElementById('zoneFrame');
    const icon = document.querySelector('#fsBtn i');
    if (!document.fullscreenElement) {
        iframe.requestFullscreen();
        icon.setAttribute('data-lucide','minimize');
    } else {
        document.exitFullscreen();
        icon.setAttribute('data-lucide','maximize');
    }
    lucide.createIcons();
}

function initBack() {
    const isMenu = document.getElementById('gameGrid') !== null;
    if (!isMenu) {
        const backBtn=document.createElement('div');
        backBtn.className='back-btn';
        backBtn.innerHTML =`
        <div class="back-btn-in">
            <i data-lucide="x"></i>
            <span class="back-txt">Back</span>
        </div>`;
        document.body.appendChild(backBtn);
        lucide.createIcons();
        backBtn.addEventListener('click',()=>{
            window.history.back();
        });
    }
}

function renderGames() {
    const grid = document.getElementById('gameGrid');
    const emptyState = document.getElementById('emptyState');
    grid.innerHTML = '';
    if (fGames.length===0) {
        grid.style.display='none';
        emptyState.style.display='flex';
        return;
    }
    grid.style.display='grid';
    emptyState.style.display='none';
    let currIdx = 0;
    const BATCH=40;
    function loadBatch() {
        const batch =fGames.slice(currIdx,currIdx+BATCH);
        if (batch.length===0) return;
        batch.forEach((game,i)=>{
            const card=createGC(game);
            card.style.animationDelay=`${i*0.05}s`;
            grid.appendChild(card);
        });
        currIdx+=BATCH;
        const old= grid.querySelector('.scroll-batch');
        if (old) old.remove();
        if (currIdx < fGames.length) {
            const batch = document.createElement('div');
            batch.className='scroll-batch';
            batch.style.cssText='width:100%;height:1px;grid-column:1/-1;';
            grid.appendChild(batch);
            batchObserver.observe(batch);
        }
    }
    const batchObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if (entry.isIntersecting) {
                batchObserver.unobserve(entry.target);
                entry.target.remove();
                loadBatch();
            }
        });
    },{rootMargin:'300px'});
    cardObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            const card=entry.target;
            const icon =card.dataset.icon;
            const name =card.dataset.name;
            const gicon=card.querySelector('.gicon');
            if (entry.isIntersecting) {
                if (!card.dataset.loaded) {
                    if (!icon) {
                        gicon.innerHTML=genFallback(name);
                    } else {
                        const img =document.createElement('img');
                        img.alt=name;
                        img.addEventListener('error',()=>{
                            gicon.innerHTML=genFallback(name);
                        });
                        img.src=icon;
                        gicon.appendChild(img);
                    }
                    card.dataset.loaded='true';
                }
            } else {
                if (card.dataset.loaded) {
                    gicon.innerHTML='';
                    delete card.dataset.loaded;
                }
            }
        });
    },{rootMargin:'400px',threshold:0});
    const _origAppend=grid.appendChild.bind(grid);
    grid.appendChild=(el)=>{
        _origAppend(el);
        if (el.classList&&el.classList.contains('gcard')) {
            cardObserver.observe(el);
        }
        return el;
    };
    loadBatch();
    lucide.createIcons();
}

function searchGames(query) {
    if (!query) {
        fGames=[...aGames];
    } else {
        const lQuery = query.toLowerCase();
        fGames = aGames.filter(game=>{
            return game.name.toLowerCase().includes(lQuery);
        });
    }
    renderGames();
}

const searchInput = document.getElementById('gameSearch');
if (searchInput) {
    searchInput.addEventListener('input',(e)=>{
        searchGames(e.target.value.trim());
    });
    initProvSel();
    loadProvider(currProvider);
}
initBack();

window.addEventListener('DOMContentLoaded',()=>{
    if (!navigator.onLine) {
        const gametainer = document.querySelector('.gametainer');
        if (gametainer) {
            const offlineMsg = document.createElement('div');
            offlineMsg.className='offline-indicator';
            offlineMsg.style.cssText = 'text-align:center;color:#94a3b8;font-size:14px;margin-top:16px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(51,65,85,0.5);border-radius:8px;padding:12px';
            offlineMsg.innerHTML = '<i data-lucide="wifi-off" style="width=16px;height=16px;"></i> <span>you are offline - showing cached games only</span>';
            gametainer.insertBefore(offlineMsg,gametainer.firstChild);
            lucide.createIcons();
        }
    }
});

function partCount() {
    const preset = localStorage.getItem('krypton_particlePreset') || 'maximum';
    return {off:0,minimal:40,medium:60,maximum:120}[preset]??120;
}

function initParticles() {
    if (localStorage.getItem('krypton_particles')==='false') return;
    const count = partCount();
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: count,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#60a5fa', '#93c5fd', '#dbeafe', '#fff']
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.8,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 2.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: '#60a5fa',
                    opacity: 0.15,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.8,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.4
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    } else {
        setTimeout(initParticles,100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}

window.addEventListener('offline',()=>{
    const gametainer = document.querySelector('.gametainer');
    if (gametainer && !document.querySelector('.offline-indicator')) {
        const offlineMsg = document.createElement('div');
        offlineMsg.className = 'offline-indicator';
        offlineMsg.style.cssText = 'text-align:center;color:#94a3b8;font-size:14px;margin-top:16px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(51,65,85,0.5);border-radius:8px;padding:12px';
        offlineMsg.innerHTML = '<i data-lucide="wifi-off" style="height=16px;width=16px;"></i> <span>you are offline - showing cached games only</span>';
        gametainer.insertBefore(offlineMsg, gametainer.firstChild);
        lucide.createIcons();
        checkGames().then(cachedUrls => {
            aGames = games.filter(game => cachedUrls.includes(game.url));
            fGames = [...aGames];
            renderGames();
        });
    }
});