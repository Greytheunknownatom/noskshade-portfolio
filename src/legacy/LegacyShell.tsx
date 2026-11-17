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

export default function LegacyShell({ page, children }: { page: string; children: (v: Vals) => React.ReactNode }) {
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

  const v = vm.renderVals();
  return (
    <>
      <Chrome v={v} />
      {children(v)}
      <Overlays v={v} />
    </>
  );
}
