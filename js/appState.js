/**
 * appState.js - Central State Management for QuickFare Studio
 * Handles undo/redo, localStorage persistence, and reactive subscriptions.
 */

class AppState {
    constructor() {
        this.STATE_KEY = 'quickfare_canvas_state';
        this.maxHistory = 50;
        this.history = [];
        this.historyIndex = -1;
        this.listeners = [];
        this.isRestoring = false;

        // Initial State
        this.state = {
            canvas: {
                elements: [],
                background: {
                    src: '',
                    filter: 'blur(0px) brightness(100%) grayscale(0%)',
                    overlay: ''
                },
                elementCount: 1000,
                maxZIndex: 20,
                selectedElementId: null
            },
            ui: {
                theme: 'dark',
                lastError: null
            }
        };

        this.init();
    }

    init() {
        this.loadFromLocal();
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(callback => callback(this.getSnapshot()));
    }

    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Update state and record history
     * @param {Object} newState 
     * @param {Boolean} recordHistory 
     */
    setState(newState, recordHistory = true) {
        if (this.isRestoring) return;

        // Deep merge or replacement logic
        this.state = { ...this.state, ...newState };

        if (recordHistory) {
            this.pushHistory();
        }

        this.saveToLocal();
        this.notify();
    }

    pushHistory() {
        const snapshot = this.getSnapshot();
        
        // Remove future if we branched
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(snapshot);
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
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
        try {
            localStorage.setItem(this.STATE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn("Storage Quota Exceeded", e);
        }
    }

    loadFromLocal() {
        try {
            const saved = localStorage.getItem(this.STATE_KEY);
            if (saved) {
                this.state = JSON.parse(saved);
                this.pushHistory(); // Add initial load to history
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }

    setError(error) {
        this.setState({ ui: { ...this.state.ui, lastError: error.message || error } }, false);
    }
}

// Export singleton instance
const appState = new AppState();
export default appState;
window.appState = appState; // For easier debugging
