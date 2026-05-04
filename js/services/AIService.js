import { CONFIG } from '../config.js';

export class AIService {
    static async generateCompletion(model, systemPrompt, userPrompt) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${CONFIG.OR_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost",
                    "X-Title": "SaaS Studio"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });

            if (!response.ok) throw new Error("API limits or CORS blocked");
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("AI Service Error:", error);
            throw error;
        }
    }
}
