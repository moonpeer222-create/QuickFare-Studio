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
    const props = document.getElementById('layer-properties');
    if (!props) return;
    props.innerHTML = `
        <div style="padding-bottom:20px;">
            <h3 style="color:var(--accent);font-size:14px;text-transform:uppercase;margin-bottom:20px;">Layer Properties</h3>
            <div class="input-group"><label>Layer ID</label><input type="text" value="${el.id}" readonly style="opacity:0.5"></div>
            ${!el.classList.contains('el-image') ? `
            <div class="input-group"><label>Font Size</label><input type="text" id="prop-fs" value="${el.style.fontSize || ''}"></div>
            <div class="input-group"><label>Color</label><input type="color" id="prop-color" value="#ffffff"></div>
            ` : ''}
            <div class="row" style="margin-top:10px;">
                <button class="btn" style="flex:1;justify-content:center;background:#334;" onclick="bringForward()"><i class="fas fa-arrow-up"></i> Forward</button>
                <button class="btn" style="flex:1;justify-content:center;background:#334;" onclick="sendBackward()"><i class="fas fa-arrow-down"></i> Backward</button>
            </div>
            <button class="btn" style="width:100%;margin-top:10px;justify-content:center;background:#5a0c16;border-color:#aa0000;" id="btn-del-layer"><i class="fas fa-trash-alt"></i> Delete Layer</button>
        </div>`;

    document.getElementById('btn-del-layer').onclick = () => {
        el.remove();
        props.innerHTML = '<div style="text-align:center;color:#555;margin-top:60px;font-size:12px;"><i class="fas fa-mouse-pointer" style="font-size:30px;margin-bottom:15px;display:block;color:var(--accent);opacity:0.5;"></i>Select Layer to Edit</div>';
        window.saveState && window.saveState();
    };
    const fsInput = document.getElementById('prop-fs');
    if (fsInput) fsInput.oninput = e => { el.style.fontSize = e.target.value; window.debounceSave && window.debounceSave(); };
    const colorInput = document.getElementById('prop-color');
    if (colorInput) colorInput.oninput = e => { el.style.color = e.target.value; window.debounceSave && window.debounceSave(); };
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
