/**
 * CanvasManager.js — Multi-page canvas engine
 * Lazy artboard getter ensures DOM is ready before use.
 */
import appState from './appState.js';
import { sEl, showToast } from './ui.js';

class CanvasManager {
    constructor() {
        this.pages = [];          // Array of page objects { id, elements, bg, overlay }
        this.activePageIndex = 0;
        this.elementCount = 1000;
        this.maxZIndex = 20;
        this._artboard = null;
        this._wrapper = null;
    }

    // ── Lazy DOM getters ────────────────────────────────────────────
    get artboard() {
        if (!this._artboard) this._artboard = document.getElementById('artboard');
        return this._artboard;
    }
    get wrapper() {
        if (!this._wrapper) this._wrapper = document.getElementById('artboard-wrapper');
        return this._wrapper;
    }

    // ── Page Management ─────────────────────────────────────────────
    initPages() {
        this.pages = [{
            id: 'page-1', label: 'Page 1',
            elements: [], bg: '', bgFilter: '',
            overlay: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3))'
        }];
        this.activePageIndex = 0;
        this._renderPageTabs();
    }

    addPage() {
        const idx = this.pages.length + 1;
        this.saveCurrentPage();
        this.pages.push({ id: `page-${idx}`, label: `Page ${idx}`, elements: [], bg: '', bgFilter: '', overlay: '' });
        this.activePageIndex = this.pages.length - 1;
        this._loadPage(this.activePageIndex);
        this._renderPageTabs();
        showToast(`Page ${idx} Added`);
    }

    deletePage(idx) {
        if (this.pages.length <= 1) { showToast('Cannot delete the only page', true); return; }
        this.pages.splice(idx, 1);
        this.activePageIndex = Math.min(this.activePageIndex, this.pages.length - 1);
        this._loadPage(this.activePageIndex);
        this._renderPageTabs();
        showToast('Page Deleted');
    }

    switchPage(idx) {
        this.saveCurrentPage();
        this.activePageIndex = idx;
        this._loadPage(idx);
        this._renderPageTabs();
    }

    saveCurrentPage() {
        if (!this.pages[this.activePageIndex]) return;
        const p = this.pages[this.activePageIndex];
        p.elements = Array.from(this.artboard.querySelectorAll('.element')).map(el => ({
            id: el.id, type: el.tagName.toLowerCase(), className: el.className,
            html: el.tagName === 'IMG' ? '' : el.innerHTML,
            src: el.tagName === 'IMG' ? el.src : '', style: el.style.cssText
        }));
        const bg = document.getElementById('bg-img');
        p.bg = bg ? bg.src : '';
        p.bgFilter = bg ? bg.style.filter : '';
        const ov = document.getElementById('bg-overlay');
        p.overlay = ov ? ov.style.background : '';
    }

    _loadPage(idx) {
        const p = this.pages[idx];
        if (!p) return;
        this.artboard.querySelectorAll('.element').forEach(e => e.remove());
        const bg = document.getElementById('bg-img');
        if (bg) { bg.src = p.bg || ''; bg.style.filter = p.bgFilter || ''; }
        const ov = document.getElementById('bg-overlay');
        if (ov) ov.style.background = p.overlay || '';
        if (p.elements?.length) this.restoreElements(p.elements);
    }

    _renderPageTabs() {
        const panel = document.getElementById('pages-panel');
        if (!panel) return;
        panel.innerHTML = this.pages.map((p, i) => `
            <div class="page-thumb ${i === this.activePageIndex ? 'active' : ''}" onclick="canvasManager.switchPage(${i})" title="${p.label}">
                <div class="page-thumb-num">${i + 1}</div>
                <div class="page-thumb-label">${p.label}</div>
                ${this.pages.length > 1 ? `<button class="page-thumb-del" onclick="event.stopPropagation();canvasManager.deletePage(${i})">×</button>` : ''}
            </div>
        `).join('') + `<div class="page-thumb page-thumb-add" onclick="canvasManager.addPage()" title="Add Page"><i class="fas fa-plus"></i><div class="page-thumb-label">Add Page</div></div>`;
    }

    // ── Element Creation ────────────────────────────────────────────
    clearAll() {
        this.artboard.querySelectorAll('.element').forEach(el => el.remove());
        const bg = document.getElementById('bg-img'); if (bg) bg.src = '';
        this.updateState(); showToast('Canvas Cleared');
    }

    addText(config = {}) {
        const { text='CLICK TO EDIT', top='200px', left='60px', width='960px',
            fontSize='120px', fontFamily='Anton', color='#fff',
            letterSpacing='0px', lineHeight='1.1', textAlign='left',
            textShadow='0 8px 20px rgba(0,0,0,.8)' } = config;
        const el = document.createElement('div');
        el.className = 'element el-text';
        el.id = `el-${this.elementCount++}`;
        el.innerHTML = text;
        Object.assign(el.style, { top, left, width, fontSize, fontFamily, color,
            letterSpacing, lineHeight, textAlign, textShadow, zIndex: ++this.maxZIndex });
        this.artboard.appendChild(el);
        this._initEl(el); this.updateState(); return el;
    }

    addCard(config = {}) {
        const { content='Add your content here...', top='500px', left='60px',
            width='900px', borderRadius='16px',
            background='rgba(15,16,32,.88)', fontSize='28px' } = config;
        const el = document.createElement('div');
        el.className = 'element el-card';
        el.id = `el-${this.elementCount++}`;
        el.innerHTML = content;
        Object.assign(el.style, { top, left, width, borderRadius, background, fontSize, zIndex: ++this.maxZIndex });
        this.artboard.appendChild(el);
        this._initEl(el); this.updateState(); return el;
    }

    addImage(url, config = {}) {
        const { top='50px', left='50px', width='400px', borderRadius='0px' } = config;
        const el = document.createElement('img');
        el.crossOrigin = 'anonymous'; el.draggable = false;
        el.className = 'element el-image';
        el.id = `el-${this.elementCount++}`;
        el.src = url;
        Object.assign(el.style, { top, left, width, borderRadius, zIndex: ++this.maxZIndex });
        this.artboard.appendChild(el);
        this._initEl(el); this.updateState(); return el;
    }

    setBackground(url) {
        const bg = document.getElementById('bg-img');
        if (!bg) return;
        bg.crossOrigin = 'anonymous';
        bg.src = url;
        bg.style.display = '';
        setTimeout(() => this.updateState(), 500);
    }

    addElement(type) {
        if (type === 'text') this.addText();
        else this.addCard();
    }

    uploadLocalImage(event) {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = e => { this.addImage(e.target.result); showToast('Image Uploaded'); };
        reader.readAsDataURL(file);
    }

    applyPresetSize() {
        const sel = document.getElementById('preset-size'); if (!sel) return;
        const [w, h] = sel.value.split('x');
        this.artboard.style.width = `${w}px`;
        this.artboard.style.height = `${h}px`;
        window.fitArtboard && window.fitArtboard();
        this.updateState();
    }

    applyFilters() {
        const blur = document.getElementById('filter-blur')?.value || 0;
        const bright = document.getElementById('filter-brightness')?.value || 100;
        const gray = document.getElementById('filter-grayscale')?.value || 0;
        const bg = document.getElementById('bg-img');
        if (bg) bg.style.filter = `blur(${blur}px) brightness(${bright}%) grayscale(${gray}%)`;
        window.debounceSave && window.debounceSave();
    }

    // ── Template Library ────────────────────────────────────────────
    loadTemplate(type, topic = '') {
        this.clearAll();
        const bgOv = document.getElementById('bg-overlay');

        const TEMPLATES = {
            cover: {
                bg: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1920',
                overlay: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
                fn: () => {
                    this.addText({ text: (topic || 'THE ULTIMATE').toUpperCase() + '<br><span style="color:#8a5cf6;">GUIDE 2026</span>', top:'180px', left:'60px', fontSize:'130px' });
                    this.addCard({ content: 'Your powerful subtitle goes here. Make it irresistible.', top:'680px', left:'60px', width:'960px' });
                }
            },
            viral: {
                bg: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1920',
                overlay: 'linear-gradient(160deg, rgba(139,92,246,.4) 0%, rgba(0,0,0,0.9) 100%)',
                fn: () => {
                    this.addText({ text: '3 SECRETS<br><span style="color:#f59e0b;">THEY HID</span>', top:'250px', left:'60px', fontSize:'150px' });
                    this.addCard({ content: '→ Secret #1: Follow for Part 2', top:'780px', left:'60px', width:'960px', background:'rgba(139,92,246,.2)', borderRadius:'8px' });
                }
            },
            quote: {
                bg: 'https://images.unsplash.com/photo-1618045952959-1582e219736e?q=80&w=1920',
                overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9))',
                fn: () => {
                    const q = topic ? `"${topic} is not just a trend, it's the future of how we operate."` : '"The people who are crazy enough to think they can change the world are the ones who do."';
                    this.addCard({ content: `${q}<br><br><span style="color:#8a5cf6;font-size:20px;">— Elite Insights</span>`, top:'300px', left:'60px', width:'960px', background:'rgba(0,0,0,0.7)', fontSize:'36px' });
                }
            },
            split: {
                bg: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1920',
                overlay: 'linear-gradient(90deg, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.2) 100%)',
                fn: () => {
                    this.addText({ text: 'BEFORE', top:'150px', left:'60px', width:'500px', fontSize:'100px', color:'#ef4444' });
                    this.addText({ text: 'AFTER', top:'150px', left:'580px', width:'500px', fontSize:'100px', color:'#10b981' });
                    this.addCard({ content: 'Old method: 12hrs/day, $500/mo\nNew method: 3hrs/day, $5,000/mo', top:'600px', left:'60px', width:'960px', fontSize:'24px' });
                }
            },
            announcement: {
                bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920',
                overlay: 'linear-gradient(135deg, rgba(245,158,11,.3) 0%, rgba(0,0,0,0.95) 100%)',
                fn: () => {
                    this.addText({ text: '🚨 BIG<br><span style="color:#f59e0b;">ANNOUNCEMENT</span>', top:'200px', left:'60px', fontSize:'130px' });
                    this.addCard({ content: 'Something HUGE is coming. Stay tuned.', top:'700px', left:'60px', width:'960px', background:'rgba(245,158,11,.15)', borderRadius:'8px' });
                }
            },
            testimonial: {
                bg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920',
                overlay: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.5) 100%)',
                fn: () => {
                    this.addText({ text: '⭐⭐⭐⭐⭐', top:'150px', left:'60px', fontSize:'80px', color:'#f59e0b' });
                    this.addCard({ content: '"I went from $500 to $8,000/month in just 60 days using this exact system."<br><br><span style="color:#8a5cf6;font-size:20px;">— Muhammad Ali, Lahore</span>', top:'400px', left:'60px', width:'960px', fontSize:'32px' });
                }
            },
            product: {
                bg: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1920',
                overlay: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.95))',
                fn: () => {
                    this.addText({ text: (topic || 'PRODUCT').toUpperCase(), top:'80px', left:'60px', fontSize:'110px', color:'#fff' });
                    this.addText({ text: '<span style="color:#f59e0b;">PKR 999</span> <span style="font-size:50px;text-decoration:line-through;color:#888;">PKR 4999</span>', top:'550px', left:'60px', fontSize:'90px' });
                    this.addCard({ content: '✓ Instant Access  ✓ Lifetime Updates  ✓ Money Back Guarantee', top:'800px', left:'60px', width:'960px', background:'rgba(245,158,11,.15)', fontSize:'24px' });
                }
            },
            minimal: {
                bg: '',
                overlay: '',
                fn: () => {
                    if (bgOv) { bgOv.style.background = 'linear-gradient(135deg, #0f1020 0%, #1a1440 100%)'; }
                    this.addText({ text: (topic || 'MINIMAL').toUpperCase(), top:'350px', left:'60px', fontSize: (topic && topic.length > 15 ? '80px' : '140px'), color:'#fff', fontFamily:'Bebas Neue' });
                    this.addText({ text: topic ? 'Master the art of scaling' : 'Subtitle goes here', top:'600px', left:'60px', fontSize:'36px', color:'rgba(255,255,255,.5)', fontFamily:'Plus Jakarta Sans' });
                }
            }
        };

        const t = TEMPLATES[type] || TEMPLATES.cover;
        if (t.bg) this.setBackground(t.bg);
        if (bgOv && t.overlay) bgOv.style.background = t.overlay;
        t.fn();
        showToast(`Template: ${type} loaded`);
        this.updateState();
    }

    // Load multiple templates as separate pages
    loadSelectedTemplates(types, topic = '') {
        if (!types || types.length === 0) { showToast('Select at least one template', true); return; }
        // Init pages for each selected template
        this.pages = [];
        this.elementCount = 1000; this.maxZIndex = 20;
        types.forEach((type, i) => {
            this.pages.push({ id: `page-${i+1}`, label: `${type.charAt(0).toUpperCase()+type.slice(1)} Page`, elements: [], bg: '', bgFilter: '', overlay: '' });
        });
        this.activePageIndex = 0;
        this._loadPage(0);
        this.loadTemplate(types[0], topic);
        // Save page 0, then pre-generate remaining pages
        types.forEach((type, i) => {
            if (i === 0) return;
            this.saveCurrentPage();
            this.activePageIndex = i;
            this.artboard.querySelectorAll('.element').forEach(e => e.remove());
            const bg = document.getElementById('bg-img'); if (bg) bg.src = '';
            this.loadTemplate(type, topic);
            this.saveCurrentPage();
        });
        // Go back to first
        this.activePageIndex = 0;
        this._loadPage(0);
        this._renderPageTabs();
        showToast(`${types.length} template pages created!`);
    }

    // ── Restore & State ─────────────────────────────────────────────
    restoreElements(elements) {
        if (!elements?.length) return;
        elements.forEach(data => {
            let el;
            if (data.type === 'img') {
                el = document.createElement('img');
                el.crossOrigin = 'anonymous'; el.draggable = false; el.src = data.src;
            } else {
                el = document.createElement('div'); el.innerHTML = data.html;
            }
            el.id = data.id; el.className = data.className; el.style.cssText = data.style;
            this.artboard.appendChild(el); this._initEl(el);
        });
    }

    updateState() {
        if (!this.pages[this.activePageIndex]) return;
        this.saveCurrentPage();
    }

    // ── Export ──────────────────────────────────────────────────────
    async downloadAsImage() {
        const fmt = document.getElementById('export-format')?.value || 'image/png';
        const ext = fmt === 'image/jpeg' ? 'jpg' : 'png';
        showToast('Rendering...');
        const old = this.wrapper.style.transform;
        this.wrapper.style.transform = 'scale(1)';
        try {
            const canvas = await html2canvas(this.artboard, { useCORS: true, backgroundColor: '#000', scale: 2 });
            this.wrapper.style.transform = old;
            const dataUrl = canvas.toDataURL(fmt, 0.92);
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay'; overlay.style.display = 'flex';
            overlay.innerHTML = `<div class="modal-content"><h3 style="color:var(--accent);margin-top:0;">PREVIEW</h3><img src="${dataUrl}"><div style="display:flex;gap:10px;width:100%;"><button class="btn" style="flex:1;" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button class="btn btn-primary" style="flex:1;" id="btn-dl"><i class="fas fa-download"></i> Download HD</button></div></div>`;
            document.body.appendChild(overlay);
            document.getElementById('btn-dl').onclick = () => {
                const a = document.createElement('a'); a.download = `QuickFare_Page${this.activePageIndex+1}.${ext}`; a.href = dataUrl; a.click();
                overlay.remove(); showToast('Downloaded!');
            };
        } catch(err) { this.wrapper.style.transform = old; showToast('Export Failed: '+err.message, true); }
    }

    async downloadAllPages() {
        if (this.pages.length === 1) { this.downloadAsImage(); return; }
        const fmt = document.getElementById('export-format')?.value || 'image/png';
        const ext = fmt === 'image/jpeg' ? 'jpg' : 'png';
        showToast(`Rendering ${this.pages.length} pages...`);
        const old = this.wrapper.style.transform;
        this.wrapper.style.transform = 'scale(1)';
        const currentIdx = this.activePageIndex;
        for (let i = 0; i < this.pages.length; i++) {
            this.activePageIndex = i;
            this._loadPage(i);
            await new Promise(r => setTimeout(r, 300)); // wait for DOM update
            try {
                const canvas = await html2canvas(this.artboard, { useCORS: true, backgroundColor: '#000', scale: 2 });
                const dataUrl = canvas.toDataURL(fmt, 0.92);
                const a = document.createElement('a');
                a.download = `QuickFare_Page${i+1}.${ext}`; a.href = dataUrl; a.click();
                await new Promise(r => setTimeout(r, 500));
            } catch(e) { console.warn(`Page ${i+1} export failed:`, e); }
        }
        this.activePageIndex = currentIdx;
        this._loadPage(currentIdx);
        this.wrapper.style.transform = old;
        showToast(`${this.pages.length} pages downloaded!`);
    }

    // ── Drag / Init ─────────────────────────────────────────────────
    _initEl(el) {
        this._makeDraggable(el);
        el.onclick = e => { e.stopPropagation(); sEl(el); el.style.zIndex = ++this.maxZIndex; };
        el.ondblclick = () => {
            if (el.classList.contains('el-image')) return;
            el.contentEditable = 'true'; el.focus(); el.style.cursor = 'text';
        };
        el.onblur = () => { el.contentEditable = 'false'; el.style.cursor = 'move'; this.updateState(); };
    }

    _makeDraggable(el) {
        let p1=0,p2=0,p3=0,p4=0,moved=false;
        el.onmousedown = e => {
            if (el.contentEditable === 'true') return;
            e.preventDefault(); e.stopPropagation(); p3=e.clientX; p4=e.clientY; moved=false;
            document.onmouseup = () => { document.onmouseup=null; document.onmousemove=null; if(moved) this.updateState(); };
            document.onmousemove = e => {
                e.preventDefault(); moved=true;
                const z = window.currScale || 1;
                p1=(p3-e.clientX)/z; p2=(p4-e.clientY)/z; p3=e.clientX; p4=e.clientY;
                el.style.top=(el.offsetTop-p2)+'px'; el.style.left=(el.offsetLeft-p1)+'px';
            };
        };
        // Touch support for mobile
        el.ontouchstart = e => {
            const t = e.touches[0];
            p3=t.clientX; p4=t.clientY; moved=false;
            el.ontouchend = () => { if(moved) this.updateState(); };
            el.ontouchmove = e => {
                e.preventDefault(); moved=true;
                const touch = e.touches[0]; const z=window.currScale||1;
                p1=(p3-touch.clientX)/z; p2=(p4-touch.clientY)/z; p3=touch.clientX; p4=touch.clientY;
                el.style.top=(el.offsetTop-p2)+'px'; el.style.left=(el.offsetLeft-p1)+'px';
            };
        };
    }
}

const canvasManager = new CanvasManager();
export default canvasManager;
window.canvasManager = canvasManager;
