import { CONFIG } from '../config.js';

export class AIService {
    /**
     * Get the active API key — prefers localStorage key over config
     */
    static getKey() {
        return localStorage.getItem('qf_or_key') || CONFIG.OR_KEY || '';
    }

    static async generateCompletion(model, systemPrompt, userPrompt) {
        const key = this.getKey();

        // If no real key configured, throw so fallback triggers
        if (!key || key === 'YOUR_OPENROUTER_API_KEY') {
            throw new Error('No API key configured — using fallback');
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': location.href,
                'X-Title': 'QuickFare Studio'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `API error ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}
