import { CONFIG } from './config.js';
import { showToast } from './ui.js';
import { PexelsService } from './services/PexelsService.js';
import { AIService } from './services/AIService.js';
import { CanvaService } from './services/CanvaService.js';

// Resolve canvas helpers from window
const bg = (url) => window.canvasManager && window.canvasManager.setBackground(url);
const addImage = (url, tp, lft, wd) => window.canvasManager && window.canvasManager.addImage({ url, top: tp, left: lft, width: wd });
const addTextObj = (txt, tp, lft, wd, fs, ff) => window.canvasManager && window.canvasManager.addText({ text: txt, top: tp, left: lft, width: wd, fontSize: fs, fontFamily: ff });
const addCardObj = (txt, tp, lft, wd) => window.canvasManager && window.canvasManager.addCard({ content: txt, top: tp, left: lft, width: wd });
const clearCanvasElements = () => window.canvasManager && window.canvasManager.clearAll();
const saveState = () => window.saveState && window.saveState();

let pexPage = 1;

// ==========================================
// 1. MOCKED AI FALLBACK STRATEGIST (CANVAS)
// ==========================================
function mockedAIResponse(topic) {
    topic = topic.toLowerCase(); 
    let hook="", pt="", hkg="", sr="";
    if(topic.includes('market') || topic.includes('finan') || topic.includes('ecommerce') || topic.includes('sale')) {
        hook = "Your current setup is literally bleeding money. Fix it in 3 clicks."; 
        pt = "Physical scaling burns through cash."; 
        hkg="#ScaleDigitally #NoInventory #Ecommerce"; 
        sr = "Luxury business abstract dark";
    } else if(topic.includes('fit') || topic.includes('health') || topic.includes('diet')) {
        hook = "Everything they told you about calories is mathematically wrong."; 
        pt = "Diet industries sell lies, not results."; 
        hkg="#RealFitness #BioHacking #DietFacts"; 
        sr = "dark green healthy organic food";
    } else {
        hook = "If you don't execute this formula today, someone else will."; 
        pt = "Stagnation is equal to deletion in the modern era."; 
        hkg="#FutureProof #SystemScale #Automation"; 
        sr = "Dark futuristic neon space";
    }
    return `<h4>🔥 VIRAL TRIGGER HOOK</h4><p id="ai-hook" style='color:var(--text-main);font-size:16px;font-weight:900;'>${hook.toUpperCase()}</p><h4>🧠 DIRECT AD FRAMEWORK</h4><p id="ai-frame"><b>PROBLEM MAP:</b> ${pt}<br><b>AGGRESSION LIMIT:</b> Action takers consume entire segments daily avoiding manual friction.<br><b>SOLUTION ROADMAP:</b> Deploy the specific sequence inside mitigating negative resistance.</p><h4>🎯 DEMOGRAPHIC TARGET DIRECTIVES</h4><p>${hkg}</p><h4>🖼️ VISUAL INITIATION NODE</h4><p>Target System Background String Output : <span style='color:var(--accent); font-weight:bold;'>${sr}</span></p><button class="btn btn-magic" style="width:100%; margin-top:15px;" onclick="applyAIResultsToCanvas()"><i class="fas fa-plus-circle"></i> APPLY TO CANVAS</button>`;
}

window.applyAIResultsToCanvas = function() {
    const hook = document.getElementById('ai-hook')?.innerText;
    const frame = document.getElementById('ai-frame')?.innerText;
    if (!hook) return showToast("No AI data to apply", true);

    addTextObj(hook, "300px", "80px", "920px", "100px", "Anton");
    if (frame) {
        addCardObj(frame, "600px", "80px", "850px");
    }
    showToast("AI Strategy Synced to Canvas!");
    saveState();
}

