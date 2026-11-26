import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './App.vue';
import HomeView from './views/HomeView.vue';

// Only the public page is rendered at build time. No session or API is needed.
export async function renderHome(): Promise<string> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/login', component: { render: () => null } },
      { path: '/register', component: { render: () => null } },
    ],
  });

  const app = createSSRApp(App);
  app.use(router);
  await router.push('/');
  await router.isReady();
  return renderToString(app);
}
