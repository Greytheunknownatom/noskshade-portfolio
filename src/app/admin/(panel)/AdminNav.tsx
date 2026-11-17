'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from '../admin.module.css';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: '◎' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: '✉' },
  { href: '/admin/posts', label: 'Journal posts', icon: '✎' },
  { href: '/admin/services', label: 'Services & prices', icon: '₦' },
];
const SOON = [{ label: 'Case studies', icon: '◆' }, { label: 'Homepage & links', icon: '⌂' }];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav style={{ display: 'contents' }}>
      {LINKS.map((l) => {
        const on = l.href === '/admin' ? path === '/admin' : path.startsWith(l.href);
        return <Link key={l.href} href={l.href} className={`${s.navLink} ${on ? s.navActive : ''}`}><span aria-hidden="true">{l.icon}</span>{l.label}</Link>;
      })}
      {SOON.map((l) => <span key={l.label} className={`${s.navLink} ${s.navSoon}`}><span aria-hidden="true">{l.icon}</span>{l.label}<small>Soon</small></span>)}
    </nav>
  );
}
