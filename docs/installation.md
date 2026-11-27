# Installation et environnement local — Budgie v2

Ce guide décrit les fichiers présents dans le dépôt. Le démarrage des services ne garantit pas encore un parcours utilisateur complet sur une base neuve : les routes de connexion et de profil interrogent `plans` et `subscriptions`, absentes de `db/init.sql`. Ce décalage de schéma doit être corrigé avant de valider l'authentification de bout en bout. Voir les [limites connues](known-limitations.md).

## Prérequis

- Git et Docker Engine ou Docker Desktop démarré.
- Docker Compose V2 prenant en charge `!reset`, également utilisé par la configuration de production.
- Ports hôte `8080`, `5001` et `5432` disponibles.
- Pour les vérifications hors conteneurs : Node.js **22.13 ou plus récent dans la branche 22**, avec npm, comme dans la CI. Le frontend déclare `^20.19.0 || >=22.12.0`, mais ESLint et jsdom exigent au moins 22.13 dans cette branche, et Vitest 5 ne prend pas en charge Node.js 20.

```bash
git --version
docker --version
docker compose version
```

Les deux Dockerfiles utilisent actuellement `node:20-alpine`, alors que GitHub Actions utilise Node.js 22. L'alignement de ces environnements reste à réaliser ; les commandes ci-dessous ne constituent pas une validation de leur compatibilité.

## 1. Récupérer le projet

```bash
git clone https://github.com/Maissane-abd/Budgie-typeScript.git
cd Budgie-typeScript
```

Toutes les commandes suivantes partent de la racine du dépôt.

## 2. Configurer l'environnement

Copier les modèles uniquement si les fichiers locaux n'existent pas encore :

```bash
cp -n .env.example .env
cp -n backend/.env.example backend/.env
```

Sous PowerShell :

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Renseigner `.env` avec des valeurs propres au poste :

```dotenv
PGUSER=budgie_local
PGPASSWORD=REMPLACER_PAR_UN_MOT_DE_PASSE_LOCAL
PGDATABASE=budgie_local
NODE_ENV=development
JWT_SECRET=REMPLACER_PAR_UN_SECRET_ALEATOIRE_LONG
JWT_EXPIRES_IN=1d
```

`compose.yml` transmet les mêmes identifiants au service PostgreSQL et au backend. Il fournit au backend `PGHOST=db` et `PGPORT=5432` : inutile de les ajouter au `.env` racine pour Docker.

Renseigner `backend/.env` :

```dotenv
PORT=5001
JWT_SECRET=REMPLACER_PAR_LE_MEME_SECRET_ALEATOIRE_LONG
JWT_EXPIRES_IN=1d
```

Dans Docker, `JWT_SECRET` défini par `environment` dans Compose prend le pas sur celui d'`env_file`. Garder les deux valeurs identiques facilite aussi un lancement du backend sur l'hôte. `NODE_ENV` du `.env` racine n'est pas automatiquement injecté dans le backend local ; le définir dans `backend/.env` si nécessaire.

La durée du JWT est actuellement fixée à `1d` dans `backend/src/routes/auth.ts`. Modifier `JWT_EXPIRES_IN` ne change pas cette durée.

Le troisième modèle, [frontend/app/.env.example](../frontend/app/.env.example), concerne `VITE_API_BASE`. Le frontend utilise `/api` par défaut, ce qui convient à Nginx local : aucun `.env` frontend n'est nécessaire pour ce parcours. Cette variable est intégrée au moment du build Vite ; elle doit rester publique et ne doit contenir aucun secret. Stripe n'est pas requis pour démarrer Budgie.

## 3. Préparer la construction locale

Deux points du Compose actuel nécessitent une adaptation sur un clone propre :

1. Les fichiers suivis par Git s'appellent `backend/dockerfile` et `frontend/dockerfile`, en minuscules. Compose attend `Dockerfile` pour le backend et référence explicitement `frontend/Dockerfile`. Ces chemins ne correspondent pas sur un système sensible à la casse.
2. Le montage `./backend:/app` masque le `dist/` compilé dans l'image. Sans compilation préalable sur l'hôte, `npm start` ne trouve pas `dist/app.js`.

