# Architecture logicielle — Budgie V1

## 1. Présentation générale

Budgie repose sur une architecture web **client-serveur**, organisée autour de trois composants principaux :

- **Frontend :** application développée avec Vue 3, Vite et Pinia.
- **Base de données :** PostgreSQL, utilisée pour conserver les utilisateurs, comptes financiers, transactions et règles de récurrence.

Ces composants sont déployés dans des conteneurs Docker sur un VPS OVH fonctionnant sous Debian 12.

Nginx assure la distribution de l'application frontend, le routage des requêtes API et la gestion des connexions HTTPS.

Cette séparation permet de distinguer l'interface utilisateur, les traitements métier et la persistance des données.

## 2. Organisation du frontend Vue.js

Le frontend constitue la partie visible de Budgie. Il permet aux utilisateurs de gérer leurs comptes financiers, revenus, dépenses et prévisions depuis une interface web.

### Technologies principales

**Vue.js 3**

Framework JavaScript utilisé pour construire une interface dynamique et réactive, organisée autour de composants réutilisables.

**Vite**

Outil de développement et de compilation permettant de lancer rapidement l'application localement et de générer les fichiers statiques optimisés pour la production.

**Pinia**

Bibliothèque de gestion d'état utilisée pour centraliser les données partagées entre les différentes parties de l'interface.

**Vue Router**

Gestionnaire de navigation côté client permettant de passer d'une vue à une autre sans rechargement complet de l'application.

### Organisation fonctionnelle

Le frontend s'articule autour de plusieurs responsabilités :

| Élément | Responsabilité |
|---|---|
| Vues | Représenter les principales pages de l'application |
| Composants Vue | Afficher les éléments réutilisables de l'interface |
| Stores Pinia | Centraliser les états partagés |
| Vue Router | Gérer la navigation entre les vues |
| Couche HTTP | Communiquer avec l'API Express |

Les principales fonctionnalités de l'interface concernent l'authentification, la gestion des comptes financiers, les revenus, les dépenses et les prévisions.

Le frontend se concentre sur la présentation des informations et les interactions utilisateur. Les opérations nécessitant un accès aux données persistantes sont déléguées au backend.

## 3. Rôle des composants Vue et des stores Pinia

### Composants Vue

Les composants Vue permettent de diviser l'interface en éléments indépendants et réutilisables.

Un composant peut notamment être chargé d'afficher un formulaire, une carte de compte financier, un tableau ou un graphique.

Les composants peuvent recevoir des données depuis leurs composants parents au moyen de propriétés (*props*) et communiquer des événements grâce au mécanisme `emit`.

Cette approche favorise :

- La réutilisation du code.
- La maintenance de l'interface.
- La séparation des responsabilités.
- L'évolution indépendante des différentes fonctionnalités.

### Stores Pinia

Pinia sert à gérer les informations qui doivent être accessibles depuis plusieurs composants ou vues.

Son utilisation permet d'éviter de transmettre systématiquement les mêmes données à travers plusieurs niveaux de composants.

Un store peut contenir :

- **State :** données réactives partagées.
- **Getters :** valeurs calculées à partir de l'état.
- **Actions :** méthodes permettant de modifier l'état ou d'effectuer des traitements asynchrones.

Par exemple, un store consacré à l'authentification peut centraliser les informations de l'utilisateur connecté, tandis qu'un store financier peut faciliter le partage des données entre plusieurs vues.

Pinia ne remplace cependant pas PostgreSQL : les données conservées dans les stores appartiennent à l'état de l'application côté client et ne constituent pas une source de persistance définitive.

## 4. Organisation du backend Express.js

Le backend de Budgie est développé avec **Node.js, Express 5 et TypeScript**.

Il expose une API REST permettant au frontend d'effectuer des opérations sur les différentes ressources de l'application.

### Point d'entrée de l'application

Le fichier `backend/src/app.ts` constitue le point d'entrée du serveur.

Il assure principalement :

1. L'initialisation de l'application Express.
2. La configuration des middlewares.
3. L'activation du traitement des requêtes JSON.
4. L'enregistrement des routeurs API.
5. Le démarrage du serveur HTTP, sur le port 5001 par défaut.

### Organisation des routes

Les routes sont regroupées dans le répertoire `backend/src/routes/`, selon leur domaine fonctionnel.

| Route principale | Responsabilité |
|---|---|
| `/api/auth` | Inscription, connexion et gestion du profil |
| `/api/accounts` | Gestion des comptes financiers |
| `/api/revenus` | Gestion des revenus |
| `/api/expenses` | Gestion des dépenses |
| `/api/previsions` | Calcul des prévisions financières |
| `/api/payments` | Routes de paiement présentes dans le code |
| `/api` | Inclut également le routeur webhook |

