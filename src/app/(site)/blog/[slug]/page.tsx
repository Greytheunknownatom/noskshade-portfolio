import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPost, getPublishedPosts } from '@/lib/content';
import { CATS, fmtDate, toCard, routeToPath } from '@/lib/blog';
import { SITE_URL, authorRef } from '@/lib/site';
import { getSocial } from '@/lib/social';
import ShareBar from './ShareBar';
import ProjectCta from '@/components/ProjectCta';

type Props = { params: Promise<{ slug: string }> };

// LEARN (lesson 4): build every published post as a static page at deploy time...
export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}
// ...and allow new slugs (posts published later from the admin) to be built on their first visit, then cached.
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  const og = `/assets/og/${p.slug}.jpg`;
  return {
    title: p.title, description: p.excerpt, alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: 'article', title: p.title, description: p.excerpt, publishedTime: p.publishedAt, authors: ['Philip Nosike'], images: [{ url: og, width: 1200, height: 627 }] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt, images: [og] },
  };
}

const TYPES: Record<string, string> = { p: 'isP', h: 'isH', q: 'isQ', img: 'isImg', l: 'isList', c: 'isCode', cta: 'isCta' };

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const cur = await getPost(slug);
  if (!cur) notFound();
  const all = await getPublishedPosts();
  const k = CATS[cur.category] ?? CATS.uiux;
  const post = {
    title: cur.title, excerpt: cur.excerpt, cover: cur.cover, coverAlt: cur.coverAlt, cat: k.label, catC: k.c, catBg: k.bg,
    bar: k.dot, glow: k.glow, date: fmtDate(cur.publishedAt), read: cur.readMinutes,
    tagList: cur.tags.map((t) => ({ t })),
    blocks: cur.blocks.map((b) => {
      const o: Record<string, any> = { isP: false, isH: false, isQ: false, isImg: false, isList: false, isCode: false, isCta: false, text: '', src: '', alt: '', items: [], href: '', label: '', target: '', maxw: '100%' };
      o[TYPES[b[0]] || 'isP'] = true;
      if (b[0] === 'img') { o.src = b[1].startsWith('/') ? b[1] : '/' + b[1]; o.alt = b[2]; o.text = b[3] || ''; o.maxw = b[4] || '100%'; }
      else if (b[0] === 'cta') {
        o.text = b[1]; o.label = b[3]; o.href = b[4] ? routeToPath(b[4]) : b[2]; o.target = b[4] ? '_self' : '_blank';
        const blue = b[5] === 'blue';
        o.ctaBg = blue ? 'linear-gradient(135deg, rgba(224,242,254,0.9), rgba(219,234,254,0.75))' : 'linear-gradient(135deg, rgba(254,243,199,0.85), rgba(254,215,170,0.7))';
        o.ctaBc = blue ? 'rgba(14,165,233,0.35)' : 'rgba(251,146,60,0.35)';
        o.ctaTc = blue ? '#0c4a6e' : '#431407';
        o.ctaBtn = blue ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'linear-gradient(135deg,#f59e0b,#ea580c)';
        o.ctaSh = blue ? '0 8px 20px rgba(14,165,233,0.3)' : '0 8px 20px rgba(234,88,12,0.3)';
      } else if (b[0] === 'l') { o.items = (b[1] as string[]).map((t) => ({ t })); }
      else { o.text = b[1]; }
      return o;
    }),
  };
  const postRelated = all.filter((p) => p.slug !== cur.slug && p.category === cur.category)
    .concat(all.filter((p) => p.slug !== cur.slug && p.category !== cur.category)).slice(0, 3).map(toCard);
  const v = { post, postRelated };
  const url = `${SITE_URL}/blog/${cur.slug}/`;
  const social = await getSocial(cur.slug);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: cur.title, description: cur.excerpt, image: `${SITE_URL}/assets/og/${cur.slug}.jpg`,
      datePublished: cur.publishedAt, dateModified: cur.publishedAt, author: authorRef, publisher: authorRef, mainEntityOfPage: url,
      keywords: cur.tags.join(', '), articleSection: k.label, inLanguage: 'en' },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: cur.title, item: url }] },
  ];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
  <div data-screen-label="Blog post" style={{ position: 'relative', padding: '130px 52px 96px' }}>
    <div style={{ position: 'absolute', top: '40px', left: '50%', width: '520px', height: '320px', transform: 'translateX(-50%)', borderRadius: '50%', background: `radial-gradient(ellipse, ${v.post.glow}, transparent 65%)`, filter: 'blur(48px)', pointerEvents: 'none' }}></div>
    <div data-posthead="1" style={{ position: 'relative', maxWidth: '760px', margin: '0 auto' }}>
      <Link href="/blog" className="hv449518" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '42px', padding: '0 20px', borderRadius: '50px', background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(18px) saturate(1.8)', fontSize: '13px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', boxShadow: '0 4px 20px rgba(14,165,233,0.15), 0 0 0 1px rgba(255,255,255,0.6) inset', transition: 'all 0.25s ease' }}><span aria-hidden="true">←</span> All posts</Link>
      <div style={{ marginTop: '36px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        <span style={{ padding: '6px 12px', borderRadius: '50px', background: v.post.catBg, color: v.post.catC, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{v.post.cat}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280' }}>{v.post.date} · {v.post.read} min read</span>
      </div>
      <h1 style={{ margin: '16px 0 0', fontSize: 'clamp(32px, 4.2vw, 52px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.025em', color: '#111111', textWrap: 'balance' }}>{v.post.title}</h1>
      <p style={{ margin: '18px 0 0', fontSize: '19px', lineHeight: 1.6, color: '#4b5563', textWrap: 'pretty' }}>{v.post.excerpt}</p>
      <div style={{ marginTop: '26px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img loading="lazy" decoding="async" src="/assets/portrait-about.webp" alt="" draggable={false} style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 18%', border: '2px solid #ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }} />
        <div><div style={{ fontSize: '14px', fontWeight: 800, color: '#111111' }}>Philip Nosike</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Product Designer · Noskshade</div></div>
      </div>
    </div>

    <div style={{ position: 'relative', maxWidth: '1000px', margin: '40px auto 0', borderRadius: '26px', overflow: 'hidden', aspectRatio: '16 / 9', background: '#e8e8e5', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}>
      <Image src={v.post.cover} alt={v.post.coverAlt} fill priority sizes="(max-width: 1040px) 100vw, 1000px" draggable={false} style={{ objectFit: 'cover' }} />
    </div>

    <div data-article="1" style={{ position: 'relative', maxWidth: '720px', margin: '52px auto 0' }}>
      {v.post.blocks.map((b, bI) => (<React.Fragment key={bI}>
        {b.isP && (<><p style={{ margin: '0 0 22px', color: '#1f2937', textWrap: 'pretty' }}>{b.text}</p></>)}
        {b.isH && (<><h2 style={{ margin: '44px 0 16px', fontSize: '26px', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.015em', color: '#111111' }}>{b.text}</h2></>)}
        {b.isQ && (<><blockquote style={{ margin: '36px 0', padding: '6px 0 6px 26px', borderLeft: `4px solid ${v.post.bar}`, fontSize: '23px', fontWeight: 700, lineHeight: 1.5, letterSpacing: '-0.01em', color: '#111111' }}>{b.text}</blockquote></>)}
        {b.isImg && (<><figure style={{ margin: '36px 0' }}><div style={{ maxWidth: b.maxw, margin: '0 auto', borderRadius: '18px', overflow: 'hidden', background: '#e8e8e5', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}><img src={b.src} alt={b.alt} draggable={false} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: 'auto' }} /></div><figcaption style={{ marginTop: '12px', fontSize: '13px', lineHeight: 1.5, color: '#6b7280', textAlign: 'center' }}>{b.text}</figcaption></figure></>)}
        {b.isList && (<><ul style={{ margin: '0 0 26px', paddingLeft: '22px' }}>{b.items.map((li: { t: string }, liI: number) => (<React.Fragment key={liI}><li style={{ margin: '0 0 10px', color: '#1f2937' }}>{li.t}</li></React.Fragment>))}</ul></>)}
        {b.isCta && (<><div style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '20px 22px', borderRadius: '18px', background: b.ctaBg, border: `1.5px solid ${b.ctaBc}` }}><p style={{ margin: 0, flex: '1 1 260px', fontWeight: 700, color: b.ctaTc }}>{b.text}</p><a href={b.href} target={b.target} rel="noopener"  style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', height: '44px', padding: '0 22px', borderRadius: '50px', background: b.ctaBtn, color: '#ffffff', fontSize: '13.5px', fontWeight: 800, textDecoration: 'none', boxShadow: b.ctaSh }}>{b.label}</a></div></>)}
        {b.isCode && (<><pre style={{ margin: '28px 0', padding: '22px 24px', borderRadius: '16px', background: '#0c1d3d', color: '#e2e8f0', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13.5px', lineHeight: 1.7, boxShadow: '0 10px 30px rgba(7,15,34,0.2)' }}><code>{b.text}</code></pre></>)}
      </React.Fragment>))}

      <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {v.post.tagList.map((t, tI) => (<React.Fragment key={tI}><span style={{ padding: '6px 13px', borderRadius: '50px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700, color: '#374151' }}>#{t.t}</span></React.Fragment>))}
      </div>

      <ShareBar url={url} title={cur.title} liText={social?.linkedin ?? ''} />
      <ProjectCta title="Building something like this?" />
      {/* Author card */}
      <div style={{ marginTop: '36px', position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '22px', padding: '28px 30px', borderRadius: '24px', background: 'radial-gradient(ellipse 80% 70% at 80% 0%, #1d3f7a 0%, #0c1d3d 55%, #070f22 100%)', boxShadow: '0 20px 50px rgba(7,15,34,0.22)' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.35), transparent 65%)', filter: 'blur(28px)', pointerEvents: 'none' }}></div>
        <img loading="lazy" decoding="async" src="/assets/portrait-about.webp" alt="Philip Nosike" draggable={false} style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '20px', objectFit: 'cover', objectPosition: 'center 18%', background: '#e2e8f0' }} />
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '220px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#93c5fd' }}>Written by</div>
          <div style={{ marginTop: '4px', fontSize: '19px', fontWeight: 800, color: '#ffffff' }}>Philip Nosike</div>
          <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: 1.65, color: '#cbd5e1' }}>Product designer working across fintech, edtech and consumer products, and learning to ship what I design.</p>
        </div>
        <Link href="/contact" className="hva080a1" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 22px', borderRadius: '50px', background: '#ffffff', color: '#111111', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>Work with me <span aria-hidden="true">→</span></Link>
      </div>
    </div>

    {/* Keep reading */}
    <div style={{ position: 'relative', maxWidth: '1160px', margin: '88px auto 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <h2 style={{ margin: 0, fontSize: 'clamp(24px, 2.6vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#111111' }}>Keep reading</h2>
        <Link href="/blog" className="hv12328f" style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1', textDecoration: 'none' }}>All posts →</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {v.postRelated.map((p, pI) => (<React.Fragment key={pI}>
          <Link data-blogcard="1" href={p.href} style={{ display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset', color: '#111111', textDecoration: 'none' }}>
            <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#e8e8e5' }}>
              <Image src={p.cover} alt={p.coverAlt} fill sizes="(max-width: 700px) 100vw, 380px" draggable={false} style={{ objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: '14px', left: '14px', padding: '6px 12px', borderRadius: '50px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: p.catC }}>{p.cat}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', padding: '22px 24px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>{p.date} · {p.read} min read</div>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, lineHeight: 1.35, letterSpacing: '-0.01em', color: '#111111', textWrap: 'balance' }}>{p.title}</h3>
              <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>Read post →</div>
            </div>
          </Link>
        </React.Fragment>))}
      </div>
    </div>
  </div>
  

  {/* Social share panel (LinkedIn / Instagram / TikTok) */}


    </>
  );
}
