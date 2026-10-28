## Architecture technique

Budgie repose sur une architecture composée de plusieurs services Docker.

flowchart TB
    U["👤 Utilisateur<br/>Navigateur web"]
    DNS["🌐 DNS OVH<br/>monbudgie.fr"]

    U -.->|"1. Résolution du domaine"| DNS
    DNS -.->|"Adresse IP publique"| U

    subgraph VPS["☁️ VPS OVH — Debian 12"]
        NG["🔐 Nginx<br/>Reverse proxy<br/>HTTPS / Let's Encrypt"]

        subgraph DOCKER["🐳 Environnement Docker Compose"]
            FE["🖥️ Frontend<br/>Vue 3 + Vite + Pinia"]
            BE["⚙️ Backend<br/>Node.js + Express + TypeScript"]
            DB[("🗄️ PostgreSQL<br/>Base de données")]
        end

        NG -->|"Route frontend /"| FE
        NG -->|"Route API /api/"| BE
        BE <-->|"Requêtes SQL<br/>Réseau Docker interne"| DB
    end

    U <-->|"2. HTTPS — Port 443<br/>Pages et requêtes API"| NG

    classDef client fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    classDef proxy fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef front fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef back fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef data fill:#fee2e2,stroke:#dc2626,color:#7f1d1d

    class U,DNS client
    class NG proxy
    class FE front
    class BE back
    class DB data

le VPS héberge les services applicatifs, Nginx gère l'entrée HTTP(S), et PostgreSQL communique avec le backend sur le réseau interne