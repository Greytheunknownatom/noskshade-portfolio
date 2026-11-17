import Link from 'next/link';

// LEARN (lesson 5): a small server component reused at the end of case studies and posts.
// It links to /services with the project type filled in, so the form opens already pre-selected.
export default function ProjectCta({ type, title = 'Want a project like this?', text = 'Tell me what you’re building. You’ll get a timeline and price estimate in about two minutes.' }: { type?: string; title?: string; text?: string }) {
  const href = type ? `/services?type=${encodeURIComponent(type)}#start` : '/services#start';
  return (
    <div style={{ marginTop: 40, position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '26px 28px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(224,242,254,0.95), rgba(224,231,255,0.85))', border: '1.5px solid rgba(14,165,233,0.3)', boxShadow: '0 12px 34px rgba(14,165,233,0.14)' }}>
      <div style={{ flex: '1 1 300px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0369a1' }}>Noskshade Studio</div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#0c1d3d' }}>{title}</div>
        <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.6, color: '#334155' }}>{text}</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Link href={href} className="hv28069d" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 22px', borderRadius: 50, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 18px rgba(14,165,233,0.35)' }}>Get an estimate →</Link>
        <Link href="/services?kind=consultation#start" style={{ display: 'inline-flex', alignItems: 'center', height: 46, padding: '0 20px', borderRadius: 50, background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(0,0,0,0.1)', color: '#111', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Book a consultation</Link>
      </div>
    </div>
  );
}