Les routes de paiement et le webhook subsistent dans le code, mais l'intégration Stripe n'est pas activée comme fonctionnalité commerciale de la V1 en production.

### Traitements métier

Le backend prend en charge les opérations qui ne doivent pas dépendre uniquement du navigateur :

- Vérification de l'authentification.
- Validation des données reçues.
- Lecture et modification des données financières.
- Application des règles d'accès aux ressources.
- Gestion des revenus et dépenses ponctuels ou récurrents.
- Calcul des soldes et prévisions financières.

Dans la V1, plusieurs fichiers de routes regroupent directement la définition des endpoints et leur logique métier.

Une séparation plus poussée entre routes, contrôleurs et services pourra être envisagée lors de futurs refactorings, sans constituer une caractéristique déjà implémentée de l'architecture actuelle.

### Accès à PostgreSQL

Le fichier `backend/src/models/db.ts` centralise la configuration de l'accès à PostgreSQL.

Il utilise le module `pg` et un pool de connexions pour permettre au serveur d'exécuter ses requêtes SQL.

Le backend utilise notamment des requêtes paramétrées, afin de séparer les valeurs utilisateur du texte SQL et de limiter les risques d'injection SQL.

## 5. Fonctionnement de l'authentification JWT

Budgie utilise une authentification reposant sur des **JSON Web Tokens (JWT)**.

Ce mécanisme permet au backend d'identifier les utilisateurs lors de leurs requêtes vers les endpoints protégés.

### Inscription

Lorsqu'un utilisateur crée un compte :

1. Le frontend transmet les informations d'inscription à `/api/auth/register`.
2. Le backend vérifie les champs requis et l'unicité de l'adresse e-mail.
3. Le mot de passe est haché avec `bcryptjs` avant son enregistrement.
4. Le backend crée l'utilisateur dans PostgreSQL.
5. Un compte financier principal est également créé.
6. Le serveur génère un JWT et le renvoie au frontend.

### Connexion

Lorsqu'un utilisateur se connecte :

1. Le frontend transmet son adresse e-mail et son mot de passe à `/api/auth/login`.
2. Le backend recherche l'utilisateur dans PostgreSQL.
3. `bcryptjs` compare le mot de passe fourni à son empreinte enregistrée.
4. Si les identifiants sont valides, le backend génère un JWT.
5. Le frontend reçoit les informations de l'utilisateur et son jeton d'authentification.

### Structure et validation du JWT

Dans la V1, le JWT contient notamment l'identifiant de l'utilisateur et son adresse e-mail.

Il est signé avec une clé secrète définie par la variable d'environnement `JWT_SECRET`.

La durée de validité actuellement définie dans le code est de **24 heures**.

Pour accéder à une route protégée, le client transmet le JWT dans l'en-tête HTTP :

`Authorization: Bearer <token>`

Le middleware `requireAuth`, défini dans le module d'authentification, vérifie la signature et la validité du jeton.

Lorsque l'authentification réussit, les informations d'identification sont associées à la requête afin de pouvoir être utilisées par les routes suivantes.

En l'absence de jeton ou lorsqu'il est invalide, le backend renvoie une erreur HTTP `401 Unauthorized`.

### Protection des données utilisateur

L'authentification est complétée par des restrictions au niveau des requêtes SQL.

Par exemple, les opérations sur les comptes financiers utilisent l'identifiant de l'utilisateur authentifié afin de sélectionner les comptes qui lui appartiennent.

Cette vérification côté serveur est essentielle : masquer une ressource dans l'interface Vue ne suffit pas à en protéger l'accès.

## 6. Communication entre le frontend et le backend

La communication entre Vue.js et Express repose sur des **requêtes HTTP et des réponses JSON**.

L'architecture suit un fonctionnement classique d'API REST.

### Exemple : récupération des comptes financiers

Lorsqu'un utilisateur consulte ses comptes :

1. L'interface Vue déclenche une requête `GET /api/accounts`.
2. Le client inclut le JWT dans l'en-tête `Authorization`.
3. Nginx transmet la requête au backend Express.
4. Le middleware `requireAuth` vérifie le JWT.
5. Le backend récupère les comptes associés à l'utilisateur dans PostgreSQL.
6. Express renvoie les résultats sous forme de JSON.
7. Le frontend utilise ces données pour actualiser l'interface.

### Répartition des responsabilités

| Frontend Vue | Backend Express |
|---|---|
| Affiche les formulaires | Valide les données reçues |
| Déclenche les requêtes HTTP | Traite les requêtes API |
| Présente les résultats | Applique les règles métier |
| Gère les interactions | Contrôle les accès |
| Actualise l'interface | Communique avec PostgreSQL |

