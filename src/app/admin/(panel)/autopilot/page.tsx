import Link from 'next/link';
import { requireSessionForPage } from '@/lib/admin/page';
import { autopilotReady, db, type Row } from '@/lib/autopilot/db';
import { getSettings } from '@/lib/autopilot/engine';
import { loadItems } from '@/lib/autopilot/content';
import { aiProvider } from '@/lib/autopilot/ai';
import { canPublish } from '@/lib/autopilot/platforms';
import { PLATFORMS, TONES, LEVELS, FORMATS, CHANNELS, DAYS, LIMITS } from '@/lib/autopilot/defaults';
import * as A from './actions';
import CopyButton from '../enquiries/CopyButton';
import Icon from '../Icon';
import s from '../../admin.module.css';

const TABS = [['posts', 'Posts'], ['leads', 'Clients'], ['jobs', 'Jobs'], ['settings', 'Settings']] as const;
const when = (d?: string) => (d ? new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) : '');
const STATUS: Record<string, string> = { pending: 'Needs your OK', scheduled: 'Scheduled', prepared: 'Ready to post', published: 'Posted', rejected: 'Rejected', failed: 'Failed', new: 'New', approved: 'Approved', skipped: 'Skipped', sent: 'Sent', applied: 'Applied' };
const COLOR: Record<string, string> = { pending: '#b45309', scheduled: '#0369a1', prepared: '#6d28d9', published: '#15803d', failed: '#b91c1c', approved: '#0369a1', sent: '#15803d', applied: '#15803d' };
const Pill = ({ v }: { v: string }) => <span className={s.pill} style={{ background: (COLOR[v] || '#6b7280') + '1f', color: COLOR[v] || '#4b5563' }}>{STATUS[v] || v}</span>;
const Btn = ({ children, ghost, danger }: { children: React.ReactNode; ghost?: boolean; danger?: boolean }) => <button className={`${s.btn} ${ghost ? s.ghost : ''} ${danger ? s.danger : ''} ${s.small}`}>{children}</button>;

