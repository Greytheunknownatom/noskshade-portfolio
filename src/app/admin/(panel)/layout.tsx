import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession, canRefresh, supabaseOn } from '@/lib/admin/auth';
import { logoutAction } from '../actions';
import AdminNav from './AdminNav';
import s from '../admin.module.css';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

// LEARN (lesson 6): every page inside (panel) passes through this check first.
// No valid session → back to the login page (or to /admin/refresh if the token just expired).
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect((await canRefresh()) ? '/admin/refresh' : '/admin/login');
  return (
    <div className={s.shell}>
      <aside className={s.side}>
        <div className={s.brand}><span className={s.brandMark}>PN</span>Noskshade</div>
        <AdminNav />
        <div className={s.sideFoot}>
          <span>{session.email}</span>
          <span>{supabaseOn ? 'Connected to Supabase' : 'Local mode (files in /content)'}</span>
          <a href="/" target="_blank" style={{ color: '#0369a1', fontWeight: 700 }}>View site ↗</a>
          <form action={logoutAction}><button className={`${s.btn} ${s.ghost} ${s.small}`}>Sign out</button></form>
        </div>
      </aside>
      <main className={s.main}>{children}</main>
    </div>
  );
}
