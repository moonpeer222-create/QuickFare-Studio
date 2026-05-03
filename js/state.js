// ==========================================
// STATE MANAGEMENT (Undo/Redo & Auto-Save)
// ==========================================
import { sEl } from './ui.js';
import { makeDrag } from './canvas.js';

const STATE_KEY = 'quickfare_canvas_state';
let history = [];
let historyIndex = -1;
let isRestoring = false;

// Call this after any modification to the canvas
export function saveState() {
    if (isRestoring) return;
    
    const artboard = document.getElementById('artboard');
    if (!artboard) return;

    // Remove active classes before saving so we don't save selection state
    const activeEl = document.querySelector('.element.active');
    if (activeEl) activeEl.classList.remove('active');

    // Serialize elements
    const state = {
        html: artboard.innerHTML,
        mxZ: window.mxZ || 20,
        elCount: window.elCount || 1000
    };

    // Restore active class
    if (activeEl) activeEl.classList.add('active');

    // Remove future history if we're branching
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }

    history.push(state);
    
    // Keep max 50 states
    if (history.length > 50) {
        history.shift();
    } else {
        historyIndex++;
    }

    // Save to localStorage
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch(e) {
        console.warn("Could not save to localStorage (quota exceeded or disabled).");
    }
}

export function undo() {
    if (historyIndex <= 0) return; // Cannot undo past initial state
    historyIndex--;
    restoreState(history[historyIndex]);
}

export function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    restoreState(history[historyIndex]);
}

function restoreState(state) {
    if (!state) return;
    isRestoring = true;
    
    const artboard = document.getElementById('artboard');
    artboard.innerHTML = state.html;
    window.mxZ = state.mxZ;
    window.elCount = state.elCount;
    window.activeEl = null;

    // Rebind events to new DOM elements
    artboard.querySelectorAll('.element').forEach(el => {
        makeDrag(el);
    });

    document.getElementById('layer-properties').innerHTML = `
        <div style="text-align: center; color: #555; margin-top: 80px; font-size: 12px; line-height: 1.6;">
            <i class="fas fa-mouse-pointer" style="font-size: 40px; margin-bottom: 20px; color:var(--accent); opacity:0.5;"></i><br>Select Layer Matrix on Canvas<br>To Open Config Panel.
        </div>`;

    isRestoring = false;
}

export function loadInitialState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            history.push(state);
            historyIndex = 0;
            restoreState(state);
            return true;
        }
    } catch(e) {
        console.warn("Failed to load from localStorage.");
    }
    return false;
}

export function clearState() {
    localStorage.removeItem(STATE_KEY);
    history = [];
    historyIndex = -1;
}
