import type { Router, RouteLocationNormalized } from 'vue-router';
import { legalPages } from '../content/legal';

const homeTitle = 'Budgie | Gestion de budget et prévisions financières';
const homeDescription =
  'Anticipez votre budget avec Budgie : renseignez vos revenus et dépenses, estimez votre solde à venir et repérez les ajustements possibles.';
const homeUrl = 'https://monbudgie.fr/';

export function getPublicPageMetadata(name: unknown) {
  if (name === 'home') {
    return {
      title: homeTitle,
      description: homeDescription,
      url: homeUrl,
      robots: 'index, follow',
    };
  }

  const page = legalPages.find((candidate) => candidate.name === name);
  if (!page) return undefined;
  return {
    title: `${page.title} | Budgie`,
    description: page.description,
    url: new URL(page.path, homeUrl).href,
    // Keep working legal texts out of search results until they are validated.
    robots: 'noindex, follow',
  };
}
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
  const metadata = getPublicPageMetadata(route.name);
  if (!metadata) {
    const title = routeTitles[String(route.name)];
    document.title = title ? `${title} | Budgie` : 'Budgie';
    setMeta('name', 'robots', 'noindex, follow');
    document.head
      .querySelectorAll('link[rel="canonical"], meta[name="description"], meta[property^="og:"]')
      .forEach((element) => element.remove());
    return;
  }

  document.title = metadata.title;
  setMeta('name', 'description', metadata.description);
  setMeta('name', 'robots', metadata.robots);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = metadata.url;
  for (const [key, content] of Object.entries({
    'og:type': 'website',
    'og:locale': 'fr_FR',
    'og:url': metadata.url,
    'og:title': metadata.title,
    'og:description': metadata.description,
  })) {
    setMeta('property', key, content);
  }
}

export function installPageMetadata(router: Router) {
  router.afterEach((to, _from, failure) => {
    if (!failure) updateMetadata(to);
  });
}
