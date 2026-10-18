import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';

const directory = resolve(process.argv[2] || '_site');
const prefix = process.argv[3] || '';
const required = ['index.html','updates/index.html','blog/index.html','experience/index.html','gallery/index.html','about/index.html','learning/index.html','admin/index.html','talks/index.html','portfolio/index.html','cv/index.html'];
for (const page of required) {
  const html = await readFile(join(directory, page), 'utf8');
  assert.match(html, /<main\b/, `${page}: main landmark missing`);
  assert.match(html, /identity\.css/, `${page}: identity stylesheet missing`);
  assert.match(html, /identity\.js/, `${page}: progressive enhancement missing`);
  assert.doesNotMatch(html, /file:\/\/\/|DESIGN PREVIEW|模拟登录|布局示例/, `${page}: prototype artifact leaked`);
  assert.doesNotMatch(html, /\{%|\{\{/, `${page}: unresolved Liquid`);
}
async function walk(path) {
  const files = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const target = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target)); else if (entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}
let count = 0;
for (const page of await walk(directory)) {
  const html = await readFile(page, 'utf8');
  // Check first-party pages using the new layout; old template documentation has unrelated legacy examples.
  if (!html.includes('identity.css')) continue;
  const isPrimary = required.some(file => page === join(directory, file)) || page.includes(`${join(directory,'talks')}`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const link = raw.replaceAll('&amp;', '&');
    if (/^[a-z][a-z\d+.-]*:/i.test(link) || link.startsWith('//') || link.startsWith('?')) continue;
    const pathname = decodeURIComponent(link.split(/[?#]/)[0]);
    if (!pathname) continue;
    if (isPrimary && prefix && pathname.startsWith('/') && !pathname.startsWith(`${prefix}/`)) throw new Error(`Base path missing: ${link}`);
    const relative = prefix && pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
    const target = relative.startsWith('/') ? resolve(directory, `.${relative}`) : resolve(dirname(page), relative);
    let exists = false;
    try { const info = await stat(target); exists = info.isFile() || (info.isDirectory() && (await stat(join(target, 'index.html'))).isFile()); } catch (_) {}
    if (!exists && !pathname.endsWith('/')) { try { exists = (await stat(`${target}.html`)).isFile(); } catch (_) {} }
    // Documentation pages predate this UI and may refer to deleted demonstration assets.
    if (isPrimary) assert.ok(exists, `${page}: missing target ${link}`);
    if (exists) count++;
  }
}
const home = await readFile(join(directory,'index.html'),'utf8');
assert.ok((home.match(/class="update(?: latest)?"/g) || []).length <= 5, 'Home activity exceeds five entries');
assert.ok((home.match(/class="experience-card"/g) || []).length <= 4, 'Home experience exceeds four entries');
assert.ok((home.match(/class="blog-card"/g) || []).length <= 3, 'Home blog exceeds three entries');
const learningJson = home.match(/<script type="application\/json" id="learning-data">([\s\S]*?)<\/script>/);
assert.ok(learningJson, 'Learning data missing'); JSON.parse(learningJson[1]);
console.log(`Site checks passed: ${required.length} primary pages, ${count} local references, calendar data and homepage limits.`);
