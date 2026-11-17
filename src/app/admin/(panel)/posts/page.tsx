import Link from 'next/link';
import { requireSessionForPage } from '@/lib/admin/page';
import { listAllPosts } from '@/lib/admin/data';
import { CATS, fmtDate } from '@/lib/blog';
import s from '../../admin.module.css';

export default async function PostsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const session = await requireSessionForPage();
  const [posts, q] = await Promise.all([listAllPosts(session), searchParams]);
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Journal posts</h1><p className={s.muted}>{posts.length} posts. Drafts are only visible here.</p></div>
        <Link href="/admin/posts/new" className={s.btn}>+ New post</Link></div>
      {q.deleted && <p className={`${s.msg} ${s.ok}`} style={{ marginBottom: 14 }}>Post deleted.</p>}
      <div className={s.card} style={{ overflowX: 'auto' }}>
        <table className={s.table}>
          <thead><tr><th></th><th>Title</th><th>Topic</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td style={{ width: 80 }}>{p.cover ? <img src={p.cover} alt="" className={s.thumb} /> : <span className={s.thumb} />}</td>
                <td><Link href={`/admin/posts/${p.slug}`} className={s.rowLink}>{p.title}</Link>{p.featured && <span className={s.muted}> · ★ featured</span>}</td>
                <td className={s.muted}>{CATS[p.category]?.label}</td>
                <td className={s.muted} style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.publishedAt)}</td>
                <td><span className={`${s.pill} ${p.status === 'published' ? s.pub : s.draft}`}>{p.status === 'published' ? 'Live' : 'Draft'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
