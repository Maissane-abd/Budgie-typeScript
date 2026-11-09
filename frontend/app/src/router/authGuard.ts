import axios from 'axios';
import type { Router } from 'vue-router';
import { API_BASE } from '@/config/api';
import { useUserStore, type User } from '@/stores/userStore';

export function getLoginDestination(router: Router, redirect: unknown): string {
  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/accounts';
  }
  const destination = router.resolve(redirect);
  return destination.matched.length && destination.meta.requiresAuth
    ? destination.fullPath
    : '/accounts';
}

export function installAuthGuard(router: Router) {
  router.beforeEach(async (to) => {
    if (!to.meta.requiresAuth && !to.meta.guestOnly) return true;

    const store = useUserStore();
    const token = localStorage.getItem('budgie_token');
    if (!token) store.clearUser();

    if (token && !store.isAuthenticated) {
      try {
        const { data } = await axios.get<User>(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // A logout may have happened while the request was in flight.
        if (localStorage.getItem('budgie_token') === token) store.setUser(data);
      } catch (error) {
        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
          if (localStorage.getItem('budgie_token') === token) store.clearUser();
        }
      }
    }

    if (to.meta.requiresAuth && !localStorage.getItem('budgie_token')) {
      return { name: 'login', query: { redirect: to.fullPath }, replace: true };
    }
    if (to.meta.guestOnly && store.isAuthenticated) {
      return { path: getLoginDestination(router, to.query.redirect), replace: true };
    }
    return true;
  });
}
