import { CONFIG } from './config.js';
import { saveState, undo, redo, clearState } from './state.js';
import { addTextObj, addCardObj, bg, addImage, clearCanvasElements } from './canvas.js';
import { fetchPexels, triggerAICampaign, magicAutoCreate } from './api.js';

window.activeEl = null;

// TOAST NOTIFICATION
export function showToast(msg, isErr=false) {
    const t = document.getElementById('toast'); 
    t.innerText = msg;
    t.style.background = isErr ? "var(--danger)" : "var(--accent)"; 
    t.style.color = isErr ? "#fff" : "#000";
    t.classList.add('show'); 
    setTimeout(() => t.classList.remove('show'), 3000);
}

// TAB SWITCHER
window.switchTab = function(t) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const btn = document.querySelector(`.tab-btn[onclick="switchTab('${t}')"]`);
    if(btn) btn.classList.add('active'); 
    document.getElementById('tab-' + t).classList.add('active');

    // UI toggles based on active tool mode
    const artboardWrapper = document.getElementById('artboard-wrapper');
    const bkWrapper = document.getElementById('business-kit-wrapper');
    const propsPanel = document.getElementById('properties-panel');
    const canvasControls = document.getElementById('canvas-controls');
    const ebookControls = document.getElementById('ebook-controls');

    if (t === 'ebook') {
        if(artboardWrapper) artboardWrapper.style.display = 'none';
        if(propsPanel) propsPanel.style.display = 'none';
        if(canvasControls) canvasControls.style.display = 'none';
        
        if(bkWrapper) bkWrapper.style.display = 'flex';
        if(ebookControls) ebookControls.style.display = 'flex';
    } else {
        if(bkWrapper) bkWrapper.style.display = 'none';
        if(ebookControls) ebookControls.style.display = 'none';
        
        if(artboardWrapper) artboardWrapper.style.display = 'block';
        if(propsPanel) propsPanel.style.display = 'flex';
        if(canvasControls) canvasControls.style.display = 'flex';
        fitArtboard();
    }
}

// PERFECT ZOOM FIT SCALING
export function fitArtboard() {
    const workspace = document.getElementById('workspace');
    const artboard = document.getElementById('artboard');
    const wrapper = document.getElementById('artboard-wrapper');
    if(!workspace || !artboard || !wrapper || wrapper.style.display === 'none') return;

    window.currScale = Math.min((workspace.clientWidth - 100) / artboard.clientWidth, (workspace.clientHeight - 100) / artboard.clientHeight);
    wrapper.style.transform = `scale(${window.currScale})`;
}

// CANVAS SIZING
window.applyPresetSize = function() { 
    const artboard = document.getElementById('artboard');
    let v = document.getElementById('preset-size').value; 
    if(v === 'custom') return; 
    artboard.style.width = v.split('x')[0] + 'px'; 
    artboard.style.height = v.split('x')[1] + 'px'; 
    fitArtboard(); 
    saveState();
}

// LAYER SELECTION & PROPERTIES
export function sEl(el) {
    if (window.activeEl) window.activeEl.classList.remove('active');
    window.activeEl = el;
    el.classList.add('active');
    
    const isImage = el.classList.contains('el-image');
    
    document.getElementById('layer-properties').innerHTML = `
        <div style="padding-bottom: 20px;">
            <h3 style="color:var(--accent); font-size:14px; text-transform:uppercase; margin-bottom: 20px;">Layer Properties</h3>
            
            <div class="row" style="margin-bottom:15px;">
                <button class="btn" style="flex:1; justify-content:center; background:#334;" onclick="changeZIndex(1)"><i class="fas fa-arrow-up"></i> Bring Forward</button>
                <button class="btn" style="flex:1; justify-content:center; background:#334;" onclick="changeZIndex(-1)"><i class="fas fa-arrow-down"></i> Send Backward</button>
            </div>

            <button class="btn" style="width:100%; margin-bottom:15px; justify-content:center; background:#5a0c16; border-color:#aa0000;" onclick="deleteActiveEl()">
                <i class="fas fa-trash-alt"></i> Delete Selected Layer
            </button>
            
            ${!isImage ? `
            <div class="input-group">
                <label>Font Family</label>
                <select id="font-picker" onchange="changeFont(this.value)">
                    <option value="Anton" ${el.style.fontFamily.includes('Anton') ? 'selected' : ''}>Anton</option>
                    <option value="Montserrat" ${el.style.fontFamily.includes('Montserrat') ? 'selected' : ''}>Montserrat</option>
                    <option value="Oswald" ${el.style.fontFamily.includes('Oswald') ? 'selected' : ''}>Oswald</option>
                    <option value="Bebas Neue" ${el.style.fontFamily.includes('Bebas Neue') ? 'selected' : ''}>Bebas Neue</option>
                    <option value="Space Grotesk" ${el.style.fontFamily.includes('Space Grotesk') ? 'selected' : ''}>Space Grotesk</option>
                    <option value="Playfair Display" ${el.style.fontFamily.includes('Playfair') ? 'selected' : ''}>Playfair Display</option>
                    <option value="Cinzel" ${el.style.fontFamily.includes('Cinzel') ? 'selected' : ''}>Cinzel</option>
                </select>
            </div>
            <div class="input-group">
                <label>Font Size</label>
                <input type="number" value="${parseInt(el.style.fontSize) || 40}" oninput="window.activeEl.style.fontSize = this.value + 'px'; debounceSave()">
            </div>
            <div class="input-group">
                <label>Text Color</label>
                <input type="color" value="${rgbToHex(el.style.color) || '#ffffff'}" oninput="window.activeEl.style.color = this.value; debounceSave()">
            </div>
            <p style="font-size: 11px; color: #888;">Tip: Double-click the text on the canvas to edit it directly.</p>
            ` : `
            <p style="font-size: 11px; color: #888;">Image selected. Use corners to resize (coming soon) or drag to move.</p>
            `}
        </div>
    `;
}

