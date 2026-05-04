/**
 * CanvasManager.js - Canvas Operations
 * NOTE: Artboard is looked up lazily (not at class instantiation)
 * to avoid "getElementById returns null" on module load.
 */
import appState from './appState.js';
import { sEl, showToast } from './ui.js';

class CanvasManager {
    constructor() {
        this._artboard = null;
        this.elementCount = appState.state.canvas.elementCount || 1000;
        this.maxZIndex = appState.state.canvas.maxZIndex || 20;
    }

    get artboard() {
        if (!this._artboard) this._artboard = document.getElementById('artboard');
        return this._artboard;
    }

    clearAll() {
        this.artboard.querySelectorAll('.element').forEach(el => el.remove());
        this.updateState();
        showToast('Canvas Cleared');
    }

    addText(config = {}) {
        const { text = 'TYPE NOW', top = '200px', left = '100px', width = '900px',
            fontSize = '130px', fontFamily = 'Anton', color = '#fff',
            letterSpacing = '0px', lineHeight = '1.1', textAlign = 'left' } = config;
        const el = document.createElement('div');
        el.className = 'element el-text';
        el.id = `el-${this.elementCount++}`;
        el.innerHTML = text;
        Object.assign(el.style, { top, left, width, fontSize, fontFamily, color, letterSpacing, lineHeight, textAlign, zIndex: ++this.maxZIndex });
        this.artboard.appendChild(el);
        this._initEl(el);
        this.updateState();
        return el;
    }

    addCard(config = {}) {
        const { content = 'Add your content here...', top = '500px', left = '80px',
            width = '850px', borderRadius = '20px', background = 'rgba(15,15,20,0.85)' } = config;
        const el = document.createElement('div');
        el.className = 'element el-card';
        el.id = `el-${this.elementCount++}`;
        el.innerHTML = content;
        Object.assign(el.style, { top, left, width, borderRadius, background, zIndex: ++this.maxZIndex });
        this.artboard.appendChild(el);
        this._initEl(el);
        this.updateState();
        return el;
    }

    addImage(url, config = {}) {
        const { top = '50px', left = '50px', width = '400px', borderRadius = '0px' } = config;
        const el = document.createElement('img');
        el.crossOrigin = 'anonymous';
        el.draggable = false;
        el.className = 'element el-image';
        el.id = `el-${this.elementCount++}`;
        el.src = url;
        Object.assign(el.style, { top, left, width, borderRadius, zIndex: ++this.maxZIndex });
        this.artboard.appendChild(el);
        this._initEl(el);
        this.updateState();
        return el;
    }

    setBackground(url) {
        const bg = document.getElementById('bg-img');
        if (!bg) return;
        bg.crossOrigin = 'anonymous';
        bg.src = url;
        setTimeout(() => this.updateState(), 500);
    }

    addElement(type) {
        if (type === 'text') this.addText();
        else this.addCard();
    }

    uploadLocalImage(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => { this.addImage(e.target.result); showToast('Image Uploaded'); };
        reader.readAsDataURL(file);
    }

    applyPresetSize() {
        const sel = document.getElementById('preset-size');
        if (!sel) return;
        const [w, h] = sel.value.split('x');
        this.artboard.style.width = `${w}px`;
        this.artboard.style.height = `${h}px`;
        fitArtboard();
        this.updateState();
    }

    loadTemplate(type) {
        this.clearAll();
        const bgImg = document.getElementById('bg-img');
        const bgOverlay = document.getElementById('bg-overlay');
        if (bgOverlay) bgOverlay.style.background = 'linear-gradient(to top, #000 0%, transparent 60%, rgba(0,0,0,0.7) 100%)';
        if (type === 'cover') {
            if (bgImg) { bgImg.crossOrigin = 'anonymous'; bgImg.src = 'https://images.unsplash.com/photo-1628156108169-f815598fb28c?q=80&w=1920'; }
            this.addText({ text: 'ULTIMATE<br>GUIDE', top: '400px', fontSize: '200px' });
        } else if (type === 'viral') {
            this.addText({ text: '3 SECRET<br>WEBSITES', top: '300px', color: '#FF0050', fontSize: '150px' });
        } else if (type === 'quote') {
            this.addCard({ content: '"The best way to predict the future is to create it."', top: '300px' });
        }
        showToast('Template Loaded');
        this.updateState();
    }

