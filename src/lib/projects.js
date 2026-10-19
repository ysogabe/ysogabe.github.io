import raw from '../data/projects.generated.json';
import config from '../../config/projects.json';

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
export const projects = raw
  .filter(r => r && r.full_name?.startsWith('ysogabe/') && !r.fork && !r.archived && !config.exclude.includes(r.name))
  .map(r => {
    const override = config.projects[r.name] || {};
    const category = override.category || inferCategory(r);
    return {
      ...r,
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
      featured: config.featured.includes(r.name)
    };
  });
export const featured = config.featured.map(n => projects.find(p => p.name === n)).filter(Boolean);
export const recent = [...projects].filter(p => p.updated_at).sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,4);
export const categoryNames = ['すべて','暮らしと見守り','記録と整理','IoTと工作','写真と風景','AIとものづくり','その他の実験'];
export function projectUrl(project) { return '/projects/' + encodeURIComponent(project.slug) + '/'; }
export function formatDate(date) { return date ? new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date)) : ''; }