window.changeZIndex = function(direction) {
    if (window.activeEl) {
        let currentZ = parseInt(window.activeEl.style.zIndex) || 10;
        window.activeEl.style.zIndex = currentZ + direction;
        saveState();
    }
}

window.changeFont = function(fontName) {
    if (window.activeEl) {
        window.activeEl.style.fontFamily = fontName;
        saveState();
    }
}

let saveTimeout;
window.debounceSave = function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveState, 500);
}

function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const parts = rgb.match(/\d+/g);
    if (!parts) return rgb;
    return "#" + parts.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

window.deleteActiveEl = function() {
    if (window.activeEl) {
        window.activeEl.remove();
        window.activeEl = null;
        document.getElementById('layer-properties').innerHTML = `
            <div style="text-align: center; color: #555; margin-top: 80px; font-size: 12px; line-height: 1.6;">
                <i class="fas fa-mouse-pointer" style="font-size: 40px; margin-bottom: 20px; color:var(--accent); opacity:0.5;"></i><br>Select Layer Matrix on Canvas<br>To Open Config Panel.
            </div>`;
        saveState();
    }
}

// Global UI bindings
window.undo = undo;
window.redo = redo;

// Pillar System Logic
export function loadPillars() {
    const cat = document.getElementById('pillar-category')?.value || 'finance';
    const gBox = document.getElementById('pillar-gallery');
    if (!gBox) return;
    
    gBox.innerHTML = '';
    const images = CONFIG.IMAGE_PILLARS[cat] || [];
    
    images.forEach(ip => {
        gBox.insertAdjacentHTML('beforeend', `
            <div class="img-card">
                <img src="${ip.url}" alt="${ip.name}">
                <div class="img-actions">
                    <button class="img-btn" onclick="bg('${ip.url}')">Set Background</button>
                </div>
            </div>
        `);
    });
}
window.loadPillars = loadPillars;

// Initialize Workspace Events
export function initUI() {
    const workspace = document.getElementById('workspace');
    window.addEventListener('resize', fitArtboard); 
    setTimeout(fitArtboard, 100);
    setTimeout(loadPillars, 500); // Load initial pillars

    workspace.addEventListener('wheel', e => {
        if(e.ctrlKey || e.metaKey){ 
            e.preventDefault(); 
            if(document.getElementById('artboard-wrapper').style.display !== 'none') {
                window.currScale = Math.max(0.1, Math.min(window.currScale + (e.deltaY > 0 ? -0.05 : 0.05), 3)); 
                document.getElementById('artboard-wrapper').style.transform = `scale(${window.currScale})`; 
            }
        }
    }, {passive: false});

    // Deselect on bg click
    document.getElementById('workspace').addEventListener('mousedown', e => {
        if(e.target.id === 'bg-img' || e.target.id === 'bg-overlay' || e.target.id === 'artboard' || e.target.id === 'workspace') {
            if(window.activeEl) {
                window.activeEl.classList.remove('active');
                window.activeEl = null;
                document.getElementById('layer-properties').innerHTML = `
                    <div style="text-align: center; color: #555; margin-top: 80px; font-size: 12px; line-height: 1.6;">
                        <i class="fas fa-mouse-pointer" style="font-size: 40px; margin-bottom: 20px; color:var(--accent); opacity:0.5;"></i><br>Select Layer Matrix on Canvas<br>To Open Config Panel.
                    </div>`;
            }
        }
    });

    // Keyboard Shortcuts (Delete element)
    document.addEventListener('keydown', e => {
        if((e.key === 'Delete' || e.key === 'Backspace') && window.activeEl) {
            // Prevent deleting if user is typing in an input or contenteditable
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === "true") return;
            window.deleteActiveEl();
        }
    });
}