    applyFilters() {
        const blur = document.getElementById('filter-blur')?.value || 0;
        const brightness = document.getElementById('filter-brightness')?.value || 100;
        const grayscale = document.getElementById('filter-grayscale')?.value || 0;
        const bg = document.getElementById('bg-img');
        if (bg) bg.style.filter = `blur(${blur}px) brightness(${brightness}%) grayscale(${grayscale}%)`;
        window.debounceSave && window.debounceSave();
    }

    restoreElements(elements) {
        if (!elements || !elements.length) return;
        elements.forEach(data => {
            let el;
            if (data.type === 'img') {
                el = document.createElement('img');
                el.crossOrigin = 'anonymous';
                el.draggable = false;
                el.src = data.src;
            } else {
                el = document.createElement('div');
                el.innerHTML = data.html;
            }
            el.id = data.id;
            el.className = data.className;
            el.style.cssText = data.style;
            this.artboard.appendChild(el);
            this._initEl(el);
        });
    }

    async downloadAsImage() {
        const fmt = document.getElementById('export-format')?.value || 'image/png';
        const ext = fmt === 'image/jpeg' ? 'jpg' : 'png';
        showToast('Rendering Asset...');
        const wrapper = document.getElementById('artboard-wrapper');
        const old = wrapper.style.transform;
        wrapper.style.transform = 'scale(1)';
        try {
            const canvas = await html2canvas(this.artboard, { useCORS: true, backgroundColor: '#000', scale: 2 });
            wrapper.style.transform = old;
            const dataUrl = canvas.toDataURL(fmt, 0.9);
            // Show preview modal
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.display = 'flex';
            overlay.innerHTML = `<div class="modal-content"><h3 style="color:var(--accent);margin-top:0;">PREVIEW RENDER</h3><img src="${dataUrl}" style="max-height:60vh;border:1px solid #333;margin-bottom:20px;"><div style="display:flex;gap:10px;width:100%;"><button class="btn" style="flex:1;justify-content:center;" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button class="btn btn-primary" style="flex:1;justify-content:center;" id="btn-dl"><i class="fas fa-download"></i> Download HD</button></div></div>`;
            document.body.appendChild(overlay);
            document.getElementById('btn-dl').onclick = () => {
                const a = document.createElement('a');
                a.download = `QuickFare_Export.${ext}`;
                a.href = dataUrl;
                a.click();
                overlay.remove();
                showToast('Asset Downloaded!');
            };
        } catch(err) {
            wrapper.style.transform = old;
            showToast('Export Failed: ' + err.message, true);
        }
    }

    updateState() {
        const elements = Array.from(this.artboard.querySelectorAll('.element')).map(el => ({
            id: el.id, type: el.tagName.toLowerCase(), className: el.className,
            html: el.tagName === 'IMG' ? '' : el.innerHTML,
            src: el.tagName === 'IMG' ? el.src : '', style: el.style.cssText
        }));
        const bgImg = document.getElementById('bg-img');
        appState.setState({
            canvas: { ...appState.state.canvas, elements, elementCount: this.elementCount, maxZIndex: this.maxZIndex, background: { src: bgImg ? bgImg.src : '', filter: bgImg ? bgImg.style.filter : '' } }
        });
    }

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
            e.preventDefault(); e.stopPropagation();
            p3 = e.clientX; p4 = e.clientY; moved = false;
            document.onmouseup = () => {
                document.onmouseup = null; document.onmousemove = null;
                if (moved) this.updateState();
            };
            document.onmousemove = e => {
                e.preventDefault(); moved = true;
                const z = window.currScale || 1;
                p1 = (p3-e.clientX)/z; p2 = (p4-e.clientY)/z;
                p3 = e.clientX; p4 = e.clientY;
                el.style.top = (el.offsetTop - p2) + 'px';
                el.style.left = (el.offsetLeft - p1) + 'px';
            };
        };
    }
}

const canvasManager = new CanvasManager();
export default canvasManager;
window.canvasManager = canvasManager;
