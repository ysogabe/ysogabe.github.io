import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const config = JSON.parse(await readFile('config/projects.json', 'utf8'));
const target = resolve('src/data/projects.generated.json');
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'ysogabe-portfolio-builder',
  'X-GitHub-Api-Version': '2022-11-28'
};
if (token) headers.Authorization = 'Bearer ' + token;

async function load() {
  const result = [];
  for (let page = 1; page <= 10; page++) {
    const url = 'https://api.github.com/users/' + encodeURIComponent(config.username) + '/repos?type=owner&sort=updated&per_page=100&page=' + page;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('GitHub API HTTP ' + response.status);
    const repos = await response.json();
    if (!Array.isArray(repos)) throw new Error('Unexpected GitHub API response');
    for (const r of repos) {
      // The public website NEVER contains metadata from private repositories.
      if (r.private || r.visibility !== 'public' || r.fork || r.archived) continue;
      if (config.exclude.includes(r.name) || r.owner?.login?.toLowerCase() !== config.username.toLowerCase()) continue;
      result.push({
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description || '',
        topics: Array.isArray(r.topics) ? r.topics : [],
        language: r.language || '',
        updated_at: r.pushed_at || r.updated_at || '',
        stargazers_count: r.stargazers_count || 0,
        fork: false,
        archived: false
      });
    }
    if (repos.length < 100) break;
  }
  if (!result.length) throw new Error('GitHub returned zero eligible public repositories');
  return result;
}

try {
  const data = await load();
  await writeFile(target, JSON.stringify(data, null, 2) + '\n');
  console.log('Fetched ' + data.length + ' public repositories from GitHub.');
} catch (err) {
  // Allow deployment with the committed seed data if GitHub has an outage.
  const cached = JSON.parse(await readFile(target, 'utf8'));
  if (!Array.isArray(cached) || !cached.length || cached.some(r => r.fork || r.archived || !r.full_name?.startsWith(config.username + '/'))) throw err;
  console.warn('GitHub API unavailable; using reviewed public fallback data: ' + err.message);
}
