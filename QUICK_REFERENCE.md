# QuickFare Studio: Quick Reference Guide

Comparison between the legacy API and the new Modular API.

## 1. Canvas Operations

| Action | Legacy (Global) | New (Module) |
| :--- | :--- | :--- |
| **Add Text** | `window.addTextObj(html, tp, lft, ...)` | `canvasManager.addText({ text: 'Hello', top: '100px' })` |
| **Add Card** | `window.addCardObj(html, tp, lft, ...)` | `canvasManager.addCard({ content: 'Info', left: '50px' })` |
| **Add Image** | `window.addImage(url, tp, lft, ...)` | `canvasManager.addImage(url, { width: '200px' })` |
| **Clear All** | `window.clearCanvasElements()` | `canvasManager.clearAll()` |
| **Set BG** | `window.bg(url)` | `canvasManager.setBackground(url)` |

## 2. State & History

| Action | Legacy | New |
| :--- | :--- | :--- |
| **Undo** | `window.undo()` | `appState.undo()` |
| **Redo** | `window.redo()` | `appState.redo()` |
| **Save State** | `saveState()` | `appState.setState({}, true)` (Auto-handled) |
| **Access State** | `window.elCount`, `window.mxZ` | `appState.state.canvas.elementCount` |

## 3. Business Logic (AI)

| Action | Legacy | New |
| :--- | :--- | :--- |
| **Generate** | `window.triggerAICampaign()` | `campaignController.generateCampaign(topic)` |
| **Apply** | `window.applyAIResultsToCanvas()` | `campaignController.applyToCanvas()` |

## 4. UI Utilities

| Action | Legacy | New |
| :--- | :--- | :--- |
| **Toast** | `showToast(msg)` | `ui.showToast(msg)` |
| **Modal** | (Manual DOM injection) | `ui.showModal(title, content, actions)` |
| **Debounce** | (Not standardized) | `ui.debounce(fn, delay)` |

---

## Example: Creating a Text Element
```javascript
// OLD
window.addTextObj("QUICKFARE", "100px", "50px", "800px", "120px", "Anton", "#FF0050");

// NEW
canvasManager.addText({
    text: "QUICKFARE",
    top: "100px",
    left: "50px",
    fontSize: "120px",
    fontFamily: "Anton",
    color: "#FF0050"
});
```
