import { requireSessionForPage } from '@/lib/admin/page';
import { getVisitStats } from '@/lib/admin/data';
import Icon from '../Icon';
import s from '../../admin.module.css';

// LEARN (lesson 9): the numbers come from visit_stats() inside Supabase, worked out over the last 30 days.
export const dynamic = 'force-dynamic';

const PAGE_NAMES: Record<string, string> = { '/': 'Homepage', '/work': 'Work', '/blog': 'Journal', '/services': 'Services', '/about': 'About', '/contact': 'Contact' };
const nice = (p: string) => PAGE_NAMES[p] ?? p.replace(/^\/(work|blog)\//, (_, k) => (k === 'work' ? 'Case: ' : 'Post: ')).replace(/-/g, ' ');

function List({ title, icon, rows }: { title: string; icon: string; rows: { label: string; n: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className={`${s.card} ${s.pad}`}>
      <h2 className={s.h2} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name={icon} />{title}</h2>
      {rows.length === 0 ? <p className={s.muted}>No data yet.</p> : (
        <ul className={s.blist}>{rows.map((r) => <li key={r.label}><span title={r.label}>{r.label}</span><b>{r.n}</b><i><em style={{ width: `${(r.n / max) * 100}%` }} /></i></li>)}</ul>
      )}
    </div>
  );
}

export default async function Visits() {
  const session = await requireSessionForPage();
  const v = await getVisitStats(session);
  if (!v) return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Visits</h1><p className={s.muted}>Who’s looking at your site.</p></div></div>
      <div className={`${s.card} ${s.pad} ${s.empty}`}><p><b>Visits aren’t switched on yet.</b></p><p className={s.muted}>Run the file <code>supabase/update-2.sql</code> once in Supabase → SQL Editor. Visits start counting straight after.</p></div>
    </>
  );
  // Fill in days with no visits so the chart shows all 30 days.
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10); return { day: d, n: v.daily.find((x) => x.day === d)?.n ?? 0 }; });
  const max = Math.max(1, ...days.map((d) => d.n));
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Visits</h1><p className={s.muted}>Page views on your site over the last 30 days. Admin pages aren’t counted.</p></div></div>
      <div className={s.stats}>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><span className={`${s.statIcon} ${s.c1}`}><Icon name="eye" /></span><b>{v.today}</b><span>Views today</span></div>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><span className={`${s.statIcon} ${s.c2}`}><Icon name="chart" /></span><b>{v.week}</b><span>Last 7 days</span></div>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><span className={`${s.statIcon} ${s.c3}`}><Icon name="overview" /></span><b>{v.month}</b><span>Last 30 days</span></div>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><span className={`${s.statIcon} ${s.c4}`}><Icon name="users" /></span><b>{v.visitors}</b><span>Visitors (30 days)</span></div>
      </div>
      <div className={`${s.card} ${s.pad}`}>
        <h2 className={s.h2}>Views per day</h2>
        <div className={s.bars} role="img" aria-label="Views per day for the last 30 days">
          {days.map((d) => <div key={d.day} style={{ height: `${Math.max(2, (d.n / max) * 100)}%`, opacity: d.n ? 1 : 0.25 }}><span>{fmt(d.day)}: {d.n}</span></div>)}
        </div>
        <div className={s.axis}><span>{fmt(days[0].day)}</span><span>{fmt(days[14].day)}</span><span>Today</span></div>
      </div>
      <div className={s.grid2c}>
        <List title="Top pages" icon="pen" rows={v.pages.map((p) => ({ label: nice(p.path), n: p.n }))} />
        <List title="Where they came from" icon="link" rows={v.refs.map((r) => ({ label: r.ref, n: r.n }))} />
        <List title="Countries" icon="globe" rows={v.countries.map((c) => ({ label: c.country, n: c.n }))} />
        <List title="Devices" icon="phone" rows={v.devices.map((d) => ({ label: d.device, n: d.n }))} />
      </div>
    </>
  );
}
