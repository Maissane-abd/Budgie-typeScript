import { beforeEach, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import axios, { AxiosError } from 'axios';
import { getLoginDestination, installAuthGuard } from '../src/router/authGuard';
import { useUserStore } from '../src/stores/userStore';

const user = { id: 1, first_name: 'Test', last_name: 'User', email: 'test@example.fr' };
function makeRouter() {
  const component = { template: '<div />' };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component },
      { path: '/login', name: 'login', component, meta: { guestOnly: true } },
      { path: '/register', component, meta: { guestOnly: true } },
      { path: '/accounts', component, meta: { requiresAuth: true } },
      { path: '/profile', component, meta: { requiresAuth: true } },
    ],
  });
  installAuthGuard(router);
  return router;
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

it.each(['/login', '/register', '/login?redirect=/login', '/login?redirect=/register'])(
  'redirects a connected user from %s without looping', async (path) => {
    localStorage.setItem('budgie_token', 'valid');
    useUserStore().setUser(user);
    const router = makeRouter();
    await router.push(path);
    expect(router.currentRoute.value.path).toBe('/accounts');
  },
);

it('restores a session before redirecting from the login page', async () => {
  localStorage.setItem('budgie_token', 'valid');
  vi.spyOn(axios, 'get').mockResolvedValue({ data: user });
  const router = makeRouter();
  await router.push('/login?redirect=/profile');
  expect(router.currentRoute.value.path).toBe('/profile');
  expect(axios.get).toHaveBeenCalledTimes(1);
});

it('clears an expired session and preserves the requested page', async () => {
  localStorage.setItem('budgie_token', 'expired');
  vi.spyOn(axios, 'get').mockRejectedValue(
    new AxiosError('Expired', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 401, data: {}, statusText: 'Unauthorized', headers: {},
      config: { headers: new axios.AxiosHeaders() },
    }),
  );
  const router = makeRouter();
  await router.push('/profile');
  expect(router.currentRoute.value.path).toBe('/login');
  expect(router.currentRoute.value.query.redirect).toBe('/profile');
  expect(localStorage.getItem('budgie_token')).toBeNull();
});

it('keeps a session during a network failure without bouncing between pages', async () => {
  localStorage.setItem('budgie_token', 'valid');
  vi.spyOn(axios, 'get').mockRejectedValue(new AxiosError('Network error'));
  const router = makeRouter();
  await router.push('/accounts');
  expect(router.currentRoute.value.path).toBe('/accounts');
  expect(localStorage.getItem('budgie_token')).toBe('valid');
});

it.each(['https://example.com', '//example.com', '/login', '/register', '/'])(
  'rejects the unsafe return destination %s', (redirect) => {
    expect(getLoginDestination(makeRouter(), redirect)).toBe('/accounts');
  },
);

it('clears stale user state after logout', async () => {
  useUserStore().setUser(user);
  const router = makeRouter();
  await router.push('/login');
  expect(router.currentRoute.value.path).toBe('/login');
  expect(useUserStore().isAuthenticated).toBe(false);
});
