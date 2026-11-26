import { mkdir, readFile, writeFile } from 'node:fs/promises';
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

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );

function withMetadata(html, metadata) {
  const head = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
  ];
  if (metadata.url) {
    head.push(
      `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
      `<link rel="canonical" href="${escapeHtml(metadata.url)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta property="og:locale" content="fr_FR" />',
      `<meta property="og:url" content="${escapeHtml(metadata.url)}" />`,
      `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    );
  }
  return html
    .replace(/\s*<title>[^<]*<\/title>/, '')
    .replace(/\s*<meta\s+name="(?:robots|description)"[^>]*>/g, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/g, '')
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/g, '')
    .replace('</head>', `    ${head.join('\n    ')}\n  </head>`);
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
  const { renderPublicPage } = await server.ssrLoadModule('/src/entry-prerender.ts');
  const { legalPages } = await server.ssrLoadModule('/src/content/legal.ts');
  const { getPublicPageMetadata } = await server.ssrLoadModule('/src/router/pageMetadata.ts');

  // Keep a separate SPA shell for authentication and private deep links.
  const appShell = withMetadata(template, { title: 'Budgie', robots: 'noindex, follow' });

  await writeFile(new URL('../dist/app.html', import.meta.url), appShell);
  for (const page of [{ path: '/', name: 'home' }, ...legalPages]) {
    const content = await renderPublicPage(page.path);
    if (!content.includes('<h1')) {
      throw new Error(`Public pre-render: content is missing for ${page.path}.`);
    }
    const metadata = getPublicPageMetadata(page.name);
    if (!metadata) throw new Error(`Public pre-render: metadata is missing for ${page.path}.`);
    const directory = new URL(
      page.path === '/' ? '../dist/' : `../dist/${page.path.slice(1)}/`,
      import.meta.url,
    );
    await mkdir(directory, { recursive: true });
    await writeFile(
      new URL('index.html', directory),
      withMetadata(template, metadata).replace(mountPoint, `<div id="app">${content}</div>`),
    );
  }
  console.log('Public homepage and legal pages pre-rendered; application shell saved separately.');
} finally {
  await server.close();
}
