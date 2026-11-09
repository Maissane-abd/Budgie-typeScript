import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import Revenus from '../views/Revenus.vue';
import Depenses from '../views/Depenses.vue';
import Accounts from '../views/Accounts.vue';
import Profile from '../views/Profiles.vue';
import PrevisionsView from '../views/PrevisionsView.vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { installAuthGuard } from './authGuard';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
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
});

installAuthGuard(router);

export default router;
