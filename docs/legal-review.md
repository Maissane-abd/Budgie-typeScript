# Vérification des pages juridiques de Budgie

Revue du 26 novembre 2026. **Statut : brouillon à compléter, sans validation juridique définitive.**

Les trois pages publiques décrivent le service de budget accessible sur monbudgie.fr.
Elles sont séparées du code source et de la documentation technique. Cette fiche conserve
les constats de la revue documentaire et technique ; elle ne remplace pas les pages publiques
ni une relecture par un professionnel du droit.

## Informations confirmées

Les éléments suivants ont été déclarés par l’éditeur pendant la préparation des textes.
Ils sont distingués des constats dans le code et ne valent pas audit du serveur ou des contrats :

- **Maïssane ABDALLAH**, particulier, est seul éditeur, responsable de publication,
  administrateur et interlocuteur pour les demandes d’accès, d’export et de suppression.
- La localisation publiable est **L’Haÿ-les-Roses, France**. L’éditeur souhaite garder son
  domicile et son numéro de téléphone privés. Une ville n’est pas une adresse postale complète ;
  le régime permettant cette présentation reste à vérifier ci-dessous.
- **abd.maissane@gmail.com** est l’adresse de contact à publier. Il s’agit d’une boîte Gmail
  personnelle grand public, lue seulement par l’éditeur, sans transfert automatique déclaré.
  Aucun courriel de test n’a été envoyé.
