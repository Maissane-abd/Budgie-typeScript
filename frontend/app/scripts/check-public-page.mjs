import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dist = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, dist), 'utf8');
const html = await read('index.html');
// Do not execute JavaScript: these checks cover the initial HTTP document.
const document = new JSDOM(html).window.document;
const text = (element) => element?.textContent.replace(/\s+/g, ' ').trim();
const legalPages = [
  { path: '/mentions-legales', title: 'Mentions légales' },
  { path: '/politique-de-confidentialite', title: 'Politique de confidentialité' },
  { path: '/conditions-utilisation', title: 'Conditions d’utilisation' },
];

function verifyFooter(page) {
  const footer = page.querySelector('footer');
  assert.ok(footer, 'A public footer must be present in the initial HTML');
  assert.ok(
    text(footer).includes('développé par Maïssane ABDALLAH'),
    'The footer must display the developer credit',
  );
  assert.ok(
    footer.querySelector('a[href="https://www.linkedin.com/in/ma%C3%AFssane-abdallah"]'),
    'The footer must link to the publisher’s LinkedIn profile',
  );
  for (const { path } of legalPages) {
    assert.ok(footer.querySelector(`a[href="${path}"]`), `Missing legal footer link: ${path}`);
  }
  const contact = footer.querySelector('a[href^="mailto:"]');
  assert.ok(
    contact?.getAttribute('href')?.slice('mailto:'.length).trim(),
    'The footer must include an email contact link',
  );
}

verifyFooter(document);

assert.equal(document.documentElement.lang, 'fr');
assert.equal(document.querySelectorAll('h1').length, 1);
assert.equal(
  text(document.querySelector('h1')),
  'Anticipez votre budget pour mieux préparer la fin du mois.',
);
assert.equal(document.title, 'Budgie | Gestion de budget et prévisions financières');
assert.ok(document.querySelector('meta[name="description"]')?.content);
assert.equal(
  document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  'https://monbudgie.fr/',
);
assert.doesNotMatch(document.querySelector('meta[name="robots"]')?.content ?? '', /noindex|none/i);
assert.ok(text(document.querySelector('#app')).includes('éducation financière'));
assert.ok(text(document.querySelector('#app')).includes('Données fictives'));

const links = [...document.querySelectorAll('a[href]')];
assert.ok(links.some((link) => link.getAttribute('href') === '/login'));
assert.ok(links.filter((link) => link.getAttribute('href') === '/register').length >= 2);
assert.ok(links.some((link) => link.getAttribute('href') === '#exemple'));
for (const link of links) {
  const href = link.getAttribute('href');
  assert.ok(href && href !== '#', 'Links must have an actual destination');
  if (href.startsWith('#')) {
    const target = document.getElementById(href.slice(1));
    assert.ok(target, `Missing anchor: ${href}`);
    assert.equal(
      target.getAttribute('tabindex'),
      '-1',
      `Anchor must receive keyboard focus: ${href}`,
    );
  }
}

const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"]')];
assert.ok(stylesheets.length > 0, 'The initial HTML must load its styles');
const css = (
  await Promise.all(stylesheets.map((link) => read(link.getAttribute('href').replace(/^\//, ''))))
).join('\n');
for (const scope of new Set(html.match(/data-v-[a-f0-9]+/g))) {
  assert.ok(css.includes(`[${scope}]`), `Pre-render and production CSS differ: ${scope}`);
}

for (const { path, title } of legalPages) {
  const legalHtml = await read(`${path.slice(1)}/index.html`);
  const legalDocument = new JSDOM(legalHtml).window.document;
  assert.equal(legalDocument.documentElement.lang, 'fr');
  assert.equal(legalDocument.querySelectorAll('h1').length, 1);
  // Accept straight or typographic apostrophes in editorial content.
  assert.equal(text(legalDocument.querySelector('h1'))?.replace(/'/g, '’'), title);
  assert.equal(legalDocument.title.replace(/'/g, '’'), `${title} | Budgie`);
  assert.ok(legalDocument.querySelector('meta[name="description"]')?.content);
  assert.equal(
    legalDocument.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    `https://monbudgie.fr${path}`,
  );
  assert.equal(
    legalDocument.querySelector('meta[property="og:url"]')?.content,
    `https://monbudgie.fr${path}`,
  );
  assert.match(legalDocument.querySelector('meta[name="robots"]')?.content ?? '', /noindex/i);
  assert.equal(
    legalDocument.querySelector('aside.legal-review'),
    null,
    'Legal pages must not display an internal review banner',
  );
  assert.doesNotMatch(
    text(legalDocument.querySelector('#app')) ?? '',
    /version de travail|avant validation définitive|reste(?:nt)? à (?:confirmer|préciser)/i,
    'Public legal content must not contain internal drafting placeholders',
  );
  const legalDate = legalDocument.querySelector('.legal-date');
  assert.ok(legalDate?.querySelector('time[datetime]'), 'Legal pages must display an update date');
  assert.doesNotMatch(
    text(legalDate) ?? '',
    /brouillon/i,
    'The public update date must not include a draft label',
  );
  assert.ok(legalDocument.querySelectorAll('h2').length >= 3, 'Legal content must be pre-rendered');
  verifyFooter(legalDocument);
  for (const scope of new Set(legalHtml.match(/data-v-[a-f0-9]+/g))) {
    assert.ok(css.includes(`[${scope}]`), `Legal pre-render and production CSS differ: ${scope}`);
  }
  for (const link of legalDocument.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    assert.ok(href && href !== '#', 'Legal links must have an actual destination');
    if (href.startsWith('#')) {
      assert.ok(legalDocument.getElementById(href.slice(1)), `Missing legal anchor: ${href}`);
    }
  }
}

const shell = new JSDOM(await read('app.html')).window.document;
assert.equal(shell.querySelector('#app').children.length, 0);
assert.match(shell.querySelector('meta[name="robots"]')?.content ?? '', /noindex/i);
assert.equal(shell.querySelector('link[rel="canonical"]'), null);
assert.equal(shell.querySelector('meta[property="og:url"]'), null);

const robots = await read('robots.txt');
assert.match(robots, /User-agent:\s*\*/i);
assert.match(robots, /Allow:\s*\/\s*(?:\r?\n|$)/i);
assert.doesNotMatch(robots, /Disallow:\s*\/\s*(?:\r?\n|$)/i);
assert.match(robots, /Sitemap:\s*https:\/\/monbudgie\.fr\/sitemap\.xml/i);
const sitemap = new JSDOM(await read('sitemap.xml'), { contentType: 'application/xml' }).window
  .document;
assert.deepEqual(
  [...sitemap.querySelectorAll('loc')].map((node) => node.textContent),
  ['https://monbudgie.fr/'],
);

console.log(
  'Public homepage and legal HTML, footers, metadata, scoped CSS, application shell, robots and sitemap: OK.',
);
