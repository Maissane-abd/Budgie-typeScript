# Roadmap Budgie V2.1

Cette feuille de route propose les prochains travaux à partir des
[limites connues de la V2](known-limitations.md). Tous les éléments ci-dessous
restent à réaliser. Les priorités expriment un ordre de travail ; aucune date de
livraison n'est fixée.

## P0 — Rendre une installation neuve utilisable et récupérable

- [ ] **Aligner l'authentification et le schéma PostgreSQL.** Supprimer les
      dépendances d'abonnement inutilisées ou fournir un schéma et une migration
      cohérents avec le service gratuit et son plafond de dix comptes.
      **Acceptation :** sur une base vide initialisée par les scripts du dépôt,
      l'inscription, la connexion, `GET /api/auth/me` et la suppression du profil
      fonctionnent ; le plafond affiché correspond à celui de l'API. Une mise à niveau
      d'une base existante conserve les utilisateurs et leurs opérations.
- [ ] **Fiabiliser Docker local et production.** Aligner la casse et les chemins
      des Dockerfiles, les versions de Node.js des images et de la CI, éviter que
      le montage local du backend masque sa compilation et rendre les images
      reproductibles à partir des fichiers de
      verrouillage et corriger les sondes de santé, leurs outils et leur configuration TLS.
      **Acceptation :** construction sur Linux depuis un clone propre, démarrage local
      sur `http://localhost:8080`, puis validation de la configuration production dans
      un environnement de test ; les sondes distinguent une API disponible d'une base
      inaccessible. Les ports publics attendus sont vérifiés après fusion Compose.
- [ ] **Mettre en place sauvegarde et restauration.** Définir une fréquence,
      une rétention, un emplacement de copie distinct et les accès nécessaires.
      **Acceptation :** une sauvegarde est restaurée sur une base isolée et un parcours
      de lecture des comptes/opérations y réussit ; la procédure et les objectifs de
      perte de données et de temps de reprise sont documentés.
- [ ] **Faire exécuter les tests par la CI.** Ajouter les suites backend et
      frontend aux contrôles qui conditionnent le déploiement.
      **Acceptation :** une régression introduite dans un test fait échouer le workflow
      et empêche le job de déploiement ; les vérifications actuelles restent actives.

## P1 — Renforcer la sécurité et la cohérence des opérations

- [ ] **Durcir l'authentification.** Corriger les origines autorisées, limiter les
      tentatives abusives et définir la gestion de session et sa révocation, y compris
      le choix du stockage du jeton. Rendre la durée configurée effective et supprimer
      les paramètres devenus inutiles.
      **Acceptation :** tests des jetons manquants, expirés et invalides, des origines
      autorisées et refusées et des tentatives répétées ; une déconnexion suit la
      politique de session documentée. Le choix de stockage comprend les protections
      nécessaires au mécanisme retenu.
- [ ] **Uniformiser validation et transactions SQL.** Valider les types, les UUID,
      les dates, les montants finis et positifs et les bornes des taux ; rendre atomiques
      les écritures transaction/récurrence et utilisateur/compte principal. Garantir le
      plafond de comptes lors de créations concurrentes.
      **Acceptation :** une entrée invalide renvoie une erreur explicite sans écriture
      partielle ; un échec de création de récurrence annule l'opération associée ; des
      requêtes concurrentes ne permettent pas de dépasser dix comptes.
- [ ] **Vérifier l'isolation avec PostgreSQL et un navigateur réels.** Ajouter des
      tests d'intégration API et un parcours de bout en bout sur des données dédiées.
      **Acceptation :** deux utilisateurs ne peuvent lire, déplacer, modifier ou
      supprimer les ressources de l'autre ; inscription, connexion, CRUD des comptes
      et opérations, prévision et déconnexion passent dans un environnement isolé.
- [ ] **Clarifier le profil gratuit.** Retirer les appels et libellés de paiement
      inactifs, ainsi que les métadonnées incohérentes avec le plafond effectif.
      **Acceptation :** le profil affiche la limite de dix comptes et n'offre aucun
      parcours d'achat sans service disponible.

