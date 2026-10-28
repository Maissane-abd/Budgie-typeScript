# Documentation de l'API REST — Budgie V1

> **État documentaire :** 23 octobre 2026 · **Source de vérité :** branche `main` du dépôt public [Maissane-abd/Budgie-typeScript](https://github.com/Maissane-abd/Budgie-typeScript), essentiellement `backend/src/app.ts`, `backend/src/routes/`, `backend/src/controllers/`, `backend/src/utils/subscription.ts` et `db/init.sql`.
>
> **Niveau de vérification :** inventaire et comportement établis par lecture du code source ; configuration de routage de production établie par lecture de `nginx/default.conf`. Le site `https://monbudgie.fr` est accessible publiquement, mais les appels API directs et les scénarios authentifiés **n'ont pas pu être exécutés depuis l'environnement de rédaction**. Les JSON ci-dessous sont **illustratifs**, non des captures de réponses réelles. Ne pas confondre « route définie dans `main` » et « endpoint validé sur le déploiement courant ».

## Sommaire

1. [Conventions et authentification](#1-conventions-et-authentification)
2. [Inventaire des endpoints](#2-inventaire-des-endpoints)
3. [Authentification et profil](#3-authentification-et-profil)
4. [Comptes financiers](#4-comptes-financiers)
5. [Revenus](#5-revenus)
6. [Dépenses](#6-dépenses)
7. [Prévisions financières](#7-prévisions-financières)
8. [Paiements et abonnements (Stripe)](#8-paiements-et-abonnements-stripe)
9. [Webhook Stripe et route technique](#9-webhook-stripe-et-route-technique)
10. [Règles métiers et validations](#10-règles-métiers-et-validations)
11. [Exemples cURL et vérification](#11-exemples-curl-et-vérification)
12. [Limites et points d'attention](#12-limites-et-points-dattention)
13. [Sources dans le dépôt](#13-sources-dans-le-dépôt)

---

## 1. Conventions et authentification

### 1.1. URL de base

| Environnement | URL | Précision |
| --- | --- | --- |
| Production | `https://monbudgie.fr/api` | Chemin `/api` transmis à Express par Nginx (`proxy_pass http://backend:5001`). |
| Backend local (exposition par `compose.yml`) | `http://localhost:5001/api` | Port Docker exposé par défaut dans la configuration locale. |
| Frontend local via Nginx | `http://localhost/api` | Dépend de la configuration Nginx locale embarquée dans l'image frontend. |

Les routes listées ici incluent le préfixe `/api`, sauf `GET /` qui est une route de test Express. La route `GET /` n'est **pas** le contenu de la page d'accueil du domaine public : Nginx sert normalement l'application Vue sur `/`.

### 1.2. Format des échanges

- La plupart des endpoints consomment et renvoient du JSON.
- Pour les requêtes avec corps JSON : `Content-Type: application/json`.
- Les réponses ne suivent **pas** encore une enveloppe uniforme : selon la route, on obtient `{ data: ... }`, `{ user, token }`, `{ error: ... }`, `{ message: ... }`, un objet seul ou un tableau direct.
- Les réponses `204 No Content` ne comprennent aucun corps.
- Les UUID, dates et montants utilisés dans les exemples sont fictifs. Les champs PostgreSQL `NUMERIC` peuvent être sérialisés comme **chaînes** via le pilote `pg` ; plusieurs champs calculés des comptes sont au contraire convertis en nombres par le code.

### 1.3. Authentification JWT

Les routes indiquées **JWT requis** passent par le middleware `requireAuth` :

```http
Authorization: Bearer <JWT>
```

- Jeton obtenu par `POST /api/auth/register` ou `POST /api/auth/login`.
- Jeton signé avec `JWT_SECRET` ; contenu signé : `{ id, email }`.
- Expiration codée en dur à **1 jour** (`expiresIn: "1d"`) ; la variable d'exemple `JWT_EXPIRES_IN` n'est pas actuellement utilisée pour ce réglage.
- Middleware sans jeton : `401 {"error":"Token manquant"}`.
- Middleware avec jeton invalide ou expiré : `401 {"error":"Token invalide"}`.
- Le middleware ne charge pas l'utilisateur depuis la base ; l'autorisation sur les ressources est vérifiée ensuite par les requêtes SQL filtrées sur `user_id`.

### 1.4. Codes HTTP usuels

| Code | Signification dans cette API |
| --- | --- |
| `200` | Lecture, modification ou opération aboutie. |
| `201` | Ressource créée. |
| `204` | Suppression réussie, sans contenu. |
| `400` | Champs manquants/invalides, ou webhook Stripe mal configuré/signé. |
| `401` | Jeton manquant/invalide ou identifiants erronés. |
| `403` | Ressource non autorisée ou limite du plan gratuit atteinte. |
| `404` | Ressource introuvable ou n'appartenant pas à l'utilisateur. |
| `409` | E-mail déjà utilisé. |
| `500` | Erreur serveur ; peut aussi résulter de valeurs rejetées par PostgreSQL et insuffisamment validées par l'API. |
| `503` | Fonction Stripe non configurée (sur certains endpoints). |

**Attention :** les réponses et statuts varient par endpoint. Les codes mentionnés ci-dessous sont ceux explicitement définis dans les handlers, plus `401` du middleware pour les routes protégées. Ce n'est pas une garantie que toute erreur inattendue sera correctement formatée.

---

## 2. Inventaire des endpoints

**26 points d'entrée** : 25 routes sous `/api`, plus la route technique Express `GET /`.

| Domaine | Méthode | Endpoint | Authentification | Opération |
| --- | --- | --- | --- | --- |
| Auth | `POST` | `/api/auth/register` | Non | Inscription et création du compte principal |
| Auth | `POST` | `/api/auth/login` | Non | Connexion |
| Auth | `GET` | `/api/auth/me` | JWT | Profil connecté |
| Auth | `PUT` | `/api/auth/me` | JWT | Modifier son profil |
| Auth | `DELETE` | `/api/auth/me` | JWT | Supprimer son profil |
| Comptes | `GET` | `/api/accounts` | JWT | Lister ses comptes et soldes calculés |
| Comptes | `POST` | `/api/accounts` | JWT | Créer un compte |
| Comptes | `PUT` | `/api/accounts/:id` | JWT | Modifier un compte |
| Comptes | `DELETE` | `/api/accounts/:id` | JWT | Supprimer un compte |
| Revenus | `GET` | `/api/revenus` | JWT | Lister ses revenus |
| Revenus | `GET` | `/api/revenus/:id` | JWT | Consulter un revenu |
| Revenus | `POST` | `/api/revenus` | JWT | Créer un revenu |
| Revenus | `PUT` | `/api/revenus/:id` | JWT | Modifier un revenu |
| Revenus | `DELETE` | `/api/revenus/:id` | JWT | Supprimer un revenu |
| Dépenses | `GET` | `/api/expenses` | JWT | Lister ses dépenses |
| Dépenses | `GET` | `/api/expenses/:id` | JWT | Consulter une dépense |
| Dépenses | `POST` | `/api/expenses` | JWT | Créer une dépense |
| Dépenses | `PUT` | `/api/expenses/:id` | JWT | Modifier une dépense |
| Dépenses | `DELETE` | `/api/expenses/:id` | JWT | Supprimer une dépense |
| Prévisions | `GET` | `/api/previsions` | JWT | Prévisions par compte et total |
| Paiements | `POST` | `/api/payments/checkout` | JWT | Démarrer Stripe Checkout |
| Paiements | `GET` | `/api/payments/subscription` | JWT | Lire l'abonnement actif |
| Paiements | `PUT` | `/api/payments/subscription` | JWT | Changer le tarif Stripe |
| Paiements | `DELETE` | `/api/payments/subscription` | JWT | Annuler l'abonnement |
| Webhook | `POST` | `/api/webhook` | Signature Stripe | Réception des événements Stripe |
| Technique | `GET` | `/` | Non | Test HTTP côté backend |

> Les routes Stripe sont **présentes dans le code**, mais les paiements sont optionnels et désactivés sans `STRIPE_SECRET_KEY`. Leur mise à disposition effective au public n'est pas confirmée. Le webhook défini dans `webhook.ts` est monté sur `/api/webhook`, **pas** sur `/api/payments/webhook`.

---

## 3. Authentification et profil

Source : [`backend/src/routes/auth.ts`](../backend/src/routes/auth.ts).

### 3.1. `POST /api/auth/register` — Inscription

**Authentification :** aucune. **Body JSON :**

| Champ | Type | Obligatoire | Validation réellement implémentée |
| --- | --- | --- | --- |
| `first_name` | chaîne | Oui | Valeur truthy ; pas de contrôle de format explicite. |
| `last_name` | chaîne | Oui | Valeur truthy. |
| `email` | chaîne | Oui | Valeur truthy ; unicité contrôlée par requête puis contrainte SQL. |
| `password` | chaîne | Oui | Valeur truthy ; aucune politique de longueur/complexité explicite. |

**Exemple de requête :**

```json
{
  "first_name": "Camille",
  "last_name": "Martin",
  "email": "camille@example.test",
  "password": "exemple-mot-de-passe"
}
```

**Réponse `201 Created` (illustrative) :**

```json
{
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "first_name": "Camille",
    "last_name": "Martin",
    "email": "camille@example.test",
    "plan_name": "Free"
  },
  "token": "<JWT>"
}
```

**Effets :** insertion d'un utilisateur (mot de passe haché avec `bcryptjs`, coût 10), puis création automatique d'un compte nommé `Compte Principal`, devise `EUR`, à la date du jour. Le token est valable 1 jour.

**Erreurs :** `400 {"error":"Champs requis"}` ; `409 {"error":"Email déjà utilisé"}` ; `500 {"error":"Erreur serveur pour le register"}`. La création de l'utilisateur et celle du compte principal ne sont pas enveloppées dans une transaction SQL explicite.

### 3.2. `POST /api/auth/login` — Connexion

**Authentification :** aucune. **Body :** `email` et `password` obligatoires.

```json
{
  "email": "camille@example.test",
  "password": "exemple-mot-de-passe"
}
```

**Réponse `200 OK` (illustrative) :**

```json
{
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "first_name": "Camille",
    "last_name": "Martin",
    "email": "camille@example.test",
    "plan_name": "Free",
    "max_accounts": 2,
    "sub_status": null
  },
  "token": "<JWT>"
}
```

**Erreurs :** `400 {"error":"Champs requis"}` ; `401 {"error":"Identifiants invalides"}` ; `500 {"error":"Erreur serveur"}`. Un utilisateur non trouvé et un mauvais mot de passe reçoivent le même message. Le profil est obtenu via jointures `users`, `subscriptions` et `plans`.

### 3.3. `GET /api/auth/me` — Profil courant

**Authentification :** JWT requis. **Paramètres :** aucun.

**Réponse `200 OK` (illustrative) :**

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "first_name": "Camille",
  "last_name": "Martin",
  "email": "camille@example.test",
  "plan_name": "Free",
  "max_accounts": 2,
  "sub_status": null
}
```

**Erreurs :** `401` JWT, `404 {"error":"Utilisateur introuvable"}`, `500 {"error":"Erreur serveur"}`. Le code renseigne `plan_name`/`max_accounts` par `COALESCE` lorsqu'il n'y a pas d'abonnement associé.

### 3.4. `PUT /api/auth/me` — Mise à jour du profil

**Authentification :** JWT requis. **Body partiel :** `first_name`, `last_name` et/ou `email` ; aucun champ explicitement obligatoire.

```json
{
  "first_name": "Camille",
  "last_name": "Durand"
}
```

**Réponse `200 OK` :** même structure de profil que `GET /api/auth/me`, avec les valeurs mises à jour. Les champs omis sont conservés via `COALESCE` SQL. La route n'accepte pas de modification de mot de passe.

**Erreurs :** `401` JWT ; `409 {"error":"Email déjà utilisé"}` lorsque la capture de l'erreur SQL reconnaît le doublon ; `500 {"error":"Erreur serveur"}`. Le handler n'effectue pas de validation de format d'e-mail.

### 3.5. `DELETE /api/auth/me` — Suppression du profil

**Authentification :** JWT requis. **Body :** aucun.

**Réponse :** `204 No Content` (corps vide). Supprime la ligne `users` correspondant au token ; les comptes et transactions liés sont supprimés en cascade par les contraintes de la base.

**Erreurs :** `401` JWT ; `500 {"error":"Erreur suppression"}`. La route ne prévoit pas de demande de confirmation supplémentaire et ne vérifie pas le nombre de lignes supprimées.

---

## 4. Comptes financiers

Source : [`backend/src/routes/accounts.ts`](../backend/src/routes/accounts.ts).

**Structure d'un compte** (extrait des champs renvoyables) :

| Champ | Type logique | Description |
| --- | --- | --- |
| `id`, `user_id` | UUID | Identifiant du compte et de son propriétaire. |
| `account_name` | chaîne | Nom affiché. |
| `description` | chaîne/null | Description libre. |
| `created_on` | date | Date de création déclarée. |
| `currency` | code sur 3 caractères | `EUR` par défaut. |
| `balance` | montant | Solde initial stocké ; **dans GET liste**, il est remplacé par solde initial + revenus − dépenses. |
| `annual_interest_rate` | numérique | Pourcentage annuel utilisé par les calculs. |
| `tax_rate` | numérique | Pourcentage d'impôt appliqué aux intérêts. |
| `current_balance` | nombre calculé | `balance` décoré avec un mois d'intérêts nets ; ne représente pas forcément une position bancaire instantanée. |
| `forecast_12m` | nombre calculé | Projection d'intérêts composés sur 12 mois, sans logique complète des transactions récurrentes. |

### 4.1. `GET /api/accounts` — Liste des comptes

**Authentification :** JWT requis. **Paramètres :** aucun.

**Réponse `200 OK` (illustrative, volontairement abrégée) :**

```json
{
  "data": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "user_id": "11111111-1111-4111-8111-111111111111",
      "account_name": "Compte Principal",
      "currency": "EUR",
      "balance": 1500.0,
      "annual_interest_rate": "0.0000",
      "tax_rate": "0.0000",
      "current_balance": 1500.0,
      "forecast_12m": 1500.0
    }
  ]
}
```

**Traitement :** seuls les comptes de `req.user.id` sont listés. La requête agrège `transactions` (`income` positif, `expense` négatif), puis le code ajoute les champs calculés. **Attention :** la liste des comptes prend en compte chaque ligne de transaction une fois, pas toutes les occurrences futures de récurrence.

**Erreurs :** `401` JWT ; `500 {"error":"Erreur lors de la récupération des comptes."}`.

### 4.2. `POST /api/accounts` — Création d'un compte

**Authentification :** JWT requis.

| Champ | Type | Obligatoire | Défaut / remarque |
| --- | --- | --- | --- |
| `account_name` | chaîne | Oui | Présence truthy uniquement. |
| `created_on` | date `YYYY-MM-DD` | Oui | Présence truthy ; date validée ensuite par PostgreSQL. |
| `description` | chaîne/null | Non | `null`. |
| `currency` | chaîne | Non | `EUR`. |
| `balance` | numérique | Non | `0`. |
| `annual_interest_rate` | numérique | Non | `0`. |
| `tax_rate` | numérique | Non | `0`. |

**Exemple de requête :**

```json
{
  "account_name": "Livret",
  "description": "Épargne de précaution",
  "created_on": "2026-10-23",
  "currency": "EUR",
  "balance": 1000,
  "annual_interest_rate": 2,
  "tax_rate": 0
}
```

**Réponse `201 Created` (illustrative, abrégée) :**

```json
{
  "data": {
    "id": "22222222-2222-4222-8222-222222222222",
    "account_name": "Livret",
    "balance": 1000,
    "current_balance": 1001.67,
    "forecast_12m": 1020.18
  }
}
```

Les champs `current_balance` et `forecast_12m` proviennent des formules internes ; ces valeurs sont uniquement un **exemple** calculé pour les données fictives précédentes.

**Autorisation métier :** utilisateur sans abonnement Premium actif limité à **2 comptes** au total, compte principal inclus.

**Erreurs :** `400 {"error":"account_name et created_on sont obligatoires."}` ; `401` JWT ; `403` avec `{ error, limitReached: true, currentCount, maxCount: 2 }` ; `500 {"error":"Erreur lors de la création du compte."}`.

### 4.3. `PUT /api/accounts/:id` — Mise à jour d'un compte

**Authentification :** JWT requis. **Path :** `id` (UUID du compte). **Body partiel :** les sept champs de création (`account_name`, `description`, `created_on`, `currency`, `balance`, `annual_interest_rate`, `tax_rate`).

```json
{
  "account_name": "Épargne",
  "annual_interest_rate": 2.5,
  "tax_rate": 0
}
```

**Réponse `200 OK` :** `{ "data": { /* compte mis à jour + current_balance + forecast_12m */ } }`.

**Autorisation :** `UPDATE accounts ... WHERE id = :id AND user_id = req.user.id`.

**Erreurs :** `401` JWT ; `404 {"error":"Compte introuvable."}` ; `500 {"error":"Erreur lors de la mise à jour du compte."}`.

**Note :** `COALESCE` conserve les valeurs existantes lorsque le champ transmis vaut `null`. Il ne permet donc pas de vider facilement une description en lui envoyant `null`.

### 4.4. `DELETE /api/accounts/:id` — Suppression d'un compte

**Authentification :** JWT requis. **Path :** `id` (UUID). **Body :** aucun.

**Réponse :** `204 No Content`.

**Autorisation :** suppression uniquement si le compte appartient à l'utilisateur authentifié.

**Effet secondaire :** suppression SQL en cascade des transactions et de leurs règles de récurrence liées à ce compte.

**Erreurs :** `401` JWT ; `404 {"error":"Compte introuvable."}` ; `500 {"error":"Erreur lors de la suppression du compte."}`.

---

## 5. Revenus

Sources : [`backend/src/routes/revenus.ts`](../backend/src/routes/revenus.ts), [`backend/src/controllers/revenusController.ts`](../backend/src/controllers/revenusController.ts).

### 5.1. Modèle de revenu

Les revenus utilisent la table commune `transactions` avec `transaction_type = "income"`.

| Champ | Type | POST | PUT | Remarque |
| --- | --- | --- | --- | --- |
| `account_id` | UUID | Obligatoire | Non accepté dans le handler | Compte propriétaire du revenu ; contrôlé à la création. |
| `transaction_name` | chaîne | Obligatoire | Obligatoire | Nom du revenu. |
| `amount` | nombre positif | Obligatoire | Obligatoire | `0` et les valeurs négatives sont rejetés. |
| `start_date` | date `YYYY-MM-DD` | Obligatoire | Obligatoire | Date de début. |
| `description` | chaîne/null | Facultatif | Facultatif | Non validé côté API. |
| `duration_type` | `one_time`, `recurring` ou `null` | Facultatif | Facultatif | Le code déclenche la récurrence si la valeur est exactement `recurring`. |
| `interval_count` | entier positif | Si récurrent | Si récurrent | Vérification de présence et `>= 1`, pas de validation stricte du type entier. |
| `interval_unit` | `day`, `month`, `year` | Si récurrent | Si récurrent | Valeurs autorisées par contrainte PostgreSQL. |
| `end_date` | date/null | Facultatif | Facultatif | `""` transformé en `null`. |

**Modèle de création ponctuelle :**

```json
{
  "account_id": "22222222-2222-4222-8222-222222222222",
  "transaction_name": "Prime exceptionnelle",
  "amount": 250,
  "start_date": "2026-10-23",
  "description": "Prime",
  "duration_type": "one_time"
}
```

**Modèle de création récurrente :**

```json
{
  "account_id": "22222222-2222-4222-8222-222222222222",
  "transaction_name": "Salaire",
  "amount": 1800,
  "start_date": "2026-11-01",
  "description": "Salaire mensuel",
  "duration_type": "recurring",
  "interval_count": 1,
  "interval_unit": "month",
  "end_date": null
}
```

**Note importante :** les champs de récurrence sont enregistrés dans `recurrence_rules`. Les réponses des routes de création/liste/détail proviennent de `transactions` et **n'embarquent pas automatiquement les champs** `interval_count`, `interval_unit` et `end_date`.

### 5.2. `GET /api/revenus` — Liste

**JWT requis.** Aucun paramètre.

**Réponse `200 OK` :** tableau direct de lignes `transactions` avec en plus `account_name`.

```json
[
  {
    "id": "33333333-3333-4333-8333-333333333333",
    "account_id": "22222222-2222-4222-8222-222222222222",
    "transaction_name": "Salaire",
    "transaction_type": "income",
    "amount": "1800.00",
    "start_date": "2026-11-01T00:00:00.000Z",
    "duration_type": "recurring",
    "account_name": "Compte Principal"
  }
]
```

**Autorisation :** filtrage par `accounts.user_id` et `transaction_type = 'income'`. **Erreurs :** `401` JWT ; erreurs inattendues non capturées explicitement dans le contrôleur.

### 5.3. `GET /api/revenus/:id` — Détail

**JWT requis.** `id` UUID de la transaction revenu.

**Réponse `200 OK` :** objet `transactions` seul (sans `account_name` ajouté par la route liste).

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "account_id": "22222222-2222-4222-8222-222222222222",
  "transaction_name": "Salaire",
  "transaction_type": "income",
  "amount": "1800.00",
  "duration_type": "recurring"
}
```

**Autorisation :** l'identifiant demandé, le type revenu et l'appartenance du compte sont vérifiés dans la requête SQL. **Erreurs :** `401` JWT ; `404 {"message":"Revenu non trouvé"}` ; erreurs non capturées.

### 5.4. `POST /api/revenus` — Création

**JWT requis.** **Body :** voir tableau de la section 5.1.

**Réponse `201 Created` :** objet `transactions` créé, sans la règle de récurrence jointe ; extrait illustratif :

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "account_id": "22222222-2222-4222-8222-222222222222",
  "transaction_name": "Salaire",
  "transaction_type": "income",
  "amount": "1800.00",
  "duration_type": "recurring"
}
```

**Vérifications :** champs obligatoires ; montant strictement positif ; `interval_count`/`interval_unit` si récurrent ; appartenance du compte ; quota revenus du plan gratuit (**2 revenus par compte** par défaut).

**Erreurs :** `400 {"message":"Champs obligatoires manquants"}` ; `400 {"message":"Le montant doit être positif"}` ; `400` règle de récurrence incomplète ; `401` JWT ; `403 {"message":"Compte non autorisé"}` ; `403` quota `{ message, limitReached: true, currentCount, maxCount }`. Les erreurs SQL ne sont pas capturées localement.

### 5.5. `PUT /api/revenus/:id` — Modification

**JWT requis.** `id` UUID du revenu. **Body :** `transaction_name`, `amount` et `start_date` **tous obligatoires**, même pour modifier un seul champ ; autres champs de la section 5.1 acceptés sauf `account_id`.

```json
{
  "transaction_name": "Salaire net",
  "amount": 1850,
  "start_date": "2026-11-01",
  "description": "Nouvelle rémunération",
  "duration_type": "recurring",
  "interval_count": 1,
  "interval_unit": "month",
  "end_date": null
}
```

**Réponse `200 OK` :** objet `transactions` actualisé.

**Autorisation :** `UPDATE` filtré par propriétaire du compte et `transaction_type = 'income'`. Lorsque `duration_type` est `recurring`, la règle liée est créée ou mise à jour ; sinon, une éventuelle règle existante est supprimée.

**Erreurs :** `400` champs manquants, montant non positif ou récurrence incomplète ; `401` JWT ; `404 {"message":"Revenu non trouvé"}` ; erreurs SQL non capturées.

### 5.6. `DELETE /api/revenus/:id` — Suppression

**JWT requis.** `id` UUID. Aucun body. **Réponse :** `204 No Content`.

**Autorisation :** propriété du compte et type `income` vérifiés dans le `DELETE`. **Effet :** la règle de récurrence est supprimée en cascade par PostgreSQL.

**Erreurs :** `401` JWT ; `404 {"message":"Revenu non trouvé"}` ; erreurs non capturées.

---

## 6. Dépenses

Sources : [`backend/src/routes/expenses.ts`](../backend/src/routes/expenses.ts), [`backend/src/controllers/expensesController.ts`](../backend/src/controllers/expensesController.ts).

Les dépenses partagent le même modèle de données que les revenus, avec `transaction_type = "expense"`. Le format est identique à celui décrit en section 5.1, sauf le quota **7 dépenses par compte** pour le plan gratuit par défaut.

### 6.1. `GET /api/expenses` — Liste

**JWT requis.** Aucun paramètre. **Réponse `200 OK` :** tableau direct de `transactions` enrichies avec `account_name`.

```json
[
  {
    "id": "44444444-4444-4444-8444-444444444444",
    "account_id": "22222222-2222-4222-8222-222222222222",
    "transaction_name": "Loyer",
    "transaction_type": "expense",
    "amount": "750.00",
    "start_date": "2026-11-05T00:00:00.000Z",
    "duration_type": "recurring",
    "account_name": "Compte Principal"
  }
]
```

**Autorisation :** filtrage par `accounts.user_id` et `transaction_type = 'expense'`. **Erreurs :** `401` JWT ; erreurs non capturées.

### 6.2. `GET /api/expenses/:id` — Détail

**JWT requis.** `id` UUID de la dépense. **Réponse `200 OK` :** objet `transactions` seul.

```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "transaction_name": "Loyer",
  "transaction_type": "expense",
  "amount": "750.00",
  "duration_type": "recurring"
}
```

**Autorisation :** propriétaire du compte et type `expense` filtrés par SQL. **Erreurs :** `401` JWT ; `404 {"message":"Dépense non trouvée"}` ; erreurs non capturées.

### 6.3. `POST /api/expenses` — Création

**JWT requis.** **Body :** `account_id`, `transaction_name`, `amount` et `start_date` obligatoires ; `description`, `duration_type`, `interval_count`, `interval_unit` et `end_date` selon les mêmes règles que les revenus.

```json
{
  "account_id": "22222222-2222-4222-8222-222222222222",
  "transaction_name": "Loyer",
  "amount": 750,
  "start_date": "2026-11-05",
  "description": "Location",
  "duration_type": "recurring",
  "interval_count": 1,
  "interval_unit": "month",
  "end_date": null
}
```

**Réponse `201 Created` :** objet `transactions` créé, par exemple :

```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "account_id": "22222222-2222-4222-8222-222222222222",
  "transaction_name": "Loyer",
  "transaction_type": "expense",
  "amount": "750.00",
  "duration_type": "recurring"
}
```

**Validations :** champs requis, montant strictement positif, règle récurrente si nécessaire, propriété du compte et quota de **7 dépenses par compte** sans Premium.

**Erreurs :** `400` champs manquants/montant non positif/récurrence incomplète ; `401` JWT ; `403 {"message":"Compte non autorisé"}` ; `403` quota avec `{ message, limitReached: true, currentCount, maxCount }` ; erreurs SQL non capturées.

### 6.4. `PUT /api/expenses/:id` — Modification

**JWT requis.** `id` UUID. **Body :** `transaction_name`, `amount`, `start_date` obligatoires à chaque `PUT` ; autres champs de dépense facultatifs, mais `account_id` n'est pas modifiable par cette route.

```json
{
  "transaction_name": "Loyer actualisé",
  "amount": 770,
  "start_date": "2026-11-05",
  "description": "Nouveau montant",
  "duration_type": "recurring",
  "interval_count": 1,
  "interval_unit": "month"
}
```

**Réponse `200 OK` :** objet `transactions` mis à jour. Création/modification/suppression de `recurrence_rules` selon `duration_type`.

**Autorisation :** vérification dans SQL que la dépense appartient à un compte de l'utilisateur. **Erreurs :** `400` validation ; `401` JWT ; `404 {"message":"Dépense non trouvée"}` ; erreurs non capturées.

### 6.5. `DELETE /api/expenses/:id` — Suppression

**JWT requis.** `id` UUID. **Réponse :** `204 No Content`, vide.

**Autorisation :** propriété du compte et type `expense` filtrés dans la requête `DELETE`. Les règles de récurrence sont supprimées en cascade.

**Erreurs :** `401` JWT ; `404 {"message":"Dépense non trouvée"}` ; erreurs non capturées.

---

## 7. Prévisions financières

Source : [`backend/src/routes/previsions.ts`](../backend/src/routes/previsions.ts).

### 7.1. `GET /api/previsions` — Calcul des prévisions

**JWT requis.** **Paramètre query :**

| Paramètre | Type | Obligatoire | Défaut |
| --- | --- | --- | --- |
| `target_date` | Date, idéalement `YYYY-MM-DD` | Non | Date UTC calculée à `maintenant + 365 jours`. |

**Exemple :** `GET /api/previsions?target_date=2027-10-23`.

**Réponse `200 OK` (illustrative, abrégée) :**

```json
{
  "target_date": "2027-10-23",
  "accounts": [
    {
      "account_id": "22222222-2222-4222-8222-222222222222",
      "account_name": "Compte Principal",
      "starting_balance": 1000,
      "forecasted_balance": 2200,
      "monthly_details": [
        {
          "month": "2026-10-01T00:00:00.000Z",
          "income": 1500,
          "expense": 300,
          "interest": 0,
          "balance": 2200
        }
      ]
    }
  ],
  "total_starting_balance": 1000,
  "total_forecasted_balance": 2200
}
```

**Important :** les montants et le tableau temporel de cet exemple servent uniquement à montrer la **forme** du JSON. Ils ne constituent pas un calcul de prévision validé à partir d'un scénario exécuté ; en réalité `monthly_details` contient une entrée par mois parcouru jusqu'à la date cible.

**Traitement lu dans le code :**

1. Récupérer les comptes de l'utilisateur connecté.
2. Pour chaque compte, récupérer toutes les transactions et une éventuelle règle `recurrence_rules`, avec jointure gauche.
3. Générer les occurrences jusqu'à la date cible (`day`, `month`, `year`, selon `interval_count` ; respecter `end_date`).
4. Agréger revenus et dépenses par mois ; appliquer les intérêts mensuels nets à partir de `annual_interest_rate` et `tax_rate`.
5. Renvoyer les prévisions par compte, les détails mensuels et les totaux globaux.

**Erreurs :** `401` JWT ; `500 {"error":"Erreur lors du calcul des prévisions."}`. Il n'existe **pas** de validation explicite de format/plage de `target_date` dans le routeur. Une date invalide ou une règle incohérente peut conduire à des résultats inattendus ou à des traitements excessifs.

**Limites connues du calcul actuel :**

- Les transactions ponctuelles sont collectées jusqu'à la cible, puis agrégées dans la boucle démarrant au mois courant : les transactions plus anciennes ne sont pas réappliquées par cette boucle.
- Les intérêts sont calculés mois par mois ; ce fonctionnement peut ne pas correspondre à la méthode d'intérêts souhaitée pour tous les produits financiers.
- Le calcul part de la colonne `accounts.balance`, tandis que `GET /api/accounts` y ajoute les transactions enregistrées : les deux endpoints n'expriment donc pas exactement la même notion de « solde de départ ».
- La génération des occurrences n'impose pas de plafond ; `interval_count` n'est pas validé strictement par l'API et une valeur nulle/inadaptée pourrait rendre la boucle problématique si elle atteint cette fonction.

---

## 8. Paiements et abonnements (Stripe)

Sources : [`backend/src/routes/payments.routes.ts`](../backend/src/routes/payments.routes.ts), [`backend/src/controllers/payments.controller.ts`](../backend/src/controllers/payments.controller.ts), [`backend/src/config/stripe.ts`](../backend/src/config/stripe.ts).

> **Statut : intégration facultative/partiellement inactive selon l'environnement.** `stripe` vaut `null` lorsque `STRIPE_SECRET_KEY` est absente. Il ne faut **pas** essayer les opérations de paiement sur la production à partir de cette documentation sans environnement de test Stripe isolé et confirmation que cette fonctionnalité est activée.

### 8.1. `POST /api/payments/checkout` — Session Checkout

**JWT requis.** **Body obligatoire :** `{ "priceId": "price_exemple" }`.

```json
{
  "priceId": "price_test_exemple"
}
```

**Réponse `200 OK` (si Stripe activé, illustrative) :**

```json
{
  "url": "https://checkout.stripe.com/c/pay/EXEMPLE"
}
```

**Traitement :** session Stripe `mode: subscription`, moyen de paiement `card`, quantité 1, e-mail tiré du JWT ; URLs de retour construites avec `CLIENT_URL` (valeur de secours `http://localhost`).

**Erreurs :** `401` JWT ; `400 {"error":"priceId est requis"}` ; `503 {"error":"Paiements Stripe désactivés en environnement local"}` si Stripe absent ; `500` `{ error: "Impossible de créer la session", details, type }` si échec Stripe. Le message `503` mentionne « environnement local » même si la désactivation survient ailleurs.

### 8.2. `GET /api/payments/subscription` — Abonnement actif

**JWT requis.** Aucun body ou query.

**Réponse `200 OK` sans abonnement :**

```json
{ "subscription": null }
```

**Réponse `200 OK` avec abonnement (illustrative et abrégée) :**

```json
{
  "subscription": {
    "id": "55555555-5555-4555-8555-555555555555",
    "user_id": "11111111-1111-4111-8111-111111111111",
    "plan_name": "Premium",
    "status": "active",
    "price": "4.99",
    "started_at": "2026-10-01T00:00:00.000Z",
    "ends_at": null,
    "interval": "month",
    "interval_count": 1
  }
}
```

**Traitement :** retourne une ligne `subscriptions` active et non expirée, jointe à `plans`. Si Stripe est disponible et qu'un identifiant d'abonnement Stripe existe, une lecture Stripe peut compléter `interval` et `interval_count`. L'absence de Stripe **n'empêche pas** la consultation de la base.

**Erreurs :** `401` JWT ; `500 {"error":"Erreur lors de la récupération de l'abonnement"}`.

### 8.3. `PUT /api/payments/subscription` — Changement d'offre Stripe

**JWT requis.** **Body obligatoire :** `{ "priceId": "price_test_nouveau" }`.

**Réponse `200 OK` (abrégée) :**

```json
{
  "message": "Abonnement modifié avec succès",
  "subscription": {
    "id": "sub_exemple",
    "status": "active"
  }
}
```

L'objet `subscription` est en réalité l'objet Stripe complet, non le sous-ensemble de l'exemple.

**Traitement :** recherche d'un abonnement actif appartenant à l'utilisateur, lecture Stripe, mise à jour du prix de son premier item, avec prorata `create_prorations`.

**Erreurs :** `401` JWT ; `503 {"error":"Stripe non configuré"}` ; `400 {"error":"priceId est requis"}` ou `{"error":"Aucun ID d'abonnement Stripe trouvé"}` ; `404 {"error":"Aucun abonnement actif trouvé"}` ; `500 { error, details }`.

### 8.4. `DELETE /api/payments/subscription` — Annulation

**JWT requis.** Aucun body.

**Réponse `200 OK` (abrégée) :**

```json
{
  "message": "Abonnement annulé avec succès",
  "subscription": {
    "id": "sub_exemple",
    "status": "canceled"
  }
}
```

**Traitement :** annule l'abonnement dans Stripe, met le statut SQL à `canceled`, puis tente de limiter le nombre de comptes utilisateur à deux (conservation des plus anciens). Il s'agit d'une opération **destructive potentielle** au niveau des comptes, à ne pas tester avec des données importantes.

**Erreurs :** `401` JWT ; `503 {"error":"Stripe non configuré"}` ; `400 {"error":"Aucun ID d'abonnement Stripe trouvé"}` ; `404 {"error":"Aucun abonnement actif trouvé"}` ; `500 { error, details }`.

---

## 9. Webhook Stripe et route technique

Sources : [`backend/src/routes/webhook.ts`](../backend/src/routes/webhook.ts), [`backend/src/app.ts`](../backend/src/app.ts).

### 9.1. `POST /api/webhook` — Réception d'événements Stripe

**Authentification :** pas de JWT. Le handler attend l'en-tête **`stripe-signature`** et la vérification cryptographique de la signature avec `STRIPE_WEBHOOK_SECRET`.

**Body :** événement JSON signé par Stripe, transmis dans la pratique comme **corps brut** de la requête. Exemple de type d'événement : `checkout.session.completed` ou `customer.subscription.created`.

**Réponse `200 OK` :**

```json
{ "received": true }
```

**Erreurs explicites :**

- `400` texte `Stripe n’est pas configuré correctement.` quand `stripe` est nul.
- `400` texte `Signature Stripe manquante dans les en-têtes.` si l'en-tête est absent.
- `503` texte `Stripe webhook désactivé (STRIPE_WEBHOOK_SECRET manquant)` si le secret manque (après les contrôles précédents).
- `400` texte `Webhook Error: ...` si la validation de signature échoue.

**Actions implémentées dans ce routeur :** journalisation de `checkout.session.completed` et `customer.subscription.created`. Il **n'effectue pas** les mutations complètes d'abonnement présentes dans un ancien handler du fichier `payments.controller.ts`, lequel n'est pas branché sur cette route. Il ne faut donc pas présenter les abonnements comme automatiquement synchronisés par ce webhook actuel.

**Problème technique à vérifier :** dans `app.ts`, `express.json()` est enregistré **avant** `webhookRoute`. Une requête Stripe `application/json` risque donc d'être parsée avant le middleware `bodyParser.raw(...)`, incompatible avec la vérification attendue sur le corps brut. La correction relève d'un futur chantier technique, pas de la documentation seule.

### 9.2. `GET /` — Test direct du backend

**Authentification :** aucune. Aucun paramètre.

**Réponse `200 OK` en texte brut :**

```text
Hello World from backend!
```

**Attention :** cette route est définie par Express, mais la page `https://monbudgie.fr/` sert l'application Vue via Nginx. Elle peut être consultée directement par l'URL du backend **dans un environnement local approprié**, par exemple `http://localhost:5001/` lorsque son port est exposé.

---

## 10. Règles métiers et validations

### 10.1. Quotas du plan gratuit

Les limites par défaut sont implémentées dans `utils/subscription.ts` et dans la création des comptes :

| Ressource | Limite sans Premium | Contrôle |
| --- | --- | --- |
| Comptes financiers | 2 comptes au total | `POST /api/accounts`. |
| Revenus | 2 par compte | `POST /api/revenus`. |
| Dépenses | 7 par compte | `POST /api/expenses`. |

Les plafonds sont testés **à la création** ; les modifications et lectures restent accessibles. Un abonnement Premium actif et non expiré peut lever ces limites en fonction des règles codées. La V1 garde ces vérifications même lorsque les routes de paiement Stripe sont désactivées.

### 10.2. Autorisation des ressources

- **Comptes :** filtrage SQL `WHERE user_id = req.user.id` pour la lecture, la modification et la suppression ; la création associe le nouveau compte à l'utilisateur connecté.
- **Revenus et dépenses :** la création vérifie la propriété de `account_id` ; liste, détail, modification et suppression joignent `accounts` pour filtrer sur son propriétaire et le type `income`/`expense`.
- **Prévisions :** récupération initiale des comptes limitée à l'utilisateur, puis des transactions associées à chacun de ses comptes.
- **Abonnements :** sélection par `user_id` issu du JWT ; webhook Stripe vérifié par signature plutôt que JWT.

### 10.3. Récurrences

- Une transaction récurrente possède `duration_type = "recurring"` et une ligne dans `recurrence_rules`.
- Valeurs SQL autorisées de `interval_unit` : `day`, `month`, `year`.
- `interval_count` doit être supérieur ou égal à 1 d'après les validations JavaScript, mais le code ne garantit pas qu'il s'agisse réellement d'un entier.
- `end_date = null` signifie absence de date de fin.
- Passage d'une transaction récurrente à ponctuelle lors d'un `PUT` : suppression de sa règle de récurrence.
- Il n'existe pas d'endpoint distinct CRUD pour `recurrence_rules` ou `transaction_exceptions` dans `app.ts`.

### 10.4. Validations qui ne sont pas encore garanties

Le code ne comporte pas de schéma de validation centralisé (par exemple Zod/Joi) pour les payloads présentés. La base PostgreSQL impose certaines contraintes (`UUID`, `DATE`, `NUMERIC`, `UNIQUE`, valeurs de `transaction_type` et `interval_unit`), mais des entrées invalides peuvent produire des exceptions SQL au lieu de réponses `400` contrôlées.

À surveiller particulièrement : format e-mail, sécurité du mot de passe, nombres finis, `amount`, dates valides, `interval_count` entier, bornes temporelles, devise ISO, taux négatifs ou excessifs, et cohérence `end_date >= start_date`.

---

## 11. Exemples cURL et vérification

> **Consigne :** utiliser de préférence **une base locale jetable**, avec un compte de test. Les commandes ci-dessous ne doivent pas être lancées telles quelles contre la production : inscriptions, mutations et suppressions ont des effets persistants. Les exemples `curl` supposent un terminal Bash ; PowerShell nécessite parfois une adaptation de la gestion des guillemets.

### 11.1. Vérifier l'accessibilité du backend local

```bash
curl -i http://localhost:5001/
```

Réponse attendue **d'après le code** : `200` et `Hello World from backend!`.

### 11.2. Tester l'absence de JWT

```bash
curl -i http://localhost:5001/api/accounts
```

Réponse attendue **d'après le middleware** : `401` et `{"error":"Token manquant"}`.

### 11.3. Créer un utilisateur de test (local uniquement)

```bash
curl -i -X POST http://localhost:5001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name":"Camille",
    "last_name":"Test",
    "email":"camille@example.test",
    "password":"exemple-mot-de-passe"
  }'
```

Récupérer `token` dans le JSON de réponse, puis renseigner **localement** la variable d'environnement du terminal (ne jamais committer le jeton) :

```bash
export BUDGIE_TOKEN='<JWT_REÇU>'
```

### 11.4. Lister les comptes et revenus

```bash
curl -i http://localhost:5001/api/accounts \
  -H "Authorization: Bearer $BUDGIE_TOKEN"

curl -i http://localhost:5001/api/revenus \
  -H "Authorization: Bearer $BUDGIE_TOKEN"
```

### 11.5. Calculer une prévision

```bash
curl -i 'http://localhost:5001/api/previsions?target_date=2027-10-23' \
  -H "Authorization: Bearer $BUDGIE_TOKEN"
```

### 11.6. Exemple Postman

1. Créer un environnement avec `baseUrl = http://localhost:5001/api` et `token` vide.
2. Exécuter `POST {{baseUrl}}/auth/login` avec un compte de test.
3. Copier la valeur `token` dans la variable d'environnement Postman.
4. Sur les requêtes protégées, configurer `Authorization: Bearer {{token}}`.
5. Vérifier `Content-Type`, corps de réponse, code HTTP, permissions et erreurs avec des données **non sensibles**.
6. Ne pas exécuter `DELETE /auth/me`, `DELETE /accounts/:id` ou les routes de paiement sur des comptes réels.

### 11.7. Matrice de tests fonctionnels à exécuter

| Scénario | Attendu selon le code | Statut de validation |
| --- | --- | --- |
| `GET /api/accounts` sans JWT | `401 Token manquant` | À exécuter localement |
| `POST /api/auth/register` incomplet | `400 Champs requis` | À exécuter localement |
| Connexion avec mauvais mot de passe | `401 Identifiants invalides` | À exécuter localement |
| `GET /api/auth/me` valide | `200` profil | À exécuter localement |
| Création d'un 3e compte gratuit | `403` et `limitReached: true` | À exécuter localement |
| Création d'un revenu avec compte d'autrui | `403 Compte non autorisé` | À exécuter en environnement isolé avec deux comptes tests |
| `GET /api/revenus/:id` d'autrui | `404 Revenu non trouvé` | À exécuter en environnement isolé |
| Récurrence mensuelle valide | `201` transaction et règle en base | À exécuter localement |
| Prévision avec date cible | `200` `accounts` et totaux | À exécuter et vérifier numériquement |
| Webhook Stripe signé | Selon configuration Stripe | À tester avec Stripe CLI *en environnement dédié* |

---

## 12. Limites et points d'attention

1. **Différence code/production.** Le contenu public de la branche `main` a été consulté le 23/10/2026, mais la version effective déployée sur le VPS n'a pas été identifiée par hash de commit. Une modification non déployée est donc possible.
2. **Route webhook et parsing JSON.** `express.json()` précède le routeur webhook dans `app.ts`. Pour une vérification fiable de la signature Stripe, le traitement du corps brut doit être audité. Dans le routeur actuellement monté, les événements sont surtout journalisés.
3. **API Stripe conditionnelle.** Les handlers existent dans le dépôt, mais Stripe est nul sans clé secrète. Ne pas afficher ces fonctions comme pleinement disponibles dans la V1 publique sans preuve de configuration.
4. **Erreur non uniforme.** Certaines erreurs sont `{ error: ... }`, d'autres `{ message: ... }` ; certains contrôleurs de revenus/dépenses ne capturent pas les erreurs de base de données.
5. **Validation insuffisamment centralisée.** Des contraintes SQL assurent une partie de la validité, mais certaines valeurs incorrectes ne sont pas rejetées proprement par `400`.
6. **Calculs financiers à valider.** Le calcul de solde décoré de `/api/accounts` et les prévisions `/api/previsions` utilisent des formules et soldes de départ différents. Les méthodes d'intérêts et la prise en compte des récurrences doivent être validées avant utilisation comme estimation financière fiable.
7. **Pas de pagination.** Les endpoints liste revenus, dépenses et comptes retournent toutes les lignes correspondant à l'utilisateur ; il n'y a pas de paramètres de pagination ou tri client documentés.
8. **Absence de `GET /api/accounts/:id`.** Le détail d'un compte n'a pas de route GET dédiée dans le backend actuel ; l'API fournit `GET /api/accounts` et les mutations par `:id`.
9. **Absence de modification de mot de passe.** Aucune route de renouvellement/réinitialisation du mot de passe n'est déclarée dans `app.ts`.
10. **Tests de production non réalisés.** Le domaine a été consulté, mais aucune requête authentifiée, mutation d'état ou transaction Stripe n'a été effectuée sur la production. Les réponses présentées sont dérivées du code, pas de captures réseau.

### Priorités recommandées pour une future V2 (hors périmètre de ce document)

- Standardiser les erreurs JSON et les validations métier.
- Ajouter des tests automatisés d'API (authentification, propriétés des ressources, quotas, récurrences, calculs).
- Corriger l'intégration et les effets réels du webhook Stripe avant toute réactivation des paiements.
- Revoir les algorithmes de prévisions et d'intérêts et documenter précisément la formule métier.
- Envisager une spécification OpenAPI/Swagger après stabilisation des contrats d'API.

---

## 13. Sources dans le dépôt

- [Point d'entrée et montage des routes — `backend/src/app.ts`](../backend/src/app.ts)
- [Authentification — `backend/src/routes/auth.ts`](../backend/src/routes/auth.ts)
- [Comptes — `backend/src/routes/accounts.ts`](../backend/src/routes/accounts.ts)
- [Routes revenus — `backend/src/routes/revenus.ts`](../backend/src/routes/revenus.ts)
- [Contrôleur revenus — `backend/src/controllers/revenusController.ts`](../backend/src/controllers/revenusController.ts)
- [Routes dépenses — `backend/src/routes/expenses.ts`](../backend/src/routes/expenses.ts)
- [Contrôleur dépenses — `backend/src/controllers/expensesController.ts`](../backend/src/controllers/expensesController.ts)
- [Prévisions — `backend/src/routes/previsions.ts`](../backend/src/routes/previsions.ts)
- [Routes paiements — `backend/src/routes/payments.routes.ts`](../backend/src/routes/payments.routes.ts)
- [Contrôleur paiements — `backend/src/controllers/payments.controller.ts`](../backend/src/controllers/payments.controller.ts)
- [Webhook — `backend/src/routes/webhook.ts`](../backend/src/routes/webhook.ts)
- [Limites des abonnements — `backend/src/utils/subscription.ts`](../backend/src/utils/subscription.ts)
- [Configuration Stripe — `backend/src/config/stripe.ts`](../backend/src/config/stripe.ts)
- [Schéma SQL — `db/init.sql`](../db/init.sql)
- [Configuration Nginx de production — `nginx/default.conf`](../nginx/default.conf)

**Maintenance de la documentation :** mettre à jour ce fichier lors de chaque création, suppression ou modification contractuelle d'un endpoint. Vérifier séparément l'état déployé en production après le pipeline CI/CD.
