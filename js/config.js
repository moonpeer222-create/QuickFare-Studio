// ==========================================
// SYSTEM CORE: Variables & API Keys
// ==========================================

// WARNING: In a production environment, these keys should NOT be exposed in client-side code.
// They should be fetched from a secure backend or injected via environment variables during a build process.
export const CONFIG = {
    CANVA_CLIENT_ID: 'OC-AZ3vyzIPn78C',
    PEXELS_KEY: 'c56L0l6NiI8lQhFccTdyyNwFg75mqhtaXKvWvimcSQVS00wqP1xdoftW',
    OR_KEY: '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',
    FALLBACK_URLS: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1080",
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1080"
    ],
    FB_SAFER_URLS: [
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1080",
        "https://images.unsplash.com/photo-1542404554-4638d15d6d84?q=80&w=1080",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1080"
    ],
    MAGIC_COLORS: ["#00F0FF", "#FF0050", "#39FF14", "#FFD700", "#FF7B00"],
    IMAGE_PILLARS: {
        finance:[
            { name: "Neon Stock Market", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1080&auto=format&fit=crop" },
            { name: "Gold Coins Vault", url: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=1080&auto=format&fit=crop" },
            { name: "Stressed Bills", url: "https://images.unsplash.com/photo-1541888073145-207019d08434?q=80&w=1080&auto=format&fit=crop" },
            { name: "Money Matrix", url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1080&auto=format&fit=crop" },
            { name: "Crypto Bitcoin", url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1080&auto=format&fit=crop" },
            { name: "Calculator Audit", url: "https://images.unsplash.com/photo-1554672408-730436b60dde?q=80&w=1080&auto=format&fit=crop" },
            { name: "Dark Wallet", url: "https://images.unsplash.com/photo-1628156108169-f815598fb28c?q=80&w=1080&auto=format&fit=crop" },
            { name: "Laptop Finance", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1080&auto=format&fit=crop" },
            { name: "Graph Arrow Down", url: "https://images.unsplash.com/photo-1612012871329-873fdb8c104e?q=80&w=1080&auto=format&fit=crop" },
            { name: "Luxury Cityscape", url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1080&auto=format&fit=crop" }
        ],
        tech:[
            { name: "Cyber Code Matrix", url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1080&auto=format&fit=crop" },
            { name: "AI Brain Node", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1080&auto=format&fit=crop" },
            { name: "Hacker Hood", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1080&auto=format&fit=crop" },
            { name: "Robot Hand AI", url: "https://images.unsplash.com/photo-1614064641936-3bce5c5928ea?q=80&w=1080&auto=format&fit=crop" },
            { name: "Server Room", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1080&auto=format&fit=crop" },
            { name: "Dark Laptop Code", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1080&auto=format&fit=crop" },
            { name: "Smartphone Glow", url: "https://images.unsplash.com/photo-1517677129300-07b130802f46?q=80&w=1080&auto=format&fit=crop" },
            { name: "Abstract Circuit", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1080&auto=format&fit=crop" },
            { name: "Voice UI Search", url: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1080&auto=format&fit=crop" },
            { name: "Tech Glasses", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1080&auto=format&fit=crop" }
        ],
        ecom:[
            { name: "Neon Shopping Cart", url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1080&auto=format&fit=crop" },
            { name: "Boxes Shipping", url: "https://images.unsplash.com/photo-1580828369019-2224b74aa8bd?q=80&w=1080&auto=format&fit=crop" },
            { name: "Phone Social Buy", url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1080&auto=format&fit=crop" },
            { name: "Stripe/Cards", url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1080&auto=format&fit=crop" },
            { name: "Retail Shelves Dark", url: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1080&auto=format&fit=crop" },
            { name: "Courier Delivery", url: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=1080&auto=format&fit=crop" },
            { name: "Shopify Laptop", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop" },
            { name: "Customer Service Bot", url: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1080&auto=format&fit=crop" },
            { name: "WhatsApp Icon Screen", url: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1080&auto=format&fit=crop" },
            { name: "Digital Marketing", url: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1080&auto=format&fit=crop" }
        ],
        fitness:[
            { name: "Green Salad Bowl", url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1080&auto=format&fit=crop" },
            { name: "Dark Gym Iron", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1080&auto=format&fit=crop" },
            { name: "Measuring Tape Diet", url: "https://images.unsplash.com/photo-1515023115689-589c33041d3c?q=80&w=1080&auto=format&fit=crop" },
            { name: "Healthy Ingredients", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1080&auto=format&fit=crop" },
            { name: "Belly Core Fit", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop" },
            { name: "Supplements/Pills", url: "https://images.unsplash.com/photo-1584308666744-24d5e4a87e5b?q=80&w=1080&auto=format&fit=crop" },
            { name: "Running Outdoors", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1080&auto=format&fit=crop" },
            { name: "Water Splash", url: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1080&auto=format&fit=crop" },
            { name: "Fruits Plate", url: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1080&auto=format&fit=crop" },
            { name: "Mindset Meditation", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1080&auto=format&fit=crop" }
        ],
        abstract:[
            { name: "Black & Neon Glow", url: "https://images.unsplash.com/photo-1618045952959-1582e219736e?q=80&w=1080&auto=format&fit=crop" },
            { name: "Red Warning Smoke", url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1080&auto=format&fit=crop" },
            { name: "Cyberpunk City", url: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1080&auto=format&fit=crop" },
            { name: "Islamic Gold Arch", url: "https://images.unsplash.com/photo-1542404554-4638d15d6d84?q=80&w=1080&auto=format&fit=crop" },
            { name: "Dark Fluid Waves", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1080&auto=format&fit=crop" },
            { name: "Mecca/Kaaba Digital", url: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1080&auto=format&fit=crop" },
            { name: "Neon Lines Speed", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop" },
            { name: "Danger Lock Alert", url: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=1080&auto=format&fit=crop" },
            { name: "Broken Glass", url: "https://images.unsplash.com/photo-1515255384510-23e8b6a6cb3c?q=80&w=1080&auto=format&fit=crop" },
            { name: "Luxury Marble Dark", url: "https://images.unsplash.com/photo-1501166222995-ff4cead2b11d?q=80&w=1080&auto=format&fit=crop" }
        ]
    }
};
