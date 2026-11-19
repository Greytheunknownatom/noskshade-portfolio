import 'server-only';
import { db, type Auth, type Row } from './db';
import { mergeSettings, DAYS, type APSettings } from './defaults';
import { loadItems, type Item } from './content';
import { draftPost, draftOutreach, draftCover, replyToBrief } from './ai';
import { canPublish, publish } from './platforms';
import { SITE_URL } from '../site';

// LEARN (Autopilot): the brain. Four jobs, all safe by default:
//  1. generate()  - turn your published posts and case studies into drafts, spread across the week
//  2. approve()/reject() - YOU decide; nothing goes out unless your autonomy level allows it
//  3. publishDue() - post what is due (only where an official API token exists, otherwise "ready to post")
//  4. scan()      - read job/lead feeds you added, plus your own Services enquiries
export const getSettings = async (a: Auth): Promise<APSettings> => mergeSettings((await db.getSettingsRaw(a)) as Partial<APSettings>);
export const saveSettings = async (a: Auth, s: APSettings) => db.saveSettingsRaw(a, s as unknown as Row);

const hist = (h: any, text: string) => [...(Array.isArray(h) ? h : []), { at: new Date().toISOString(), text }];
const hasKey = (k: string | undefined) => !!k;

/** Upcoming slot times (UTC Date objects) on the days you chose, at your post time, in your time zone. */
export function planSlots(s: APSettings, now = new Date(), count = s.perWeek): Date[] {
  const [hh, mm] = (s.postTime || '10:00').split(':').map(Number);
  const out: Date[] = [];
  for (let i = 0; i < 14 && out.length < count; i++) {
    const local = new Date(now.getTime() + s.utcOffsetHours * 3600_000 + i * 86400_000);
    const day = DAYS[(local.getUTCDay() + 6) % 7];
    if (!s.days[day]) continue;
    const slot = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), hh - s.utcOffsetHours, mm));
    if (slot.getTime() > now.getTime() + 30 * 60_000) out.push(slot);
  }
  return out;
}

export async function generate(a: Auth, opts: { itemKey?: string; note?: string } = {}) {
  const s = await getSettings(a);
  if (s.autonomy.publish === 0) return { created: 0, reason: 'Posting is switched off in Settings.' };
  const items = (await loadItems(a)).filter((i) => s.privacy[i.key] !== 'never');
  if (!items.length) return { created: 0, reason: 'No published posts or case studies to use yet.' };

  const existing = await db.list(a, 'ap_posts', {}, { select: 'item_key,status,scheduled_for,platform', limit: 500 });
  const openCount = existing.filter((p) => ['pending', 'scheduled'].includes(p.status)).length;
  const usedCount = new Map<string, number>();
  existing.forEach((p) => usedCount.set(p.item_key, (usedCount.get(p.item_key) || 0) + 1));

  let chosen: Item[];
  if (opts.itemKey) chosen = items.filter((i) => i.key === opts.itemKey);
  else {
    // Least-used first, newest first among ties. Fill only what the week still needs.
    const need = Math.max(0, s.perWeek - Math.ceil(openCount / Math.max(1, Object.values(s.platforms).filter(Boolean).length)));
    chosen = [...items].sort((x, y) => (usedCount.get(x.key) || 0) - (usedCount.get(y.key) || 0) || y.published.localeCompare(x.published)).slice(0, need);
  }
  const slots = opts.itemKey ? [new Date(Date.now() + 3600_000)] : planSlots(s);
  const platforms = Object.entries(s.platforms).filter(([, on]) => on).map(([p]) => p);
  let created = 0;
  for (let i = 0; i < chosen.length; i++) {
    const item = chosen[i]; const slot = slots[i] || slots[slots.length - 1] || new Date(Date.now() + 86400_000);
    for (let k = 0; k < platforms.length; k++) {
      const platform = platforms[k];
      const { text, by } = await draftPost({ platform, item, settings: s, pick: (usedCount.get(item.key) || 0) + k });
      const blur = s.privacy[item.key] === 'blur';
      const when = new Date(slot.getTime() + k * 30 * 60_000);
      await db.insert(a, 'ap_posts', {
        item_key: item.key, platform, text, link: item.url, source_label: item.title,
        art_url: blur ? '' : item.art || item.image || '',
        status: s.autonomy.publish >= 3 ? 'scheduled' : 'pending',
        scheduled_for: when.toISOString(),
        why: `From ${item.kind === 'work' ? 'your case study' : 'your journal post'} “${item.title}”. Written by ${by}.${blur ? ' Image left out because this item is set to Blur.' : ''}`,
        history: hist([], `Drafted for ${platform} (${by})${opts.note ? ' · ' + opts.note : ''}`),
      });
      created++;
    }
  }
  if (created) await db.log(a, `Drafted ${created} post${created === 1 ? '' : 's'}`);
  return { created };
}

