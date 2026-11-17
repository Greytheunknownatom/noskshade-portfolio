'use client';
// LEARN (lesson 4): the filters and search need to react to clicks and typing, so this part is a
// client component. The posts themselves arrive already rendered from the server (see page.tsx),
// so Google and slow phones get the full list even before this JavaScript loads.
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATS, type PostCard } from '@/lib/blog';
import type { CategoryId } from '@/lib/content/types';

export default function BlogIndex({ posts, latest }: { posts: PostCard[]; latest: string }) {
  const [filter, setFilter] = useState<'all' | CategoryId>('all');
  const [q, setQ] = useState('');
  const v = useMemo(() => {
    const query = q.trim().toLowerCase();
    const inCat = posts.filter((p) => filter === 'all' || p.catId === filter);
    const matches = inCat.filter((p) => !query || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(query));
    const feat = posts.find((p) => p.featured) || posts[0];
    const blogShowFeat = filter === 'all' && !query && !!feat;
    const blogList = blogShowFeat ? matches.filter((p) => p.slug !== feat.slug) : matches;
    const fBtn = (id: 'all' | CategoryId, label: string, dot: string) => {
      const on = filter === id;
      return { label, dot, n: id === 'all' ? posts.length : posts.filter((p) => p.catId === id).length,
        pressed: on, bg: on ? '#111111' : 'rgba(255,255,255,0.7)', c: on ? '#ffffff' : '#374151', bc: on ? '#111111' : 'rgba(255,255,255,0.9)',
        pick: () => setFilter(id) };
    };
    const blogFilters = [fBtn('all', 'All posts', 'linear-gradient(135deg,#fbbf24,#ea580c)')]
      .concat((Object.keys(CATS) as CategoryId[]).map((id) => fBtn(id, CATS[id].label, CATS[id].dot)));
    return { blogCount: posts.length, blogLatest: latest, blogFilters, blogQ: q, blogShowFeat, blogFeat: feat, blogList, blogEmpty: matches.length === 0 };
  }, [posts, latest, filter, q]);

  return (
  <div data-screen-label="Blog" style={{ position: 'relative', padding: '130px 52px 96px' }}>
    <div style={{ position: 'absolute', top: '60px', right: '4%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,146,60,0.22), transparent 65%)', filter: 'blur(40px)', animation: 'nkFlow 26s ease-in-out infinite', pointerEvents: 'none' }}></div>
    <div style={{ position: 'absolute', top: '220px', left: '2%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.2), transparent 65%)', filter: 'blur(40px)', animation: 'nkFlow 30s ease-in-out infinite 4s', pointerEvents: 'none' }}></div>
    <div style={{ position: 'relative', maxWidth: '1160px', margin: '0 auto' }}>
      <Link href="/" className="hv449518" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '42px', padding: '0 20px', borderRadius: '50px', background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(18px) saturate(1.8)', fontSize: '13px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', boxShadow: '0 4px 20px rgba(14,165,233,0.15), 0 0 0 1px rgba(255,255,255,0.6) inset', transition: 'all 0.25s ease' }}><span aria-hidden="true">←</span> Back home</Link>

      <div style={{ marginTop: '36px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'linear-gradient(135deg,#fbbf24,#ea580c)', boxShadow: '0 0 0 3px rgba(251,146,60,0.18)' }}></span>The Journal</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(34px, 4.4vw, 58px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#111111' }}>What I’m learning as I design, <span style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>and build.</span></h1>
          <p style={{ margin: '16px 0 0', fontSize: '16px', lineHeight: 1.7, color: '#4b5563' }}>I’m Philip. I design apps, brands and systems, mostly for people across Africa, and lately I’ve been learning to build them too. This is where I write down what worked, what didn’t, and what surprised me along the way.</p>
        </div>
        <div data-blogstats="1" style={{ display: 'flex', gap: '28px', padding: '16px 24px', borderRadius: '18px', background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div><div style={{ fontSize: '24px', fontWeight: 800, color: '#111111' }}>{v.blogCount}</div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Posts</div></div>
          <div><div style={{ fontSize: '24px', fontWeight: 800, color: '#111111' }}>4</div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Topics</div></div>
          <div><div style={{ fontSize: '24px', fontWeight: 800, color: '#111111' }}>{v.blogLatest}</div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Latest</div></div>
        </div>
      </div>

      {/* Filters + search */}
      <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div data-blogfilters="1" role="group" aria-label="Filter posts by topic" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {v.blogFilters.map((f, fI) => (<React.Fragment key={fI}>
            <button data-blogbtn="1" type="button" aria-pressed={f.pressed} onClick={f.pick} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 16px', borderRadius: '50px', border: `1.5px solid ${f.bc}`, background: f.bg, color: f.c, fontSize: '13px', fontWeight: 700, backdropFilter: 'blur(14px)', transition: 'all 0.2s ease' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.dot }}></span>{f.label}<span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.7 }}>{f.n}</span></button>
          </React.Fragment>))}
        </div>
        <label data-blogsearchwrap="1" style={{ position: 'relative', display: 'block', flex: '0 1 300px', minWidth: '220px' }}>
          <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Search posts</span>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ position: 'absolute', left: '16px', top: '50%', zIndex: 2, transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="7" cy="7" r="5" fill="none" stroke="#6b7280" strokeWidth="1.7"></circle><path d="M11 11 L14.5 14.5" stroke="#6b7280" strokeWidth="1.7" strokeLinecap="round"></path></svg>
          <input data-blogsearch="1" type="search" value={v.blogQ} onChange={(e) => setQ(e.target.value)} placeholder="Search posts" style={{ width: '100%', boxSizing: 'border-box', height: '44px', padding: '0 18px 0 42px', borderRadius: '50px', border: '1.5px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(14px)', fontFamily: '\'Plus Jakarta Sans\', sans-serif', fontSize: '14px', fontWeight: 600, color: '#111111', outline: 'none', transition: 'all 0.2s ease' }} />
        </label>
      </div>

      {/* Featured post */}
      {v.blogShowFeat && (<>
        <Link data-blogcard="1" data-blogfeat="1" href={v.blogFeat.href} style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', borderRadius: '26px', overflow: 'hidden', background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset', color: '#111111', textDecoration: 'none' }}>
          <div style={{ position: 'relative', flex: '1 1 520px', minHeight: '340px', overflow: 'hidden', background: '#e8e8e5' }}>
            <Image src={v.blogFeat.cover} alt={v.blogFeat.coverAlt} fill priority sizes="(max-width: 960px) 100vw, 640px" draggable={false} style={{ objectFit: 'cover' }} />
            <span style={{ position: 'absolute', top: '18px', left: '18px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '50px', background: '#111111', color: '#ffffff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}><span style={{ color: '#fbbf24' }} aria-hidden="true">★</span>Featured</span>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: '280px', padding: '40px 40px 36px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}><span style={{ padding: '6px 12px', borderRadius: '50px', background: v.blogFeat.catBg, color: v.blogFeat.catC, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{v.blogFeat.cat}</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280' }}>{v.blogFeat.date} · {v.blogFeat.read} min read</span></div>
            <h2 style={{ margin: 0, fontSize: 'clamp(24px, 2.6vw, 34px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#111111', textWrap: 'balance' }}>{v.blogFeat.title}</h2>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#4b5563', textWrap: 'pretty' }}>{v.blogFeat.excerpt}</p>
            <div style={{ marginTop: 'auto', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img loading="lazy" decoding="async" src="/assets/portrait-about.webp" alt="" draggable={false} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 18%' }} /><div><div style={{ fontSize: '13px', fontWeight: 800, color: '#111111' }}>Philip Nosike</div><div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>Product Designer</div></div></div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '42px', padding: '0 22px', borderRadius: '50px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#ffffff', fontSize: '13px', fontWeight: 700, boxShadow: '0 6px 18px rgba(14,165,233,0.35)' }}>Read post <span aria-hidden="true">→</span></span>
            </div>
          </div>
        </Link>
      </>)}

      {/* Grid */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {v.blogList.map((p, pI) => (<React.Fragment key={pI}>
          <Link data-blogcard="1" href={p.href} style={{ display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset', color: '#111111', textDecoration: 'none' }}>
            <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#e8e8e5' }}>
              <Image src={p.cover} alt={p.coverAlt} fill sizes="(max-width: 700px) 100vw, 380px" draggable={false} style={{ objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: '14px', left: '14px', padding: '6px 12px', borderRadius: '50px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: p.catC }}>{p.cat}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', padding: '22px 24px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>{p.date} · {p.read} min read</div>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, lineHeight: 1.35, letterSpacing: '-0.01em', color: '#111111', textWrap: 'balance' }}>{p.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: '#4b5563', textWrap: 'pretty' }}>{p.excerpt}</p>
              <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>Read post →</div>
            </div>
          </Link>
        </React.Fragment>))}
      </div>

      {/* Empty state */}
      {v.blogEmpty && (<>
        <div style={{ marginTop: '8px', padding: '56px 24px', borderRadius: '22px', textAlign: 'center', background: 'rgba(255,255,255,0.6)', border: '1.5px dashed rgba(0,0,0,0.12)' }}>
          <div style={{ fontSize: '30px' }} aria-hidden="true">✎</div>
          <h2 style={{ margin: '10px 0 0', fontSize: '20px', fontWeight: 800, color: '#111111' }}>No posts match “{v.blogQ}”</h2>
          <p style={{ margin: '8px auto 0', maxWidth: '380px', fontSize: '14px', lineHeight: 1.6, color: '#4b5563' }}>Try another word, or clear the search to see everything in this topic.</p>
          <button data-blogbtn="1" type="button" onClick={() => setQ('')} style={{ marginTop: '18px', cursor: 'pointer', height: '42px', padding: '0 22px', borderRadius: '50px', border: '2px solid #0ea5e9', background: 'rgba(255,255,255,0.7)', color: '#0369a1', fontSize: '13px', fontWeight: 700 }}>Clear search</button>
        </div>
      </>)}
    </div>
  </div>
  


  );
}
