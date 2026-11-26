# Vérification des pages juridiques de Budgie

Revue du 26 novembre 2026. **Statut : brouillon à compléter, sans validation juridique définitive.**

Les trois pages publiques décrivent le service de budget accessible sur monbudgie.fr.
Elles sont séparées du code source et de la documentation technique. Cette fiche conserve
les constats de la revue documentaire et technique ; elle ne remplace pas les pages publiques
ni une relecture par un professionnel du droit.

## Informations confirmées

L’éditeur a confirmé dans la demande : **Maïssane ABDALLAH, particulier, Paris, France**,
avec **abd.maissane@gmail.com** comme contact à publier pour le support et la confidentialité.
Il ne s’agit pas d’une adresse postale complète. Aucun courriel de test n’a été envoyé.

Les textes sont centralisés dans `frontend/app/src/content/legal.ts`, avec leur date,
leur statut de brouillon et les points restant à compléter. Ils sont accessibles à :

- `/mentions-legales` ;
- `/politique-de-confidentialite` ;
- `/conditions-utilisation`.

Le footer commun donne accès aux trois pages et au contact. L’inscription présente
une information sur les données et des liens avant le bouton de création du compte.
Elle ne présente pas l’acceptation des CGU comme un consentement général au traitement
des données. Aucune preuve d’acceptation de CGU définitives n’est collectée par ce changement.

## Concordance avec le fonctionnement examiné

| Sujet                  | Constat retenu                                                                                                             | Preuve dans le dépôt                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Identité               | Prénom, nom, e-mail, identifiant, empreinte du mot de passe et dates                                                       | `db/init.sql`, `backend/src/routes/auth.ts`                                   |
| Budget                 | Comptes manuels, soldes, devises, descriptions, taux, revenus, dépenses et récurrences                                     | `db/init.sql`, `backend/src/routes/accounts.ts`, contrôleurs revenus/dépenses |
| Prévisions             | Calculs à partir des saisies, y compris les taux lorsqu’ils sont renseignés                                                | `backend/src/routes/previsions.ts`                                            |
| Connexion bancaire     | Aucun connecteur bancaire ni paiement actif identifié                                                                      | `backend/src/app.ts`, routes et interfaces examinées                          |
| Gestion du compte      | Modification du prénom, du nom et de l’e-mail ; suppression confirmée depuis le profil                                     | `frontend/app/src/views/Profiles.vue`, `backend/src/routes/auth.ts`           |
| Suppression            | Cascade en base active sur comptes, opérations et récurrences ; aucun effacement des sauvegardes/journaux démontré         | `db/init.sql`, `backend/src/routes/auth.ts`                                   |
| Session                | Jeton `budgie_token` en localStorage, contenant identifiant et e-mail, valide un jour ; expiration et effacement distincts | `LoginView.vue`, `userStore.ts`, `backend/src/routes/auth.ts`                 |
| Journaux               | IP transmise par Nginx ; identifiant/e-mail journalisés lors de certaines requêtes ; erreurs techniques                    | `nginx/default.conf`, `backend/src/controllers/revenusController.ts`          |
| Sécurité               | Mot de passe haché avec bcrypt ; HTTPS configuré en production ; aucun chiffrement de bout en bout démontré                | `backend/src/routes/auth.ts`, `nginx/default.conf`                            |
| Récupération et export | Aucun parcours effectif de réinitialisation du mot de passe ni export autonome identifié                                   | Routeur frontend et API examinés                                              |
| Traceurs               | Pas d’analytics, publicité ou cookie applicatif identifié dans le code examiné ; le déploiement reste à contrôler          | `frontend/app/src`, `frontend/app/index.html`, `frontend/app/public`          |
| Hébergement            | OVHcloud annoncé dans le README ; entité contractante, emplacement et garanties non établis                                | `README.md`, configurations Compose                                           |

Les descriptions libres peuvent contenir des informations privées supplémentaires. Les textes
conseillent de ne pas y saisir de secrets bancaires, de justificatifs ou de données sensibles inutiles.
Les données financières personnelles ne sont pas toutes, par leur seule nature, des données
de catégorie particulière au sens de l’article 9 du RGPD.

Le message du profil promettant auparavant l’effacement de « toutes vos données » a été corrigé
pour viser la base active et renvoyer à la politique de confidentialité.

## Revue documentaire juridique

La revue a contrôlé les informations à fournir, les droits, les délais et la distinction entre
stockage nécessaire à l’authentification et traceurs soumis au consentement. Les bases proposées
sont l’exécution du service pour compte/budget, l’intérêt légitime à documenter pour sécurité
et certaines demandes de contact, et l’obligation légale pour les demandes de droits.
Elles doivent être confirmées dans le registre des traitements et dans les pratiques effectives.

Les CGU expliquent le caractère indicatif des prévisions et évitent une exonération générale
de responsabilité ou une compétence judiciaire exclusive imposée à l’utilisateur.

Sources officielles consultées le 26 novembre 2026 :