- Le profil [LinkedIn de Maïssane ABDALLAH](https://www.linkedin.com/in/ma%C3%AFssane-abdallah)
  est confirmé comme contact complémentaire. Les messages envoyés par ce canal sont traités
  sur LinkedIn, selon la politique de la plateforme ; ce lien ne constitue pas une connexion
  entre les comptes Budgie et LinkedIn.
- Le contrat d’hébergement désigne **OVH SAS** et un **VPS au Royaume-Uni**. L’interface,
  l’API et la base de données sont hébergées sur ce même VPS. Les prestataires déclarés pour
  l’hébergement et la messagerie sont OVH et Gmail ; LinkedIn est un canal de contact externe
  complémentaire. Aucun transfert automatique vers un autre outil n’a été indiqué.
- **Aucune sauvegarde n’est mise en place par Budgie.** Il n’y a donc pas de copie de secours
  déclarée pour restaurer les données après une perte. Cela ne permet pas de déduire les
  pratiques internes de conservation des fournisseurs.
- Le service est **entièrement gratuit, sans publicité et sans vente des données**.
- L’éditeur a confirmé **« Aucune règle définie pour les trois »**, à propos des journaux,
  des comptes inactifs et des messages de support. L’absence de règle est donc établie ;
  les durées, critères de conservation et modalités de purge restent à définir et à appliquer.
- L’éditeur souhaite accueillir **tous les âges, mineurs inclus**. Il s’agit de l’intention
  d’ouverture du service ; les conditions juridiques et le parcours adapté aux mineurs restent
  à examiner.
- **Aucun juriste n’a encore relu le site**, selon l’éditeur.

Les textes sont centralisés dans `frontend/app/src/content/legal.ts`, avec leur date
et leur statut interne de revue. Les points restant à compléter sont suivis dans cette fiche.
Ils sont accessibles à :

- `/mentions-legales` ;
- `/politique-de-confidentialite` ;
- `/conditions-utilisation`.

Le footer commun donne accès aux trois pages et au contact, y compris depuis l’inscription.
La présentation de l’information au moment de la collecte, ainsi que les conditions d’accueil
des mineurs, restent à vérifier sur le parcours final. L’acceptation des CGU ne constitue pas
un consentement général au traitement des données. Aucune preuve d’acceptation de CGU
définitives n’est collectée par ce changement.

À la demande de l’éditeur, la bannière « Version de travail — en cours de validation »
et la mention équivalente dans les CGU ont été retirées du rendu public. Le footer indique
« développé par Maïssane ABDALLAH ». Cette modification de présentation ne clôt pas la revue :
les points ouverts sont suivis ci-dessous et le statut interne demeure en attente.
Les faits désormais confirmés remplacent les anciennes incertitudes, sans inventer de durée
de conservation ou de garantie de conformité.

## Points encore à traiter

- Règles de conservation et de rotation des journaux, traitement des comptes inactifs,
  conservation des messages de support et purges : aucune règle n’est définie, fait confirmé.
  Il reste à les décider, les documenter et les appliquer ; aucune durée chiffrée ne doit être
  ajoutée par défaut.
- Détention par OVH des informations d’identification privées requises pour l’éventuel recours
  au régime d’anonymat des éditeurs non professionnels : l’éditeur a répondu « Je dois le vérifier ».
  La confirmation reste donc à obtenir.
- Coordonnées légales de l’entité OVH SAS à reprendre du contrat et des sources officielles,
  clauses de traitement, accès et éventuels transferts ultérieurs des fournisseurs : à contrôler.
  L’identité contractante et le pays du VPS sont connus ; ils ne sont plus des points à demander.
- Qualification et conditions de recours à Gmail grand public pour les messages des utilisateurs,
  lieux de traitement, transferts, sécurité et effacement effectif des messages : à documenter.
- Applicabilité du régime des éditeurs non professionnels et conditions d’accueil des mineurs :
  revue juridique nécessaire ; aucune dispense de coordonnées ni conformité « tous âges »
  n’est considérée comme acquise.

## Concordance avec le fonctionnement examiné

| Sujet                  | Constat retenu                                                                                                                      | Preuve dans le dépôt                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Identité               | Prénom, nom, e-mail, identifiant, empreinte du mot de passe et dates                                                                | `db/init.sql`, `backend/src/routes/auth.ts`                                   |
| Budget                 | Comptes manuels, soldes, devises, descriptions, taux, revenus, dépenses et récurrences                                              | `db/init.sql`, `backend/src/routes/accounts.ts`, contrôleurs revenus/dépenses |
| Prévisions             | Calculs à partir des saisies, y compris les taux lorsqu’ils sont renseignés                                                         | `backend/src/routes/previsions.ts`                                            |
| Connexion bancaire     | Aucun connecteur bancaire ni paiement actif identifié                                                                               | `backend/src/app.ts`, routes et interfaces examinées                          |
| Gestion du compte      | Modification du prénom, du nom et de l’e-mail ; suppression confirmée depuis le profil                                              | `frontend/app/src/views/Profiles.vue`, `backend/src/routes/auth.ts`           |
| Suppression            | Cascade en base active sur comptes, opérations et récurrences ; journaux et courriels distincts ; aucune sauvegarde Budgie déclarée | `db/init.sql`, `backend/src/routes/auth.ts` et déclaration de l’éditeur       |
| Session                | Jeton `budgie_token` en localStorage, contenant identifiant et e-mail, valide un jour ; expiration et effacement distincts          | `LoginView.vue`, `userStore.ts`, `backend/src/routes/auth.ts`                 |
| Journaux               | IP transmise par Nginx ; identifiant/e-mail journalisés lors de certaines requêtes ; erreurs techniques                             | `nginx/default.conf`, `backend/src/controllers/revenusController.ts`          |
| Sécurité               | Mot de passe haché avec bcrypt ; HTTPS configuré en production ; aucun chiffrement de bout en bout démontré                         | `backend/src/routes/auth.ts`, `nginx/default.conf`                            |
| Récupération et export | Aucun parcours effectif de réinitialisation du mot de passe ni export autonome identifié ; demandes d’export traitées par l’éditeur | Routeur frontend, API examinés et déclaration de l’éditeur                    |
| Traceurs               | Pas d’analytics, publicité ou cookie applicatif identifié dans le code examiné ; le déploiement reste à contrôler                   | `frontend/app/src`, `frontend/app/index.html`, `frontend/app/public`          |
| Hébergement            | OVH SAS, VPS Royaume-Uni commun à l’interface, à l’API et à la base ; contrat et garanties à contrôler                              | Déclaration de l’éditeur ; `README.md`, configurations Compose                |
| Sauvegardes            | Aucune sauvegarde mise en place par Budgie, selon l’éditeur ; aucune restauration promise                                           | Déclaration de l’éditeur                                                      |
| Messagerie             | Gmail personnel grand public, lecture et traitement des demandes par l’éditeur seul, sans transfert automatique déclaré             | Déclaration de l’éditeur                                                      |
| Contact LinkedIn       | Profil confirmé comme contact externe complémentaire ; messages traités sur la plateforme selon sa politique                        | Déclaration de l’éditeur et politique LinkedIn                                |
| Conservation           | Aucune règle définie pour les journaux, les comptes inactifs et les messages de support                                             | Réponse explicite de l’éditeur                                                |
| Modèle du service      | Gratuit, sans publicité ni vente des données, selon l’éditeur                                                                       | Déclaration de l’éditeur                                                      |

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

Le Royaume-Uni reste un pays hors EEE. Le cadre d’adéquation applicable au titre de l’article 45
du RGPD a été renouvelé par la décision (UE) 2025/2574 du 19 décembre 2025, qui fixe l’échéance
au 27 décembre 2031, sauf prorogation. Cela fournit un cadre pour les transferts couverts ;
cela ne certifie pas la conformité de Budgie, du contrat OVH ou des transferts ultérieurs.
Le maintien en vigueur et le périmètre doivent être suivis. [Décision officielle EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32025D2574).

Google indique explicitement ne proposer aucun accord de traitement des données pour Gmail
grand public et ne pas agir comme sous-traitant pour cette version. Il ne faut donc pas lui
attribuer les garanties contractuelles de Google Workspace. La qualification de l’usage de cette
boîte pour Budgie et les mesures adaptées demandent une analyse, sans conclure automatiquement
à sa conformité ou à son interdiction. [Google — Centre d’aide sur la confidentialité](https://support.google.com/policies/answer/9581826?hl=en).

Pour les utilisateurs de l’EEE, Google présente Google Ireland Limited comme responsable
du traitement relevant de sa politique ; celle-ci prévoit des traitements dans plusieurs pays.
Google décrit notamment l’adéquation et le cadre UE–États-Unis parmi les mécanismes qu’il utilise.
Ces déclarations ne prouvent ni une localisation de Gmail dans l’UE ni l’absence de transferts
pour la boîte de Budgie. [Politique Google](https://policies.google.com/privacy?hl=fr),
[cadres de transfert Google](https://policies.google.com/privacy/frameworks?hl=fr).

Le contact complémentaire LinkedIn ouvre un service externe. LinkedIn décrit la collecte
et l’utilisation des communications échangées sur sa plateforme dans sa propre politique.
Il faut informer les utilisateurs de ce canal et de ses conditions, sans le présenter comme
une messagerie exploitée uniquement sur le VPS Budgie. Le lien vers un profil ne démontre
aucun envoi automatique des données de budget. [LinkedIn — Politique de confidentialité](https://www.linkedin.com/legal/privacy-policy).

L’ouverture aux mineurs doit distinguer la capacité de conclure le contrat d’utilisation
et la base légale du traitement. Le seuil de 15 ans ne constitue pas une autorisation générale
de s’inscrire : il concerne le consentement à certains traitements en ligne. La base contractuelle
exige aussi l’examen de la capacité du mineur et de l’exception relative aux actes courants.
Aucun accord parental collecté ou vérifié ne doit être annoncé sans parcours effectif.
[CNIL — Capacité d’agir des mineurs](https://www.cnil.fr/fr/recommandation-1-encadrer-la-capacite-dagir-des-mineurs-en-ligne),
[CNIL — Consentement parental](https://cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans),
[Code civil, article 1146](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032041065),
[article 1148](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032041055).

Le régime d’anonymat de la LCEN pour les éditeurs non professionnels repose notamment
sur l’identification de l’hébergeur et la communication à celui-ci des informations d’identité.
La publication volontaire du nom de l’éditeur ne permet pas, à elle seule, de conclure que
le domicile et le téléphone peuvent être omis dans toutes les hypothèses. L’application précise
à Budgie doit être revue ; aucune publication de ces coordonnées privées n’est prévue en attendant.
[LCEN, article 1-1](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049568614/).

Sources officielles consultées le 26 novembre 2026 :

- [CNIL — Information et transparence](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence) : périmètre de l’information et accès distinct de la politique de confidentialité.
- [CNIL — RGPD, chapitre III](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3) : articles 12 et 13, droits d’accès, rectification, effacement, limitation, portabilité et opposition.
- [CNIL — Cookies et traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi) : information et exemption possible des traceurs strictement nécessaires à l’authentification.
- [CNIL — Durées de conservation](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees) : fixation et mise en œuvre des durées.
- [CNIL — Adresser une plainte](https://www.cnil.fr/fr/adresser-une-plainte) : recours et lien utilisé dans la politique.
- [LCEN — Article 1-1](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049568614/) : mentions et régime d’anonymat des éditeurs non professionnels. L’ouverture directe a retourné 403 pendant la recherche initiale ; le texte primaire a également été vérifié par index officiel. Son application au cas de Budgie reste à valider.
- [Service Public — Mentions d’un site professionnel](https://entreprendre.service-public.gouv.fr/vosdroits/F37351) : référence complémentaire si le statut évolue ; cette page ne suffit pas à qualifier les obligations d’un éditeur particulier.
- [EUR-Lex — Décision (UE) 2025/2574](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32025D2574) : renouvellement de l’adéquation du Royaume-Uni ; article 2, échéance du 27 décembre 2031. L’index officiel et le texte PDF ont permis de vérifier la disposition malgré le contrôle antirobot rencontré sur certaines ouvertures HTML.
- [Google — Centre d’aide sur la confidentialité](https://support.google.com/policies/answer/9581826?hl=en) : version grand public de Gmail, absence de DPA et de rôle de sous-traitant annoncés par Google ; consultation directe du paragraphe relatif aux ressources d’entreprise.
- [Google — Politique de confidentialité](https://policies.google.com/privacy?hl=fr) et [mécanismes de transfert](https://policies.google.com/privacy/frameworks?hl=fr) : rôle déclaré de Google pour les utilisateurs de l’EEE, traitements dans plusieurs pays et garanties annoncées, distincts d’un audit de la boîte de Budgie.
- [LinkedIn — Politique de confidentialité](https://www.linkedin.com/legal/privacy-policy) : communications échangées entre membres et traitements propres à la plateforme ; consultation directe de la politique pour le canal de contact complémentaire.
- [CNIL — Mineurs et capacité d’agir](https://www.cnil.fr/fr/recommandation-1-encadrer-la-capacite-dagir-des-mineurs-en-ligne) et [consentement parental](https://cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans) : distinction entre capacité et consentement. La première recommandation est signalée en cours de mise à jour ; sa lecture ne suffit pas à valider une ouverture à tous les âges.

## Conditions avant validation définitive

- [x] Recueillir l’identité de l’éditeur et du responsable de publication, le contact et la localisation publiable : Maïssane ABDALLAH, particulier, L’Haÿ-les-Roses, France ; contact Gmail confirmé.
- [x] Recueillir l’entité d’hébergement et le pays du VPS : OVH SAS, Royaume-Uni, même VPS pour l’interface, l’API et la base.
- [x] Clarifier les sauvegardes : aucune mise en place par Budgie, sans promesse de restauration.
- [x] Identifier l’interlocuteur des demandes de droits : l’éditeur seul, par le contact publié.
- [x] Recevoir l’URL exacte du contact LinkedIn complémentaire : `https://www.linkedin.com/in/ma%C3%AFssane-abdallah`.
- [x] Clarifier la situation de conservation : l’absence de règle pour les journaux, les comptes inactifs et les messages de support est confirmée ; cela ne clôt pas l’action nécessaire ci-dessous.
- [ ] Vérifier l’applicabilité à Budgie du régime non professionnel de la LCEN et les conditions permettant de garder domicile et téléphone privés. Obtenir la confirmation qu’OVH détient les informations d’identification requises ; ne pas transformer la ville ou la publication du nom en dispense automatique.
- [ ] Contrôler les coordonnées légales d’OVH SAS, les clauses de traitement et les accès/transferts ultérieurs à partir du contrat. Documenter le cadre d’adéquation du Royaume-Uni et suivre son maintien en vigueur.
- [ ] Examiner les conditions de l’usage de Gmail grand public pour le support, son rôle, ses transferts, la sécurité du compte et les règles d’effacement des messages ; ne pas lui attribuer un DPA Workspace.
- [ ] Définir, documenter et appliquer les durées ou critères de conservation des comptes actifs/inactifs, des journaux et des messages de support, ainsi que les purges correspondantes. L’absence actuelle de règle est confirmée ; ne pas la présenter comme une durée déterminée. Si des sauvegardes sont ajoutées ensuite, documenter leur durée et actualiser les textes.
- [ ] Formaliser le traitement privé des demandes par l’éditeur : réponse dans les meilleurs délais et au plus tard sous un mois, prolongations légalement encadrées si nécessaires, export à fournir sur demande, transmission sûre et vérification proportionnée de l’identité.
- [ ] Définir et faire vérifier les conditions d’accueil des mineurs au regard de la capacité contractuelle, des bases légales et des risques du service. Adapter l’information et, si nécessaire, le parcours des représentants légaux ; ne pas annoncer une vérification parentale absente du code.
- [ ] Informer sur le canal LinkedIn et les traitements de messages propres à cette plateforme ; vérifier la sécurité de l’accès et les modalités de gestion des demandes reçues par ce canal. Un lien externe n’implique pas un transfert automatique des données de budget.
- [ ] Documenter les bases légales, les intérêts légitimes et la nécessité des champs obligatoires, notamment prénom/nom.
- [ ] Contrôler le service déployé : schéma réel, suppression en cascade, cookies et stockage, ressources tierces, journaux, HTTPS et coordonnées de contact.
- [ ] Harmoniser les limites de comptes avant toute promesse chiffrée : l’API applique 10 comptes, tandis que les informations de plan et le README évoquent 2. Aucun plafond contractuel n’est inventé dans les CGU.
- [ ] Vérifier la cohérence des tables `subscriptions`/`plans` référencées par l’authentification avec le schéma effectivement déployé ; ne pas déduire des capacités payantes de la documentation obsolète.
- [ ] Faire relire la version complète par un professionnel du droit, confirmer la version applicable et définir l’information/acceptation des CGU si nécessaire.
- [ ] Après validation seulement, actualiser la date et le statut interne de revue dans `legal.ts`, remplacer les renseignements restant à confirmer et réexaminer le `noindex`, le sitemap et leurs contrôles. Les mentions publiques de brouillon ont déjà été retirées à la demande de l’éditeur.

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
Les pages juridiques sont en `noindex, follow` et restent hors du sitemap tant que la revue
interne n’est pas clôturée, sans bannière publique de brouillon.

Ces contrôles techniques ne constituent pas une validation juridique. La recette sur
l’infrastructure de production et la relecture professionnelle restent à effectuer.

Résultats de la vérification locale initiale : 37 tests réussis, compilation avec contrôle des types,
lint frontend sans avertissement et vérification du HTML public réussis. Le formatage et
`git diff --check` ont également été contrôlés. Le défilement revient en haut après un clic
sur les liens du footer et restaure la position lors d’un retour dans l’historique.
Ces résultats décrivent les contrôles déjà effectués ; la présente mise à jour des faits
d’exploitation n’a pas relancé la compilation ni les tests.

Le navigateur connecté était indisponible lors de la revue initiale : l’affichage visuel et les interactions dans
un navigateur n’ont pas été vérifiés. Les configurations Nginx ont été relues statiquement,
sans exécution du serveur Nginx pendant cette revue.
