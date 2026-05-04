/**
 * CampaignController.js - Business Logic for AI Campaigns
 * Orchestrates AI calls, parsing, and canvas application.
 */
import appState from './appState.js';
import canvasManager from './CanvasManager.js';
import { AIService } from './services/AIService.js';
import { PexelsService } from './services/PexelsService.js';
import { showToast } from './ui.js';

class CampaignController {
    constructor() {
        this.currentCampaign = null;
    }

    /**
     * Trigger a new AI marketing campaign generation
     * @param {string} topic 
     */
    async generateCampaign(topic) {
        if (!topic) {
            showToast("Provide a topic segment", true);
            return;
        }

        showToast("AI Neural Integration Initiated...");
        
        const systemPrompt = `Produce elite marketing copy formatted as HTML. 
        Include: 
        1. A viral hook (h4 + p#ai-hook)
        2. Ad framework (h4 + p#ai-frame)
        3. Visual descriptors for background (p#visual-node)`;

        try {
            const response = await AIService.generateCompletion(
                "meta-llama/llama-3-8b-instruct:free", 
                systemPrompt, 
                `Generate campaign for: ${topic}`
            );

            this.processResponse(response);
            showToast("AI Strategy Accepted");
        } catch (err) {
            console.warn("AI Primary Link Failed. Using Fallback Strategy.");
            this.handleFallback(topic);
        }
    }

    /**
     * Parse and handle AI response
     */
    processResponse(rawHtml) {
        const div = document.createElement('div');
        div.innerHTML = rawHtml;

        const hook = div.querySelector('#ai-hook')?.innerText || "ELITE MARKETING HOOK";
        const frame = div.querySelector('#ai-frame')?.innerText || "Strategic Framework Content";
        const visualQuery = div.querySelector('#visual-node')?.innerText || "Abstract dark business";

        this.currentCampaign = { hook, frame, visualQuery };
        
        // Auto-fetch visual
        this.syncVisuals(visualQuery);
        
        // Update results UI if it exists
        const resultsBox = document.getElementById('ai-results');
        if (resultsBox) {
            resultsBox.innerHTML = rawHtml + `<button class="btn btn-magic" style="width:100%; margin-top:15px;" id="btn-apply-campaign"><i class="fas fa-plus-circle"></i> APPLY TO CANVAS</button>`;
            document.getElementById('btn-apply-campaign').onclick = () => this.applyToCanvas();
        }
    }

    /**
     * Apply the current campaign data to the canvas
     */
    applyToCanvas() {
        if (!this.currentCampaign) return;

        canvasManager.addText({
            text: this.currentCampaign.hook.toUpperCase(),
            top: "300px",
            fontSize: "100px",
            fontFamily: "Anton"
        });

        canvasManager.addCard({
            content: this.currentCampaign.frame,
            top: "600px"
        });

        showToast("Campaign Synced to Canvas");
    }

    /**
     * Synchronize visuals based on query
     */
    async syncVisuals(query) {
        try {
            const photos = await PexelsService.search(query, 1, 1);
            if (photos && photos.length > 0) {
                canvasManager.setBackground(photos[0].src.large2x);
            }
        } catch (e) {
            console.error("Visual sync failed", e);
        }
    }

    /**
     * Magic Auto Create logic
     */
    magicAutoCreate() {
        const topic = document.getElementById('magic-topic').value || "Default Launch";
        showToast("Generating Magic Canvas...");
        canvasManager.clearAll();
        canvasManager.addText({ text: topic.toUpperCase(), top: "150px" });
        canvasManager.addCard({ content: "AI Generated Framework Content...", top: "800px" });
        this.syncVisuals(topic + " dark");
    }

    /**
     * Fallback logic when AI is unavailable
     */
    handleFallback(topic) {
        const mockData = {
            hook: `REVOLUTIONIZING ${topic.toUpperCase()} FOREVER`,
            frame: "Problem Map: Traditional methods are failing. Solution Roadmap: Deploy the QuickFare sequence immediately.",
            visualQuery: topic + " dark"
        };

        this.currentCampaign = mockData;
        this.processResponse(`
            <div class="fallback-banner">PROXY FALLBACK LAUNCHED</div>
            <h4>🔥 VIRAL TRIGGER HOOK</h4><p id="ai-hook">${mockData.hook}</p>
            <h4>🧠 DIRECT AD FRAMEWORK</h4><p id="ai-frame">${mockData.frame}</p>
        `);
    }
}

const campaignController = new CampaignController();
export default campaignController;
window.campaignController = campaignController;