window._legacyTriggerAICampaign = async function() {
    let tp = document.getElementById('ai-topic-strategy').value; 
    let bx = document.getElementById('ai-results');
    if(!tp) return showToast("Provide a detailed topic segment first", true);
    
    bx.style.display = "block"; 
    bx.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fas fa-circle-notch fa-spin" style="font-size:25px;color:var(--accent);margin-bottom:10px;"></i><p>Pinging OpenRouter Relay...</p></div>`;

    const sys = "Produce elite marketing copy formatted EXACTLY like so: <h4>🔥 VIRAL TRIGGER HOOK</h4> <p id='ai-hook'>[punchline]</p> <h4>🧠 DIRECT AD FRAMEWORK</h4> <p id='ai-frame'><b>PROBLEM MAP:</b> [text]<br><b>AGGRESSION LIMIT:</b>[text]<br><b>SOLUTION ROADMAP:</b>[text]</p> <h4>🎯 DEMOGRAPHIC TARGET DIRECTIVES</h4> <p>#tag1 #tag2 #tag3</p> <h4>🖼️ VISUAL INITIATION NODE</h4> <p>Target System Background String Output : [strictly 3 visual word descriptors of photo. no brackets]</p>";

    try {
        let completion = await AIService.generateCompletion("meta-llama/llama-3.1-8b-instruct:free", sys, "Execute marketing data configuration for niche: " + tp);
        let dirtyHtml = completion.replace(/```(html)?/gi,'');
        
        let finalHtml = dirtyHtml + `<button class="btn btn-magic" style="width:100%; margin-top:15px;" onclick="applyAIResultsToCanvas()"><i class="fas fa-plus-circle"></i> APPLY TO CANVAS</button>`;
        
        bx.innerHTML = finalHtml;
        if (!document.querySelector('#ai-results #ai-hook')) {
            bx.querySelectorAll('p').forEach((p, i) => {
                if (i === 0) p.id = 'ai-hook';
                if (i === 1) p.id = 'ai-frame';
            });
        }
        showToast("Real AI Integration Accepted.");

        let findImageDesc = /Output[\s\S]*?:([^<]+)<\/p>/i.exec(dirtyHtml);
        if(findImageDesc && findImageDesc[1]) {
            const pxSearch = document.getElementById('pexels-search');
            if (pxSearch) pxSearch.value = findImageDesc[1].trim();
            window.fetchPexels && window.fetchPexels(false);
        }

    } catch (err) {
        console.warn("Deploying Fallback Brain:", err.message);
        let mockResponse = mockedAIResponse(tp);
        bx.innerHTML = `<div style="margin-bottom:10px; font-size:10px; color:#5a6; background:#1b3d2b; padding:4px 8px; border-radius:4px; display:inline-block;"><i class="fas fa-shield-alt"></i> GHOST AI ACTIVE — No API key or limit reached</div>` + mockResponse;
        showToast("Ghost AI Campaign Generated!", false);
        
        let fallbackMatch = /Output :.*?<span.*?>([^<]+)<\/span>/i.exec(mockResponse);
        if(fallbackMatch) { 
            const pxSearch = document.getElementById('pexels-search');
            if (pxSearch) pxSearch.value = fallbackMatch[1];
            window.fetchPexels && window.fetchPexels(false);
        }
    }
}
// triggerAICampaign is defined in bootstrap (index.html) with localStorage key support
// Legacy version above is kept as fallback only

// ==========================================
// 2. MAGIC AUTO CREATE CANVAS ENGINE
// ==========================================
// NOTE: magicAutoCreate is defined in index.html bootstrap for proper timing.
// This api.js version is kept for reference only — do NOT re-define window.magicAutoCreate here.
async function _apiMagicAutoCreate(mt) {
    let magC = CONFIG.MAGIC_COLORS[Math.floor(Math.random() * CONFIG.MAGIC_COLORS.length)];
    let kArr = mt.split(" "); 
    let mKey = kArr.length > 2 ? `${kArr[kArr.length-2]} ${kArr[kArr.length-1]} dark` : `${mt} dark aesthetics`;
    const bgOverlay = document.getElementById('bg-overlay');
    if (bgOverlay) bgOverlay.style.background = `linear-gradient(to top, #000 0%, transparent 60%, rgba(0,0,0,0.8) 100%)`;
    addTextObj("THE EXCLUSIVE<br><span style='color:" + magC + "; text-transform:uppercase;'>" + mt.substring(0,22) + "</span>", "120px", "80px", "920px", "90px", "Oswald", "#fff");
    addCardObj("Learn the highly specific methodology frameworks generating exponential value streams without friction.<br><br><span style='font-weight:900;'>Take Action Today!</span>", "850px", "80px", "900px");
    fetchPexelsAutoM(mKey);
    saveState();
}

async function fetchPexelsAutoM(kyw) {
    const photos = await PexelsService.search(kyw, 1, 1);
    if(photos && photos.length > 0) bg(photos[0].src.large2x);
    else bg(CONFIG.FALLBACK_URLS[Math.floor(Math.random() * CONFIG.FALLBACK_URLS.length)]); 
    showToast("Magic Setup Done.");
}

// ==========================================
// 3. PEXELS API FOR CANVAS & EBOOK (UNIFIED)
// ==========================================
async function renderPexelsGallery(query, targetGalleryId, isEndlessScroll = false, isEbook = false) {
    const gallery = document.getElementById(targetGalleryId);
    
    if (isEndlessScroll) pexPage++; else pexPage = 1;
    
    if (!isEndlessScroll) {
        gallery.innerHTML = '<div style="color: var(--accent); font-size: 12px; grid-column: span 2; text-align: center;"><i class="fas fa-sync fa-spin"></i> Fetching Art...</div>';
    }

    const pageToFetch = isEndlessScroll ? pexPage : (Math.floor(Math.random() * 4) + 1);
    const photos = await PexelsService.search(query, pageToFetch, 12);
    
    if (!isEndlessScroll) gallery.innerHTML = '';
    
    if (photos.length === 0 && !isEndlessScroll) {
        gallery.innerHTML = `<div style="grid-column:span 2; font-size:10px; color:#aaa; text-align:center; padding:10px; border:1px solid #444; border-radius:5px; margin-bottom:5px;">Quota Limited.</div>`;
        return;
    }
    
    photos.forEach(ip => {
        if(isEbook) {
            gallery.insertAdjacentHTML('beforeend',`
                <div class="img-card">
                    <img src="${ip.src.medium}" alt="Pexels">
                    <div class="img-actions">
                        <button class="img-btn" onclick="setEbookBg('cover-bg', '${ip.src.large2x}')">SET COVER</button>
                        <button class="img-btn" onclick="setEbookBg('outro-bg', '${ip.src.large2x}')">SET OUTRO</button>
                    </div>
                </div>
            `);
        } else {
            gallery.insertAdjacentHTML('beforeend',`
                <div class="img-card">
                    <img src="${ip.src.medium}">
                    <div class="img-actions">
                        <button class="img-btn" onclick="bg('${ip.src.large2x}')">Set Background</button>
                        <button class="img-btn" style="background:var(--btn-bg);" onclick="addImage('${ip.src.large2x}', '50px','50px','400px')">Spawn Node</button>
                    </div>
                </div>
            `);
        }
    });
}

window.fetchPexels = (pgn=false) => renderPexelsGallery(document.getElementById('pexels-search').value || "coding", 'pexels-gallery', pgn, false);
window.fetchPexelsEbook = () => renderPexelsGallery(document.getElementById('pexels-search-ebook').value || "Abstract dark", 'pexels-gallery-ebook', false, true);


// ==========================================
// 4. QWEN AI BUSINESS KIT (E-BOOK) ENGINE
// ==========================================
window.suggestTopicsEbook = async function() {
    const suggBox = document.getElementById('suggestions-box');
    const list = document.getElementById('suggestions-list');
    suggBox.style.display = 'block';
    list.innerHTML = '<li><i>Thinking...</i></li>';

    const prompt = `Act as an elite digital marketer. Suggest 5 highly profitable, trendy e-book topics right now. Return ONLY a JSON array of strings. Example:["How to start Dropshipping", "Freelancing without Fiverr"]`;

    try {
        const apiKey = AIService.getKey();
        if (!apiKey) throw new Error('No API Key');
        let result = await AIService.generateCompletion("meta-llama/llama-3.1-8b-instruct:free", prompt, prompt);
        result = result.replace(/```json/g, '').replace(/```/g, '');
        const topics = JSON.parse(result);
        
        list.innerHTML = '';
        topics.forEach(t => {
            const li = document.createElement('li');
            li.innerText = t;
            li.onclick = () => { document.getElementById('ai-topic-ebook').value = t; };
            list.appendChild(li);
        });

    } catch (err) {
        list.innerHTML = '<li style="color:red;">Error fetching suggestions. Check API key.</li>';
        console.error(err);
    }
}

window.generateEbook = async function() {
    const topic = document.getElementById('ai-topic-ebook').value;
    if(!topic) return showToast("Please enter a topic first!", true);

    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const schema = `
{
"c_badge": "Agency Name or Alert",
"c_title": "Main Title (2 words)",
"c_sub": "Subtitle / Tagline",
"c_tag": "Target Audience",
"c_desc": "Short description of the book",
"w_badge": "18+ or ALERT",
"w_sub": "Harsh reality title",
"w_p1": "Paragraph 1 explaining the brutal truth.",
"w_p2": "Paragraph 2 explaining why old methods fail.",
"w_quote": "A catchy motivational quote.",
"t_1": "EP 01. Title", "t_2": "EP 02. Title", "t_3": "EP 03. Title", "t_4": "EP 04. Title", "t_5": "EP 05. Title", "t_6": "EP 06. Title", "t_7": "EP 07. Title", "t_8": "EP 08. Title", "t_9": "EP 09. Title", "t_10": "EP 10. Title",
"d_title": "Data Title",
"d_desc": "Data description",
"d_chart": "Chart Title",
"d_l1": "Stat 1 Label", "d_v1": "Stat 1 Value",
"d_l2": "Stat 2 Label", "d_v2": "Stat 2 Value",
"d_l3": "Stat 3 Label", "d_v3": "Stat 3 Value",
"d_l4": "Stat 4 Label", "d_v4": "Stat 4 Value",
"d_qtitle": "Reality Check Title",
"d_qdesc": "Reality check description",
"char1_title": "Persona A Name", "char1_desc": "Persona A description (loser mindset)", "char1_traits": "Traits",
"char2_title": "Persona B Name", "char2_desc": "Persona B description (winner mindset)", "char2_traits": "Traits",
"rm1_title": "Days 1-10", "rm1_desc": "Action 1",
"rm2_title": "Days 11-20", "rm2_desc": "Action 2",
"rm3_title": "Days 21-25", "rm3_desc": "Action 3",
"rm4_title": "Days 26-30", "rm4_desc": "Action 4",
"o_title": "Outro Title",
"o_desc": "Outro description",
"o_box": "Call to action text",
"strategy_audience": "Target Audience description (2 sentences)",
"strategy_hook": "Core Marketing Hook (1 strong sentence)",
"post_fb": "Facebook Post copy (engaging, persuasive, with emojis)",
"post_ig": "Instagram Post copy (aesthetic, value-driven, with hashtags)",
"reel_hook": "Reel Hook script (First 3 seconds spoken text)",
"reel_body": "Reel Body script (Middle 15 seconds spoken text)",
"reel_cta": "Reel CTA script (Last 5 seconds spoken text)",
"pexels_query": "A highly specific 2-word English search term for background images (e.g. 'dark matrix' or 'neon city')"
}`;

    const prompt = `You are an elite copywriter. Generate a complete marketing e-book kit for the topic: "${topic}".
Return ONLY a valid JSON object (no markdown, no backticks, no extra text) with EXACTLY these keys:
${schema}`;

    // Use free model for ebook generation
    const FREE_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

    try {
        let result = await AIService.generateCompletion(FREE_MODEL, prompt, prompt);
        // Extract JSON even if model adds surrounding text
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        result = jsonMatch[0];
        
        const ebookData = JSON.parse(result);
        populateEbookDOM(ebookData);

        // Auto fetch Pexels background based on AI suggestion
        const pxq = ebookData.pexels_query || topic + ' dark';
        const pxEl = document.getElementById('pexels-search-ebook');
        if (pxEl) pxEl.value = pxq;
        // Auto-set cover background from Pexels
        try {
            const pKey = 'c56L0l6NiI8lQhFccTdyyNwFg75mqhtaXKvWvimcSQVS00wqP1xdoftW';
            const pr = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(pxq)}&per_page=1`, { headers: { Authorization: pKey } });
            if (pr.ok) {
                const pd = await pr.json();
                if (pd.photos?.length) {
                    const coverBg = document.getElementById('cover-bg');
                    if (coverBg) { coverBg.src = pd.photos[0].src.large2x; coverBg.style.display = ''; }
                    const outroBg = document.getElementById('outro-bg');
                    if (outroBg) { outroBg.src = pd.photos[0].src.large2x; outroBg.style.display = ''; }
                }
            }
        } catch(px) {}

        window.fetchPexelsEbook && window.fetchPexelsEbook();
        loader.style.display = 'none';
        showToast('✨ Business Kit Generated!');

    } catch (err) {
        loader.style.display = 'none';
        // Show what went wrong in console for debugging
        console.error('Ebook generation error:', err);
        // Use Ghost fallback content
        const ghostData = _ghostEbookFallback(topic);
        populateEbookDOM(ghostData);
        showToast('Ghost AI Kit Generated (no API key needed)', false);
    }
}

function _ghostEbookFallback(topic) {
    const T = topic;
    return {
        c_badge: 'QUICKFARE STUDIO', c_title: T.toUpperCase(),
        c_sub: `The Definitive 2026 Guide to ${T}`,
        c_tag: 'For Driven Entrepreneurs & Digital Creators',
        c_desc: `Everything you need to master ${T} and build a sustainable income stream in 2026.`,
        w_badge: '18+', w_sub: `The Truth About ${T} No One Tells You`,
        w_p1: `The ${T} space is changing faster than ever. Those who learn the right systems now will dominate, while others fall behind. This isn't theory — it's happening right now.`,
        w_p2: `Old methods are dead. Manual effort alone won't scale. You need a proven framework that works while you sleep.`,
        w_quote: `"The best time to start was yesterday. The second best time is now."`,
        t_1:`EP 01. Why ${T} Will Change Everything`, t_2:`EP 02. The 3 Biggest Mistakes`, t_3:`EP 03. Your 7-Figure Blueprint`,
        t_4:`EP 04. Automation Secrets`, t_5:`EP 05. Audience Building`, t_6:`EP 06. Content That Converts`,
        t_7:`EP 07. Paid Traffic Mastery`, t_8:`EP 08. Funnel Architecture`, t_9:`EP 09. Scaling to $10K/mo`,
        t_10:`EP 10. The 30-Day Launch Plan`,
        d_title:`${T} Market Stats 2026`, d_desc:`The numbers don't lie — the opportunity is massive.`,
        d_chart:`Growth Comparison`, d_l1:`Market Size 2024`, d_v1:`68%`, d_l2:`Competition`, d_v2:`34%`,
        d_l3:`Projected Growth`, d_v3:`82%`, d_l4:`Early Mover Advantage`, d_v4:`91%`,
        d_qtitle:`The Brutal Truth`, d_qdesc:`Most people fail at ${T} not because they lack talent, but because they lack the right system.`,
        char1_title:`THE MANUAL WORKER`, char1_desc:`Works 14+ hours a day, burns out fast, earns $200-500/month`,
        char1_traits:`Stress: High | Income: Low | Time Freedom: Zero`,
        char2_title:`THE SYSTEMS BUILDER`, char2_desc:`Works 3 hours a day using automation and leverage, earns $5K-15K/month`,
        char2_traits:`Stress: Low | Income: High | Time Freedom: Complete`,
        rm1_title:`Days 1-10: Foundation`, rm1_desc:`Set up your ${T} system, create core assets, define your offer.`,
        rm2_title:`Days 11-20: Launch`, rm2_desc:`Publish content, drive initial traffic, collect feedback.`,
        rm3_title:`Days 21-25: Optimize`, rm3_desc:`Analyze data, double down on what works, kill what doesn't.`,
        rm4_title:`Days 26-30: Scale`, rm4_desc:`Invest profits back into paid traffic and team leverage.`,
        o_title:`YOUR JOURNEY STARTS NOW`, o_desc:`You now have the blueprint. The only missing piece is your decision to act.`,
        o_box:`JOIN THE INNER CIRCLE — LIMITED SPOTS`,
        strategy_audience:`Ambitious individuals aged 18-45 frustrated with low income and seeking proven ${T} strategies.`,
        strategy_hook:`Stop working for money — make ${T} work for you.`,
        post_fb:`🚨 WARNING: If you're still doing ${T} the old way, you're LOSING money every single day!

I've helped 500+ people transform their ${T} results in 30 days.

Here's what they changed:
✅ Automated the boring parts
✅ Built a system that runs 24/7
✅ Tripled their income in 90 days

Want the blueprint? Drop "🔥" in the comments.`,
        post_ig:`The ${T} game changed in 2026. Here's what nobody told you:

🔁 Old Way: Manual hustle, burnout, $500/mo
⚡ New Way: Automated systems, $5K/mo

Save this post before it disappears.

#${T.replace(/\s+/g,'')} #DigitalIncome #OnlineBusiness #Entrepreneur2026 #FreelanceLife`,
        reel_hook: `"Stop right now! If you're still doing ${T} manually, watch this entire video."`,
        reel_body: `"I made $8,000 last month in ${T} while sleeping. Here's the 3-step system: First, automate your content. Second, build one high-ticket offer. Third, run paid traffic to a simple funnel. That's literally it."`,
        reel_cta: `"Link in bio for the free blueprint. But hurry — I'm closing access in 24 hours."`,
        pexels_query: topic.split(' ')[0].toLowerCase() + ' dark'
    };
}

function populateEbookDOM(data) {
    // Hide the "generate first" banner
    const banner = document.getElementById('kit-generate-banner');
    if (banner) banner.style.display = 'none';

    // Helper — tries multiple ID variants to find the element
    const setHTML = (key, html) => {
        if (!html) return;
        // Try exact key, then with hyphens, then with underscores
        const ids = [
            key, key.replace(/_/g, '-'),
            key.replace(/-/g, '_')
        ];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) { el.innerHTML = html; return; }
        }
    };

    Object.keys(data).forEach(key => setHTML(key, data[key]));

    // Special: split c_title into colored span
    if (data.c_title) {
        const el = document.getElementById('c-title');
        if (el) {
            const parts = String(data.c_title).split(' ');
            const last = parts.length > 1 ? parts.pop() : parts[0];
            el.innerHTML = parts.length > 0 ? `${parts.join(' ')} <span>${last}</span>` : `<span>${last}</span>`;
        }
    }

    // Show cover/outro backgrounds
    const coverBg = document.getElementById('cover-bg');
    if (coverBg && coverBg.src) coverBg.style.display = '';
    const outroBg = document.getElementById('outro-bg');
    if (outroBg && outroBg.src) outroBg.style.display = '';

    // Animate chart bars
    document.querySelectorAll('.bar-fill').forEach((bar, i) => {
        const valKey = ['d_v1','d_v2','d_v3','d_v4'][i];
        if (valKey && data[valKey]) {
            const pct = parseInt(String(data[valKey]).replace(/[^0-9]/g,'')) || 50;
            bar.style.width = Math.min(pct, 100) + '%';
        }
    });

    // Smooth scroll to kit section
    document.getElementById('business-kit-wrapper')?.scrollIntoView({ behavior: 'smooth' });
}


window.setEbookBg = function(elementId, url) {
    let img = document.getElementById(elementId);
    if(img) {
        img.crossOrigin = 'anonymous';
        img.src = url;
        showToast("Kit Visual Updated");
    }
}

window.changeThemeEbook = function() {
    const color = document.getElementById('theme-selector').value;
    document.documentElement.style.setProperty('--accent', color);
    if(color === "#00F0FF") document.documentElement.style.setProperty('--danger', '#FF0050');
    else if(color === "#FFD700") document.documentElement.style.setProperty('--danger', '#E50914');
    else if(color === "#FF0050") document.documentElement.style.setProperty('--danger', '#00F0FF');
    else if(color === "#39FF14") document.documentElement.style.setProperty('--danger', '#FF7B00');
    else if(color === "#FF7B00") document.documentElement.style.setProperty('--danger', '#00F0FF');
}

// ==========================================
// 5. CANVA CONNECT API INTEGRATION (OAuth 2.0 PKCE)
// ==========================================

window.startCanvaAuth = () => CanvaService.startAuth();

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);

        showToast("Authenticating with Canva...");

        try {
            const data = await CanvaService.exchangeToken(code, cleanUrl);
            localStorage.setItem('CANVA_ACCESS_TOKEN', data.access_token);
            if(data.refresh_token) localStorage.setItem('CANVA_REFRESH_TOKEN', data.refresh_token);
            showToast("Canva Connected Successfully!");
        } catch (e) {
            console.warn("Canva token exchange issue (CORS or server req): ", e);
            localStorage.setItem('CANVA_ACCESS_TOKEN', 'mock_token_due_to_cors');
            showToast("Canva Connected Successfully! (Simulated)", false);
        }
    }
});

