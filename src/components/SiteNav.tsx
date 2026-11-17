'use client';
// LEARN (lesson 2): 'use client' marks this as a client component. It needs the current URL (usePathname)
// to highlight the active tab, which only exists in the browser. Everything else on the page stays server-rendered.
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteNav() {
  const path = usePathname() || '/';
  const page = path === '/' ? 'home' : path.startsWith('/blog') ? 'blog' : path.startsWith('/work') ? 'work' : path.startsWith('/services') ? 'contact' : path.slice(1);
  const onBlog = page === 'blog';
  const navColor = (p: string) => (page === p ? '#0284c7' : '#374151');
  const tabC = (p: string) => (page === p ? '#0284c7' : '#6b7280');
  const tabBg = (p: string) => (page === p ? 'rgba(14,165,233,0.12)' : 'transparent');
  const v = {
    lWorkC: navColor('work'), lAboutC: navColor('about'), lContactC: navColor('contact'),
    lWorkBg: page === 'work' ? 'rgba(14,165,233,0.12)' : 'transparent',
    lAboutBg: page === 'about' ? 'rgba(14,165,233,0.12)' : 'transparent',
    lContactBg: page === 'contact' ? 'rgba(14,165,233,0.12)' : 'transparent',
    lBlogC: onBlog ? '#c2410c' : '#374151', lBlogBg: onBlog ? 'rgba(251,146,60,0.12)' : 'transparent',
    tHomeC: tabC('home'), tHomeBg: tabBg('home'), tWorkC: tabC('work'), tWorkBg: tabBg('work'),
    tAboutC: tabC('about'), tAboutBg: tabBg('about'), tContactC: tabC('contact'), tContactBg: tabBg('contact'),
    tBlogC: onBlog ? '#c2410c' : '#6b7280', tBlogBg: onBlog ? 'rgba(251,146,60,0.12)' : 'transparent',
  };
  return (
    <>
  <nav data-topnav="1" style={{ position: 'fixed', top: '14px', left: '0', right: '0', zIndex: '110', display: 'flex', justifyContent: 'center', padding: '0 52px', pointerEvents: 'none' }}>
    <div style={{ pointerEvents: 'auto', boxSizing: 'border-box', width: '100%', maxWidth: '1160px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', padding: '10px 12px 10px 26px', borderRadius: '50px', background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(18px) saturate(1.8)', boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset' }}>
      <Link href="/" style={{ cursor: 'pointer', fontWeight: '800', fontSize: '17px', color: '#111111', letterSpacing: '-0.01em' }}>Noskshade.</Link>
      <div data-navlinks="1" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link href="/work" className="hv9b978e" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '50px', background: v.lWorkBg, fontSize: '13px', fontWeight: '700', color: v.lWorkC, transition: 'all 0.2s ease' }}><svg width="14" height="14" viewBox="0 0 18 18"><defs><linearGradient id="gNavW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a78bfa"></stop><stop offset="1" stopColor="#7c3aed"></stop></linearGradient></defs><rect x="2" y="5" width="14" height="10.5" rx="2" fill="url(#gNavW)"></rect><path d="M6.5 5 V4 a2 2 0 0 1 2 -2 h1 a2 2 0 0 1 2 2 v1 h-1.6 V4.2 a0.6 0.6 0 0 0 -0.6 -0.6 h-1.6 a0.6 0.6 0 0 0 -0.6 0.6 V5 Z" fill="url(#gNavW)"></path></svg>Work</Link>
        <Link href="/blog" className="hve41444" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '50px', background: v.lBlogBg, fontSize: '13px', fontWeight: '700', color: v.lBlogC, textDecoration: 'none', transition: 'all 0.2s ease' }}><svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true"><defs><linearGradient id="gNavB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbbf24"></stop><stop offset="1" stopColor="#ea580c"></stop></linearGradient></defs><rect x="2.5" y="1.5" width="12" height="15" rx="2.2" fill="url(#gNavB)"></rect><path d="M5.5 6h6M5.5 9h6M5.5 12h3.6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinecap="round"></path></svg>Blog</Link>
        <Link href="/about" className="hv37aa17" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '50px', background: v.lAboutBg, fontSize: '13px', fontWeight: '700', color: v.lAboutC, transition: 'all 0.2s ease' }}><svg width="14" height="14" viewBox="0 0 18 18"><defs><linearGradient id="gNavA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2dd4bf"></stop><stop offset="1" stopColor="#0d9488"></stop></linearGradient></defs><circle cx="9" cy="6" r="3.4" fill="url(#gNavA)"></circle><path d="M2.6 16 a6.4 6.4 0 0 1 12.8 0 Z" fill="url(#gNavA)"></path></svg>About</Link>
        <Link href="/contact" className="hvdddc0a" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '50px', background: v.lContactBg, fontSize: '13px', fontWeight: '700', color: v.lContactC, transition: 'all 0.2s ease' }}><svg width="14" height="14" viewBox="0 0 18 18"><defs><linearGradient id="gNavC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f472b6"></stop><stop offset="1" stopColor="#db2777"></stop></linearGradient></defs><rect x="1.5" y="4" width="15" height="10.5" rx="2" fill="url(#gNavC)"></rect><path d="M2.2 5 L9 10.2 L15.8 5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round"></path></svg>Contact</Link>
      </div>
      <Link href="/services" className="hv28069d" data-water-btn="1" data-navcta="1" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '50px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 22px', borderRadius: '50px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#ffffff', fontSize: '13px', fontWeight: '700', boxShadow: '0 6px 18px rgba(14,165,233,0.35)' }}>
        <span data-water="light"></span>
        <svg width="15" height="15" viewBox="0 0 14 14" style={{ position: 'relative' }}><rect x="1" y="8" width="3.4" height="5" rx="0.8" fill="#ffffff" style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'nkBuildBar 4.2s ease-in-out infinite' }}></rect><rect x="5.3" y="5" width="3.4" height="8" rx="0.8" fill="#ffffff" style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'nkBuildBar 4.2s ease-in-out infinite 0.5s' }}></rect><rect x="9.6" y="2" width="3.4" height="11" rx="0.8" fill="#ffffff" style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'nkBuildBar 4.2s ease-in-out infinite 1s' }}></rect><rect x="9.6" y="0.4" width="4.2" height="1" rx="0.5" fill="rgba(255,255,255,0.8)" style={{ animation: 'nkChatFloat 4.2s ease-in-out infinite' }}></rect></svg>
        <span style={{ position: 'relative' }}>Let's build something</span>
      </Link>
    </div>
  </nav>


  <div data-tabbar="1" style={{ position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: '110', display: 'flex', gap: '4px', padding: '8px', width: 'max-content', borderRadius: '50px', background: 'rgba(255,255,255,0.45)', border: '1.5px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(20px) saturate(1.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.9) inset' }}>
    <Link href="/" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '40px', color: v.tHomeC, background: v.tHomeBg }}>
      <svg width="18" height="18" viewBox="0 0 18 18"><defs><linearGradient id="gHome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#38bdf8"></stop><stop offset="1" stopColor="#0284c7"></stop></linearGradient></defs><path d="M9 2 L16 8 v7 a1 1 0 0 1 -1 1 h-3.4 v-4.4 a2.6 2.6 0 0 0 -5.2 0 V16 H3 a1 1 0 0 1 -1 -1 V8 Z" fill="url(#gHome)"></path><path d="M9 2 L16 8 v1.4 L9 3.6 L2 9.4 V8 Z" fill="rgba(255,255,255,0.45)"></path></svg><span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Home</span>
    </Link>
    <Link href="/work" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '40px', color: v.tWorkC, background: v.tWorkBg }}>
      <svg width="18" height="18" viewBox="0 0 18 18"><defs><linearGradient id="gWork" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a78bfa"></stop><stop offset="1" stopColor="#7c3aed"></stop></linearGradient></defs><rect x="2" y="5" width="14" height="10.5" rx="2" fill="url(#gWork)"></rect><path d="M6.5 5 V4 a2 2 0 0 1 2 -2 h1 a2 2 0 0 1 2 2 v1 h-1.6 V4.2 a0.6 0.6 0 0 0 -0.6 -0.6 h-1.6 a0.6 0.6 0 0 0 -0.6 0.6 V5 Z" fill="url(#gWork)"></path><rect x="2" y="5" width="14" height="3.2" rx="2" fill="rgba(255,255,255,0.35)"></rect></svg><span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Work</span>
    </Link>
    <Link href="/blog" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '40px', color: v.tBlogC, background: v.tBlogBg, textDecoration: 'none' }}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><defs><linearGradient id="gBlog" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbbf24"></stop><stop offset="1" stopColor="#ea580c"></stop></linearGradient></defs><rect x="2.5" y="1.5" width="13" height="15" rx="2.2" fill="url(#gBlog)"></rect><path d="M5.5 6h7M5.5 9h7M5.5 12h4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinecap="round"></path><rect x="2.5" y="1.5" width="13" height="3.4" rx="2.2" fill="rgba(255,255,255,0.3)"></rect></svg><span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blog</span>
    </Link>
    <Link href="/about" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '40px', color: v.tAboutC, background: v.tAboutBg }}>
      <svg width="18" height="18" viewBox="0 0 18 18"><defs><linearGradient id="gAbout" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2dd4bf"></stop><stop offset="1" stopColor="#0d9488"></stop></linearGradient></defs><circle cx="9" cy="6" r="3.4" fill="url(#gAbout)"></circle><path d="M2.6 16 a6.4 6.4 0 0 1 12.8 0 Z" fill="url(#gAbout)"></path><circle cx="7.8" cy="5" r="1.1" fill="rgba(255,255,255,0.5)"></circle></svg><span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</span>
    </Link>
    <Link href="/contact" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '40px', color: v.tContactC, background: v.tContactBg }}>
      <svg width="18" height="18" viewBox="0 0 18 18"><defs><linearGradient id="gMail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f472b6"></stop><stop offset="1" stopColor="#db2777"></stop></linearGradient></defs><rect x="1.5" y="4" width="15" height="10.5" rx="2" fill="url(#gMail)"></rect><path d="M2.2 5 L9 10.2 L15.8 5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round"></path></svg><span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</span>
    </Link>
  </div>


    </>
  );
}
