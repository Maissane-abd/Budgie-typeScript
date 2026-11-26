import { beforeEach, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { installAuthGuard } from '../src/router/authGuard';
import { installPageMetadata } from '../src/router/pageMetadata';

function makeRouter() {
  const component = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component },
      { path: '/login', name: 'login', component, meta: { guestOnly: true } },
      { path: '/register', name: 'register', component, meta: { guestOnly: true } },
      { path: '/accounts', name: 'accounts', component, meta: { requiresAuth: true } },
    ],
  });
  installAuthGuard(router);
  installPageMetadata(router);
  return router;
}

function content(selector: string) {
  return document.head.querySelector(selector)?.getAttribute('content');
}

beforeEach(() => {
  document.head.innerHTML = '';
  localStorage.clear();
  setActivePinia(createPinia());
});

it('keeps authentication redirects private and restores the public metadata on return', async () => {
  const router = makeRouter();
  await router.push('/accounts');
  expect(router.currentRoute.value.name).toBe('login');
  expect(content('meta[name="robots"]')).toContain('noindex');
  expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();

  await router.push('/');
  const publicHead = document.head.innerHTML;
  expect(content('meta[name="robots"]')).not.toContain('noindex');
  expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
    .toBe('https://monbudgie.fr/');
  expect(content('meta[property="og:title"]')).toBe(document.title);

  for (const path of ['/register', '/login']) {
    await router.push(path);
    expect(content('meta[name="robots"]')).toContain('noindex');
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull();
    await router.push('/');
    expect(document.head.innerHTML).toBe(publicHead);
    expect(document.head.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  }
});

it('does not change public metadata when navigation is cancelled', async () => {
  const router = makeRouter();
  await router.push('/');
  const publicHead = document.head.innerHTML;
  router.beforeEach((to) => to.name !== 'register');
  await router.push('/register');
  expect(router.currentRoute.value.name).toBe('home');
  expect(document.head.innerHTML).toBe(publicHead);
});
