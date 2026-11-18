import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Post, CaseStudy, SiteLinks, SiteHome } from './types';
import type { ServicesData } from '../services';
import * as local from './local';
import * as supabase from './supabase';

// LEARN (lesson 3): one switch decides where content comes from.
// No Supabase keys yet → read the JSON files in /content. Keys added → read Supabase. Pages never know the difference.
const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
const source = useSupabase ? supabase : local;

// LEARN (lesson 5): the data cache survives between builds. Local JSON files ship with each deploy,
// so caching them would serve last build's prices. Only Supabase reads are cached (the admin clears them).
const cached: typeof unstable_cache = useSupabase ? unstable_cache : ((fn) => fn) as typeof unstable_cache;

// LEARN (lesson 4): unstable_cache keeps the result on the server, so most visits never touch the database.
// The 'posts' tag lets the admin say "posts changed" and refresh only what depends on them.
export const getPublishedPosts = cached(
  async (): Promise<Post[]> => {
    const posts = await source.listPosts();
    return posts
      .filter((p) => p.status === 'published')
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  },
  ['published-posts'],
  { tags: ['posts'], revalidate: 86400 },
);

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug);
}

// LEARN (lesson 5): settings such as Services prices are cached too, under the 'settings' tag.
export const getServices = cached(
  async (): Promise<ServicesData> => source.readSettings<ServicesData>('services'),
  ['services'],
  { tags: ['settings'], revalidate: 86400 },
);

// Case studies and homepage settings, cached under their own tags so an admin save refreshes only them.
export const getCases = cached(
  async (): Promise<CaseStudy[]> => source.listCases().catch(() => []),
  ['cases'],
  { tags: ['cases'], revalidate: 86400 },
);
export async function getCase(slug: string) { return (await getCases()).find((c) => c.slug === slug); }

export const getSite = cached(
  async (): Promise<{ links: SiteLinks; home: SiteHome }> => ({
    links: await source.readSettingsOr<SiteLinks>('links', {}),
    home: await source.readSettingsOr<SiteHome>('home', {}),
  }),
  ['site'],
  { tags: ['settings'], revalidate: 86400 },
);

export const saveEnquiry = (e: unknown) => source.addEnquiry(e);

export type { Post, CaseStudy, SiteLinks, SiteHome } from './types';