export async function approvePost(a: Auth, id: string) {
  const s = await getSettings(a);
  const p = await db.get(a, 'ap_posts', id); if (!p) throw new Error('Post not found');
  const auto = s.autonomy.publish >= 2 && canPublish(p.platform);
  return db.update(a, 'ap_posts', id, {
    status: auto ? 'scheduled' : 'prepared',
    scheduled_for: p.scheduled_for || new Date().toISOString(),
    history: hist(p.history, auto ? 'Approved · will post at the scheduled time' : 'Approved · ready for you to post'),
  });
}
export const rejectPost = async (a: Auth, id: string) => { const p = await db.get(a, 'ap_posts', id); return db.update(a, 'ap_posts', id, { status: 'rejected', history: hist(p?.history, 'Rejected') }); };
export const markPosted = async (a: Auth, id: string, url = '') => { const p = await db.get(a, 'ap_posts', id); return db.update(a, 'ap_posts', id, { status: 'published', published_at: new Date().toISOString(), external_url: url || null, history: hist(p?.history, 'Marked as posted by you') }); };
export async function editPost(a: Auth, id: string, text: string) {
  const p = await db.get(a, 'ap_posts', id); if (!p) throw new Error('Post not found');
  return db.update(a, 'ap_posts', id, { text, history: hist(p.history, 'Edited by you') });
}

export async function publishDue(a: Auth) {
  const s = await getSettings(a);
  const due = await db.list(a, 'ap_posts', { status: 'scheduled', scheduled_for: { lte: new Date().toISOString() } }, { order: 'scheduled_for.asc', limit: 20 });
  let ok = 0, failed = 0;
  for (const p of due) {
    if (s.autonomy.publish < 2 || !canPublish(p.platform)) { await db.update(a, 'ap_posts', p.id, { status: 'prepared', history: hist(p.history, 'Due, but cannot post by API here. Ready for you to post.') }); continue; }
    try {
      const r = await publish({ platform: p.platform, text: p.text, art_url: p.art_url });
      await db.update(a, 'ap_posts', p.id, { status: 'published', published_at: new Date().toISOString(), external_url: r.url || null, history: hist(p.history, 'Posted') });
      ok++;
    } catch (e: any) {
      await db.update(a, 'ap_posts', p.id, { status: 'failed', error: String(e.message || e).slice(0, 300), history: hist(p.history, 'Failed to post') });
      failed++;
    }
  }
  if (ok || failed) await db.log(a, `Posted ${ok}, failed ${failed}`);
  return { published: ok, failed };
}