Pour un démarrage local depuis les images compilées, créer un fichier **local** `compose.local.yml` avec le contenu suivant :

```yaml
services:
  backend:
    build:
      dockerfile: dockerfile
    volumes: !reset []
  frontend:
    build:
      dockerfile: frontend/dockerfile
```

Cette surcharge conserve les contextes de build, les ports et la configuration Nginx locale de `compose.yml`. Elle retire le montage du code backend : toute modification du code nécessite donc une reconstruction. Ce fichier de dépannage n'est pas fourni par le dépôt et n'est pas une correction de la configuration de production.

## 4. Construire et démarrer

Valider la configuration sans afficher les secrets, puis démarrer :

```bash
docker compose -f compose.yml -f compose.local.yml config --quiet
docker compose -f compose.yml -f compose.local.yml up -d --build
docker compose -f compose.yml -f compose.local.yml ps
```

Pour le diagnostic :

```bash
docker compose -f compose.yml -f compose.local.yml logs --tail=100 db backend frontend
```

Le `depends_on` local impose un ordre de démarrage, sans attendre que PostgreSQL accepte les connexions. Si une requête échoue pendant son initialisation, attendre que la base soit prête et réessayer ; redémarrer le backend si nécessaire.

## 5. Accéder aux services

| Service                 | Adresse ou accès                                       | Vérification                               |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Interface Vue via Nginx | <http://localhost:8080>                                | Accueil public et pages légales.           |
| API via Nginx           | <http://localhost:8080/api/auth/me>                    | HTTP `401` sans JWT.                       |
| Backend direct          | <http://localhost:5001/health>                         | HTTP `200`, corps `OK`.                    |
| PostgreSQL              | `localhost:5432` depuis l'hôte ; `db:5432` dans Docker | Connexion avec les valeurs `PG*` choisies. |

```bash
curl -i http://localhost:5001/health
curl -i http://localhost:8080/api/auth/me
```

Pour l'exemple `PGUSER=budgie_local`, `PGDATABASE=budgie_local` :

```bash
docker compose -f compose.yml -f compose.local.yml exec db pg_isready -U budgie_local -d budgie_local
docker compose -f compose.yml -f compose.local.yml exec db psql -U budgie_local -d budgie_local -c '\dt'
```

Adapter ces deux valeurs si elles diffèrent dans `.env`. Les endpoints `/health` vérifient la réponse HTTP du processus, sans tester une requête PostgreSQL. Une réponse `200` ne résout pas le décalage de schéma mentionné en début de guide.

## 6. Installer les outils et vérifier le code

Les trois projets npm possèdent leur propre fichier de verrouillage ; la racine n'est pas un workspace npm qui installerait les dépendances des deux applications.

```bash
npm ci
npm --prefix backend ci
npm --prefix frontend/app ci
npm run lint
npm --prefix backend run typecheck
npm --prefix frontend/app run typecheck
npm test
npm run build
npm --prefix frontend/app run verify:public
```

Sous PowerShell, utiliser `npm.cmd` à la place de `npm` si la politique d'exécution bloque `npm.ps1`. Les tests Vitest se lancent localement avec `npm test` ; le workflow CI/CD actuel ne les exécute pas.

Le build frontend exécute `vue-tsc`, Vite puis le pré-rendu de l'accueil et des trois pages légales. `verify:public` contrôle le HTML produit dans `frontend/app/dist` et doit donc suivre le build.

Pour travailler sur les services séparément, les scripts existent :

```bash
npm --prefix backend run dev
npm --prefix frontend/app run dev
```

Avant de les utiliser, configurer les variables `PG*` du backend pour une base accessible depuis l'hôte (`PGHOST=localhost` pour le PostgreSQL exposé par Docker), arrêter le backend Docker qui occupe le port `5001`, et adapter le routage des appels API. Le serveur Vite ne configure aucun proxy `/api`, et la liste CORS actuelle ne permet pas un accès direct habituel depuis `http://localhost:5173` : ces deux scripts seuls ne constituent pas un lancement complet de l'application.

## 7. Arrêt et conservation des données

```bash
docker compose -f compose.yml -f compose.local.yml down
```

Le volume nommé `db_data` conserve PostgreSQL après cet arrêt. L'option `down -v` supprime les volumes et leurs données.

