/**
 * ui.js - UI Utilities (no circular deps)
 */

export function showToast(msg, isErr = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    toast.style.background = isErr ? 'var(--danger)' : 'var(--accent)';
    toast.style.color = isErr ? '#fff' : '#000';
    toast.className = 'toast show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

export function sEl(el) {
    document.querySelectorAll('.element').forEach(z => z.classList.remove('active'));
    if (!el) return;
    el.classList.add('active');
    const isImg = el.classList.contains('el-image');
    
    props.innerHTML = `
        <div style="padding-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin:0;">Layer Properties</h3>
                <span style="font-size:10px; color:var(--muted); font-family:monospace;">${el.id}</span>
            </div>

            ${!isImg ? `
            <div class="input-group">
                <label>Text Content</label>
                <textarea id="prop-text" style="height:60px;">${el.innerHTML.replace(/<br>/g, '\n')}</textarea>
            </div>
            <div class="row">
                <div class="input-group" style="flex:2;">
                    <label>Font Family</label>
                    <select id="prop-font">
                        <option value="Anton" ${el.style.fontFamily.includes('Anton') ? 'selected' : ''}>Anton - Bold</option>
                        <option value="'Plus Jakarta Sans'" ${el.style.fontFamily.includes('Jakarta') ? 'selected' : ''}>Jakarta - Modern</option>
                        <option value="'Space Grotesk'" ${el.style.fontFamily.includes('Grotesk') ? 'selected' : ''}>Grotesk - Tech</option>
                        <option value="'Oswald'" ${el.style.fontFamily.includes('Oswald') ? 'selected' : ''}>Oswald - News</option>
                        <option value="'Montserrat'" ${el.style.fontFamily.includes('Montserrat') ? 'selected' : ''}>Montserrat</option>
                    </select>
                </div>
                <div class="input-group" style="flex:1;">
                    <label>Size</label>
                    <input type="number" id="prop-fs" value="${parseInt(el.style.fontSize) || 40}">
                </div>
            </div>
            <div class="row">
                <div class="input-group">
                    <label>Color</label>
                    <input type="color" id="prop-color" value="${rgbToHex(el.style.color) || '#ffffff'}">
                </div>
                <div class="input-group">
                    <label>Align</label>
                    <select id="prop-align">
                        <option value="left" ${el.style.textAlign === 'left' ? 'selected' : ''}>Left</option>
                        <option value="center" ${el.style.textAlign === 'center' ? 'selected' : ''}>Center</option>
                        <option value="right" ${el.style.textAlign === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                </div>
            </div>
            ` : `
            <div class="input-group">
                <label>Border Radius</label>
                <input type="range" id="prop-radius" min="0" max="100" value="${parseInt(el.style.borderRadius) || 0}">
            </div>
            `}

            <div class="row" style="margin-top:15px;">
                <button class="btn" style="flex:1;justify-content:center;" onclick="bringForward()" title="Bring to Front"><i class="fas fa-layer-group"></i> UP</button>
                <button class="btn" style="flex:1;justify-content:center;" onclick="sendBackward()" title="Send to Back"><i class="fas fa-layer-group" style="transform:rotate(180deg)"></i> DOWN</button>
                <button class="btn" style="flex:1;justify-content:center;" onclick="duplicateLayer()" title="Duplicate Layer"><i class="fas fa-copy"></i> CLONE</button>
            </div>
            <button class="btn btn-danger" style="width:100%; margin-top:10px; justify-content:center;" id="btn-del-layer"><i class="fas fa-trash-alt"></i> DELETE LAYER</button>
        </div>`;

    // Event Listeners
    if (!isImg) {
        document.getElementById('prop-text').oninput = e => { el.innerHTML = e.target.value.replace(/\n/g, '<br>'); window.canvasManager.updateState(); };
        document.getElementById('prop-font').onchange = e => { el.style.fontFamily = e.target.value; window.canvasManager.updateState(); };
        document.getElementById('prop-fs').oninput = e => { el.style.fontSize = e.target.value + 'px'; window.canvasManager.updateState(); };
        document.getElementById('prop-color').oninput = e => { el.style.color = e.target.value; window.canvasManager.updateState(); };
        document.getElementById('prop-align').onchange = e => { el.style.textAlign = e.target.value; window.canvasManager.updateState(); };

        // Sync Sidebar
        const pick = document.getElementById('font-picker'); if (pick) pick.value = el.style.fontFamily.replace(/'/g, '');
        const sizeIn = document.getElementById('font-size-input'); if (sizeIn) sizeIn.value = parseInt(el.style.fontSize) || 80;
        const colIn = document.getElementById('font-color-input'); if (colIn) colIn.value = rgbToHex(el.style.color) || '#ffffff';
    } else {
        document.getElementById('prop-radius').oninput = e => { el.style.borderRadius = e.target.value + 'px'; window.canvasManager.updateState(); };
    }

    document.getElementById('btn-del-layer').onclick = () => {
        el.remove();
        props.innerHTML = '<div style="text-align:center;color:#555;margin-top:60px;font-size:12px;"><i class="fas fa-mouse-pointer" style="font-size:30px;margin-bottom:15px;display:block;color:var(--accent);opacity:0.5;"></i>Select Layer to Edit</div>';
        window.canvasManager.updateState();
    };
}

function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return '#ffffff';
    const hex = (n) => parseInt(n).toString(16).padStart(2, '0');
    return `#${hex(parts[0])}${hex(parts[1])}${hex(parts[2])}`;
}

export function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById(`tab-${tabId}`);
    if (content) content.classList.add('active');
    const cc = document.getElementById('canvas-controls');
    const ec = document.getElementById('ebook-controls');
    if (tabId === 'ebook') {
        if (cc) cc.style.display = 'none';
        if (ec) ec.style.display = 'flex';
        document.getElementById('artboard-wrapper').style.display = 'none';
        document.getElementById('business-kit-wrapper').style.display = 'flex';
    } else {
        if (cc) cc.style.display = 'flex';
        if (ec) ec.style.display = 'none';
        document.getElementById('artboard-wrapper').style.display = '';
        document.getElementById('business-kit-wrapper').style.display = 'none';
    }
}

export function toggleTheme() {
    document.body.classList.toggle('theme-light');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = document.body.classList.contains('theme-light') ? 'fas fa-sun' : 'fas fa-moon';
}

export function debounce(func, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), wait); };
}

// Expose globally for inline onclick handlers
window.showToast = showToast;
window.sEl = sEl;
window.switchTab = switchTab;
window.toggleTheme = toggleTheme;
