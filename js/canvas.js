import { saveState } from './state.js';
import { sEl, showToast } from './ui.js';

window.elCount = 1000;
window.mxZ = 20;

const artboard = document.getElementById('artboard');

export function clearCanvasElements() { 
    artboard.querySelectorAll('.element').forEach(z => z.remove()); 
    saveState();
}
window.clearCanvasElements = clearCanvasElements;

window.addElement = function(t) { 
    if(t === 'text') addTextObj("TYPE NOW", "200px", "100px", "800px", "100px", "Anton"); 
    else addCardObj("Highlight target logic here clearly to engage readers seamlessly with your new output.", "400px", "100px", "600px");
    saveState();
}

export function addTextObj(htm, tp, lft, wd, fs, fm, cl="#fff", ls="0px", lh="1.1", al="left", stk="0px transparent") {
    let dv = document.createElement('div'); 
    dv.className = 'element el-text'; 
    dv.id = 'el-' + window.elCount++;
    dv.innerHTML = htm; 
    dv.style.top = tp; 
    dv.style.left = lft; 
    dv.style.width = wd; 
    dv.style.fontSize = fs; 
    dv.style.fontFamily = fm; 
    dv.style.color = cl; 
    dv.style.letterSpacing = ls; 
    dv.style.lineHeight = lh; 
    dv.style.textAlign = al; 
    dv.style.webkitTextStroke = stk; 
    dv.style.zIndex = ++window.mxZ; 
    
    document.getElementById('artboard').appendChild(dv); 
    makeDrag(dv); 
    sEl(dv); 
    return dv;
}
window.addTextObj = addTextObj;

export function addCardObj(htm, tp, lft, wd, br="20px", clrB="rgba(18,20,25,0.85)") {
    let cp = document.createElement('div'); 
    cp.className = 'element el-card'; 
    cp.id = 'el-' + window.elCount++; 
    cp.innerHTML = htm; 
    cp.style.top = tp; 
    cp.style.left = lft; 
    cp.style.width = wd; 
    cp.style.borderRadius = br; 
    cp.style.background = clrB; 
    cp.style.zIndex = ++window.mxZ; 
    
    document.getElementById('artboard').appendChild(cp); 
    makeDrag(cp); 
    sEl(cp); 
    return cp;
}
window.addCardObj = addCardObj;

export function addImage(url, tp, lft, wd, br="0px"){
    let mg = document.createElement('img'); 
    mg.crossOrigin = 'anonymous'; 
    mg.draggable = false; 
    mg.className = 'element el-image'; 
    mg.id = 'el-' + window.elCount++; 
    mg.src = url; 
    mg.style.top = tp; 
    mg.style.left = lft; 
    mg.style.width = wd; 
    mg.style.borderRadius = br; 
    mg.style.zIndex = ++window.mxZ; 
    
    document.getElementById('artboard').appendChild(mg); 
    makeDrag(mg); 
    sEl(mg); 
    return mg;
}
window.addImage = addImage;

export function bg(url) { 
    let b = document.getElementById('bg-img'); 
    if(!b) return;
    b.crossOrigin = 'anonymous'; 
    b.src = url; 
    setTimeout(saveState, 500); // Wait for image to start loading
}
window.bg = bg;

window.uploadLocalImage = function(ev){ 
    let iFn = ev.target.files[0]; 
    if(!iFn) return; 
    let rdLObj = new FileReader(); 
    rdLObj.onload = z => {
        addImage(z.target.result, "50px", "50px", "400px", "0px");
        saveState();
    };
    rdLObj.readAsDataURL(iFn); 
    showToast("Upload Active.");
}

