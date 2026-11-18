import Link from 'next/link';
import type { CaseStudy, CaseFlowItem } from '@/lib/content/types';
import ProjectCta from './ProjectCta';

// LEARN (lesson 8): pieces for case studies edited in the admin.
// CaseFlow is the "design flow" gallery added under any case study; CustomCase is the standard
// template for case studies created in the admin; MoreWork lists those on /work.

const wrap: React.CSSProperties = { maxWidth: 1160, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' };
const eyebrow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0369a1' };
const dot = <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0ea5e9' }} />;
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 24, boxShadow: '0 10px 30px rgba(12,29,61,0.06)' };

export function CaseFlow({ flow, title = 'The design flow' }: { flow?: CaseFlowItem[]; title?: string }) {
  if (!flow?.length) return null;
  return (
    <section style={{ ...wrap, padding: '56px clamp(16px, 4vw, 40px)' }} aria-labelledby="flow-h">
      <div style={eyebrow}>{dot}Step by step</div>
      <h2 id="flow-h" style={{ margin: '10px 0 0', fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#0c1d3d' }}>{title}</h2>
      <div style={{ marginTop: 26, display: 'flex', gap: 22, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 14 }}>
        {flow.map((f, i) => (
          <figure key={i} style={{ margin: 0, flex: '0 0 auto', width: 'min(300px, 78vw)', scrollSnapAlign: 'start' }}>
            <div style={{ ...glass, padding: 12 }}><img src={f.img} alt={f.t} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', borderRadius: 14 }} /></div>
            <figcaption style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0c1d3d' }}><span style={{ color: '#0284c7', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>{f.t}</div>
              {f.b && <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.6, color: '#475569' }}>{f.b}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

const BRIEF: [keyof CaseStudy['brief'], string, string][] = [
  ['problem', 'The problem', '#f97316'], ['did', 'What I did', '#0ea5e9'], ['result', 'The result', '#22c55e'],
  ['trade', 'The trade-off', '#8b5cf6'], ['next', 'What’s next', '#ec4899'],
];

export function CustomCase({ c }: { c: CaseStudy }) {
  return (
    <article style={{ paddingTop: 120, paddingBottom: 80, background: 'radial-gradient(ellipse 70% 50% at 80% 0%, rgba(14,165,233,0.16), transparent 60%), radial-gradient(ellipse 50% 40% at 0% 20%, rgba(99,102,241,0.10), transparent 60%)' }}>
      <header style={wrap}>
        <div style={eyebrow}>{dot}Case study{c.kind ? ` · ${c.kind}` : ''}</div>
        <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(36px, 5.4vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#0c1d3d', textWrap: 'balance' }}>{c.title}</h1>
        {c.card.intro && <p style={{ margin: '18px 0 0', maxWidth: 680, fontSize: 18, lineHeight: 1.65, color: '#334155' }}>{c.card.intro}</p>}
        {c.card.cover && <div style={{ ...glass, marginTop: 34, padding: 12 }}><img src={c.card.cover} alt={c.title} style={{ display: 'block', width: '100%', borderRadius: 16 }} /></div>}
      </header>
      <div style={{ ...wrap, marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {BRIEF.filter(([k]) => c.brief[k]).map(([k, label, col]) => (
          <div key={k} style={{ ...glass, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: col }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />{label}</div>
            <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.65, color: '#1f2937' }}>{c.brief[k]}</p>
          </div>
        ))}
      </div>
      {c.sections.map((s, i) => (
        <section key={i} style={{ ...wrap, marginTop: 56 }}>
          {s.h && <h2 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#0c1d3d' }}>{s.h}</h2>}
          {s.p && s.p.split(/\n{2,}/).map((para, j) => <p key={j} style={{ margin: '14px 0 0', maxWidth: 720, fontSize: 16.5, lineHeight: 1.75, color: '#334155' }}>{para}</p>)}
          {s.img && <figure style={{ margin: '24px 0 0' }}><div style={{ ...glass, padding: 12 }}><img src={s.img} alt={s.cap || s.h} loading="lazy" style={{ display: 'block', width: '100%', borderRadius: 14 }} /></div>{s.cap && <figcaption style={{ marginTop: 10, fontSize: 13, color: '#64748b' }}>{s.cap}</figcaption>}</figure>}
        </section>
      ))}
      <CaseFlow flow={c.card.flow} />
      <div style={wrap}><ProjectCta /></div>
    </article>
  );
}

export function MoreWork({ cases }: { cases: CaseStudy[] }) {
  const list = cases.filter((c) => c.card.custom && !c.card.hidden);
  if (!list.length) return null;
  return (
    <section style={{ ...wrap, paddingBottom: 80 }} aria-labelledby="more-h">
      <div style={eyebrow}>{dot}New</div>
      <h2 id="more-h" style={{ margin: '10px 0 22px', fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#0c1d3d' }}>More case studies</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {list.map((c) => (
          <Link key={c.slug} href={`/work/${c.slug}`} style={{ ...glass, overflow: 'hidden', textDecoration: 'none', color: '#0c1d3d' }}>
            {c.card.cover && <img src={c.card.cover} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />}
            <div style={{ padding: '16px 18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>{c.kind}</div>
              <div style={{ marginTop: 6, fontSize: 19, fontWeight: 800 }}>{c.title}</div>
              {c.card.intro && <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.6, color: '#475569' }}>{c.card.intro.slice(0, 140)}{c.card.intro.length > 140 ? '…' : ''}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
