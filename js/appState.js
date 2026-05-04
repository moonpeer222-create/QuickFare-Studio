/**
 * appState.js - Central State Management
 */
class AppState {
    constructor() {
        this.STATE_KEY = 'quickfare_canvas_state';
        this.maxHistory = 50;
        this.history = [];
        this.historyIndex = -1;
        this.listeners = [];
        this.isRestoring = false;
        this.state = {
            canvas: { elements: [], background: { src: '', filter: '' }, elementCount: 1000, maxZIndex: 20 },
            ui: { theme: 'dark', lastError: null }
        };
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(l => l !== callback); };
    }

    notify() { this.listeners.forEach(cb => cb(this.state)); }

    getSnapshot() { return JSON.parse(JSON.stringify(this.state)); }

    setState(partial, record = true) {
        if (this.isRestoring) return;
        this.state = { ...this.state, ...partial };
        if (record) this.pushHistory();
        this.saveToLocal();
        this.notify();
    }

    pushHistory() {
        const snap = this.getSnapshot();
        if (this.historyIndex < this.history.length - 1)
            this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snap);
        if (this.history.length > this.maxHistory) this.history.shift();
        else this.historyIndex++;
    }

    undo() {
        if (this.historyIndex <= 0) return null;
        this.historyIndex--;
        this.isRestoring = true;
        this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.isRestoring = false;
        this.notify();
        return this.state;
    }

    redo() {
        if (this.historyIndex >= this.history.length - 1) return null;
        this.historyIndex++;
        this.isRestoring = true;
        this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.isRestoring = false;
        this.notify();
        return this.state;
    }

    saveToLocal() {
        try { localStorage.setItem(this.STATE_KEY, JSON.stringify(this.state)); } catch(e) {}
    }

    loadFromLocal() {
        try {
            const s = localStorage.getItem(this.STATE_KEY);
            if (s) { this.state = JSON.parse(s); this.pushHistory(); return true; }
        } catch(e) {}
        return false;
    }

    setError(err) { this.setState({ ui: { ...this.state.ui, lastError: err.message || err } }, false); }
}

const appState = new AppState();
export default appState;
window.appState = appState;
