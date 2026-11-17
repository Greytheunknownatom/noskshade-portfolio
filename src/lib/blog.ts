import type { Post, CategoryId } from './content/types';

// Category colours, unchanged from the original site.
export const CATS: Record<CategoryId, { label: string; c: string; bg: string; dot: string; glow: string }> = {
  uiux: { label: 'UI/UX & Product', c: '#0369a1', bg: 'rgba(14,165,233,0.12)', dot: '#0ea5e9', glow: 'rgba(14,165,233,0.28)' },
  brand: { label: 'Brand identity', c: '#be185d', bg: 'rgba(236,72,153,0.12)', dot: '#ec4899', glow: 'rgba(236,72,153,0.22)' },
  systems: { label: 'Design systems', c: '#6d28d9', bg: 'rgba(139,92,246,0.12)', dot: '#8b5cf6', glow: 'rgba(139,92,246,0.24)' },
  code: { label: 'Design x code', c: '#0f766e', bg: 'rgba(20,184,166,0.12)', dot: '#14b8a6', glow: 'rgba(20,184,166,0.24)' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (d: string) => {
  const [y, m, dd] = d.split('-');
  return `${Number(dd)} ${MONTHS[Number(m) - 1]} ${y}`;
};
export const fmtMonth = (d: string) => {
  const [y, m] = d.split('-');
  return `${MONTHS[Number(m) - 1]} ${y}`;
};

/** A post card's display values (plain data, so it can be passed to a client component). */
export interface PostCard {
  slug: string; href: string; title: string; excerpt: string; cover: string; coverAlt: string;
  date: string; read: number; cat: string; catId: CategoryId; catC: string; catBg: string;
  tags: string[]; featured: boolean;
}

export const toCard = (p: Post): PostCard => {
  const k = CATS[p.category] ?? CATS.uiux;
  return {
    slug: p.slug, href: `/blog/${p.slug}`, title: p.title, excerpt: p.excerpt, cover: p.cover, coverAlt: p.coverAlt,
    date: fmtDate(p.publishedAt), read: p.readMinutes, cat: k.label, catId: p.category, catC: k.c, catBg: k.bg,
    tags: p.tags, featured: p.featured,
  };
};

/** Old hash routes (#case-heatbud) used inside post CTAs, mapped to the new paths. */
export { pathFor as routeToPath } from '../legacy/routes';
