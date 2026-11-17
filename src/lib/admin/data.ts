import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Post } from '../content/types';
import type { ServicesData } from '../services';
import { supabaseOn, type Session } from './auth';

// LEARN (lesson 6): the admin's read/write functions. Same idea as src/lib/content: one set of
// functions, two back ends. Supabase calls carry YOUR access token, so the database itself decides
// whether the write is allowed (row-level security). The page code can't bypass that.

export interface Enquiry { id: number | string; created_at: string; status: 'new' | 'contacted' | 'won' | 'lost'; data: Record<string, any> }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
const dir = path.join(process.cwd(), 'content');

async function sb<T>(s: Session, p: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${url}${p}`, {
    ...init, cache: 'no-store',
    headers: { apikey: key, Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`Database error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
const readLocal = async <T>(f: string, fallback: T): Promise<T> => JSON.parse(await fs.readFile(path.join(dir, f), 'utf8').catch(() => JSON.stringify(fallback)));
const writeLocal = (f: string, v: unknown) => fs.writeFile(path.join(dir, f), JSON.stringify(v, null, 1) + '\n');

const toRow = (p: Post) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, published_at: p.publishedAt, read_minutes: p.readMinutes,
  cover: p.cover, cover_alt: p.coverAlt, tags: p.tags, featured: p.featured, status: p.status, blocks: p.blocks, updated_at: new Date().toISOString() });
const fromRow = (r: any): Post => ({ slug: r.slug, title: r.title, excerpt: r.excerpt, category: r.category, publishedAt: r.published_at, readMinutes: r.read_minutes,
  cover: r.cover, coverAlt: r.cover_alt, tags: r.tags ?? [], featured: r.featured, status: r.status, blocks: r.blocks ?? [] });

// ---------- Posts ----------
export async function listAllPosts(s: Session): Promise<Post[]> {
  const list = supabaseOn ? (await sb<any[]>(s, '/rest/v1/posts?select=*')).map(fromRow) : await readLocal<Post[]>('posts.json', []);
  return list.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function savePost(s: Session, post: Post, originalSlug?: string) {
  if (supabaseOn) {
    if (originalSlug && originalSlug !== post.slug) await sb(s, `/rest/v1/posts?slug=eq.${encodeURIComponent(originalSlug)}`, { method: 'DELETE' });
    await sb(s, '/rest/v1/posts?on_conflict=slug', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(toRow(post)) });
    return;
  }
  const list = await readLocal<Post[]>('posts.json', []);
  const rest = list.filter((p) => p.slug !== post.slug && p.slug !== originalSlug);
  await writeLocal('posts.json', [post, ...rest]);
}

export async function deletePost(s: Session, slug: string) {
  if (supabaseOn) return void (await sb(s, `/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}`, { method: 'DELETE' }));
  await writeLocal('posts.json', (await readLocal<Post[]>('posts.json', [])).filter((p) => p.slug !== slug));
}

// ---------- Settings ----------
export async function getServicesAdmin(s: Session): Promise<ServicesData> {
  if (supabaseOn) return (await sb<{ value: ServicesData }[]>(s, '/rest/v1/settings?key=eq.services&select=value'))[0].value;
  return readLocal<ServicesData>('services.json', {} as ServicesData);
}

export async function saveServices(s: Session, v: ServicesData) {
  if (supabaseOn) {
    await sb(s, '/rest/v1/settings?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key: 'services', value: v, updated_at: new Date().toISOString() }) });
    return;
  }
  await writeLocal('services.json', v);
}

// ---------- Enquiries ----------
export async function listEnquiries(s: Session): Promise<Enquiry[]> {
  if (supabaseOn) return sb<Enquiry[]>(s, '/rest/v1/enquiries?select=*&order=created_at.desc&limit=200');
  const raw = await readLocal<any[]>('enquiries.json', []);
  return raw.map((d, i) => ({ id: d.id ?? `local-${raw.length - i}`, created_at: d.receivedAt, status: d.status ?? 'new', data: d }));
}

export async function setEnquiryStatus(s: Session, id: string, status: Enquiry['status']) {
  if (supabaseOn) return void (await sb(s, `/rest/v1/enquiries?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }) }));
  const raw = await readLocal<any[]>('enquiries.json', []);
  raw.forEach((d, i) => { if ((d.id ?? `local-${raw.length - i}`) === id) d.status = status; });
  await writeLocal('enquiries.json', raw);
}

// ---------- Images ----------
/** Upload an image. Returns its public URL. */
export async function uploadImage(s: Session, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (supabaseOn) {
    const res = await fetch(`${url}/storage/v1/object/media/uploads/${name}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${s.token}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' }, body: bytes,
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return `${url}/storage/v1/object/public/media/uploads/${name}`;
  }
  const out = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(path.join(out, name), bytes);
  return `/uploads/${name}`;
}
