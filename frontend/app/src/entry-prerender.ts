import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './App.vue';
import { publicRoutes } from './router/publicRoutes';

// Only public pages are rendered at build time. No session or API is needed.
export async function renderPublicPage(path: string): Promise<string> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...publicRoutes,
      { path: '/login', component: { render: () => null } },
      { path: '/register', component: { render: () => null } },
    ],
  });

  const app = createSSRApp(App);
  app.use(router);
  await router.push(path);
  await router.isReady();
  return renderToString(app);
}
