# Limites connues — Budgie V2

Cette liste décrit le code et les configurations versionnés. Les constats issus de la
[revue juridique](legal-review.md) sont attribués à cette revue ; ils ne constituent
pas un audit du serveur de production. Les corrections proposées sont suivies dans la
[roadmap V2.1](roadmap-v2.1.md).

## Installation et exploitation

| Limite                                                                    | Effet concret                                                                                                                                                                                                                                                                                                                                                  | Référence                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Schéma d'authentification incomplet sur une base neuve                    | La requête `queryUser` joint `subscriptions` et `plans`, absentes de `db/init.sql`. L'inscription peut créer un utilisateur, mais la connexion et `GET /api/auth/me` échouent si ces tables n'existent pas déjà.                                                                                                                                               | [Authentification](../backend/src/routes/auth.ts), [schéma initial](../db/init.sql)                           |
| Chemins des Dockerfiles incohérents en environnement sensible à la casse  | Les fichiers suivis sont `backend/dockerfile` et `frontend/dockerfile`, alors que Compose utilise la découverte par défaut de `Dockerfile` pour le backend et `frontend/Dockerfile` pour le frontend. La construction doit être corrigée avant utilisation sur Linux.                                                                                          | [Compose](../compose.yml), [backend](../backend/dockerfile), [frontend](../frontend/dockerfile)               |
| Contrôles de santé à fiabiliser                                           | Les healthchecks de production utilisent `curl`, sans installation explicite dans les Dockerfiles ; celui du frontend appelle `https://localhost` avec un certificat destiné au domaine public. De plus, `/health` ne vérifie pas PostgreSQL et Nginx renvoie directement `200`. Un conteneur démarré ne garantit donc pas un parcours applicatif fonctionnel. | [Compose production](../compose.production.yml), [API](../backend/src/app.ts), [Nginx](../nginx/default.conf) |
| Sauvegarde et restauration non mises en place selon la revue documentaire | Le volume PostgreSQL conserve les données entre redémarrages, mais ne constitue pas une copie de secours. La revue rapporte qu'aucune sauvegarde Budgie n'est mise en place.                                                                                                                                                                                   | [Revue juridique](legal-review.md), [volume PostgreSQL](../compose.yml)                                       |
| Absence de migrations et de rollback automatisé dans le dépôt             | `init.sql` s'applique à la création d'un volume vide ; modifier ce script ne met pas à jour une base existante. Le workflow reconstruit sur le VPS et ne prévoit pas de retour automatique à la version précédente.                                                                                                                                            | [Initialisation](../db/init.sql), [déploiement](../.github/workflows/deploy.yml)                              |

