import { CONFIG } from '../config.js';

export class CanvaService {
    static generateRandomString(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';
        const values = new Uint8Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) result += charset[values[i] % charset.length];
        return result;
    }

    static async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    static async startAuth() {
        const codeVerifier = this.generateRandomString(96);
        localStorage.setItem('CANVA_CODE_VERIFIER', codeVerifier);
        
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        const clientId = CONFIG.CANVA_CLIENT_ID;
        const scope = "brandtemplate:content:write brandtemplate:content:read comment:read folder:permission:write design:content:read asset:read asset:write design:permission:read design:permission:write comment:write app:read folder:permission:read folder:write design:meta:read app:write design:content:write folder:read brandtemplate:meta:read";
        
        const authUrl = `https://www.canva.com/api/oauth/authorize?code_challenge_method=s256&response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&code_challenge=${codeChallenge}`;
        
        window.location.href = authUrl;
    }

    static async exchangeToken(code, redirectUri) {
        const codeVerifier = localStorage.getItem('CANVA_CODE_VERIFIER');
        const clientId = CONFIG.CANVA_CLIENT_ID;

        const tokenParams = new URLSearchParams();
        tokenParams.append('grant_type', 'authorization_code');
        tokenParams.append('code_verifier', codeVerifier);
        tokenParams.append('code', code);
        tokenParams.append('client_id', clientId);
        tokenParams.append('redirect_uri', redirectUri);

        const response = await fetch('https://api.canva.com/rest/v1/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams
        });

        if (!response.ok) throw new Error("Token exchange failed");
        return await response.json();
    }

    static async uploadAsset(blob, token) {
        const formData = new FormData();
        formData.append("file", blob, "quickfare_studio_export.png");
        
        // Mock the API delay
        await new Promise(r => setTimeout(r, 2000));
        
        /* REAL IMPLEMENTATION COMMENT:
        const response = await fetch("https://api.canva.com/rest/v1/asset-uploads", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token },
            body: formData
        });
        if(!response.ok) throw new Error("Canva API Auth Failed");
        */
        
        return true;
    }
}
