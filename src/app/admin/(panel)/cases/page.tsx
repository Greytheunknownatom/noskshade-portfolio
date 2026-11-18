import Link from 'next/link';
import meta from '@/legacy/cases-meta.json';
import { requireSessionForPage } from '@/lib/admin/page';
import { listCasesAdmin } from '@/lib/admin/data';
import Icon from '../Icon';
import s from '../../admin.module.css';

type Meta = { title: string; kind: string; cover: string };

export default async function Cases({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const session = await requireSessionForPage();
  const rows = await listCasesAdmin(session);
  const { deleted } = await searchParams;
  const builtIn = Object.entries(meta as Record<string, Meta>).map(([slug, m]) => {
    const r = rows.find((x) => x.slug === slug);
    return { slug, title: r?.title || m.title, kind: m.kind, cover: r?.card.cover || m.cover, edited: !!r, custom: false, status: 'published' };
  });
  const custom = rows.filter((r) => r.card.custom).map((r) => ({ slug: r.slug, title: r.title, kind: r.kind, cover: r.card.cover || '', edited: true, custom: true, status: r.status }));
  const Card = ({ c }: { c: (typeof builtIn)[number] }) => (
    <Link href={`/admin/cases/${c.slug}`} className={`${s.card} ${s.caseCard}`}>
      {c.cover ? <img src={c.cover} alt="" loading="lazy" /> : <span className={s.noimg} />}
      <div><b>{c.title}</b><div className={s.muted} style={{ fontSize: 12.5 }}>{c.kind}</div>
        <div className={s.tagLine}>
          {c.custom ? <span className={`${s.pill} ${c.status === 'published' ? s.pub : s.draft}`}>{c.status === 'published' ? 'Live' : 'Draft'}</span> : <span className={s.chip}>Designed page</span>}
          {c.edited && !c.custom && <span className={`${s.pill} ${s.pub}`}>Edited</span>}
        </div></div>
    </Link>
  );
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Case studies</h1><p className={s.muted}>Edit the text, cover and design flow of any case study, or add a new one.</p></div>
        <Link href="/admin/cases/new" className={s.btn}><Icon name="plus" size={16} />New case study</Link></div>
      {deleted && <p className={`${s.msg} ${s.ok}`} style={{ marginBottom: 16 }}>Case study deleted.</p>}
      {custom.length > 0 && <><h2 className={s.h2}>Your new case studies</h2><div className={s.caseGrid} style={{ marginBottom: 28 }}>{custom.map((c) => <Card key={c.slug} c={c} />)}</div></>}
      <h2 className={s.h2}>Designed case studies</h2>
      <div className={s.caseGrid}>{builtIn.map((c) => <Card key={c.slug} c={c} />)}</div>
    </>
  );
}
