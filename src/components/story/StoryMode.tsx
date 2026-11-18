'use client';
// LEARN (lesson 11): the Story mode button and the full-screen hall.
// Nothing heavy loads with the page: the hall code and three.js are fetched only when the button is pressed,
// and weak phones (or anyone who has turned off motion) get the light version instead of 3D.
import { useEffect, useRef, useState } from 'react';
import type { Exhibit } from './exhibits';
import './story.css';

export default function StoryMode({ exhibits, label = 'Story mode' }: { exhibits: Exhibit[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !root.current) return;
    const el = root.current;
    let cleanup: (() => void) | undefined;
    let closeStory: (() => void) | undefined;
    let cancelled = false;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.innerHTML = '<div class="gload"><i></i>Opening the gallery…</div>';
    (async () => {
      const hall = await import('./hall.js');
      if (cancelled) return;
      const onPlay = (i: number) => { closeStory?.(); closeStory = hall.playStory(el, hall.storyFor(exhibits[i]), () => (closeStory = undefined)); };
      const onClose = () => setOpen(false);
      try {
        if (hall.weakDevice()) throw new Error('light');
        const THREE = await import('three');
        if (cancelled) return;
        cleanup = hall.mountHall(el, exhibits, THREE, { onPlay, onClose });
      } catch {
        if (!cancelled) cleanup = hall.mountFlat(el, exhibits, { onPlay, onClose });
      }
      el.querySelector('.gload')?.remove();
    })();
    return () => { cancelled = true; closeStory?.(); cleanup?.(); el.innerHTML = ''; document.body.style.overflow = prevOverflow; };
  }, [open, exhibits]);

  return (
    <>
      <button type="button" className="nkst-btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <i aria-hidden="true">▶</i>{label}<em>· walk through my work</em>
      </button>
      {open && (
        <div ref={root} className="nkst" role="dialog" aria-modal="true" aria-label="Story mode: a gallery of my case studies" />
      )}
    </>
  );
}
