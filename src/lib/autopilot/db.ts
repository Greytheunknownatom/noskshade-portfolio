import 'server-only';
import { supabaseOn } from '../admin/auth';

// LEARN (Autopilot): one tiny data layer for all ap_* tables.
// Two ways in: as YOU (your admin token, so row-level security checks you are an admin), or as the
// scheduled job (the service key, which only ever lives on the server and is used by /api/autopilot/run).
export type Auth = { token: string } | { service: true };
export type Row = Record<string, any>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

export const autopilotReady = supabaseOn;

async function rest<T = Row[]>(a: Auth, p: string, init: RequestInit = {}): Promise<T> {
  let key = anon, bearer = '';
  if ('service' in a) {
    key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    bearer = key;
  } else bearer = a.token;
  const res = await fetch(`${url}/rest/v1/${p}`, {
    ...init, cache: 'no-store',
    // New-style secret keys (sb_secret_...) are not JWTs: send them as the apikey only.
    headers: { apikey: key, ...(bearer.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${bearer}` }), 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Database error ${res.status}: ${text.slice(0, 200)}`);
  return (text ? JSON.parse(text) : []) as T;
}

type Filter = Record<string, string | number | boolean | { in: string[] } | { lte: string }>;
function qs(f: Filter = {}, o: { order?: string; limit?: number; select?: string } = {}) {
  const p: string[] = [];
  for (const [k, v] of Object.entries(f)) {
    if (typeof v === 'object') p.push('in' in v ? `${k}=in.(${v.in.map(encodeURIComponent).join(',')})` : `${k}=lte.${encodeURIComponent(v.lte)}`);
    else p.push(`${k}=eq.${encodeURIComponent(String(v))}`);
  }
  if (o.select) p.push(`select=${o.select}`);
  if (o.order) p.push(`order=${o.order}`);
  if (o.limit) p.push(`limit=${o.limit}`);
  return p.length ? '?' + p.join('&') : '';
}

export const db = {
  list: (a: Auth, table: string, f: Filter = {}, o: { order?: string; limit?: number; select?: string } = {}) => rest(a, table + qs(f, o)),
  async get(a: Auth, table: string, id: string) { return (await rest(a, table + qs({ id }, { limit: 1 })))[0] || null; },
  async insert(a: Auth, table: string, row: Row) { return (await rest(a, table, { method: 'POST', body: JSON.stringify(row) }))[0]; },
  async update(a: Auth, table: string, id: string, patch: Row) { return (await rest(a, `${table}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }))[0] || null; },
  async insertIfNew(a: Auth, table: string, col: string, row: Row) {
    const found = (await rest(a, table + qs({ [col]: row[col] }, { limit: 1 })))[0];
    if (found) return { row: found, created: false };
    return { row: await this.insert(a, table, row), created: true };
  },
  async remove(a: Auth, table: string, id: string) { await rest(a, `${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); },
  async getSettingsRaw(a: Auth) { return ((await rest(a, 'ap_settings?id=eq.1'))[0] || {}).data || {}; },
  async saveSettingsRaw(a: Auth, data: Row) {
    await rest(a, 'ap_settings?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: 1, data, updated_at: new Date().toISOString() }) });
  },
  log: (a: Auth, text: string) => rest(a, 'ap_activity', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ text }) }),
  /** Public published rows (the same data your site shows). Works with either kind of access. */
  rawPublic: (a: Auth, p: string) => rest<Row[]>(a, p),
};