## P1 — Rendre les hypothèses de prévision explicites et testées

- [ ] **Définir les règles calendaires et les dates passées.** Choisir le traitement
      des échéances du 29, 30 et 31, des années bissextiles et d'une cible antérieure
      à aujourd'hui ; présenter la règle dans l'interface.
      **Acceptation :** tests couvrant le 31 janvier, le 29 février, une date de fin,
      le jour courant et des exécutions dans plusieurs fuseaux ; les dates passées
      sont rejetées clairement ou produisent un historique correctement défini.
- [ ] **Sécuriser les montants et les totaux par devise.** Choisir une arithmétique
      décimale ou en unités monétaires entières et éviter l'addition de devises différentes.
      **Acceptation :** résultats stables au centime sur de longues séries ; devises
      affichées correctement ; totaux regroupés par devise ou conversion explicite
      selon un taux identifié. La convention de pourcentage est cohérente dans le
      schéma, les exemples et l'interface.
- [ ] **Tester et expliquer les intérêts nets.** Conserver le modèle annuel à
      anniversaire ou définir son évolution, en rendant visibles taux, fiscalité,
      date de crédit et hypothèses.
      **Acceptation :** calculs vérifiés pour zéro intérêt, plusieurs anniversaires,
      année bissextile et mouvements le jour du crédit ; l'utilisateur peut comprendre
      comment le montant net a été obtenu.
- [ ] **Borner le coût des prévisions.** Mesurer les longues périodes et les
      récurrences quotidiennes ; optimiser les occurrences et les lectures SQL ou
      limiter explicitement la charge acceptée.
      **Acceptation :** jeux de référence et budget de temps/mémoire documentés ; les
      demandes hors budget sont rejetées clairement sans bloquer les autres utilisateurs.

## P2 — Améliorer l'autonomie et l'exploitation

- [ ] **Récupération de mot de passe.** Remplacer la simulation par un flux réel
      avec jeton temporaire à usage unique et réponse qui ne révèle pas l'existence
      d'un compte. **Acceptation :** expiration, réutilisation et invalidation de session
      sont testées ; aucun secret n'est inscrit dans les journaux.
- [ ] **Export personnel.** Fournir un export des comptes et opérations dans un
      format documenté. **Acceptation :** l'export ne contient que les données de
      l'utilisateur authentifié et conserve montants, devises et règles de récurrence.
- [ ] **Migrations et livraison récupérable.** Versionner les évolutions du schéma,
      documenter la reprise après échec et ajouter une vérification applicative après
      déploiement. **Acceptation :** mise à niveau et procédure de retour éprouvées en
      environnement de test, sans effacement des données existantes.
- [ ] **Accessibilité et confidentialité.** Vérifier clavier, focus et annonces
      d'erreur des formulaires/modales ; compléter la revue juridique et définir les
      règles de conservation identifiées comme manquantes.
      **Acceptation :** parcours essentiels utilisables au clavier, contrôles
      d'accessibilité documentés, règles de conservation publiées et appliquées.
- [ ] **Remettre à niveau les références techniques V1.** Actualiser `docs/api.md` et
      `docs/database.md` après stabilisation du schéma
      et des routes. **Acceptation :** seuls les endpoints montés sont décrits comme
      disponibles, le dictionnaire SQL correspond au schéma et aux migrations, et
      les exemples de taux, ports et plafonds correspondent au comportement testé.

## Évolutions à cadrer après stabilisation

Les exceptions de récurrence, virements internes et règles d'épargne automatique
pourront être étudiés après les correctifs précédents. Leur conception devra éviter
le double comptage des transferts et garantir l'isolation utilisateur. Le code
d'exceptions existant devra être sécurisé avant toute exposition par l'API.

La synchronisation bancaire, le suivi d'investissements, le blog et un tableau
de bord d'administration restent des pistes séparées, sans engagement pour V2.1.

[Retour au README](../README.md) · [Changelog V2](../CHANGELOG.md)
