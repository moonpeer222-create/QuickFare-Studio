# QuickFare Studio Migration Guide

Follow these phases to upgrade your codebase to the new refactored architecture.

## Phase 1: Setup (30 min)
1. Copy the new files into your `js/` directory:
   - `appState.js`
   - `CanvasManager.js`
   - `CampaignController.js`
   - `ui.js` (Overwrite existing)
2. Ensure `services/AIService.js` and `services/PexelsService.js` are present.

## Phase 2: Update index.html (1-2 hours)
1. Change your main script imports to `type="module"`:
   ```html
   <script type="module" src="js/appState.js"></script>
   <script type="module" src="js/CanvasManager.js"></script>
   <script type="module" src="js/CampaignController.js"></script>
   ```
2. Remove old script tags for `canvas.js`, `state.js`, and `api.js` (once fully migrated).

## Phase 3: Update Event Handlers
The new architecture uses module-based calls. Update your HTML buttons:

### Canvas Operations
- **Before**: `onclick="window.clearCanvasElements()"`
- **After**: `onclick="canvasManager.clearAll()"`

- **Before**: `onclick="window.addElement('text')"`
- **After**: `onclick="canvasManager.addText()"`

### Campaign Logic
- **Before**: `onclick="window.triggerAICampaign()"`
- **After**: `onclick="campaignController.generateCampaign(document.getElementById('topic').value)"`

## Phase 4: State Management
The app now auto-saves. You no longer need to call `saveState()` manually after every small change, as `CanvasManager` handles it.

To debug state, use:
```javascript
console.log(appState.getSnapshot());
```

## Phase 5: Testing
1. Test element creation (Text, Image, Card).
2. Test undo/redo via `appState.undo()` and `appState.redo()`.
3. Verify the export works using `canvasManager.downloadAsImage()`.