Cette séparation permet de maintenir une distinction claire entre les responsabilités de présentation et celles du serveur.

Le navigateur ne dispose pas d'un accès direct à PostgreSQL.

## 7. Rôle du reverse proxy Nginx

Nginx constitue le point d'entrée web de Budgie en production.

Dans la configuration Docker Compose actuelle, **Nginx s'exécute au sein du conteneur frontend**. Il assure à la fois la distribution des fichiers statiques et la transmission des appels API.

### Distribution du frontend

Lorsqu'un utilisateur consulte `https://monbudgie.fr`, Nginx sert les fichiers statiques de l'application Vue.

La configuration utilise une règle de repli vers `index.html`, permettant à Vue Router de gérer les routes côté client.

### Transmission des requêtes API

Les requêtes dont le chemin commence par `/api` sont transmises au service backend Docker, accessible sous l'adresse interne :

`http://backend:5001`

Nginx fonctionne alors comme un reverse proxy : il reçoit la requête du navigateur et la transmet au service Express approprié.

### Gestion du HTTPS

Nginx utilise les certificats Let's Encrypt installés sur le serveur afin de fournir des connexions chiffrées en HTTPS.

La configuration prévoit également :

- La redirection HTTP vers HTTPS.
- La redirection de `www.monbudgie.fr` vers `monbudgie.fr`.
- La prise en charge des demandes de validation de certificats Let's Encrypt.
- La transmission au backend des en-têtes utiles relatifs à la requête d'origine.

La présence de Nginx permet ainsi d'exposer l'application sous un domaine unique, sans nécessiter l'exposition publique directe du port du backend en production.

## 8. Justification des choix techniques

### Pourquoi Vue.js 3 ?

Vue.js permet de construire une interface réactive et organisée autour de composants.

Son approche modulaire convient à Budgie, qui possède plusieurs domaines fonctionnels amenés à évoluer indépendamment.

### Pourquoi Pinia ?

Pinia simplifie la centralisation et le partage de l'état entre les composants Vue.

Il offre une solution adaptée à une application de gestion financière où plusieurs vues peuvent manipuler des informations communes.

### Pourquoi Express.js ?

Express fournit une base légère pour développer une API REST avec Node.js.

Il permet d'organiser les fonctionnalités sous forme de routeurs, d'utiliser des middlewares et de maîtriser directement les traitements côté serveur.

### Pourquoi TypeScript ?

TypeScript apporte un système de typage statique à JavaScript.

Son utilisation contribue à mieux définir les structures de données, améliorer la lisibilité du code et détecter certaines erreurs avant l'exécution.

### Pourquoi PostgreSQL ?

Budgie manipule des données structurées et liées entre elles : utilisateurs, comptes, transactions et règles de récurrence.

PostgreSQL est adapté à ce modèle relationnel et offre notamment :

- La gestion des relations entre tables.
- Des contraintes d'intégrité des données.
- Le support des transactions SQL.
- Des types numériques adaptés au stockage de montants financiers.
- Des capacités d'interrogation et d'agrégation nécessaires aux fonctionnalités de prévision.

### Pourquoi Docker Compose ?

Docker Compose permet de définir et de lancer les services de l'application à partir de fichiers de configuration versionnés.

Budgie utilise des services distincts pour le frontend, le backend et PostgreSQL.

Cette approche facilite la gestion des dépendances, des réseaux, des volumes et des variables d'environnement.

Le projet distingue la configuration principale `compose.yml` de la configuration adaptée à la production `compose.production.yml`.

Cette dernière prévoit notamment un contrôle de disponibilité de PostgreSQL et évite d'exposer directement les ports de PostgreSQL et du backend.

### Pourquoi Nginx ?

Nginx centralise le trafic HTTP(S), sert les fichiers statiques et joue le rôle d'intermédiaire entre le navigateur et Express.

Il permet également de gérer les certificats HTTPS et les redirections du domaine.

Cette architecture évite de devoir exposer directement chaque service applicatif sur Internet.

## 9. Synthèse

L'architecture de Budgie V1 repose sur une séparation entre trois responsabilités :

**Présentation :** Vue.js et Pinia assurent l'affichage de l'application et la gestion des interactions utilisateur.

**Logique applicative :** Express et TypeScript prennent en charge l'API REST, l'authentification JWT et les traitements financiers.

**Persistance :** PostgreSQL conserve les données et garantit leur organisation relationnelle.

Docker Compose facilite l'exécution des différents services, tandis que Nginx gère l'accès web sécurisé à l'application.

Cette organisation constitue une base technique évolutive pour Budgie V2, notamment pour les fonctionnalités de suivi d'investissements, l'amélioration des prévisions et l'enrichissement des outils de gestion financière.