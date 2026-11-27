import type { RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LegalPageView from '../views/LegalPageView.vue';
import { legalPages } from '../content/legal';

// Shared by the browser and build-time renderer: these pages never require a session.
export const publicRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  ...legalPages.map((page) => ({
    path: page.path,
    name: page.name,
    component: LegalPageView,
    props: { page },
  })),
];
