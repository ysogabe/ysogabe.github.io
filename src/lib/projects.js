import raw from '../data/projects.generated.json' with { type: 'json' };
import config from '../../config/projects.json' with { type: 'json' };

const categories = {
  '暮らしと見守り': ['home','monitor','panel','hogo','rescue','sensor'],
  '記録と整理': ['memo','capture','ledger','notes','resume','document','zenn'],
  'IoTと工作': ['esp','mqtt','iot','scanner','skyway','keyball','qmk','tab5'],
  '写真と風景': ['photo','panorama','image','geoframe','orbit','vector'],
  'AIとものづくり': ['ai','agent','claude','hermes','model','dify','llm','mcp']
};
function inferCategory(repo) {
  const words = (repo.name + ' ' + (repo.description || '') + ' ' + (repo.topics || []).join(' ')).toLowerCase();
  for (const [category, keys] of Object.entries(categories)) if (keys.some(k => words.includes(k))) return category;
  return 'その他の実験';
}
function safeUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}
// Compare the UTC calendar anniversary, clamping leap day to February 28.
export function isActiveRepository(value, now = new Date()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const updated = new Date(value);
  if (!Number.isFinite(updated.getTime()) || updated.toISOString() !== (value.includes('.') ? value : value.replace('Z', '.000Z'))) return false;
  const expires = new Date(updated);
  const month = expires.getUTCMonth();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  if (expires.getUTCMonth() !== month) expires.setUTCDate(0);
  return updated <= now && now < expires;
}

export function buildProjects(repositories = raw, settings = config, now = new Date()) {
  const publicProjects = repositories
    .filter(r => r && r.full_name === settings.username + '/' + r.name && !r.private && (!r.visibility || r.visibility === 'public') && !r.fork && !r.archived && !settings.exclude.includes(r.name) && isActiveRepository(r.updated_at, now))
    .map(r => {
      const override = settings.projects[r.name] || {};
      const category = override.category || inferCategory(r);
      return {
        ...r,
        html_url: safeUrl(r.html_url),
        slug: r.name,
        title: override.title || r.name.replace(/[-_]/g, ' '),
        subtitle: override.subtitle || '',
        description: override.description || r.description || 'GitHubで公開している小さなプロジェクト。詳しくはREADMEをご覧ください。',
        category,
        icon: override.icon || ({'暮らしと見守り':'🏡','記録と整理':'📝','IoTと工作':'📡','写真と風景':'📷','AIとものづくり':'✨'}[category] || '🌱'),
        image: safeUrl(override.image),
        site: safeUrl(override.site),
        tags: (override.tags?.length ? override.tags : [r.language, ...(r.topics || []).slice(0,2)]).filter(Boolean).slice(0,4),
        features: override.features || [],
        story: override.story || '',
        featured: settings.featured.includes(r.name)
      };
    });
  const curated = (settings.curatedProjects || []).map(p => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    description: p.description,
    story: p.story,
    features: p.features || [],
    site: safeUrl(p.site),
    subtitle: '',
    icon: p.category === '記録と整理' ? '📝' : '🏡',
    image: '',
    tags: [],
    featured: settings.featured.includes(p.slug)
  }));
  return [...publicProjects, ...curated];
}
export const projects = buildProjects();
export const featured = config.featured.map(n => projects.find(p => p.slug === n)).filter(Boolean);
export const recent = [...projects].filter(p => p.updated_at).sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,4);
export const categoryNames = ['すべて','暮らしと見守り','記録と整理','IoTと工作','写真と風景','AIとものづくり','その他の実験'];
export function projectUrl(project) { return '/projects/' + encodeURIComponent(project.slug) + '/'; }
export function formatDate(date) { return date ? new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date)) : ''; }
