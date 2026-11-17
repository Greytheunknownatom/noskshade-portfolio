import type { Metadata } from 'next';
import LoginForm from './LoginForm';
import s from '../admin.module.css';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className={s.login}>
      <div className={`${s.card} ${s.loginCard}`}>
        <div className={s.brand} style={{ padding: 0 }}><span className={s.brandMark}>PN</span>Noskshade admin</div>
        <p className={s.muted} style={{ margin: '14px 0 22px' }}>Sign in to edit your site.</p>
        <LoginForm />
      </div>
    </div>
  );
}
