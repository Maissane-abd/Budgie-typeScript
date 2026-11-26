# Changelog

Ce journal regroupe les évolutions de Budgie visibles dans le code et l’historique Git.
Le périmètre v2 ci-dessous est documenté au **26 novembre 2026** : cette date correspond
à la revue du dépôt, sans attester une publication ni un déploiement en production.
Aucun tag de version n’est présent dans le dépôt local ; les versions des fichiers
`package.json` restent `1.0.0` à la racine et dans le backend, et `0.0.0` dans le frontend.

## v2 — état du dépôt

### Fonctionnalités et comportement

- Gestion des comptes avec nom, description, date d’ouverture, devise, solde initial,
  taux d’intérêt annuel et taux de taxation. Le solde courant est calculé à partir du
  solde initial, des opérations échues et des intérêts nets ; une projection à douze
  mois est également renvoyée pour chaque compte.
- Remplacement de l’ancien plafond lié à l’abonnement par une limite de **10 comptes
  financiers par utilisateur**, compte principal créé à l’inscription compris.
- Création, modification et suppression de revenus et de dépenses, ponctuels ou
  récurrents. Les récurrences acceptent un intervalle en jours, mois ou années et une
  date de fin facultative.
- Modification du compte de rattachement d’un revenu ou d’une dépense, avec contrôle
  de la propriété du compte de destination.
- Recherche et filtres dans les listes : compte, période et type pour les revenus ;
  compte et tri par date ou montant pour les dépenses ; recherche et tri des comptes.
- Prévisions par compte et synthèse globale à une date choisie, avec détail mensuel
  des revenus, dépenses, intérêts nets et soldes. La nouvelle date s’applique au clic
  sur **Actualiser**.
- Calcul des intérêts et de leur taxation une fois par an, à la date anniversaire
  de l’ouverture du compte. Pour une ouverture le 29 février, l’anniversaire est
  ramené au 28 février les années non bissextiles. Les taux sont saisis en pourcentage
  (`2.5` représente `2,5 %`).
- Validation des dates de prévision et plafond de **100 ans à partir d’aujourd’hui**,
  contrôlés dans le frontend et l’API.

### Accueil et pages publiques

- Accueil public enrichi et pré-rendu au moment du build, avec titre, description,
  URL canonique et métadonnées Open Graph.
- Ajout des pages **Mentions légales**, **Politique de confidentialité** et
  **Conditions d’utilisation**, accessibles depuis le footer et pré-rendues comme
  l’accueil. Leur revue reste ouverte dans [le suivi juridique](docs/legal-review.md).
- Ajout de `robots.txt`, d’un sitemap et de métadonnées par route. Les pages
  d’authentification, de l’espace privé et les pages légales en cours de revue
  reçoivent la directive `noindex` ; le sitemap liste uniquement l’accueil.
- Conservation d’une coque SPA séparée (`app.html`) pour les pages privées et
  d’authentification, servie par Nginx lors des accès directs à ces routes.

### Corrections et sécurité

- Unification du calcul des soldes des comptes et des prévisions : les opérations
  passées et celles du jour entrent dans le solde de départ sans être ajoutées une
  seconde fois aux flux futurs. Recalculer une projection ne modifie pas les soldes
  enregistrés en base.
- Traitement des dates SQL `DATE` comme dates calendaires dans le moteur de calcul.
- Centralisation du middleware JWT et de la configuration du secret. L’API refuse
  de démarrer si `JWT_SECRET` n’est pas défini ; les jetons émis expirent après un jour.
- Protection des routes privées côté frontend, restauration de la session via
  `/api/auth/me` et retour vers une route privée interne après connexion. Les
  redirections externes ne sont pas acceptées par ce mécanisme.
- Politique commune de mot de passe à l’inscription : au moins **12 caractères**, une
  majuscule, un chiffre et un caractère spécial, avec un maximum de **72 octets UTF-8**.
  Les mots de passe existants ne sont pas modifiés par cette règle ; le stockage
  utilise `bcryptjs`.
- Retrait du parcours de réinitialisation du mot de passe du routeur tant que le
  service correspondant n’est pas disponible.

### Architecture, qualité et livraison

- Migration du frontend vers TypeScript, contrôle des composants avec `vue-tsc` et
  compilation du backend TypeScript avant son démarrage.
- Scripts de lint ESLint, formatage Prettier, contrôle de types, tests Vitest et
  builds disponibles dans le dépôt. Les tests couvrent notamment la politique de
  mot de passe, les gardes de navigation, les revenus et les prévisions.
- Configuration Docker distincte pour le développement HTTP et la production
  HTTPS, avec reverse proxy Nginx vers l’API et contrôles de santé des services.
- Workflow GitHub Actions sur les pull requests vers `dev` ou `main`, sur les pushs
  vers `main` et sur déclenchement manuel : lint, typage du backend, builds et
  vérification du HTML public pré-rendu. Le build frontend inclut `vue-tsc`.
- Déploiement SSH du commit ayant déclenché le workflow, réservé à `main` après
  réussite des contrôles : vérification de la clé d’hôte, avance rapide Git,
  validation de Compose, démarrage avec attente des services puis contrôle HTTP
  de l’accueil public.
- Agent de documentation Vegapunk configuré pour proposer des mises à jour par
  pull request.

### Retraits et limites de cette version

- Retrait des routes de paiement et du webhook Stripe ainsi que des contrôles
  d’abonnement sur les créations de revenus et de dépenses. Le dépôt conserve
  toutefois des dépendances et références de profil liées aux anciens abonnements.
- Les requêtes de connexion et de profil utilisent encore les tables `plans` et
  `subscriptions`, absentes du script `db/init.sql` actuel : le parcours complet
  d’authentification sur une base neuve reste bloqué par cette incohérence.
- Les exceptions de transaction présentes dans le schéma et dans des fichiers de
  contrôleur ne sont ni exposées par `app.ts` ni intégrées au moteur de prévision.
  Les transferts internes et l’affectation automatique d’un pourcentage de revenu
  ne sont pas implémentés.
- Les tests Vitest sont disponibles localement mais ne sont pas exécutés par le
  workflow CI/CD actuel. Celui-ci ne fournit pas de validation de bout en bout du
  parcours financier.

Les autres restrictions, leurs conséquences et les améliorations proposées sont
détaillées dans les [limites connues](docs/known-limitations.md) et la
[roadmap v2.1](docs/roadmap-v2.1.md).

### Repères dans l’historique

| Évolution                                                | Commit                          |
| -------------------------------------------------------- | ------------------------------- |
| Retrait du parcours Stripe et des contrôles d’abonnement | `e5bf523`                       |
| Migration du frontend vers TypeScript                    | `c6caf3d`                       |
| Politique de mot de passe à l’inscription                | `7e2ccb9`                       |
| Limite de 10 comptes financiers                          | `c1c3e22`                       |
| Garde des routes privées                                 | `cac3d5a`                       |
| Centralisation de l’authentification JWT                 | `c792049`                       |
| Soldes et calcul des prévisions                          | `bc5964e`                       |
| Validation de l’horizon de prévision                     | `4d77776`                       |
| SEO, pré-rendu et métadonnées                            | `ddf06a9`                       |
| Pages légales et navigation publique                     | `1c79cd1`, `a3f6bf2`, `425653e` |

Pour installer et vérifier cet état du projet, consulter le [README](README.md)
et le [guide d’installation](docs/installation.md).
