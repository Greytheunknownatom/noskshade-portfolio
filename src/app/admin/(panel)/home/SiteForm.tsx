'use client';
import { useActionState } from 'react';
import { saveSiteAction, type ActionResult } from '../../actions';
import type { SiteHome, SiteLinks } from '@/lib/content/types';
import Icon from '../Icon';
import s from '../../admin.module.css';

// Empty fields keep what the site was designed with.
const LINKS: [keyof SiteLinks, string, string][] = [
  ['email', 'Email', 'you@example.com'], ['whatsapp', 'WhatsApp number', '+234 902 366 1518'], ['linkedin', 'LinkedIn', 'https://linkedin.com/in/…'],
  ['instagram', 'Instagram', 'https://instagram.com/…'], ['tiktok', 'TikTok', 'https://tiktok.com/@…'], ['behance', 'Behance', 'https://behance.net/…'],
  ['dribbble', 'Dribbble', 'https://dribbble.com/…'], ['x', 'X (Twitter)', 'https://x.com/…'], ['cv', 'CV (PDF link)', '/assets/philip-nosike-cv.pdf'],
];

export default function SiteForm({ links, home }: { links: SiteLinks; home: SiteHome }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveSiteAction, null);
  return (
    <>
      <div className={s.head}><div><h1 className={s.h1}>Homepage & links</h1><p className={s.muted}>Change your homepage intro and the links used across the site. Leave a field empty to keep the designed version.</p></div></div>
      <form action={action} className={s.form}>
        <div className={s.stack}>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <h2 className={s.h2} style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="home" />Homepage</h2>
            <label className={s.field}>Big heading<input className={`${s.input} ${s.titleInput}`} name="title" defaultValue={home.title} placeholder="Philip Nosike" /></label>
            <label className={s.field}>Intro under the heading<textarea className={s.input} name="intro" defaultValue={home.intro} placeholder="Leave empty to keep the designed intro" /></label>
          </div>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <h2 className={s.h2} style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="link" />Contact & social links</h2>
            <p className={s.muted} style={{ margin: 0 }}>Every button and icon on the site that points to one of these uses the address you set here.</p>
            <div className={s.grid2}>{LINKS.map(([k, label, ph]) => <label key={k} className={s.field}>{label}<input className={s.input} name={k} defaultValue={links[k]} placeholder={ph} /></label>)}</div>
          </div>
        </div>
        <aside className={`${s.stack} ${s.sticky}`}>
          <div className={`${s.card} ${s.pad} ${s.stack}`}>
            <button className={s.btn} disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
            {state?.message && <p className={`${s.msg} ${state.ok ? s.ok : s.err}`} role="status">{state.message}</p>}
            <a href="/" target="_blank" className={s.sideLink}><Icon name="external" size={15} />Open homepage</a>
          </div>
        </aside>
      </form>
    </>
  );
}
