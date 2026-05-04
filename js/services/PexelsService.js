import { CONFIG } from '../config.js';

export class PexelsService {
    static async search(query, page = 1, perPage = 12) {
        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}&page=${page}`, {
                headers: { Authorization: CONFIG.PEXELS_KEY }
            });
            if (!response.ok) throw new Error("API Limit Reached");
            
            const data = await response.json();
            return data.photos; 
        } catch (error) {
            console.warn("Pexels failed, falling back to local URLs", error);
            // Simulate API structure with local fallbacks
            return CONFIG.FB_SAFER_URLS.map(url => ({ src: { medium: url, large2x: url } }));
        }
    }
}
