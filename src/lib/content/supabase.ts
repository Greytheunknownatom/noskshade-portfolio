import 'server-only';
import type { Post } from './types';

// LEARN (lesson 3): the Supabase version of the same functions. It uses Supabase's REST API with the
// public (anon) key; row-level security in the database only lets the public read published rows.
// Filled in for real when your Supabase project is connected; the table shape is in supabase/schema.sql.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// New Supabase projects give a publishable key (sb_publishable_…); older ones an anon key. Either works here.
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface PostRow {
  slug: string; title: string; excerpt: string; category: Post['category']; published_at: string;
  read_minutes: number; cover: string; cover_alt: string; tags: string[]; featured: boolean;
  status: Post['status']; blocks: Post['blocks'];
}

const fromRow = (r: PostRow): Post => ({
  slug: r.slug, title: r.title, excerpt: r.excerpt, category: r.category, publishedAt: r.published_at,
  readMinutes: r.read_minutes, cover: r.cover, coverAlt: r.cover_alt, tags: r.tags ?? [], featured: r.featured,
  status: r.status, blocks: r.blocks ?? [],
});

export async function listPosts(): Promise<Post[]> {
  const res = await fetch(`${url}/rest/v1/posts?select=*&status=eq.published`, {
    headers: { apikey: key! },
  });
  if (!res.ok) throw new Error(`Supabase posts: ${res.status}`);
  return ((await res.json()) as PostRow[]).map(fromRow);
}

export async function readSettings<T>(k: string): Promise<T> {
  const res = await fetch(`${url}/rest/v1/settings?key=eq.${encodeURIComponent(k)}&select=value`, {
    headers: { apikey: key! },
  });
  if (!res.ok) throw new Error(`Supabase settings: ${res.status}`);
  const rows = (await res.json()) as { value: T }[];
  if (!rows[0]) throw new Error(`Supabase settings: no row for ${k}`);
  return rows[0].value;
}

// Enquiries are inserted with the public key; row-level security allows insert but never read.
export async function addEnquiry(e: unknown): Promise<void> {
  const res = await fetch(`${url}/rest/v1/enquiries`, {
    method: 'POST',
    headers: { apikey: key!, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ data: e }),
  });
  if (!res.ok) throw new Error(`Supabase enquiry: ${res.status}`);
}