export default async function Autopilot({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await requireSessionForPage();
  const tab = (await searchParams).tab || 'posts';
  if (!autopilotReady) return (<><div className={s.head}><div><h1 className={s.h1}>Autopilot</h1></div></div><div className={`${s.card} ${s.pad}`}><p>Autopilot stores its drafts in Supabase, so it needs your Supabase connection. Add the Supabase keys to this site first, then reload.</p></div></>);
  const a = { token: session.token };
  let setupError = '';
  let posts: Row[] = [], leads: Row[] = [], jobs: Row[] = [], sources: Row[] = [], activity: Row[] = [];
  try {
    [posts, leads, jobs, sources, activity] = await Promise.all([
      db.list(a, 'ap_posts', {}, { order: 'scheduled_for.asc', limit: 80 }), db.list(a, 'ap_leads', {}, { order: 'created_at.desc', limit: 60 }),
      db.list(a, 'ap_jobs', {}, { order: 'match.desc', limit: 60 }), db.list(a, 'ap_sources', {}), db.list(a, 'ap_activity', {}, { order: 'at.desc', limit: 8 }),
    ]);
  } catch (e: any) { setupError = String(e.message || e); }
  if (setupError) return (<><div className={s.head}><div><h1 className={s.h1}>Autopilot</h1></div></div><div className={`${s.card} ${s.pad}`}><b>One step left.</b><p className={s.muted}>The Autopilot tables are not in your database yet. In Supabase open SQL Editor, paste the file <code>supabase/update-4-autopilot.sql</code> from your project and press Run. Then reload this page.</p><p className={s.muted} style={{ fontSize: 12 }}>{setupError.slice(0, 160)}</p></div></>);

  const st = await getSettings(a);
  const waiting = posts.filter((p) => p.status === 'pending').length + leads.filter((l) => l.status === 'new').length + jobs.filter((j) => j.status === 'new').length;
  const link = (t: string) => `/admin/autopilot?tab=${t}`;

  return (
    <>
      <div className={s.head}>
        <div><h1 className={s.h1}>Autopilot</h1><p className={s.muted}>Turns your posts and case studies into ready-to-post content, and finds clients and jobs. Nothing goes out without your say, unless you switch a feature to automatic.</p></div>
        <div className={s.row}>
          <form action={A.generateAction}><button className={s.btn}><Icon name="spark" size={16} />Draft posts now</button></form>
          <form action={A.scanAction}><button className={`${s.btn} ${s.ghost}`}>Find clients and jobs</button></form>
        </div>
      </div>

      <div className={s.row} style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => <Link key={k} href={link(k)} className={`${s.btn} ${tab === k ? '' : s.ghost} ${s.small}`}>{l}{k === 'posts' && posts.filter((p) => p.status === 'pending').length ? ` · ${posts.filter((p) => p.status === 'pending').length}` : ''}{k === 'leads' && leads.filter((l2) => l2.status === 'new').length ? ` · ${leads.filter((l2) => l2.status === 'new').length}` : ''}{k === 'jobs' && jobs.filter((j) => j.status === 'new').length ? ` · ${jobs.filter((j) => j.status === 'new').length}` : ''}</Link>)}
        {waiting > 0 && <span className={s.muted} style={{ alignSelf: 'center' }}>{waiting} waiting for you</span>}
      </div>

      {tab === 'posts' && (
        <div className={s.stack}>
          {posts.filter((p) => !['rejected'].includes(p.status)).length === 0 && <div className={`${s.card} ${s.pad}`}><p className={s.muted}>No posts yet. Press “Draft posts now” and Autopilot will write drafts from your published journal posts and case studies.</p></div>}
          {posts.filter((p) => p.status !== 'rejected').sort((x, y) => (x.status === 'pending' ? -1 : 0) - (y.status === 'pending' ? -1 : 0)).map((p) => {
            const over = p.text.length > (LIMITS[p.platform] || 9999);
            return (
              <div key={p.id} className={`${s.card} ${s.pad}`}>
                <div className={s.row} style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div><b>{p.platform}</b> <span className={s.muted}>· {when(p.scheduled_for)}</span></div><Pill v={p.status} />
                </div>
                <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0', lineHeight: 1.55, fontSize: 14 }}>{p.text}</p>
                {p.art_url && /\.(png|jpe?g|webp)/i.test(p.art_url) && <img src={p.art_url} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />}
                <p className={s.muted} style={{ fontSize: 12 }}>{p.why}{over ? ' Over the platform limit: shorten it before posting.' : ''}{p.error ? ` Error: ${p.error}` : ''}</p>
                <div className={s.row} style={{ flexWrap: 'wrap', gap: 8 }}>
                  {p.status === 'pending' && <form action={A.approvePostAction}><input type="hidden" name="id" value={p.id} /><Btn>Approve</Btn></form>}
                  {['prepared', 'failed'].includes(p.status) && <><CopyButton text={p.text} label="Copy text" /><form action={A.postedAction}><input type="hidden" name="id" value={p.id} /><Btn ghost>I posted it</Btn></form></>}
                  {p.status === 'failed' && <form action={A.approvePostAction}><input type="hidden" name="id" value={p.id} /><Btn ghost>Try again</Btn></form>}
                  {['pending', 'scheduled', 'prepared'].includes(p.status) && <form action={A.rejectPostAction}><input type="hidden" name="id" value={p.id} /><Btn ghost danger>Reject</Btn></form>}
                  {p.external_url && <a className={`${s.btn} ${s.ghost} ${s.small}`} href={p.external_url} target="_blank" rel="noopener"><Icon name="external" size={14} />Open</a>}
                </div>
                {['pending', 'scheduled', 'prepared'].includes(p.status) && (
                  <details className={s.details} style={{ marginTop: 10 }}><summary>Edit text</summary>
                    <form action={A.editPostAction} className={s.stack}><input type="hidden" name="id" value={p.id} /><textarea className={s.input} name="text" defaultValue={p.text} rows={6} /><div><Btn>Save changes</Btn></div></form>
                  </details>
                )}
              </div>
            );
          })}
          {activity.length > 0 && <div className={`${s.card} ${s.pad}`}><b>Recent activity</b>{activity.map((x) => <div key={x.id} className={s.muted} style={{ fontSize: 13, marginTop: 6 }}>{when(x.at)} · {x.text}</div>)}</div>}
        </div>
      )}

      {tab === 'leads' && (
        <div className={s.stack}>
          {leads.length === 0 && <div className={`${s.card} ${s.pad}`}><p className={s.muted}>No clients yet. Briefs from your Services page appear here automatically. Add a feed under Settings to find more.</p></div>}
          {leads.map((l) => {
            const fmt = l.fmt ?? st.pitchFmt, chan = l.chan ?? st.pitchChan;
            return (
              <div key={l.id} className={`${s.card} ${s.pad}`}>
                <div className={s.row} style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div><b>{l.name}</b><div className={s.muted}>{l.kind} · fit {l.fit}% · {l.source}</div></div><Pill v={l.status} />
                </div>
                {l.signal && <p className={s.muted} style={{ fontSize: 13, marginTop: 8 }}>{l.signal}</p>}
                {l.why && <p style={{ fontSize: 13.5, margin: '8px 0' }}><b>Why:</b> {l.why}<br /><b>Approach:</b> {l.approach}</p>}
                {l.msg ? (
                  <form action={A.leadAction} className={s.stack}>
                    <input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value="save" />
                    <label className={s.field}>Message<textarea className={s.input} name="msg" defaultValue={l.msg} rows={5} /></label>
                    <div className={s.grid2}>
                      <label className={s.field}>Pitch format<select className={s.input} name="fmt" defaultValue={fmt}>{FORMATS.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}</select></label>
                      <label className={s.field}>How to reach out<select className={s.input} name="chan" defaultValue={chan}>{CHANNELS.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}</select></label>
                    </div>
                    <p className={s.muted} style={{ fontSize: 12.5 }}>{CHANNELS[chan]?.note}{l.contact ? ` Contact: ${l.contact}.` : ''}</p>
                    <label className={s.field}>Your notes<input className={s.input} name="notes" defaultValue={l.notes || ''} /></label>
                    <div className={s.row} style={{ flexWrap: 'wrap', gap: 8 }}><Btn>Save</Btn><CopyButton text={l.msg} label="Copy message" /></div>
                  </form>
                ) : <p className={s.muted} style={{ fontSize: 13 }}>No message yet.</p>}
                <div className={s.row} style={{ flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  <form action={A.leadAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value="prepare" /><Btn ghost>{l.msg ? 'Redraft approach' : 'Draft approach'}</Btn></form>
                  {l.status === 'new' && l.msg && <form action={A.leadAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value="approve" /><Btn>Approve</Btn></form>}
                  {l.status === 'approved' && <form action={A.leadAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value="sent" /><Btn>I sent it</Btn></form>}
                  {['new', 'approved'].includes(l.status) && <form action={A.leadAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="op" value="skip" /><Btn ghost danger>Skip</Btn></form>}
                  {l.source_url?.startsWith('http') && <a className={`${s.btn} ${s.ghost} ${s.small}`} href={l.source_url} target="_blank" rel="noopener"><Icon name="external" size={14} />Source</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'jobs' && (
        <div className={s.stack}>
          {jobs.length === 0 && <div className={`${s.card} ${s.pad}`}><p className={s.muted}>No jobs yet. Add a public jobs feed under Settings, then press “Find clients and jobs”.</p></div>}
          {jobs.map((j) => (
            <div key={j.id} className={`${s.card} ${s.pad}`}>
              <div className={s.row} style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div><b>{j.title}</b><div className={s.muted}>{j.company || 'Company not listed'} · match {j.match}% · {j.source}</div></div><Pill v={j.status} />
              </div>
              {j.cover ? (
                <form action={A.jobAction} className={s.stack}>
                  <input type="hidden" name="id" value={j.id} /><input type="hidden" name="op" value="save" />
                  <label className={s.field}>Subject<input className={s.input} name="subject" defaultValue={j.subject} /></label>
                  <label className={s.field}>Cover note<textarea className={s.input} name="cover" defaultValue={j.cover} rows={8} /></label>
                  <div className={s.row} style={{ flexWrap: 'wrap', gap: 8 }}><Btn>Save</Btn><CopyButton text={j.cover} label="Copy note" /></div>
                </form>
              ) : <p className={s.muted} style={{ fontSize: 13, marginTop: 8 }}>{String(j.description || '').slice(0, 220)}</p>}
              <div className={s.row} style={{ flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <form action={A.jobAction}><input type="hidden" name="id" value={j.id} /><input type="hidden" name="op" value="prepare" /><Btn ghost>{j.cover ? 'Redraft cover note' : 'Draft cover note'}</Btn></form>
                {j.status === 'new' && j.cover && <form action={A.jobAction}><input type="hidden" name="id" value={j.id} /><input type="hidden" name="op" value="approve" /><Btn>Approve</Btn></form>}
                {j.status === 'approved' && <form action={A.jobAction}><input type="hidden" name="id" value={j.id} /><input type="hidden" name="op" value="applied" /><Btn>I applied</Btn></form>}
                {['new', 'approved'].includes(j.status) && <form action={A.jobAction}><input type="hidden" name="id" value={j.id} /><input type="hidden" name="op" value="skip" /><Btn ghost danger>Skip</Btn></form>}
                {j.source_url && <a className={`${s.btn} ${s.ghost} ${s.small}`} href={j.source_url} target="_blank" rel="noopener"><Icon name="external" size={14} />Open listing</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && <Settings st={st} sources={sources} a={a} />}
    </>
  );
}

async function Settings({ st, sources, a }: { st: Awaited<ReturnType<typeof getSettings>>; sources: Row[]; a: { token: string } }) {
  const items = await loadItems(a).catch(() => []);
  const ready = (ok: boolean) => <span className={s.pill} style={{ background: ok ? '#15803d1f' : '#6b72801f', color: ok ? '#15803d' : '#4b5563' }}>{ok ? 'Connected' : 'Not connected'}</span>;
  return (
    <div className={s.stack}>
      <form action={A.saveSettingsAction} className={s.stack}>
        <div className={`${s.card} ${s.pad} ${s.stack}`}>
          <h2 className={s.h2}>Posting</h2>
          <div className={s.grid2}>
            <label className={s.field}>Tone<select className={s.input} name="tone" defaultValue={st.tone}>{TONES.map((t, i) => <option key={t} value={i}>{t}</option>)}</select></label>
            <label className={s.field}>Posts per week<input className={s.input} type="number" min={1} max={7} name="perWeek" defaultValue={st.perWeek} /></label>
          </div>
          <div className={s.grid2}>
            <label className={s.field}>Post time (Abuja)<input className={s.input} type="time" name="postTime" defaultValue={st.postTime} /></label>
            <label className={s.field}>Words to avoid<input className={s.input} name="avoid" defaultValue={st.avoid} /></label>
          </div>
          <b style={{ fontSize: 13 }}>Days</b>
          <div className={s.row} style={{ flexWrap: 'wrap', gap: 14 }}>{DAYS.map((d) => <label key={d} className={s.check}><input type="checkbox" name={'day_' + d} defaultChecked={st.days[d]} />{d}</label>)}</div>
          <b style={{ fontSize: 13 }}>Platforms</b>
          <div className={s.row} style={{ flexWrap: 'wrap', gap: 14 }}>{PLATFORMS.map((p) => <label key={p} className={s.check}><input type="checkbox" name={'plat_' + p} defaultChecked={st.platforms[p]} />{p}</label>)}</div>
        </div>

        <div className={`${s.card} ${s.pad} ${s.stack}`}>
          <h2 className={s.h2}>How much Autopilot may do</h2>
          <p className={s.muted} style={{ fontSize: 13 }}>Off does nothing. Draft only writes it and waits. Ask first posts only what you approve. Automatic posts on schedule where an official connection exists.</p>
          <div className={s.grid3}>
            <label className={s.field}>Posting<select className={s.input} name="a_publish" defaultValue={st.autonomy.publish}>{LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}</select></label>
            <label className={s.field}>Reaching out<select className={s.input} name="a_outreach" defaultValue={st.autonomy.outreach}>{LEVELS.slice(0, 3).map((l, i) => <option key={l} value={i}>{l}</option>)}</select></label>
            <label className={s.field}>Job applications<select className={s.input} name="a_jobs" defaultValue={st.autonomy.jobs}>{LEVELS.slice(0, 3).map((l, i) => <option key={l} value={i}>{l}</option>)}</select></label>
          </div>
          <div className={s.grid2}>
            <label className={s.field}>Default pitch format<select className={s.input} name="pitchFmt" defaultValue={st.pitchFmt}>{FORMATS.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}</select></label>
            <label className={s.field}>Default way to reach out<select className={s.input} name="pitchChan" defaultValue={st.pitchChan}>{CHANNELS.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}</select></label>
          </div>
        </div>

        <div className={`${s.card} ${s.pad} ${s.stack}`}>
          <h2 className={s.h2}>Jobs</h2>
          <label className={s.field}>Skills to match (comma separated)<textarea className={s.input} name="skills" rows={3} defaultValue={st.skills.join(', ')} /></label>
          <div className={s.grid2}>
            <label className={s.field}>Minimum match %<input className={s.input} type="number" name="minMatch" min={30} max={95} defaultValue={st.minMatch} /></label>
            <label className={s.field}>Sign-off<input className={s.input} name="signature" defaultValue={st.signature} /></label>
          </div>
        </div>

        <div className={`${s.card} ${s.pad} ${s.stack}`}>
          <h2 className={s.h2}>What may be shared</h2>
          <p className={s.muted} style={{ fontSize: 13 }}>Share uses the title, text and image. Blur leaves the image out. Never skips it completely. Use Never for client work under NDA.</p>
          {items.length === 0 && <p className={s.muted}>Nothing published yet.</p>}
          {items.map((i) => <label key={i.key} className={s.field} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><span style={{ flex: 1, minWidth: 0 }}>{i.title}<span className={s.muted}> · {i.kind === 'work' ? 'case study' : 'journal'}</span></span><select className={s.input} style={{ width: 120 }} name={'priv_' + i.key} defaultValue={st.privacy[i.key] || 'share'}><option value="share">Share</option><option value="blur">Blur</option><option value="never">Never</option></select></label>)}
        </div>
        <div><button className={s.btn}>Save settings</button></div>
      </form>

      <div className={`${s.card} ${s.pad} ${s.stack}`}>
        <h2 className={s.h2}>Where Autopilot looks for clients and jobs</h2>
        <p className={s.muted} style={{ fontSize: 13 }}>Public RSS or Atom feeds only (job boards, company blogs, hiring posts that publish a feed). No scraping, no logins. Your own Services briefs come in automatically.</p>
        {sources.map((x) => <div key={x.id} className={s.row} style={{ justifyContent: 'space-between', gap: 10 }}><span style={{ minWidth: 0, wordBreak: 'break-all', fontSize: 13 }}><b>{x.kind === 'jobs' ? 'Jobs' : 'Clients'}</b> · {x.label || x.url}</span><form action={A.removeSourceAction}><input type="hidden" name="id" value={x.id} /><Btn ghost danger>Remove</Btn></form></div>)}
        <form action={A.addSourceAction} className={s.stack}>
          <div className={s.grid3}>
            <label className={s.field}>Type<select className={s.input} name="kind"><option value="jobs">Jobs</option><option value="leads">Clients</option></select></label>
            <label className={s.field}>Name<input className={s.input} name="label" placeholder="e.g. Remote design jobs" /></label>
            <label className={s.field}>Feed link<input className={s.input} name="url" type="url" placeholder="https://…" required /></label>
          </div>
          <div><Btn ghost>Add source</Btn></div>
        </form>
      </div>

      <div className={`${s.card} ${s.pad}`}>
        <h2 className={s.h2}>Connections</h2>
        <p className={s.muted} style={{ fontSize: 13 }}>These are set once as secret settings on your host, never in the page. Where one is missing, Autopilot still writes the post and you copy it.</p>
        <div className={s.stack} style={{ gap: 8 }}>
          <div className={s.row} style={{ justifyContent: 'space-between' }}><span>Scheduled runs (3 times a day)</span>{ready(!!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.CRON_SECRET)}</div>
          <div className={s.row} style={{ justifyContent: 'space-between' }}><span>AI writing ({aiProvider()})</span>{ready(aiProvider() !== 'none')}</div>
          {(['LinkedIn', 'X', 'Instagram'] as const).map((p) => <div key={p} className={s.row} style={{ justifyContent: 'space-between' }}><span>{p} posting</span>{ready(canPublish(p))}</div>)}
          <div className={s.row} style={{ justifyContent: 'space-between' }}><span>TikTok, Behance, Dribbble</span><span className={s.muted}>Copy and post yourself</span></div>
        </div>
      </div>
    </div>
  );
}
