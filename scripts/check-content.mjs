import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile('config/projects.json', 'utf8'));
const seed = JSON.parse(await readFile('src/data/projects.generated.json', 'utf8'));
if (config.username !== 'ysogabe') throw new Error('Unexpected username');
if (!Array.isArray(seed) || seed.length < 3) throw new Error('Public seed data missing');
if (new Set(seed.map(r => r.name)).size !== seed.length) throw new Error('Duplicate seed slugs');
for (const repo of seed) {
  if (!repo.full_name?.startsWith('ysogabe/') || repo.private || (repo.visibility && repo.visibility !== 'public') || repo.fork || repo.archived) {
    throw new Error('Unsafe seed entry: ' + repo.name);
  }
  if (!/^https:\/\/github\.com\/ysogabe\//.test(repo.html_url)) throw new Error('Unexpected repo URL: ' + repo.name);
}
for (const [name, entry] of Object.entries(config.projects || {})) {
  if (!/^[A-Za-z0-9_.-]+$/.test(name)) throw new Error('Unsafe repository slug: ' + name);
  for (const field of ['image','site']) {
    if (entry[field] && !entry[field].startsWith('https://')) throw new Error('Only HTTPS URL allowed: ' + name + '.' + field);
  }
}
console.log('Configuration and public seed metadata are valid.');

// Exercise the same normalization used by every page and the sitemap, including
// offline seed builds. Fixed clocks make the calendar boundary reproducible.
const { buildProjects, isActiveRepository, projects, featured, recent, projectUrl } = await import('../src/lib/projects.js');
const { default: assert } = await import('node:assert/strict');
const updated = '2025-10-20T06:00:00Z';
assert.equal(isActiveRepository(updated, new Date('2026-10-20T05:59:59.999Z')), true);
assert.equal(isActiveRepository(updated, new Date('2026-10-20T06:00:00Z')), false);
assert.equal(isActiveRepository(updated, new Date('2026-10-20T06:00:00.001Z')), false);
for (const value of [undefined, null, '', 'invalid', '2025-02-30T00:00:00Z']) {
  assert.equal(isActiveRepository(value), false);
}
assert.equal(isActiveRepository('2024-02-29T12:00:00Z', new Date('2025-02-28T11:59:59Z')), true);
assert.equal(isActiveRepository('2024-02-29T12:00:00Z', new Date('2025-02-28T12:00:00Z')), false);
const fixture = { name: 'fixture', full_name: 'ysogabe/fixture', html_url: 'https://github.com/ysogabe/fixture', updated_at: updated };
assert.equal(buildProjects([fixture], config, new Date('2026-10-20T05:59:59.999Z')).some(p => p.slug === 'fixture'), true);
assert.equal(buildProjects([fixture], config, new Date('2026-10-20T06:00:00Z')).some(p => p.slug === 'fixture'), false);
assert.equal(buildProjects(seed, config, new Date('2100-01-01T00:00:00Z')).length, 3, 'Stale seed must leave only curated projects');
for (const patch of [{private:true}, {visibility:'private'}, {fork:true}, {archived:true}, {updated_at:undefined}]) {
  assert.equal(buildProjects([{...fixture, ...patch}], config, new Date('2026-01-01T00:00:00Z')).some(p => p.slug === 'fixture'), false);
}
const curatedFields = new Set(['slug', 'title', 'category', 'site', 'image', 'description', 'story', 'features']);
const expectedSites = new Map([
  ['hogo-meter', 'https://hogo-meter-intro.akebi.dam-lab.work/'],
  ['iryouhi', 'https://iryouhi-intro.akebi.dam-lab.work/'],
  ['digital-mahjong', 'https://dms-info.pages.dev/']
]);
assert.equal(config.curatedProjects.length, expectedSites.size);
assert.equal(new Set(projects.map(p => p.slug)).size, projects.length);
for (const entry of config.curatedProjects) {
  assert.match(entry.slug, /^[a-z0-9-]+$/);
  for (const key of Object.keys(entry)) assert.ok(curatedFields.has(key), 'Unexpected curated field: ' + key);
  assert.equal(new URL(entry.site).href, expectedSites.get(entry.slug));
  if (entry.image) assert.equal(new URL(entry.image).protocol, 'https:', 'Curated image must use HTTPS: ' + entry.slug);
  for (const field of ['title', 'category', 'description', 'story']) assert.ok(entry[field]);
  assert.ok(entry.features.length);
  assert.ok(!/https?:|github\.com/i.test([entry.title, entry.description, entry.story, ...entry.features].join(' ')));
  const project = projects.find(p => p.slug === entry.slug);
  assert.ok(project && featured.includes(project));
  assert.equal(project.html_url, undefined);
  assert.equal(project.updated_at, undefined);
  assert.ok(!recent.includes(project));
}
for (const project of projects.filter(p => p.full_name)) assert.match(project.html_url, /^https:\/\/github\.com\/ysogabe\//);

if (process.argv.includes('--built')) {
  const home = await readFile('dist/index.html', 'utf8');
  const catalog = await readFile('dist/projects/index.html', 'utf8');
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  const relatedSlugs = new Set();
  for (const project of projects) {
    const route = projectUrl(project);
    const html = await readFile('dist' + route + 'index.html', 'utf8');
    const related = projects.filter(p => p.slug !== project.slug && p.category === project.category).sort((a,b) => Number(b.featured) - Number(a.featured)).slice(0,3);
    for (const item of related) {
      relatedSlugs.add(item.slug);
      assert.ok(html.includes('href="' + projectUrl(item) + '" class="related-item"'));
    }
    assert.ok(catalog.includes('href="' + route + '"'));
    assert.ok(sitemap.includes('https://ysogabe.github.io' + route));
    if (expectedSites.has(project.slug)) {
      assert.ok(home.includes('href="' + route + '"'));
      assert.ok(catalog.includes('data-search="' + project.title.toLowerCase()));
      assert.ok(html.includes('href="' + project.site + '"'));
      assert.ok(!/href="https:\/\/github\.com\/ysogabe\/[^" ]+/.test(html), 'Curated page must not link a repository');
      assert.ok(!html.includes('開発の記録を読む'));
      assert.ok(!html.includes('<dt>最終更新</dt>'));
    } else {
      assert.ok(html.includes('href="' + project.html_url + '"'));
      assert.ok(html.includes('開発の記録を読む'));
    }
  }
  for (const slug of expectedSites.keys()) assert.ok(relatedSlugs.has(slug), 'Curated project missing from related links: ' + slug);
  for (const repo of seed.filter(r => !projects.some(p => p.slug === r.name))) {
    const route = projectUrl({slug:repo.name});
    assert.ok(!sitemap.includes('https://ysogabe.github.io' + route));
    assert.ok(!catalog.includes('href="' + route + '"'));
    assert.ok(!home.includes('href="' + route + '"'));
    await assert.rejects(readFile('dist' + route + 'index.html'), {code:'ENOENT'});
  }
  console.log('Built catalog, search data, featured, details, links, stale routes and sitemap are valid.');
}
console.log('Calendar boundaries, stale seeds and curated projects are valid.');
