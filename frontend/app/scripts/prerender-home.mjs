import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';

// Match the production compiler's scoped CSS identifiers. This server never listens.
process.env.NODE_ENV = 'production';
const root = fileURLToPath(new URL('../', import.meta.url));
const indexPath = new URL('../dist/index.html', import.meta.url);
const template = await readFile(indexPath, 'utf8');
const mountPoint = '<div id="app"></div>';

if (!template.includes(mountPoint)) {
  throw new Error('Public pre-render: the empty Vue mount point was not found.');
}

const server = await createServer({
  configFile: false,
  root,
  mode: 'production',
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { renderHome } = await server.ssrLoadModule('/src/entry-prerender.ts');
  const home = await renderHome();
  if (!home.includes('<h1') || !home.includes('Anticipez votre budget')) {
    throw new Error('Public pre-render: the homepage content is missing.');
  }

  // Keep a separate SPA shell for authentication and private deep links.
  const appShell = template
    .replace(/<title>[^<]*<\/title>/, '<title>Budgie</title>')
    .replace(/<meta\s+name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/g, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/g, '')
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/g, '');

  await writeFile(new URL('../dist/app.html', import.meta.url), appShell);
  await writeFile(indexPath, template.replace(mountPoint, `<div id="app">${home}</div>`));
  console.log('Public homepage pre-rendered; application shell saved separately.');
} finally {
  await server.close();
}
