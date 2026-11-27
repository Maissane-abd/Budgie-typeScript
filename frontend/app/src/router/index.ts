import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import Revenus from '../views/Revenus.vue';
import Depenses from '../views/Depenses.vue';
import Accounts from '../views/Accounts.vue';
import Profile from '../views/Profiles.vue';
import PrevisionsView from '../views/PrevisionsView.vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { installAuthGuard } from './authGuard';
import { installPageMetadata } from './pageMetadata';
import { publicRoutes } from './publicRoutes';

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'revenus',
        name: 'revenus',
        component: Revenus,
      },
      {
        path: '/depenses',
        name: 'depenses',
        component: Depenses,
      },
      {
        path: '/accounts',
        name: 'accounts',
        component: Accounts,
      },
      {
        path: 'previsions',
        name: 'previsions',
        component: PrevisionsView,
      },
      // {
      //   path: '/abonnement',
      //   name: 'abonnement',
      //   component: AbonnementView
      // },
      {
        path: '/profile',
        name: 'profile',
        component: Profile,
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true },
  },
  // {
  //   path: '/reset-password',
  //   name: 'reset-password',
  //   component: ResetPasswordView,
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { left: 0, top: 0 };
  },
});

installAuthGuard(router);
installPageMetadata(router);

export default router;
