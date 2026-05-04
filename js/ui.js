/**
 * ui.js - Refactored UI Utilities
 * Toast notifications, modals, DOM helpers, and theme management.
 */
import appState from './appState.js';

/**
 * Toast Notification System
 */
export function showToast(msg, isErr = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.innerHTML = `<i class="fas ${isErr ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${msg}`;
    toast.style.background = isErr ? 'rgba(255,0,80,0.9)' : 'rgba(0,240,255,0.9)';
    toast.className = 'toast show';
    
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

/**
 * Element Selection Visuals
 */
export function sEl(el) {
    document.querySelectorAll('.element').forEach(z => z.classList.remove('active'));
    el.classList.add('active');
    
    // Update Layer Properties Panel
    const props = document.getElementById('layer-properties');
    if (!props) return;

    props.innerHTML = `
        <div class="prop-group">
            <label>LAYER ID</label>
            <input type="text" value="${el.id}" readonly style="opacity:0.5">
        </div>
        <div class="prop-group">
            <label>CONTENT / HTML</label>
            <textarea id="prop-html" rows="4">${el.innerHTML}</textarea>
        </div>
        <div class="prop-group">
            <label>SIZE / FONT</label>
            <input type="text" id="prop-fs" value="${el.style.fontSize}">
        </div>
        <button class="btn btn-danger" id="btn-delete-el" style="width:100%; margin-top:10px;"><i class="fas fa-trash"></i> DELETE LAYER</button>
    `;

    // Bind events
    document.getElementById('prop-html').oninput = (e) => {
        el.innerHTML = e.target.value;
    };
    document.getElementById('prop-fs').oninput = (e) => {
        el.style.fontSize = e.target.value;
    };
    document.getElementById('btn-delete-el').onclick = () => {
        el.remove();
        props.innerHTML = '<p style="text-align:center; opacity:0.5;">Select Layer Matrix</p>';
    };
}

/**
 * Theme Management
 */
export function toggleTheme() {
    const isDark = document.body.classList.toggle('light-theme');
    appState.setState({ ui: { ...appState.state.ui, theme: isDark ? 'light' : 'dark' } }, false);
}

/**
 * Debounce Helper
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Modal System Helper
 */
export function showModal(title, content, actions = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    
    overlay.innerHTML = `
        <div class="modal-content">
            <h3 style="color:var(--accent); margin-top:0;">${title}</h3>
            <div class="modal-body">${content}</div>
            <div class="modal-actions" style="display:flex; gap:10px; width:100%; margin-top:20px;">
                ${actions.map((a, i) => `<button class="btn ${a.primary ? 'btn-primary' : ''}" id="modal-btn-${i}">${a.label}</button>`).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    actions.forEach((a, i) => {
        document.getElementById(`modal-btn-${i}`).onclick = () => {
            if (a.onClick) a.onClick();
            overlay.remove();
        };
    });

    return overlay;
}

/**
 * Tab Switching Logic
 */
export function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeBtn = document.querySelector(`.tab-btn[onclick*="switchTab('${tabId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const content = document.getElementById(`tab-${tabId}`);
    if (content) content.classList.add('active');

    // Update visibility of top controls
    const canvasControls = document.getElementById('canvas-controls');
    const ebookControls = document.getElementById('ebook-controls');
    
    if (tabId === 'ebook') {
        if (canvasControls) canvasControls.style.display = 'none';
        if (ebookControls) ebookControls.style.display = 'flex';
    } else {
        if (canvasControls) canvasControls.style.display = 'flex';
        if (ebookControls) ebookControls.style.display = 'none';
    }
}

/**
 * Global exposure for legacy compatibility
 */
window.showToast = showToast;
window.sEl = sEl;
window.toggleTheme = toggleTheme;
window.switchTab = switchTab;
