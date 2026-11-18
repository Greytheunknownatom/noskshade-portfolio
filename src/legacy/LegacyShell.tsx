'use client';
// LEARN (lesson 7): runs the original site's logic (vm.js) for one page. It creates the logic
// object once, re-renders when its state changes, and starts/stops its effects (reveal-on-scroll,
// parallax, typewriter, lightbox) when the page mounts and unmounts.
import { useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Component from './vm';
import Chrome from './sections/Chrome';
import Overlays from './sections/Overlays';
import { pathFor } from './routes';
import './hover.css';

type Vals = Record<string, any>;

// Admin overrides: { card: { title, intro }, brief: { problem, did, result, trade, next }, links: { linkedin, … } }
const LINK_RULES: [string, (h: string) => boolean, (v: string) => string][] = [
  ['linkedin', (h) => h.includes('linkedin.com'), (v) => v],
  ['instagram', (h) => h.includes('instagram.com'), (v) => v],
  ['tiktok', (h) => h.includes('tiktok.com'), (v) => v],
  ['behance', (h) => h.includes('behance.net'), (v) => v],
  ['dribbble', (h) => h.includes('dribbble.com'), (v) => v],
  ['x', (h) => /\/\/(www\.)?(x|twitter)\.com/.test(h), (v) => v],
  ['whatsapp', (h) => h.includes('wa.me/'), (v) => `https://wa.me/${v.replace(/[^\d]/g, '')}`],
  ['email', (h) => h.startsWith('mailto:'), (v) => `mailto:${v}`],
  ['cv', (h) => /cv\.pdf$/i.test(h), (v) => v],
];

export default function LegacyShell({ page, children, ov }: { page: string; children: (v: Vals) => React.ReactNode; ov?: any }) {
  const router = useRouter();
  const vmRef = useRef<any>(null);
  if (!vmRef.current) {
    const vm = new (Component as any)();
    vm.state = { ...vm.state, page };
    vm.navigate = (p: string) => router.push(pathFor(p));
    vmRef.current = vm;
  }
  const vm = vmRef.current;
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => vm.subscribe(rerender), [vm]);
  useEffect(() => {
    // Links shared from the old site look like /#case-heatbud or /#post-…: send them to the new address.
    const old = window.location.hash.slice(1);
    if (old && /^(case-|post-|work$|about$|contact$|blog$)/.test(old)) { router.replace(pathFor(old)); return; }
    window.scrollTo(0, 0);
    vm.componentDidMount?.();
    return () => vm.componentWillUnmount?.();
  }, [vm, router]);
  useEffect(() => { vm.componentDidUpdate?.(); });
  useEffect(() => {
    const links = ov?.links;
    if (!links) return;
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      const h = a.getAttribute('href') || '';
      for (const [k, test, make] of LINK_RULES) if (links[k] && test(h)) { a.setAttribute('href', make(links[k])); break; }
    });
  });

  const v = vm.renderVals();
  if (ov) {
    const brief = Object.fromEntries(Object.entries(ov.brief || {}).filter(([, x]) => typeof x === 'string' && x.trim()));
    if (v.cb && Object.keys(brief).length) v.cb = { ...v.cb, ...brief, hasTrade: v.cb.hasTrade || !!brief.trade, hasNext: v.cb.hasNext || !!brief.next, hasEnd: v.cb.hasEnd || !!brief.trade || !!brief.next };
    v.ov = { title: ov.card?.title?.trim() || '', intro: ov.card?.intro?.trim() || '' };
  } else v.ov = {};
  return (
    <>
      <Chrome v={v} />
      {children(v)}
      <Overlays v={v} />
    </>
  );
}
