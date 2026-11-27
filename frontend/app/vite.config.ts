import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { legalPages } from './src/content/legal';

// Mirror Nginx's SPA fallback when reviewing a production build locally.
function applicationShellPreview(): Plugin {
  return {
    name: 'application-shell-preview',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const pathname = request.url?.split('?')[0] ?? '/';
        const legalPage = legalPages.find((page) => pathname.replace(/\/$/, '') === page.path);
        if (legalPage) {
          request.url = `${legalPage.path}/index.html`;
        } else if (pathname !== '/' && pathname !== '/index.html' && !pathname.includes('.')) {
          request.url = '/app.html';
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), applicationShellPreview()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
