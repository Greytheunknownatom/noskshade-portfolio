import Link from 'next/link';
import { requireSessionForPage } from '@/lib/admin/page';
import { listAllPosts, listEnquiries, getVisitStats } from '@/lib/admin/data';
import Icon from './Icon';
import s from '../admin.module.css';

export default async function Overview() {
  const session = await requireSessionForPage();
  const [posts, enquiries, visits] = await Promise.all([listAllPosts(session), listEnquiries(session), getVisitStats(session)]);
  const fresh = enquiries.filter((e) => e.status === 'new');
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Welcome back</h1><p className={s.muted}>Here’s what’s happening on your site.</p></div>
        <div className={s.row}><Link href="/admin/cases/new" className={`${s.btn} ${s.ghost}`}><Icon name="layers" size={15} />New case study</Link><Link href="/admin/posts/new" className={s.btn}><Icon name="plus" size={15} />New post</Link></div></div>
      <div className={s.stats}>
        <Link href="/admin/visits" className={`${s.card} ${s.pad} ${s.stat}`} style={{ textDecoration: 'none', color: 'inherit' }}><span className={`${s.statIcon} ${s.c1}`}><Icon name="eye" /></span><b>{visits ? visits.week : '—'}</b><span>Visits this week</span></Link>
        <Link href="/admin/enquiries" className={`${s.card} ${s.pad} ${s.stat}`} style={{ textDecoration: 'none', color: 'inherit' }}><span className={`${s.statIcon} ${s.c2}`}><Icon name="mail" /></span><b>{fresh.length}</b><span>New enquiries</span></Link>
        <Link href="/admin/posts" className={`${s.card} ${s.pad} ${s.stat}`} style={{ textDecoration: 'none', color: 'inherit' }}><span className={`${s.statIcon} ${s.c3}`}><Icon name="pen" /></span><b>{posts.filter((p) => p.status === 'published').length}</b><span>Published posts</span></Link>
        <Link href="/admin/enquiries" className={`${s.card} ${s.pad} ${s.stat}`} style={{ textDecoration: 'none', color: 'inherit' }}><span className={`${s.statIcon} ${s.c4}`}><Icon name="users" /></span><b>{enquiries.length}</b><span>All enquiries</span></Link>
      </div>
      <div className={`${s.card} ${s.pad}`}>
        <div className={s.head} style={{ marginBottom: 8 }}><h2 className={s.h2} style={{ margin: 0 }}>Latest enquiries</h2><Link href="/admin/enquiries" className={`${s.btn} ${s.ghost} ${s.small}`}>See all</Link></div>
        {enquiries.length === 0 ? <p className={s.muted}>No enquiries yet. Briefs sent from /services appear here.</p> : (
          <table className={s.table}><tbody>
            {enquiries.slice(0, 5).map((e) => (
              <tr key={e.id}><td><b>{e.data.name}</b><div className={s.muted}>{e.data.email}</div></td>
                <td>{e.data.kind === 'consultation' ? 'Consultation' : 'Project'}</td>
                <td className={s.muted}>{new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                <td><span className={`${s.pill} ${e.status === 'new' ? s.draft : s.pub}`}>{e.status}</span></td></tr>
            ))}
          </tbody></table>
        )}
      </div>
    </>
  );
}
