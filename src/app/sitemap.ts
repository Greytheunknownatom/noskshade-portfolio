import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getPublishedPosts, getCases } from '@/lib/content';
import { CASE_SLUGS } from '@/legacy/routes';

// LEARN (lesson 7): Next.js turns this into /sitemap.xml. New posts appear in it automatically.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, extra] = await Promise.all([getPublishedPosts(), getCases()]);
  const fixed = ['', '/work', '/services', '/blog', '/about', '/contact'].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.8 }));
  const cases = Object.values(CASE_SLUGS).map((s) => ({ url: `${SITE_URL}/work/${s}`, priority: 0.8 }));
  const custom = extra.filter((c) => c.card.custom && !c.card.hidden).map((c) => ({ url: `${SITE_URL}/work/${c.slug}`, priority: 0.8 }));
  const blog = posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.publishedAt, priority: 0.7 }));
  return [...fixed, ...cases, ...custom, ...blog];
}