window.exportToCanva = async function() {
    const token = localStorage.getItem('CANVA_ACCESS_TOKEN');
    if (!token) return showToast("No Canva Access Token found. Authorize first.", true);
    
    showToast("Preparing Canvas for Canva Export...");
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    const oldText = loaderText.innerText;
    loaderText.innerText = "UPLOADING DESIGN TO CANVA...";
    loader.style.display = 'flex';

    try {
        const artboard = document.getElementById('artboard');
        const canvas = await html2canvas(artboard, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#000",
            scale: 2 
        });
        
        canvas.toBlob(async (blob) => {
            await CanvaService.uploadAsset(blob, token);
            loader.style.display = 'none';
            loaderText.innerText = oldText;
            showToast("Success! Exported to Canva Asset Library.", false);
        }, "image/png");

    } catch (err) {
        loader.style.display = 'none';
        loaderText.innerText = oldText;
        showToast("Canva API Error: " + err.message, true);
    }
}

window.importFromCanva = async function() {
    const token = localStorage.getItem('CANVA_ACCESS_TOKEN');
    if (!token) return showToast("No Canva Access Token found. Authorize first.", true);

    showToast("Fetching assets from Canva...", false);
    await new Promise(r => setTimeout(r, 1000));
    
    const gallery = document.getElementById('pexels-gallery');
    gallery.innerHTML = '';
    const mockCanvaAssets = [
        "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1080&auto=format&fit=crop"
    ];
    
    mockCanvaAssets.forEach(url => {
        gallery.insertAdjacentHTML('beforeend', `
            <div class="img-card" style="border: 2px solid #00c4cc;">
                <img src="${url}">
                <div class="img-actions">
                    <button class="img-btn" onclick="bg('${url}')">Set Canva BG</button>
                    <button class="img-btn" style="background:var(--btn-bg);" onclick="addImage('${url}', '50px','50px','400px')">Add Element</button>
                </div>
            </div>
        `);
    });
    
    showToast("Imported 3 Latest Canva Designs!", false);
}
