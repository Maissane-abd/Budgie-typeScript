# Installation et environnement local — Budgie V1

## Sommaire

1. [Objectif](#1-objectif)
2. [Prérequis](#2-prérequis)
3. [Récupérer le projet](#3-récupérer-le-projet)
4. [Configurer les variables d'environnement](#4-configurer-les-variables-denvironnement)
5. [Démarrer Budgie avec Docker Compose](#5-démarrer-budgie-avec-docker-compose)
6. [Accéder aux services et vérifier l'installation](#6-accéder-aux-services-et-vérifier-linstallation)
7. [Commandes utiles](#7-commandes-utiles)
8. [Initialisation et conservation des données](#8-initialisation-et-conservation-des-données)
9. [Problèmes courants](#9-problèmes-courants)
10. [Bonnes pratiques de sécurité](#10-bonnes-pratiques-de-sécurité)
11. [Points restant à vérifier](#11-points-restant-à-vérifier)

## 1. Objectif

Ce guide explique comment récupérer et démarrer **Budgie V1** sur un poste de développement, sans utiliser le VPS OVH ni les certificats HTTPS de production.

L'application utilise trois services déclarés dans [`compose.yml`](../compose.yml) :

| Service Docker | Rôle | Port publié en local |
|---|---|---|
| `db` | PostgreSQL 15 et données financières | `5432` |
| `backend` | API REST Express / TypeScript | `5001` |
| `frontend` | Application Vue distribuée par Nginx | `80` |

Le service `backend` communique avec PostgreSQL via le nom de service Docker `db`. La configuration locale **ne doit pas** utiliser le fichier [`compose.production.yml`](../compose.production.yml), qui est adapté au serveur OVH, au domaine `monbudgie.fr` et à ses certificats TLS.

## 2. Prérequis

Installer sur son ordinateur :

- **Git**, pour cloner le dépôt.
- **Docker Engine** ou **Docker Desktop** (avec Docker Compose V2), pour construire et lancer les services.
- Un éditeur de code, par exemple VS Code.
- Une connexion Internet pour récupérer les images et dépendances lors du premier démarrage.

Sur Windows, utiliser de préférence **Docker Desktop avec WSL 2**.

Vérifier les installations dans un terminal :

```bash
git --version
docker --version
docker compose version
```

S'assurer que Docker Desktop / Docker Engine est effectivement démarré avant de poursuivre. Les ports **80**, **5001** et **5432** doivent être disponibles sur le poste, car `compose.yml` les publie.

> **Node.js et npm :** non indispensables si toute la pile est lancée avec Docker. Ils deviennent nécessaires pour exécuter les scripts du frontend ou du backend directement sur l'hôte. Le backend contient notamment `npm run dev`, `npm run typecheck` et `npm run build` ; la version Node.js compatible doit alors être vérifiée dans ses fichiers de configuration.

## 3. Récupérer le projet

Ouvrir un terminal puis exécuter :

```bash
git clone https://github.com/Maissane-abd/Budgie-typeScript.git
cd Budgie-typeScript
```

Les commandes suivantes doivent être exécutées **à la racine du dépôt**, là où se trouve `compose.yml`.

## 4. Configurer les variables d'environnement

### 4.1. Deux modèles existent déjà

Le dépôt possède **deux fichiers `.env.example`** :

| Fichier existant | Utilisation |
|---|---|
| [`.env.example`](../.env.example) | Variables partagées et substitution `${...}` dans Docker Compose : PostgreSQL, `JWT_SECRET`, etc. |
| [`backend/.env.example`](../backend/.env.example) | Variables spécifiques au serveur Express : `PORT`, `JWT_SECRET` et `JWT_EXPIRES_IN`. |

Il **n'est pas nécessaire d'en créer un nouveau** pour suivre ce guide.

Depuis la racine du projet, créer les copies locales :

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Équivalent **PowerShell (Windows)** :

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

Ne jamais committer les fichiers `.env` contenant des secrets. Le fichier `.gitignore` du dépôt ignore déjà les fichiers nommés `.env`.

### 4.2. Configuration du fichier `.env` à la racine

Renseigner dans **`Budgie-typeScript/.env`** les valeurs de développement **correspondant exactement aux paramètres actuels du service `db` dans `compose.yml`** :

```dotenv
# PostgreSQL local — valeurs de démonstration présentes dans compose.yml
PGHOST=db
PGUSER=budgie
PGPASSWORD=budgie_password
PGDATABASE=budgie_db
PGPORT=5432

NODE_ENV=development

# Remplacer cette valeur par une vraie clé aléatoire longue, propre au poste
JWT_SECRET=REMPLACER_PAR_UN_SECRET_ALEATOIRE_LOCAL

# Variable présente dans l'exemple, mais non consommée actuellement
# par la création du JWT (voir remarque ci-dessous).
JWT_EXPIRES_IN=1d

# Stripe : non requis pour utiliser les fonctionnalités V1 en local.
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=
# STRIPE_WEBHOOK_SECRET=
```

**Pourquoi ces identifiants PostgreSQL ?** Dans la configuration locale actuelle, le service `db` définit directement `POSTGRES_USER=budgie`, `POSTGRES_PASSWORD=budgie_password` et `POSTGRES_DB=budgie_db`. Les valeurs `PGUSER`, `PGPASSWORD` et `PGDATABASE` transmises au backend doivent être identiques ; sinon PostgreSQL rejettera la connexion.

Ces identifiants ne sont qu'une configuration de **développement local**, déjà inscrite dans le Compose public. **Ne pas les réutiliser en production.** Une amélioration ultérieure consistera à paramétrer également le service `db` à partir des variables d'environnement pour éliminer les identifiants codés en dur.

### 4.3. Configuration de `backend/.env`

Renseigner **`Budgie-typeScript/backend/.env`** :

```dotenv
PORT=5001
JWT_SECRET=REMPLACER_PAR_LE_MEME_SECRET_ALEATOIRE_LOCAL
JWT_EXPIRES_IN=1d
```

Pour éviter toute confusion, conserver la même valeur de `JWT_SECRET` dans les deux fichiers locaux. **En exécution Docker Compose, la valeur du `.env` racine est prioritaire**, car `compose.yml` définit explicitement `JWT_SECRET: ${JWT_SECRET}` dans la section `environment` du backend, en plus de son `env_file`.

La connexion PostgreSQL du backend est également fournie explicitement par `compose.yml`. Il n'est donc pas nécessaire de répliquer les variables `PG*` dans `backend/.env` pour cette méthode de démarrage.

> **Important — `JWT_EXPIRES_IN` :** la variable apparaît dans les deux fichiers exemples, mais dans [`backend/src/routes/auth.ts`](../backend/src/routes/auth.ts), la génération du JWT utilise actuellement une durée codée en dur (`expiresIn: "1d"`). Modifier cette variable ne modifie donc pas encore la durée des jetons : il faudra adapter le code si cette configuration doit devenir effective.

### 4.4. Variable frontend à surveiller

Le frontend a déjà rencontré un problème lié à `VITE_API_BASE` lors de la mise en production. Cette variable ne figure pas dans les **deux** modèles `.env.example` identifiés ci-dessus.

Ne pas ajouter aveuglément une variable supplémentaire : vérifier dans les sources frontend et dans ses fichiers de compilation si l'URL de l'API est codée, possède une valeur par défaut, ou doit être injectée lors du build. Pour un accès via le même domaine que Nginx, la base d'API attendue est généralement **`/api`** ; il faut néanmoins vérifier les appels réels et éviter un chemin `/api//...`.

## 5. Démarrer Budgie avec Docker Compose

Toujours depuis la racine du dépôt :

### 5.1. Examiner la configuration finale

```bash
docker compose config --services
```

Résultat attendu (noms des services) :

```text
db
backend
frontend
```

Les éventuels messages signalant une variable non renseignée doivent être corrigés **avant le lancement**. Ne pas partager la sortie complète de `docker compose config` sans masquer les secrets : elle peut afficher des valeurs sensibles.

### 5.2. Construire et démarrer les services

```bash
docker compose up --build -d
```

Cette commande demande à Docker Compose de construire les images nécessaires, démarrer PostgreSQL, puis le backend et le frontend, en arrière-plan.

**Attention :** ce démarrage suppose que les fichiers Dockerfile référencés dans le dépôt sont disponibles localement. Voir [Points restant à vérifier](#11-points-restant-à-vérifier) si la construction échoue.

### 5.3. Vérifier l'état

```bash
docker compose ps
```

Examiner ensuite les journaux des services si nécessaire :

```bash
docker compose logs --tail=100 db
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

Le `depends_on` du Compose local définit un **ordre de démarrage**, mais ne garantit pas à lui seul que PostgreSQL accepte déjà les connexions lorsque le backend démarre. Si le backend affiche une erreur de connexion pendant l'initialisation, vérifier que `db` est prêt et redémarrer le backend au besoin :

```bash
docker compose restart backend
```

## 6. Accéder aux services et vérifier l'installation

Si la construction et le démarrage ont réussi :

| Service | Adresse locale | Résultat attendu |
|---|---|---|
| Interface Vue | <http://localhost> | Page d'accueil Budgie |
| Backend Express | <http://localhost:5001/> | `Hello World from backend!` |
| API, via Nginx | <http://localhost/api/auth/me> | Réponse JSON `401` sans JWT (route protégée) |
| PostgreSQL | Service Docker `db` (port publié `5432`) | Base disponible |

Pour tester le backend avec `curl` :

```bash
curl -i http://localhost:5001/
```

Pour interroger PostgreSQL **sans installer `psql` sur le poste**, lancer :

```bash
docker compose exec db pg_isready -U budgie -d budgie_db
docker compose exec db psql -U budgie -d budgie_db -c '\dt'
```

La seconde commande doit lister les tables créées au premier démarrage par `db/init.sql` (si l'initialisation de la base a réussi).

**Validation fonctionnelle manuelle :** ouvrir l'interface, créer un compte local de test, se connecter, créer un compte financier puis vérifier qu'il apparaît après un rafraîchissement de la page. Ne pas utiliser de données financières personnelles réelles pour ces tests.

## 7. Commandes utiles

| Besoin | Commande à lancer à la racine |
|---|---|
| Voir les conteneurs | `docker compose ps` |
| Démarrer | `docker compose up -d` |
| Reconstruire après modification | `docker compose up --build -d` |
| Afficher les logs | `docker compose logs -f --tail=100` |
| Logs backend uniquement | `docker compose logs -f backend` |
| Redémarrer le backend | `docker compose restart backend` |
| Arrêter sans supprimer les données | `docker compose down` |
| Voir les volumes Docker | `docker volume ls` |

**Ne pas exécuter `docker compose down -v` par habitude : cette option supprime aussi les volumes de la pile et donc les données PostgreSQL locales.**

## 8. Initialisation et conservation des données

Le fichier [`db/init.sql`](../db/init.sql) est monté dans `/docker-entrypoint-initdb.d/init.sql` et exécuté par l'image PostgreSQL officielle **uniquement lorsque son répertoire de données est initialisé pour la première fois**.

Le volume nommé `db_data` permet de conserver les données après un arrêt simple des conteneurs.

Conséquences pratiques :

- Un `docker compose down` normal **préserve** le volume de données.
- Relancer `docker compose up -d` **ne rejoue pas** automatiquement `db/init.sql` sur une base déjà initialisée.
- Modifier `db/init.sql` **ne met pas automatiquement à jour** un schéma existant.
- Pour les évolutions futures du schéma, prévoir des migrations SQL versionnées plutôt qu'une suppression du volume.

En cas de réinitialisation **volontaire et destructive** d'un environnement de test uniquement, sauvegarder au préalable toute donnée importante avant d'envisager de supprimer le volume. **Ne jamais appliquer cette opération à une base de production.**

## 9. Problèmes courants

### Docker ne démarre pas

Vérifier que Docker Desktop ou le démon Docker fonctionne :

```bash
docker info
```

Sur Windows, vérifier également le fonctionnement de WSL 2.

### Un port est déjà utilisé

Les ports `80`, `5001` et `5432` sont publiés par `compose.yml`. Un serveur web local, une API ou PostgreSQL déjà lancé sur l'hôte peut empêcher le démarrage. Identifier le service occupant le port puis l'arrêter ou, pour un besoin local particulier, adapter **les ports côté hôte** dans `compose.yml`.

### `env file ./backend/.env not found`

Revenir à l'étape 4 et créer `backend/.env` à partir de `backend/.env.example`.

### `JWT_SECRET n'est pas défini`

Vérifier que `JWT_SECRET` a bien une valeur non vide dans le `.env` racine et que l'environnement final du backend la reçoit. Ne pas publier le secret dans une issue ou une capture d'écran.

### Connexion PostgreSQL refusée / `password authentication failed`

Comparer les identifiants `PGUSER`, `PGPASSWORD` et `PGDATABASE` du fichier `.env` avec `POSTGRES_USER`, `POSTGRES_PASSWORD` et `POSTGRES_DB` de `compose.yml`. Vérifier également que l'hôte configuré **dans Docker** est `db` (et non `localhost`).

Si le volume PostgreSQL existait déjà avec d'autres identifiants, changer les variables ne recrée **pas** automatiquement l'utilisateur ou le mot de passe dans la base existante.

### `relation ... does not exist`

Vérifier les messages de démarrage du service `db` et le résultat de la commande `psql -c '\dt'`. Le script `db/init.sql` peut ne pas s'être exécuté sur un volume préexistant, ou l'initialisation peut avoir échoué.

### `401 Unauthorized`

Une route protégée nécessite un jeton valide transmis sous la forme `Authorization: Bearer <token>`. Vérifier la connexion utilisateur et la présence de l'en-tête HTTP. Le jeton actuel expire au bout d'un jour.

### Erreur 404 / API inaccessible depuis le frontend

Vérifier le routage Nginx, le bon démarrage du backend et l'URL construite côté frontend (notamment `VITE_API_BASE`, si utilisée). En production, Nginx transmet les chemins commençant par `/api` à `http://backend:5001` ; la configuration locale distribuée avec l'image frontend doit être contrôlée séparément.

### Erreur CORS pendant un développement hors Docker

La configuration CORS visible dans `backend/src/app.ts` contient encore des origines anciennes ou mal formées. Cela peut empêcher un navigateur d'appeler directement l'API depuis un autre port de développement. Préférer un proxy de développement configuré correctement ou corriger la liste des origines autorisées ; ne pas ouvrir CORS à toutes les origines sans justification.

### `failed to read dockerfile` / fichier Dockerfile introuvable

Le fichier `compose.yml` référence `backend/Dockerfile` (via son contexte de build) et `frontend/Dockerfile`. Vérifier leur présence **avec la casse exacte** sur la branche clonée. Si l'un est absent, la construction ne peut pas aboutir sans restaurer ou corriger le chemin référencé dans Compose.

## 10. Bonnes pratiques de sécurité

- Ne jamais pousser les fichiers `.env` dans Git, ni les envoyer dans une capture d'écran.
- Utiliser une clé JWT longue, aléatoire et différente de celle de production.
- Garder les identifiants de démonstration PostgreSQL **uniquement en local**.
- Ne jamais utiliser les secrets du VPS, les certificats Let's Encrypt ou une base de production pour tester un clone local.
- Éviter d'exposer les ports PostgreSQL et backend sur un réseau public lors d'un développement sur un poste partagé.
- Avant tout commit, vérifier les fichiers modifiés avec `git status` puis `git diff --cached` (sans afficher ou partager les secrets).

## 11. Points restant à vérifier

Cette documentation a été préparée à partir des fichiers publics disponibles dans le dépôt, **sans exécuter les conteneurs**. La validation finale doit être effectuée depuis un véritable clone Git :

- [ ] Vérifier la présence effective des Dockerfiles référencés par `compose.yml` (`frontend/Dockerfile`, `backend/Dockerfile`) : leur ouverture directe sur GitHub n'a pas pu être confirmée lors de la rédaction.
- [ ] Confirmer que le conteneur frontend local sert bien l'application et transmet les requêtes `/api` au backend.
- [ ] Vérifier, dans le frontend, le paramétrage réel de la base d'URL de l'API (`VITE_API_BASE` ou mécanisme équivalent).
- [ ] Tester `docker compose up --build -d` sur un poste propre avec les **deux fichiers `.env` locaux**.
- [ ] Confirmer l'initialisation correcte des tables SQL, l'inscription et la connexion d'un utilisateur de test.
- [ ] Confirmer les versions Node.js/npm requises si un démarrage sans Docker doit être documenté ultérieurement.

---

**Sources techniques internes au dépôt :** [`compose.yml`](../compose.yml), [`compose.production.yml`](../compose.production.yml), [`.env.example`](../.env.example), [`backend/.env.example`](../backend/.env.example), [`backend/src/app.ts`](../backend/src/app.ts), [`backend/src/routes/auth.ts`](../backend/src/routes/auth.ts), [`backend/src/models/db.ts`](../backend/src/models/db.ts), [`db/init.sql`](../db/init.sql), [`nginx/default.conf`](../nginx/default.conf).
