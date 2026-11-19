'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import s from '../admin.module.css';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: 'overview' },
  { href: '/admin/visits', label: 'Visits', icon: 'chart' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: 'mail' },
  { href: '/admin/cases', label: 'Case studies', icon: 'layers' },
  { href: '/admin/posts', label: 'Journal posts', icon: 'pen' },
  { href: '/admin/autopilot', label: 'Autopilot', icon: 'spark' },
  { href: '/admin/home', label: 'Homepage & links', icon: 'home' },
  { href: '/admin/services', label: 'Services & prices', icon: 'tag' },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className={s.nav}>
      {LINKS.map((l) => {
        const on = l.href === '/admin' ? path === '/admin' : path.startsWith(l.href);
        return <Link key={l.href} href={l.href} className={`${s.navLink} ${on ? s.navActive : ''}`} aria-current={on ? 'page' : undefined}><Icon name={l.icon} />{l.label}</Link>;
      })}
    </nav>
  );
}
