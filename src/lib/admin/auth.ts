import 'server-only';
import { cookies } from 'next/headers';

// LEARN (lesson 6): how the admin login works.
// Supabase checks your email + password and returns two tokens: a short-lived ACCESS token (1 hour)
// and a long-lived REFRESH token. We keep both in httpOnly cookies, which JavaScript in the page
// can't read, so a malicious script can't steal them. Every database write sends the access token,
// and Supabase's row-level security checks it against your admin list.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseOn = !!(url && key);

const A = 'nk_at', R = 'nk_rt', LOCAL = 'nk_local';
const secure = process.env.NODE_ENV === 'production';
const opts = (maxAge: number) => ({ httpOnly: true, secure, sameSite: 'lax' as const, path: '/', maxAge });

export interface Session { email: string; token: string }

function decode(token: string): { email?: string; exp?: number } {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')); } catch { return {}; }
}

async function tokenRequest(grant: 'password' | 'refresh_token', body: object) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST', headers: { apikey: key!, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
  });
  if (!res.ok) return null;
  return (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
}

async function store(t: { access_token: string; refresh_token: string; expires_in: number }) {
  const jar = await cookies();
  jar.set(A, t.access_token, opts(t.expires_in));
  jar.set(R, t.refresh_token, opts(60 * 60 * 24 * 30));
}

/** Sign in. Returns an error message, or null on success. Only callable from Server Actions. */
export async function signIn(email: string, password: string): Promise<string | null> {
  if (!supabaseOn) {
    // Local stand-in (development only): one password from .env, no database.
    const dev = process.env.ADMIN_DEV_PASSWORD;
    if (process.env.NODE_ENV === 'production' || !dev) return 'Admin is not connected to Supabase yet.';
    if (password !== dev) return 'Wrong email or password.';
    (await cookies()).set(LOCAL, email, opts(60 * 60 * 8));
    return null;
  }
  const t = await tokenRequest('password', { email, password });
  if (!t) return 'Wrong email or password.';
  await store(t);
  return null;
}

export async function signOut() {
  const jar = await cookies();
  for (const c of [A, R, LOCAL]) jar.delete(c);
}

/** Read the session in a page or layout (cannot refresh cookies there). */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  if (!supabaseOn) {
    const e = jar.get(LOCAL)?.value;
    return e && process.env.NODE_ENV !== 'production' ? { email: e, token: 'local' } : null;
  }
  const token = jar.get(A)?.value;
  if (!token) return null;
  const p = decode(token);
  if (!p.exp || p.exp * 1000 < Date.now() + 30_000) return null;
  return { email: p.email ?? '', token };
}

/** True when the access token expired but a refresh token exists (layout then sends you to /admin/refresh). */
export async function canRefresh() {
  return supabaseOn && !!(await cookies()).get(R)?.value;
}

/** Swap the refresh token for a fresh access token. Route Handlers and Server Actions only. */
export async function refresh(): Promise<boolean> {
  const rt = (await cookies()).get(R)?.value;
  if (!rt) return false;
  const t = await tokenRequest('refresh_token', { refresh_token: rt });
  if (!t) return false;
  await store(t);
  return true;
}

/** For Server Actions: the current session, refreshing it if needed. */
export async function requireSession(): Promise<Session> {
  let s = await getSession();
  if (!s && (await refresh())) s = await getSession();
  if (!s) throw new Error('Your session expired. Please sign in again.');
  return s;
}