// DRAGGING LOGIC
export function makeDrag(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let hasMoved = false;
    if (el.tagName === 'IMG') el.draggable = false;
    
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (el.contentEditable === "true") return; // Don't drag while editing
        e.preventDefault();
        e.stopPropagation();
        if (e.target !== el && e.target.nodeName === 'BUTTON') return;
        
        sEl(el);
        el.style.zIndex = ++window.mxZ;
        hasMoved = false;

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    el.ondblclick = function(e) {
        if (el.classList.contains('el-image')) return;
        el.contentEditable = "true";
        el.focus();
        el.style.cursor = "text";
        document.execCommand('selectAll', false, null);
    };

    el.onblur = function() {
        el.contentEditable = "false";
        el.style.cursor = "move";
        saveState(); // Save text changes
    };

    function elementDrag(e) {
        e.preventDefault();
        hasMoved = true;
        let currentZoom = window.currScale || 1;
        pos1 = (pos3 - e.clientX) / currentZoom;
        pos2 = (pos4 - e.clientY) / currentZoom;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        if (hasMoved) saveState();
    }
}

// TEMPLATES SETUP
window.loadTemplate = function(type) {
    clearCanvasElements();
    if (type === 'cover') {
        document.getElementById('preset-size').value = "1748x2480"; window.applyPresetSize();
        bg("https://images.unsplash.com/photo-1628156108169-f815598fb28c?q=80&w=1920");
        addTextObj("ULTIMATE<br>GUIDE", "400px", "100px", "1500px", "200px", "Anton", "#00F0FF");
    } else if (type === 'viral') {
        document.getElementById('preset-size').value = "1080x1920"; window.applyPresetSize();
        addTextObj("3 SECRET<br>WEBSITES", "300px", "50px", "980px", "150px", "Anton", "#FF0050");
    } else if (type === 'quote') {
        document.getElementById('preset-size').value = "1080x1080"; window.applyPresetSize();
        addCardObj('"The best way to predict the future is to create it."', "300px", "100px", "880px", "20px", "rgba(0,0,0,0.8)");
    } else {
        document.getElementById('preset-size').value = "1080x1080"; window.applyPresetSize();
    }
    showToast("Template Loaded.");
    saveState();
}

// EXPORT FUNCTION (html2canvas)
window.exportDesign = function() {
    showToast("Rendering Final Asset...");
    if(window.activeEl) window.activeEl.classList.remove('active');
    
    let format = document.getElementById('export-format').value;
    let ext = format === 'image/jpeg' ? 'jpg' : 'png';
    
    setTimeout(() => {
        const artboard = document.getElementById('artboard');
        const wrapper = document.getElementById('artboard-wrapper');
        
        // Unscale the wrapper temporarily to prevent transformation bugs during rendering
        const oldTransform = wrapper.style.transform;
        wrapper.style.transform = 'scale(1)';

        html2canvas(artboard, {
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#000000",
            scale: 2, // High resolution export
            logging: false
        }).then(canvas => {
            // Restore scale
            wrapper.style.transform = oldTransform;

            // Show preview modal
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.display = 'flex';
            
            const dataUrl = canvas.toDataURL(format, 0.9);
            
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3 style="color:var(--accent); margin-top:0;">PREVIEW RENDER</h3>
                    <img src="${dataUrl}" alt="Preview" style="max-height: 60vh; border: 1px solid #333; margin-bottom: 20px;">
                    <div style="display:flex; gap:10px; width:100%;">
                        <button class="btn" style="flex:1; justify-content:center;" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button class="btn btn-primary" style="flex:1; justify-content:center;" id="btn-confirm-download"><i class="fas fa-download"></i> Download HD Asset</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('btn-confirm-download').onclick = () => {
                let link = document.createElement('a');
                link.download = `QuickFare_Export.${ext}`;
                link.href = dataUrl;
                link.click();
                overlay.remove();
                showToast("Asset Downloaded Successfully!");
            };

        }).catch(err => {
            wrapper.style.transform = oldTransform;
            showToast("Export failed: " + err.message, true);
            console.error("Export Error:", err);
        });
    }, 100);
}

// Apply background filters
window.applyFilters = function() {
    const blur = document.getElementById('filter-blur').value;
    const brightness = document.getElementById('filter-brightness').value;
    const grayscale = document.getElementById('filter-grayscale').value;
    
    const bgImg = document.getElementById('bg-img');
    if (bgImg) {
        bgImg.style.filter = `blur(${blur}px) brightness(${brightness}%) grayscale(${grayscale}%)`;
        window.debounceSave();
    }
}