- [CNIL — Information et transparence](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence) : périmètre de l’information et accès distinct de la politique de confidentialité.
- [CNIL — RGPD, chapitre III](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3) : articles 12 et 13, droits d’accès, rectification, effacement, limitation, portabilité et opposition.
- [CNIL — Cookies et traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi) : information et exemption possible des traceurs strictement nécessaires à l’authentification.
- [CNIL — Durées de conservation](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees) : fixation et mise en œuvre des durées.
- [CNIL — Adresser une plainte](https://www.cnil.fr/fr/adresser-une-plainte) : recours et lien utilisé dans la politique.
- [LCEN — Article 1-1](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049568614/) : mentions et régime des éditeurs non professionnels. Article retrouvé dans l’index officiel ; l’ouverture directe a retourné 403 pendant la recherche. Sa version applicable doit être relue avant validation.
- [Service Public — Mentions d’un site professionnel](https://entreprendre.service-public.gouv.fr/vosdroits/F37351) : référence complémentaire si le statut évolue ; cette page ne suffit pas à qualifier les obligations d’un éditeur particulier.

## Conditions avant validation définitive

- [ ] Vérifier le statut effectif de l’activité et le régime des coordonnées à publier pour cet éditeur non professionnel ; compléter l’adresse et les autres coordonnées requises, et confirmer le responsable de publication. Ne pas déduire ces informations de la seule localisation « Paris ».
- [ ] Identifier l’entité contractante d’hébergement, son adresse et son téléphone à partir du contrat, puis les lieux de stockage, les accès, les sous-traitants, les transferts éventuels hors EEE et leurs garanties.
- [ ] Examiner aussi Gmail/Google pour la boîte de contact : conditions applicables, transferts, destinataires, conservation des messages et sécurité des accès. L’adresse de support ne prouve pas à elle seule l’adéquation du service de messagerie.
- [ ] Fixer et appliquer les règles de conservation des comptes actifs/inactifs, les délais de purge, les journaux, les messages et les éventuelles sauvegardes. Ne pas inventer des durées pour compléter la page.
- [ ] Organiser le traitement privé des demandes de droits, y compris les réponses dans les meilleurs délais et au plus tard sous un mois, l’export à fournir sur demande et la vérification proportionnée de l’identité.
- [ ] Documenter les bases légales, les intérêts légitimes et la nécessité des champs obligatoires, notamment prénom/nom.
- [ ] Contrôler le service déployé : schéma réel, suppression en cascade, cookies et stockage, ressources tierces, journaux, HTTPS et coordonnées de contact.
- [ ] Harmoniser les limites de comptes avant toute promesse chiffrée : l’API applique 10 comptes, tandis que les informations de plan et le README évoquent 2. Aucun plafond contractuel n’est inventé dans les CGU.
- [ ] Vérifier la cohérence des tables `subscriptions`/`plans` référencées par l’authentification avec le schéma effectivement déployé ; ne pas déduire des capacités payantes de la documentation obsolète.
- [ ] Faire relire la version complète par un professionnel du droit, confirmer la version applicable et définir l’information/acceptation des CGU si nécessaire.
- [ ] Après validation seulement, mettre à jour la date et les mentions de brouillon dans `legal.ts`, `LegalPageView.vue`, `AppFooter.vue`, `RegisterView.vue` et les CGU ; réexaminer le `noindex`, le sitemap et leurs contrôles.

## Vérification technique reproductible

Depuis la racine du dépôt, sous Windows, utiliser les exécutables `.cmd` si PowerShell bloque
les scripts npm. La compilation contrôle aussi les types Vue et produit l’accueil et les trois
pages juridiques en HTML initial ; elle n’accède pas aux données des comptes.

```powershell
npm.cmd --prefix frontend/app test
npm.cmd --prefix frontend/app run build
npm.cmd --prefix frontend/app run verify:public
```

`verify:public` contrôle le HTML sans exécuter JavaScript : footer, destinations, titres,
ancres, métadonnées et styles. Les tests de navigation vérifient aussi que les pages juridiques
restent accessibles sans appel d’authentification, même avec un jeton périmé.
Les règles Nginx et l’aperçu Vite servent les pages juridiques pré-rendues à leurs URL propres.
Les brouillons sont en `noindex, follow` et restent hors du sitemap.

Ces contrôles techniques ne constituent pas une validation juridique. La recette sur
l’infrastructure de production et la relecture professionnelle restent à effectuer.

Résultats de la vérification locale : 37 tests réussis, compilation avec contrôle des types,
lint frontend sans avertissement et vérification du HTML public réussis. Le formatage et
`git diff --check` ont également été contrôlés. Le défilement revient en haut après un clic
sur les liens du footer et restaure la position lors d’un retour dans l’historique.

Le navigateur connecté était indisponible : l’affichage visuel et les interactions dans
un navigateur n’ont pas été vérifiés. Les configurations Nginx ont été relues statiquement,
sans exécution du serveur Nginx pendant cette revue.
