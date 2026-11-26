import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const dist = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, dist), 'utf8');
const html = await read('index.html');
// Do not execute JavaScript: these checks cover the initial HTTP document.
const document = new JSDOM(html).window.document;
const text = (element) => element?.textContent.replace(/\s+/g, ' ').trim();

assert.equal(document.documentElement.lang, 'fr');
assert.equal(document.querySelectorAll('h1').length, 1);
assert.equal(text(document.querySelector('h1')),
  'Anticipez votre budget pour mieux préparer la fin du mois.');
assert.equal(document.title, 'Budgie | Gestion de budget et prévisions financières');
assert.ok(document.querySelector('meta[name="description"]')?.content);
assert.equal(document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  'https://monbudgie.fr/');
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
    assert.equal(target.getAttribute('tabindex'), '-1', `Anchor must receive keyboard focus: ${href}`);
  }
}

const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"]')];
assert.ok(stylesheets.length > 0, 'The initial HTML must load its styles');
const css = (await Promise.all(stylesheets.map((link) =>
  read(link.getAttribute('href').replace(/^\//, ''))))).join('\n');
for (const scope of new Set(html.match(/data-v-[a-f0-9]+/g))) {
  assert.ok(css.includes(`[${scope}]`), `Pre-render and production CSS differ: ${scope}`);
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
const sitemap = new JSDOM(await read('sitemap.xml'), { contentType: 'application/xml' }).window.document;
assert.deepEqual([...sitemap.querySelectorAll('loc')].map((node) => node.textContent),
  ['https://monbudgie.fr/']);

console.log('Public HTML, links, anchors, scoped CSS, application shell, robots and sitemap: OK.');
