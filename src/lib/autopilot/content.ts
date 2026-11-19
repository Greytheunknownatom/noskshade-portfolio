import 'server-only';
import casesMeta from '@/legacy/cases-meta.json';
import { SITE_URL } from '../site';
import { getSocial } from '../social';
import { db, type Auth, type Row } from './db';

// LEARN (Autopilot): what Autopilot can post about. It reads the SAME data your site shows:
// published journal posts and case studies from Supabase, plus the built-in case studies.
// If the social asset pipeline already wrote captions for a post, those are used as they are.
export interface Item {
  key: string; kind: 'blog' | 'work'; slug: string; url: string; title: string; description: string;
  image: string; published: string; body: string; captions?: Record<string, string>; art?: string;
}

const abs = (p: string) => (!p ? '' : /^https?:\/\//.test(p) ? p : SITE_URL + (p.startsWith('/') ? p : '/' + p));

function textOf(blocks: any[]): string {
  return (blocks || []).map((b) => (b[0] === 'p' || b[0] === 'h' || b[0] === 'q' ? String(b[1]) : b[0] === 'l' ? (b[1] as string[]).join('. ') : '')).filter(Boolean).join(' ').replace(/\s+/g, ' ').slice(0, 3000);
}

export async function loadItems(a: Auth): Promise<Item[]> {
  const [posts, cases] = await Promise.all([
    db.rawPublic(a, 'posts?status=eq.published&select=slug,title,excerpt,published_at,cover,blocks&order=published_at.desc'),
    db.rawPublic(a, 'case_studies?status=eq.published&select=slug,title,kind,card,brief,sections'),
  ]);
  const items: Item[] = [];
  for (const p of posts as Row[]) {
    let captions: Record<string, string> | undefined, art: string | undefined;
    try {
      const soc = await getSocial(p.slug);
      if (soc) {
        captions = { LinkedIn: soc.linkedin || '', Instagram: soc.instagram || '', TikTok: soc.tiktok || '' };
        Object.keys(captions).forEach((k) => !captions![k] && delete captions![k]);
        if (soc.slides?.length) art = `${SITE_URL}/assets/social/${p.slug}/${soc.slides[0]}`;
      }
    } catch { /* no social assets for this post */ }
    items.push({ key: `post:${p.slug}`, kind: 'blog', slug: p.slug, url: `${SITE_URL}/blog/${p.slug}`, title: p.title, description: p.excerpt || '', image: abs(p.cover), published: String(p.published_at || ''), body: textOf(p.blocks), captions, art });
  }
  const meta = casesMeta as Record<string, Row>;
  const over = new Map((cases as Row[]).map((c) => [c.slug, c]));
  for (const [slug, m] of Object.entries(meta)) {
    const o = over.get(slug);
    if (o?.card?.hidden) continue;
    items.push({ key: `case:${slug}`, kind: 'work', slug, url: `${SITE_URL}/work/${slug}`, title: o?.title || m.seoTitle || m.title, description: o?.card?.desc || m.desc || '', image: abs(o?.card?.cover || m.og || m.cover || ''), published: '', body: [o?.brief?.problem, o?.brief?.result].filter(Boolean).join(' ') });
  }
  for (const c of cases as Row[]) {
    if (!c.card?.custom || c.card?.hidden || meta[c.slug]) continue;
    items.push({ key: `case:${c.slug}`, kind: 'work', slug: c.slug, url: `${SITE_URL}/work/${c.slug}`, title: c.title, description: c.card?.desc || c.card?.intro || '', image: abs(c.card?.cover || ''), published: '', body: [c.brief?.problem, c.brief?.did, c.brief?.result].filter(Boolean).join(' ') });
  }
  return items;
}