// ---- Jobs & leads from feeds you added (RSS/Atom only: public feeds meant to be read) ----
function parseFeed(xml: string) {
  const out: { title: string; link: string; desc: string }[] = [];
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/g) || [];
  const pick = (b: string, tag: string) => (b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')) || [])[1] || '';
  const strip = (t: string) => t.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  for (const b of blocks) {
    const link = pick(b, 'link').trim() || (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || '';
    out.push({ title: strip(pick(b, 'title')), link: strip(link), desc: strip(pick(b, 'description') || pick(b, 'summary') || pick(b, 'content')).slice(0, 1500) });
  }
  return out.filter((x) => x.title && x.link);
}
const score = (text: string, skills: string[]) => {
  const t = text.toLowerCase(); const hits = skills.filter((k) => t.includes(k.toLowerCase())).length;
  return hits ? Math.min(98, 55 + hits * 12) : 0;
};

export async function scan(a: Auth) {
  const s = await getSettings(a);
  const sources = await db.list(a, 'ap_sources', { enabled: true });
  let jobs = 0, leads = 0, errors = 0;
  for (const src of sources) {
    try {
      const res = await fetch(src.url, { headers: { 'User-Agent': 'NoskshadeAutopilot/1.0 (+' + SITE_URL + ')' }, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(String(res.status));
      for (const f of parseFeed(await res.text()).slice(0, 30)) {
        const m = score(f.title + ' ' + f.desc, s.skills);
        if (m < s.minMatch) continue;
        if (src.kind === 'jobs') {
          const [title, company = ''] = f.title.split(/\s+(?:at|@|–|-|\|)\s+/);
          const r = await db.insertIfNew(a, 'ap_jobs', 'source_url', { title, company, match: m, source_url: f.link, source: src.label || new URL(src.url).hostname, description: f.desc, history: hist([], 'Found') });
          if (r.created) jobs++;
        } else {
          const r = await db.insertIfNew(a, 'ap_leads', 'source_url', { name: f.title.slice(0, 80), kind: 'Possible client', fit: m, signal: f.desc.slice(0, 200), source: src.label || new URL(src.url).hostname, source_url: f.link, history: hist([], 'Found') });
          if (r.created) leads++;
        }
      }
    } catch { errors++; }
  }
  // Your own Services briefs are the warmest leads.
  try {
    const enq = await db.rawPublic(a, 'enquiries?select=id,data,created_at&order=created_at.desc&limit=30');
    for (const e of enq) {
      const d = e.data || {}; if (!d.name) continue;
      const r = await db.insertIfNew(a, 'ap_leads', 'source_url', { name: d.company ? `${d.name} · ${d.company}` : d.name, kind: 'Brief from your site', fit: 95, signal: String(d.message || '').slice(0, 200), source: 'Services form', source_url: `enquiry:${e.id}`, contact: d.email || '', ...replyToBrief(d), history: hist([], 'Came in through your Services page') });
      if (r.created) leads++;
    }
  } catch { /* enquiries not reachable by the service key: skip */ }
  if (jobs || leads) await db.log(a, `Found ${jobs} job${jobs === 1 ? '' : 's'} and ${leads} lead${leads === 1 ? '' : 's'}`);
  return { jobs, leads, errors };
}

export async function prepareLead(a: Auth, id: string) {
  const s = await getSettings(a);
  const l = await db.get(a, 'ap_leads', id); if (!l) throw new Error('Lead not found');
  const projects = (await loadItems(a)).filter((i) => i.kind === 'work').slice(0, 3).map((i) => i.title);
  const o = await draftOutreach({ lead: l as any, settings: s, projects });
  return db.update(a, 'ap_leads', id, { ...o, history: hist(l.history, 'Approach drafted') });
}
export async function prepareJob(a: Auth, id: string) {
  const s = await getSettings(a);
  const j = await db.get(a, 'ap_jobs', id); if (!j) throw new Error('Job not found');
  const projects = (await loadItems(a)).filter((i) => i.kind === 'work').slice(0, 3).map((i) => i.title);
  const cover = await draftCover({ job: j as any, settings: s, projects, siteUrl: SITE_URL });
  return db.update(a, 'ap_jobs', id, { cover, subject: `Application: ${j.title}${j.company ? ' · ' + j.company : ''}`, history: hist(j.history, 'Cover note drafted') });
}

/** Everything the scheduled job does, in a safe order. */
export async function runAll(a: Auth) {
  const out: Record<string, unknown> = {};
  try { out.scan = await scan(a); } catch (e: any) { out.scan = { error: e.message }; }
  try { out.generate = await generate(a); } catch (e: any) { out.generate = { error: e.message }; }
  try { out.publish = await publishDue(a); } catch (e: any) { out.publish = { error: e.message }; }
  return out;
}
export { hasKey };
