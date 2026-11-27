# Frontend Budgie

Application Vue 3 et TypeScript construite avec Vite. Les commandes ci-dessous
s’exécutent depuis `frontend/app`, avec Node.js `^20.19.0` ou `>=22.12.0`.

## Installation et développement

```sh
npm install
npm run dev
```

Vite affiche l’adresse du serveur de développement dans le terminal. Les
parcours authentifiés utilisent également l’API Budgie ; le serveur Vite seul
ne remplace pas le backend.

## Construire et prévisualiser la version de production

```sh
npm run build
npm run verify:public
npm run preview
```

La construction vérifie les types avec `vue-tsc`, produit les fichiers statiques
avec Vite, puis exécute automatiquement
[`scripts/prerender-home.mjs`](scripts/prerender-home.mjs).
Ce script utilise [`src/entry-prerender.ts`](src/entry-prerender.ts) pour rendre
uniquement la page d’accueil publique, sans session utilisateur ni appel API.

Deux documents sont produits dans `dist/` :

- `index.html` contient le texte principal de l’accueil dès la réponse HTML,
  ainsi que ses métadonnées publiques. Il reste lisible sans exécuter JavaScript.
- `app.html` est le document de démarrage Vue pour la connexion, l’inscription
  et les routes privées. Son conteneur est vide avant l’exécution de JavaScript
  et sa balise `robots` indique `noindex, follow`.

Le pré-rendu se fait pendant la construction : aucun serveur SSR ne tourne en
production et aucune dépendance supplémentaire n’est nécessaire. Les composants
Vue restent la source du contenu de l’accueil ; il n’existe pas de copie HTML
à maintenir manuellement. Toute modification de cette page nécessite une
nouvelle construction pour mettre à jour le HTML livré.

Les configurations Nginx [de production](../../nginx/default.conf) et
[locale Docker](../../nginx/default.dev.conf) servent `index.html` pour `/`, les
fichiers existants directement, puis `app.html` pour les autres routes du
frontend. Le serveur de prévisualisation Vite reprend ce fonctionnement pour
les parcours habituels tels que `/login`, `/register` et `/accounts`.
La navigation et les protections des routes restent assurées par Vue Router
et l’API.

Utiliser `npm run preview` après `npm run build` pour vérifier le HTML de
production : `npm run dev` sert l’application de développement sans cette
étape de pré-rendu.

`npm run verify:public` contrôle les documents produits sans exécuter le
JavaScript de l’application : contenu principal, métadonnées, destinations
des liens, ancres accessibles, correspondance du CSS, document applicatif,
robots et sitemap. Ce contrôle est aussi exécuté par la CI après le build.

## Vérifications du code

```sh
npm run typecheck
npm test
npm run test:watch
npm run lint
```

`npm test` exécute les tests une fois ; `npm run test:watch` les relance pendant
le développement. La construction comprend déjà une vérification des types.

## Référencement de l’accueil

[`index.html`](index.html) définit la langue française, le titre, la description,
l’URL canonique et les métadonnées Open Graph de l’accueil public.
[`public/robots.txt`](public/robots.txt) autorise l’exploration et annonce
[`public/sitemap.xml`](public/sitemap.xml). Ce sitemap contient uniquement
`https://monbudgie.fr/` ; les écrans d’authentification et les pages privées
n’y figurent pas.

## Contrôles après déploiement

Ces points sont à vérifier sur l’URL publique après la livraison ; une
construction locale réussie ne les confirme pas :

- Effectuer un GET anonyme de `https://monbudgie.fr/` et vérifier une réponse
  HTTP 200. Confirmer que les éventuelles redirections HTTP et `www` aboutissent
  à cette URL HTTPS.
- Examiner la réponse HTML et les en-têtes : l’accueil ne doit recevoir aucune
  directive `noindex`, ni dans une balise `meta name="robots"`, ni dans un
  en-tête `X-Robots-Tag`. Contrôler aussi le titre, la description, la langue
  et l’URL canonique.
- Vérifier que `/robots.txt` renvoie bien du texte contenant les règles
  d’exploration et que `/sitemap.xml` renvoie un document XML contenant
  l’accueil, plutôt que le document de démarrage de l’application.
- Afficher le code source de `/` ou désactiver JavaScript : le H1, les textes,
  l’exemple fictif et les liens de l’accueil doivent déjà être présents.
- Vérifier le rendu aux largeurs de 390 et 320 pixels : lisibilité, absence de
  défilement horizontal, carte de prévision, tableau et boutons. Sur ordinateur,
  vérifier les sections centrées et les trois étapes disposées côte à côte.
- Parcourir la page avec Tab, Maj+Tab et Entrée : le focus doit rester visible,
  les liens d’ancrage doivent atteindre leur contenu et les boutons d’inscription
  doivent mener à `/register`. Le lien de connexion doit mener à `/login`.
- Ouvrir directement `/register`, `/login` et une route privée sans session :
  vérifier les formulaires, la redirection vers la connexion quand nécessaire,
  puis le retour vers l’espace authentifié après connexion. Le HTML initial
  de ces routes doit utiliser le document `app.html` avec `noindex`.