Le montage local `./backend:/app` masque également le répertoire `dist` compilé
dans l'image ; un clone sans build sur l'hôte ne peut pas démarrer ainsi. Le
[guide d'installation](installation.md#3-préparer-la-construction-locale) propose
une surcharge locale pour ce montage et la casse des Dockerfiles.

Les images utilisent `node:20-alpine`, alors que la CI utilise Node.js 22 et que
des outils de développement, dont Vitest 5, exigent Node.js 22 ou une branche
ultérieure prise en charge. L'environnement Docker et celui des tests locaux ne
sont donc pas alignés. En production, Compose conserve le port HTTP `8080:80` et
ajoute `443:443` ; le dépôt ne publie pas `80:80`. L'accès HTTP externe et les
validations de certificats dépendent ainsi de la configuration du serveur.

## Fonctionnalités et prévisions

- **Dix comptes financiers au maximum.** Le compte principal créé à l'inscription
  entre dans ce total. L'API impose cette valeur, mais le profil conserve des
  métadonnées d'abonnement pouvant encore afficher une autre limite. Aucun paiement
  ni webhook Stripe n'est monté dans l'application Express.
  Sources : [comptes](../backend/src/routes/accounts.ts),
  [authentification](../backend/src/routes/auth.ts), [routes actives](../backend/src/app.ts).
- **Saisie manuelle des opérations.** Le dépôt ne fournit pas de synchronisation
  bancaire, de virement interne modélisé comme tel, de règle d'épargne automatique,
  ni d'import/export autonome dans l'interface.
- **Les exceptions de transaction ne modifient pas les prévisions.** Une table et
  du code d'API existent, mais le routeur d'exceptions n'est pas enregistré dans
  `app.ts` et le moteur ne lit pas `transaction_exceptions`. Leur activation demande
  également des contrôles d'authentification et de propriété dans ce module.
  Sources : [exceptions](../backend/src/routes/exceptionsRevenus.ts),
  [moteur](../backend/src/routes/previsions.ts), [application](../backend/src/app.ts).
- **Intérêts selon un modèle simplifié.** Le taux annuel, saisi en pourcentage
  (`2,5` pour `2,5 %`), est appliqué au solde à chaque anniversaire du compte ;
  la fiscalité saisie réduit ce montant. Le moteur ne modélise ni intérêts
  journaliers ou par quinzaine, ni changement de taux, ni inflation. Les opérations
  datées du même jour précèdent le calcul des intérêts.
  Source : [moteur de prévision](../backend/src/routes/previsions.ts).
- **Attention aux récurrences en fin de mois.** Les incréments mensuels et annuels
  utilisent `Date.setMonth` et `Date.setFullYear`. Une récurrence au 31 janvier peut
  déborder en mars ; une règle d'échéance au dernier jour du mois n'est pas définie.
  Source : [génération des occurrences](../backend/src/routes/previsions.ts).
- **Prévisions orientées vers le futur.** L'horizon maximal est de 100 ans à partir
  d'aujourd'hui. Une date passée n'est pas rejetée, mais ne reconstitue pas un
  historique des soldes : le calcul part du solde actuel. Les longues périodes
  génèrent les occurrences en mémoire et peuvent coûter cher avec des récurrences
  quotidiennes ou un historique important.
  Source : [validation et calcul](../backend/src/routes/previsions.ts).
- **Pas de conversion de devises.** Les comptes ont un champ `currency`, mais
  les totaux de prévision additionnent leurs montants sans conversion et l'affichage
  des prévisions utilise l'euro. Pour interpréter les totaux, utiliser des comptes
  dans une même devise.
  Sources : [totaux API](../backend/src/routes/previsions.ts),
  [affichage](../frontend/app/src/views/PrevisionsView.vue).
- **Arithmétique monétaire à renforcer.** PostgreSQL conserve les montants en
  `NUMERIC`, puis le moteur les convertit en `Number` JavaScript, avec arrondis à
  deux décimales pour les intérêts et les résultats. Il n'utilise pas une
  arithmétique décimale dédiée.
  Sources : [schéma](../db/init.sql), [calcul](../backend/src/routes/previsions.ts).

Les soldes projetés dépendent des données saisies et des hypothèses de calcul.
Ils ne garantissent pas le solde réel d'un compte bancaire.

## Sécurité et intégrité des données

Les routes financières actives utilisent `requireAuth`, des requêtes paramétrées
et des vérifications de propriété. Les mots de passe sont hachés avec bcrypt et
une politique est appliquée à l'inscription. Ces protections s'accompagnent des
limites suivantes :

- Le JWT est conservé dans `localStorage`, donc accessible aux scripts de même
  origine. Il expire après un jour ; il n'existe pas de renouvellement ni de
  révocation serveur. La déconnexion efface la copie du navigateur. La durée est
  fixée à `1d` dans le code, indépendamment de `JWT_EXPIRES_IN`.
- Aucun mécanisme de limitation des tentatives de connexion, de MFA, de vérification
  d'adresse e-mail ou de récupération opérationnelle du mot de passe n'est présent
  dans les routes actives. La vue de réinitialisation est une simulation et sa
  route est commentée.
- La liste CORS contient `http:localhost:80` et `https://budgie.com`, qui ne
  correspondent pas aux origines utilisées par l'installation locale et le domaine
  public. Le passage par `/api` sur la même origine évite la dépendance à cette liste.
- Les validations des montants, taux, devises et dates restent partielles selon les
  endpoints. La création/modification d'une transaction et de sa règle de récurrence,
  ainsi que l'inscription et la création du compte principal, utilisent plusieurs
  requêtes sans transaction SQL englobante : une erreur intermédiaire peut laisser
  un état partiel. Le comptage avant création des comptes n'est pas verrouillé contre
  les requêtes concurrentes.
- Si `DATABASE_URL` est défini, le pool PostgreSQL active TLS avec
  `rejectUnauthorized: false` : le certificat du serveur n'est pas vérifié.
  Source : [configuration du pool](../backend/src/models/db.ts).
- La conservation des journaux, des comptes inactifs et des messages de support
  reste à définir, selon la revue documentaire. Les textes juridiques sont encore
  indiqués comme brouillons à compléter et à faire relire.

Sources : [authentification](../backend/src/routes/auth.ts),
[middleware](../backend/src/middlewares/index.ts),
[store utilisateur](../frontend/app/src/stores/userStore.ts),
[routeur frontend](../frontend/app/src/router/index.ts),
[revenus](../backend/src/controllers/revenusController.ts),
[dépenses](../backend/src/controllers/expensesController.ts),
[revue juridique](legal-review.md).

## Qualité et CI/CD

Des tests Vitest couvrent notamment la politique de mot de passe, des prévisions,
la modification des revenus, la navigation et certains composants Vue. Le workflow
CI/CD exécute le lint, le typage/les builds et la vérification du HTML public,
mais **ne lance pas les suites Vitest**. Aucun test d'intégration avec PostgreSQL réel
ni parcours navigateur de bout en bout n'est configuré dans ce workflow.

Le contrôle public après déploiement vérifie uniquement qu'une requête HTTP vers
la page d'accueil réussit. Il ne valide ni la connexion, ni les autorisations,
ni une création d'opération ou un calcul de prévision.

Sources : [tests backend](../backend/tests), [tests frontend](../frontend/app/tests),
[workflow CI/CD](../.github/workflows/deploy.yml).
