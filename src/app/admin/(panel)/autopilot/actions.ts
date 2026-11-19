'use server';
// LEARN (Autopilot): every button on the Autopilot page lands here. Same pattern as the rest of your admin:
// check you are signed in, do the work with YOUR token, then refresh the page.
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/admin/auth';
import { db, type Auth } from '@/lib/autopilot/db';
import * as engine from '@/lib/autopilot/engine';
import { PLATFORMS, DAYS, mergeSettings, type APSettings } from '@/lib/autopilot/defaults';

const PATH = '/admin/autopilot';
async function auth(): Promise<Auth> { return { token: (await requireSession()).token }; }
const id = (f: FormData) => String(f.get('id') || '');
const done = () => revalidatePath(PATH);
const log = (a: Auth, s: string) => db.log(a, s).catch(() => {});

export async function generateAction() { const a = await auth(); await engine.generate(a, { note: 'you asked' }); done(); }
export async function generateForAction(f: FormData) { const a = await auth(); await engine.generate(a, { itemKey: String(f.get('key') || ''), note: 'you picked it' }); done(); }
export async function scanAction() { const a = await auth(); await engine.scan(a); done(); }

export async function approvePostAction(f: FormData) { const a = await auth(); await engine.approvePost(a, id(f)); await log(a, 'You approved a post'); done(); }
export async function rejectPostAction(f: FormData) { const a = await auth(); await engine.rejectPost(a, id(f)); done(); }
export async function postedAction(f: FormData) { const a = await auth(); await engine.markPosted(a, id(f), String(f.get('url') || '')); await log(a, 'You marked a post as posted'); done(); }
export async function editPostAction(f: FormData) { const a = await auth(); await engine.editPost(a, id(f), String(f.get('text') || '').trim()); done(); }
export async function publishNowAction() { const a = await auth(); await engine.publishDue(a); done(); }

export async function leadAction(f: FormData) {
  const a = await auth(); const i = id(f); const op = String(f.get('op'));
  if (op === 'prepare') await engine.prepareLead(a, i);
  else if (op === 'approve') await db.update(a, 'ap_leads', i, { status: 'approved' });
  else if (op === 'skip') await db.update(a, 'ap_leads', i, { status: 'skipped' });
  else if (op === 'sent') await db.update(a, 'ap_leads', i, { status: 'sent' });
  else if (op === 'save') await db.update(a, 'ap_leads', i, { msg: String(f.get('msg') || ''), fmt: Number(f.get('fmt')), chan: Number(f.get('chan')), notes: String(f.get('notes') || '') });
  done();
}
export async function jobAction(f: FormData) {
  const a = await auth(); const i = id(f); const op = String(f.get('op'));
  if (op === 'prepare') await engine.prepareJob(a, i);
  else if (op === 'approve') await db.update(a, 'ap_jobs', i, { status: 'approved' });
  else if (op === 'skip') await db.update(a, 'ap_jobs', i, { status: 'skipped' });
  else if (op === 'applied') await db.update(a, 'ap_jobs', i, { status: 'applied' });
  else if (op === 'save') await db.update(a, 'ap_jobs', i, { cover: String(f.get('cover') || ''), subject: String(f.get('subject') || '') });
  done();
}

export async function addSourceAction(f: FormData) {
  const a = await auth();
  const url = String(f.get('url') || '').trim();
  if (!/^https:\/\//.test(url)) return; // public https feeds only
  await db.insertIfNew(a, 'ap_sources', 'url', { kind: f.get('kind') === 'leads' ? 'leads' : 'jobs', url, label: String(f.get('label') || '').trim(), enabled: true });
  done();
}
export async function removeSourceAction(f: FormData) { const a = await auth(); await db.remove(a, 'ap_sources', id(f)); done(); }

export async function saveSettingsAction(f: FormData) {
  const a = await auth();
  const cur = await engine.getSettings(a);
  const n: APSettings = mergeSettings({
    ...cur,
    tone: Number(f.get('tone')), avoid: String(f.get('avoid') || '').slice(0, 300),
    perWeek: Math.min(7, Math.max(1, Number(f.get('perWeek')) || 3)),
    days: Object.fromEntries(DAYS.map((d) => [d, f.get('day_' + d) === 'on'])),
    postTime: /^\d{2}:\d{2}$/.test(String(f.get('postTime'))) ? String(f.get('postTime')) : cur.postTime,
    platforms: Object.fromEntries(PLATFORMS.map((p) => [p, f.get('plat_' + p) === 'on'])),
    autonomy: { publish: Number(f.get('a_publish')), outreach: Number(f.get('a_outreach')), jobs: Number(f.get('a_jobs')) },
    pitchFmt: Number(f.get('pitchFmt')), pitchChan: Number(f.get('pitchChan')),
    skills: String(f.get('skills') || '').split(',').map((x) => x.trim()).filter(Boolean),
    minMatch: Math.min(95, Math.max(30, Number(f.get('minMatch')) || 60)),
    signature: String(f.get('signature') || '').slice(0, 120),
    privacy: Object.fromEntries([...f.entries()].filter(([k]) => k.startsWith('priv_')).map(([k, v]) => [k.slice(5), (['share', 'blur', 'never'].includes(String(v)) ? v : 'share') as 'share'])),
  });
  await engine.saveSettings(a, n);
  await log(a, 'Settings saved');
  done();
}
