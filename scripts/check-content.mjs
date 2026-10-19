import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile('config/projects.json', 'utf8'));
const seed = JSON.parse(await readFile('src/data/projects.generated.json', 'utf8'));
if (config.username !== 'ysogabe') throw new Error('Unexpected username');
if (!Array.isArray(seed) || seed.length < 3) throw new Error('Public seed data missing');
if (new Set(seed.map(r => r.name)).size !== seed.length) throw new Error('Duplicate seed slugs');
for (const repo of seed) {
  if (!repo.full_name?.startsWith('ysogabe/') || repo.fork || repo.archived) {
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
