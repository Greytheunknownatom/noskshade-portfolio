import SiteNav from '@/components/SiteNav';
import Track from '@/components/Track';

// LEARN (lesson 6): the (site) folder is a route group. The brackets keep it out of the URL
// (/blog, not /site/blog) but let every public page share this layout with the nav.
// The admin lives outside it, so it gets its own clean layout with no public nav.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-pagebody="1" style={{ minHeight: '100vh', overflowX: 'clip', background: '#f1f1ef', color: '#111111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SiteNav />
      <Track />
      {children}
    </div>
  );
}
