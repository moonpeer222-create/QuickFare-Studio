/**
 * CanvasManager.js - Core Canvas Operations
 * Replaces addTextObj, addCardObj, addImage, clearCanvasElements.
 */
import appState from './appState.js';
import { sEl, showToast } from './ui.js';

class CanvasManager {
    constructor(artboardId = 'artboard') {
        this.artboard = document.getElementById(artboardId);
        this.elementCount = 1000;
        this.maxZIndex = 20;
    }

    /**
     * Clear all elements from the canvas
     */
    clearAll() {
        this.artboard.querySelectorAll('.element').forEach(el => el.remove());
        this.updateState();
        showToast("Canvas Cleared");
    }

    /**
     * Add a text element
     */
    addText(config = {}) {
        const {
            text = "TYPE NOW",
            top = "200px",
            left = "100px",
            width = "800px",
            fontSize = "100px",
            fontFamily = "Anton",
            color = "#fff",
            letterSpacing = "0px",
            lineHeight = "1.1",
            textAlign = "left",
            stroke = "0px transparent"
        } = config;

        const el = document.createElement('div');
        el.className = 'element el-text';
        el.id = `el-${this.elementCount++}`;
        el.innerHTML = text;
        
        Object.assign(el.style, {
            top, left, width, fontSize, fontFamily, color,
            letterSpacing, lineHeight, textAlign,
            webkitTextStroke: stroke,
            zIndex: ++this.maxZIndex
        });

        this.artboard.appendChild(el);
        this.initElement(el);
        this.updateState();
        return el;
    }

    /**
     * Add a card/box element
     */
    addCard(config = {}) {
        const {
            content = "Highlight target logic here...",
            top = "400px",
            left = "100px",
            width = "600px",
            borderRadius = "20px",
            background = "rgba(18,20,25,0.85)"
        } = config;

        const el = document.createElement('div');
        el.className = 'element el-card';
        el.id = `el-${this.elementCount++}`;
        el.innerHTML = content;

        Object.assign(el.style, {
            top, left, width, borderRadius, background,
            zIndex: ++this.maxZIndex
        });

        this.artboard.appendChild(el);
        this.initElement(el);
        this.updateState();
        return el;
    }

    /**
     * Add an image element
     */
    addImage(url, config = {}) {
        const {
            top = "50px",
            left = "50px",
            width = "400px",
            borderRadius = "0px"
        } = config;

        const el = document.createElement('img');
        el.crossOrigin = 'anonymous';
        el.draggable = false;
        el.className = 'element el-image';
        el.id = `el-${this.elementCount++}`;
        el.src = url;

        Object.assign(el.style, {
            top, left, width, borderRadius,
            zIndex: ++this.maxZIndex
        });

        this.artboard.appendChild(el);
        this.initElement(el);
        this.updateState();
        return el;
    }

    /**
     * Set the canvas background
     */
    setBackground(url) {
        const bgImg = document.getElementById('bg-img');
        if (bgImg) {
            bgImg.crossOrigin = 'anonymous';
            bgImg.src = url;
            setTimeout(() => this.updateState(), 500);
        }
    }

    /**
     * Initialize element with dragging and interaction
     */
    initElement(el) {
        this.makeDraggable(el);
        
        el.onclick = (e) => {
            e.stopPropagation();
            sEl(el);
            el.style.zIndex = ++this.maxZIndex;
        };

        el.ondblclick = () => {
            if (el.classList.contains('el-image')) return;
            el.contentEditable = "true";
            el.focus();
            el.style.cursor = "text";
        };

        el.onblur = () => {
            el.contentEditable = "false";
            el.style.cursor = "move";
            this.updateState();
        };
    }

    makeDraggable(el) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let hasMoved = false;

        el.onmousedown = (e) => {
            if (el.contentEditable === "true") return;
            e.preventDefault();
            e.stopPropagation();

            pos3 = e.clientX;
            pos4 = e.clientY;
            hasMoved = false;

            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                if (hasMoved) this.updateState();
            };

            document.onmousemove = (e) => {
                e.preventDefault();
                hasMoved = true;
                const zoom = window.currScale || 1;
                pos1 = (pos3 - e.clientX) / zoom;
                pos2 = (pos4 - e.clientY) / zoom;
                pos3 = e.clientX;
                pos4 = e.clientY;
                el.style.top = (el.offsetTop - pos2) + "px";
                el.style.left = (el.offsetLeft - pos1) + "px";
            };
        };
    }

    /**
     * Add generic element helper
     */
    addElement(type) {
        if (type === 'text') this.addText();
        else this.addCard();
    }

    /**
     * Handle local image upload
     */
    uploadLocalImage(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addImage(e.target.result);
            showToast("Image Uploaded");
        };
        reader.readAsDataURL(file);
    }

    /**
     * Apply preset sizing
     */
    applyPresetSize() {
        const select = document.getElementById('preset-size');
        const [w, h] = select.value.split('x');
        const artboard = document.getElementById('artboard');
        artboard.style.width = `${w}px`;
        artboard.style.height = `${h}px`;
        this.updateState();
    }

    /**
     * Load predefined templates
     */
    loadTemplate(type) {
        this.clearAll();
        if (type === 'cover') {
            this.setBackground("https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&w=1920");
            this.addText({ text: "ULTIMATE\nGUIDE", top: "400px" });
        } else if (type === 'viral') {
            this.addText({ text: "3 SECRET\nWEBSITES", color: "#FF0050" });
        }
        showToast("Template Loaded");
    }

    /**
     * Update global app state with current canvas data
     */
    updateState() {
        const elements = Array.from(this.artboard.querySelectorAll('.element')).map(el => ({
            id: el.id,
            type: el.tagName.toLowerCase(),
            className: el.className,
            html: el.tagName === 'IMG' ? '' : el.innerHTML,
            src: el.tagName === 'IMG' ? el.src : '',
            style: el.style.cssText
        }));

        const bgImg = document.getElementById('bg-img');
        
        appState.setState({
            canvas: {
                ...appState.state.canvas,
                elements,
                background: {
                    ...appState.state.canvas.background,
                    src: bgImg ? bgImg.src : ''
                },
                elementCount: this.elementCount,
                maxZIndex: this.maxZIndex
            }
        });
    }

    /**
     * Export to PNG/JPEG
     */
    async downloadAsImage(filename = 'QuickFare_Design', format = 'image/png') {
        showToast("Rendering Asset...");
        const wrapper = document.getElementById('artboard-wrapper');
        const oldTransform = wrapper.style.transform;
        wrapper.style.transform = 'scale(1)';

        try {
            const canvas = await html2canvas(this.artboard, {
                useCORS: true,
                backgroundColor: "#000",
                scale: 2
            });
            wrapper.style.transform = oldTransform;

            const link = document.createElement('a');
            link.download = `${filename}.${format === 'image/jpeg' ? 'jpg' : 'png'}`;
            link.href = canvas.toDataURL(format, 0.9);
            link.click();
            showToast("Download Complete!");
        } catch (err) {
            wrapper.style.transform = oldTransform;
            showToast("Export Failed", true);
            console.error(err);
        }
    }
}

const canvasManager = new CanvasManager();
export default canvasManager;
window.canvasManager = canvasManager;
