'use server';
// LEARN (lesson 6): every admin change goes through one of these Server Actions.
// Each one: (1) checks you're signed in, (2) writes through the data layer (where the database checks
// your admin rights again), (3) tells Next.js which cached pages to rebuild with updateTag/revalidatePath.
import { redirect, unstable_rethrow } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { signIn, signOut, requireSession } from '@/lib/admin/auth';
import * as data from '@/lib/admin/data';
import type { Block, CategoryId, Post } from '@/lib/content/types';
import type { ServicesData } from '@/lib/services';

export interface ActionResult { ok: boolean; message?: string }

export async function loginAction(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  const err = await signIn(String(f.get('email') || '').trim(), String(f.get('password') || ''));
  if (err) return { ok: false, message: err };
  redirect('/admin');
}

export async function logoutAction() {
  await signOut();
  redirect('/admin/login');
}

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);

function refreshBlog(slugs: string[]) {
  updateTag('posts');
  revalidatePath('/blog');
  slugs.filter(Boolean).forEach((s) => revalidatePath(`/blog/${s}`));
  revalidatePath('/sitemap.xml');
}

export async function savePostAction(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  try {
    const s = await requireSession();
    const title = String(f.get('title') || '').trim();
    if (!title) return { ok: false, message: 'Add a title.' };
    const slug = slugify(String(f.get('slug') || '') || title);
    const originalSlug = String(f.get('originalSlug') || '') || undefined;
    let blocks: Block[] = [];
    try { blocks = JSON.parse(String(f.get('blocks') || '[]')); } catch { return { ok: false, message: 'The article body could not be read. Try again.' }; }
    const words = blocks.reduce((n, b) => n + (Array.isArray(b[1]) ? b[1].join(' ') : String(b[1] ?? '')).split(/\s+/).length, 0);
    const post: Post = {
      slug, title, excerpt: String(f.get('excerpt') || '').trim(), category: (String(f.get('category') || 'uiux') as CategoryId),
      publishedAt: String(f.get('publishedAt') || new Date().toISOString().slice(0, 10)),
      readMinutes: Math.max(1, Math.round(words / 220)),
      cover: String(f.get('cover') || ''), coverAlt: String(f.get('coverAlt') || ''),
      tags: String(f.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
      featured: f.get('featured') === 'on', status: f.get('status') === 'published' ? 'published' : 'draft', blocks,
    };
    if (post.featured) {
      // Only one featured post at a time.
      for (const p of await data.listAllPosts(s)) if (p.featured && p.slug !== slug && p.slug !== originalSlug) await data.savePost(s, { ...p, featured: false });
    }
    await data.savePost(s, post, originalSlug);
    refreshBlog([slug, originalSlug ?? '']);
    if (originalSlug !== slug) redirect(`/admin/posts/${slug}?saved=1`);
    return { ok: true, message: post.status === 'published' ? 'Saved and live.' : 'Saved as draft.' };
  } catch (e) {
    unstable_rethrow(e); // let Next.js handle its own redirect signal
    return { ok: false, message: (e as Error).message };
  }
}

export async function deletePostAction(f: FormData) {
  const s = await requireSession();
  const slug = String(f.get('originalSlug') || '');
  if (!slug) return;
  await data.deletePost(s, slug);
  refreshBlog([slug]);
  redirect('/admin/posts?deleted=1');
}

export async function uploadImageAction(f: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const s = await requireSession();
    const file = f.get('file');
    if (!(file instanceof File) || !file.size) return { error: 'Choose an image.' };
    if (!file.type.startsWith('image/')) return { error: 'That file is not an image.' };
    if (file.size > 4 * 1024 * 1024) return { error: 'Images must be under 4 MB.' };
    return { url: await data.uploadImage(s, file) };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function saveServicesAction(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  try {
    const s = await requireSession();
    const v = JSON.parse(String(f.get('services') || '{}')) as ServicesData;
    if (!v.plans?.length || !v.estimator || !v.consultation) return { ok: false, message: 'Something is missing from the prices. Nothing was saved.' };
    await data.saveServices(s, v);
    updateTag('settings');
    revalidatePath('/services');
    return { ok: true, message: 'Prices and settings saved. The Services page is updated.' };
  } catch (e) { return { ok: false, message: (e as Error).message }; }
}

export async function enquiryStatusAction(f: FormData) {
  const s = await requireSession();
  const status = String(f.get('status')) as data.Enquiry['status'];
  if (!['new', 'contacted', 'won', 'lost'].includes(status)) return;
  await data.setEnquiryStatus(s, String(f.get('id')), status);
  revalidatePath('/admin/enquiries');
  revalidatePath('/admin');
}

// ---------- Case studies ----------
import type { CaseStudy } from '@/lib/content/types';

function refreshCases(slugs: string[]) {
  updateTag('cases');
  revalidatePath('/work');
  slugs.filter(Boolean).forEach((s) => revalidatePath(`/work/${s}`));
  revalidatePath('/sitemap.xml');
}

export async function saveCaseAction(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  try {
    const s = await requireSession();
    const c = JSON.parse(String(f.get('case') || '{}')) as CaseStudy;
    const custom = !!c.card?.custom;
    if (!c.title?.trim() && custom) return { ok: false, message: 'Add a title.' };
    const originalSlug = String(f.get('originalSlug') || '') || undefined;
    c.slug = custom ? slugify(c.slug || c.title) : String(originalSlug || c.slug);
    if (!c.slug) return { ok: false, message: 'Add a title so the case study gets an address.' };
    if (!custom) c.status = 'published'; // built-in case studies are always live; their edits apply straight away
    c.card.flow = (c.card.flow || []).filter((x) => x.img);
    c.sections = (c.sections || []).filter((x) => x.h || x.p || x.img);
    await data.saveCase(s, c, custom ? originalSlug : undefined);
    refreshCases([c.slug, originalSlug ?? '']);
    if (custom && originalSlug !== c.slug) redirect(`/admin/cases/${c.slug}?saved=1`);
    return { ok: true, message: custom && c.status === 'draft' ? 'Saved as draft.' : 'Saved. The live page is updated.' };
  } catch (e) {
    unstable_rethrow(e);
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteCaseAction(f: FormData) {
  const s = await requireSession();
  const slug = String(f.get('slug') || '');
  if (!slug) return;
  await data.deleteCase(s, slug);
  refreshCases([slug]);
  redirect('/admin/cases?deleted=1');
}

// ---------- Homepage & links ----------
export async function saveSiteAction(_: ActionResult | null, f: FormData): Promise<ActionResult> {
  try {
    const s = await requireSession();
    const clean = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, String(f.get(k) || '').trim()]).filter(([, v]) => v));
    await data.saveSetting(s, 'links', clean(['email', 'whatsapp', 'linkedin', 'instagram', 'tiktok', 'behance', 'dribbble', 'x', 'cv']));
    await data.saveSetting(s, 'home', clean(['title', 'intro']));
    updateTag('settings');
    ['/', '/work', '/about', '/contact'].forEach((p) => revalidatePath(p));
    revalidatePath('/work/[slug]', 'page');
    return { ok: true, message: 'Saved. Your homepage and links are updated.' };
  } catch (e) { return { ok: false, message: (e as Error).message }; }
}