[db/init.sql](../db/init.sql) s'exécute uniquement lors de la première initialisation du répertoire de données PostgreSQL. Relancer les conteneurs, modifier ce script ou changer les identifiants du `.env` ne met pas à jour une base déjà créée. Le dépôt ne fournit pas encore de migrations versionnées pour réconcilier un schéma existant. Ne pas supprimer un volume pour corriger un problème de schéma sans sauvegarder les données à conserver.

`db/seed.sql` n'est pas monté par défaut : sa ligne est commentée dans Compose.

## Dépannage

| Symptôme                                               | Vérification                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Port déjà utilisé                                      | Vérifier `8080`, `5001`, `5432` et arrêter le service local concurrent ou adapter le port hôte.               |
| Fichier Dockerfile introuvable                         | Utiliser la surcharge de l'étape 3 ; vérifier la casse des chemins suivis par Git.                            |
| `Cannot find module ... dist/app.js`                   | Le montage backend masque le résultat de compilation ; utiliser la surcharge ou compiler sur l'hôte.          |
| `JWT_SECRET n'est pas défini`                          | Renseigner le `.env` racine et `backend/.env` avant de créer les conteneurs.                                  |
| Authentification PostgreSQL refusée                    | Vérifier les identifiants et ceux ayant initialisé le volume existant.                                        |
| `relation "plans"` ou `"subscriptions" does not exist` | Décalage connu entre l'authentification et `db/init.sql` ; un redémarrage ne crée pas les tables manquantes.  |
| `401 Unauthorized`                                     | Un endpoint protégé exige `Authorization: Bearer <token>` ; le JWT expire après un jour.                      |
| API inaccessible via Vite                              | Aucun proxy `/api` n'est configuré ; les origines CORS doivent également être corrigées pour un accès direct. |

## Production et CI/CD

Le lancement local ci-dessus utilise uniquement `compose.yml` et sa surcharge locale. Le fichier `compose.production.yml` est une surcharge du Compose principal, liée au domaine `monbudgie.fr` et aux certificats du serveur : il n'est pas autonome.

Le workflow [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) :

- vérifie les PR vers `main` et `dev`, les push vers `main` et les déclenchements manuels ;
- installe les dépendances avec `npm ci` sous Node.js 22 ;
- lance lint, typecheck et build backend, puis lint, build et contrôle du HTML public frontend ;
- déploie après succès des deux jobs, uniquement pour `main` hors événement de PR ;
- se connecte par SSH avec contrôle de la clé d'hôte, refuse les modifications locales suivies par Git et sélectionne le SHA ayant déclenché le workflow ;
- valide Compose, reconstruit les services avec `up -d --build --wait`, puis contrôle la page d'accueil HTTPS.

Le déploiement attend le dépôt dans `/home/debian/Budgie-typeScript`, les fichiers d'environnement sur le VPS et les secrets GitHub `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS` et `VPS_HOST`. Les commandes exécutées sur le serveur combinent `-f compose.yml -f compose.production.yml`.

Points à vérifier avant une nouvelle livraison :

- La casse des Dockerfiles reste incohérente dans la configuration versionnée ; la surcharge locale ne s'applique pas au workflow de production.
- Les sondes de production utilisent `curl`, sans installation explicite dans les Dockerfiles ; la sonde frontend vise `https://localhost` alors que le certificat configuré concerne `monbudgie.fr`.
- Le port HTTP hérité reste `8080:80`, avec ajout de `443:443` en production. Le Compose ne publie pas `80:80` ; une exposition externe du port 80 et le renouvellement des certificats doivent être vérifiés côté infrastructure.
- Aucun test Vitest, test fonctionnel complet, migration, sauvegarde ou retour arrière automatique n'est exécuté par ce workflow.

Ces vérifications décrivent le dépôt ; elles ne valident pas l'état réel du VPS. Les conteneurs n'ont pas été démarrés pour cette mise à jour documentaire.

## Références

[README](../README.md) · [Architecture](architecture.md) · [Compose local](../compose.yml) · [Surcharge production](../compose.production.yml) · [Nginx local](../nginx/default.dev.conf) · [Nginx production](../nginx/default.conf)
