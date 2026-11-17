import Link from 'next/link';
import { requireSessionForPage } from '@/lib/admin/page';
import { listAllPosts, listEnquiries } from '@/lib/admin/data';
import s from '../admin.module.css';

export default async function Overview() {
  const session = await requireSessionForPage();
  const [posts, enquiries] = await Promise.all([listAllPosts(session), listEnquiries(session)]);
  const fresh = enquiries.filter((e) => e.status === 'new');
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Welcome back</h1><p className={s.muted}>Here’s what’s happening on your site.</p></div>
        <Link href="/admin/posts/new" className={s.btn}>+ New post</Link></div>
      <div className={s.stats}>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><b>{fresh.length}</b><span>New enquiries</span></div>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><b>{enquiries.length}</b><span>All enquiries</span></div>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><b>{posts.filter((p) => p.status === 'published').length}</b><span>Published posts</span></div>
        <div className={`${s.card} ${s.pad} ${s.stat}`}><b>{posts.filter((p) => p.status === 'draft').length}</b><span>Drafts</span></div>
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
