# Diagramme d'architecture — Budgie v2

État des configurations du dépôt au 26 novembre 2026. Ce diagramme décrit les
trois services Compose ; il ne certifie pas l'état du VPS déployé.

```mermaid
flowchart TB
    Browser["Navigateur web<br/>Vue 3 / TypeScript / Pinia / Vue Router"]

    subgraph Compose["Docker Compose : local ou VPS de production"]
        subgraph Frontend["Service frontend"]
            Nginx["Nginx<br/>Fichiers statiques et reverse proxy"]
            Static["Build Vite et pré-rendu<br/>Accueil et trois pages légales<br/>app.html et assets de l'application"]
            Static -->|"Fichiers servis"| Nginx
        end

        Backend["Service backend<br/>Node.js / Express 5 / TypeScript<br/>Authentification JWT et prévisions"]
        Database[("Service db<br/>PostgreSQL 15")]
        Data[("Volume nommé db_data")]
        Init["db/init.sql"]
        Certificates["Certificats Let's Encrypt du serveur<br/>Production uniquement"]

        Nginx -->|"/api vers http://backend:5001"| Backend
        Backend -->|"Pool pg / SQL paramétré vers db:5432"| Database
        Database ---|"Persistance"| Data
        Init -.->|"Initialisation d'un volume vide"| Database
        Certificates -.->|"Montage en lecture seule"| Nginx
    end

    Browser -->|"HTTP local :8080 / HTTPS production :443"| Nginx
    Nginx -->|"HTML / JavaScript / CSS / réponses API"| Browser

    classDef client fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    classDef front fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef back fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef data fill:#fee2e2,stroke:#dc2626,color:#7f1d1d

    class Browser client
    class Nginx,Static front
    class Backend back
    class Database,Data data
```

Vue s'exécute dans le navigateur. Nginx appartient au conteneur `frontend` et sert
les fichiers générés pendant le build ; aucun serveur Vite ou de rendu Vue à la
demande n'est lancé en production. Les appels `/api` sont transmis au backend,
qui est le seul composant applicatif à accéder à PostgreSQL.

| Configuration                                         | Ports publiés sur l'hôte                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Locale : `compose.yml`                                | Frontend `8080:80`, backend `5001:5001`, PostgreSQL `5432:5432`.                                     |
| Production : `compose.yml` + `compose.production.yml` | Frontend `443:443` et `8080:80` hérité ; ports backend et PostgreSQL retirés. Aucun `80:80` déclaré. |

Le diagramme présente le routage prévu. Les écarts de casse des Dockerfiles, les
sondes de santé et les références d'authentification aux tables manquantes restent
suivis dans les [limites connues](known-limitations.md).

Sources : [Compose local](../compose.yml), [surcharge production](../compose.production.yml),
[Dockerfile frontend](../frontend/dockerfile), [Nginx local](../nginx/default.dev.conf)
et [Nginx production](../nginx/default.conf).

[Architecture détaillée](architecture.md) · [Installation](installation.md) · [README](../README.md)
