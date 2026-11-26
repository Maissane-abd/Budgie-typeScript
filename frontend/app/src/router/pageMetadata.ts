import type { Router, RouteLocationNormalized } from 'vue-router';

const homeTitle = 'Budgie | Gestion de budget et prévisions financières';
const homeDescription =
  'Anticipez votre budget avec Budgie : renseignez vos revenus et dépenses, estimez votre solde à venir et repérez les ajustements possibles.';
const homeUrl = 'https://monbudgie.fr/';
const routeTitles: Record<string, string> = {
  login: 'Connexion',
  register: 'Inscription',
  accounts: 'Comptes',
  revenus: 'Revenus',
  depenses: 'Dépenses',
  previsions: 'Prévisions',
  profile: 'Profil',
};

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

function updateMetadata(route: RouteLocationNormalized) {
  if (route.name !== 'home') {
    const title = routeTitles[String(route.name)];
    document.title = title ? `${title} | Budgie` : 'Budgie';
    setMeta('name', 'robots', 'noindex, follow');
    document.head
      .querySelectorAll('link[rel="canonical"], meta[name="description"], meta[property^="og:"]')
      .forEach((element) => element.remove());
    return;
  }

  document.title = homeTitle;
  setMeta('name', 'description', homeDescription);
  setMeta('name', 'robots', 'index, follow');
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = homeUrl;
  for (const [key, content] of Object.entries({
    'og:type': 'website',
    'og:locale': 'fr_FR',
    'og:url': homeUrl,
    'og:title': homeTitle,
    'og:description': homeDescription,
  })) {
    setMeta('property', key, content);
  }
}

export function installPageMetadata(router: Router) {
  router.afterEach((to, _from, failure) => {
    if (!failure) updateMetadata(to);
  });
}
