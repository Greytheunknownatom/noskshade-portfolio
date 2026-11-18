import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import meta from '@/legacy/cases-meta.json';
import { SITE_URL, authorRef } from '@/lib/site';
import { getCase, getCases, getSite } from '@/lib/content';
import { CaseFlow, CustomCase } from '@/components/CaseExtras';
import CaseKoynx from '@/legacy/pages/CaseKoynx';
import CaseKoynxAdmin from '@/legacy/pages/CaseKoynxAdmin';
import CaseHillcross from '@/legacy/pages/CaseHillcross';
import CaseStudent from '@/legacy/pages/CaseStudent';
import CaseTeacher from '@/legacy/pages/CaseTeacher';
import CasePortal from '@/legacy/pages/CasePortal';
import CaseWemove from '@/legacy/pages/CaseWemove';
import CaseLucenture from '@/legacy/pages/CaseLucenture';
import CaseHeatbud from '@/legacy/pages/CaseHeatbud';
import CaseBlissbill from '@/legacy/pages/CaseBlissbill';
import CaseLaundromate from '@/legacy/pages/CaseLaundromate';

// LEARN (lesson 7): one route for all case studies. Each slug maps to its ported page component.
const PAGES: Record<string, React.ComponentType<{ ov?: any }>> = {
  'koynx': CaseKoynx,
  'koynx-admin': CaseKoynxAdmin,
  'hillcross-college-website': CaseHillcross,
  'hillcross-student-dashboard': CaseStudent,
  'hillcross-teacher-dashboard': CaseTeacher,
  'hillcross-university-student-portal': CasePortal,
  'wemove-fitness': CaseWemove,
  'lucenture-consult': CaseLucenture,
  'heatbud': CaseHeatbud,
  'blissbill': CaseBlissbill,
  'laundromate': CaseLaundromate,
};
type Meta = { route: string; title: string; seoTitle: string; desc: string; og: string; kind: string; cover: string };
const M = meta as Record<string, Meta>;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const custom = (await getCases()).filter((c) => c.card.custom).map((c) => c.slug);
  return [...Object.keys(PAGES), ...custom].map((slug) => ({ slug }));
}
// New case studies made in the admin get built on their first visit, then cached.
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const c = await getCase(slug);
  if (!M[slug] && c?.card.custom) {
    const d = c.card.desc || c.card.intro || '';
    return { title: c.title, description: d, alternates: { canonical: `/work/${slug}` }, openGraph: { type: 'article', title: c.title, description: d, images: c.card.cover ? [{ url: c.card.cover }] : [] } };
  }
  const m0 = M[slug];
  if (!m0) return {};
  const m = { ...m0, desc: c?.card.desc || m0.desc };
  return {
    title: m.seoTitle, description: m.desc, alternates: { canonical: `/work/${slug}` },
    openGraph: { type: 'article', title: m.seoTitle, description: m.desc, images: [{ url: c?.card.cover || m.og }] },
    twitter: { card: 'summary_large_image', title: m.seoTitle, description: m.desc, images: [c?.card.cover || m.og] },
  };
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const Page = PAGES[slug];
  const m = M[slug];
  const [c, { links }] = await Promise.all([getCase(slug), getSite()]);
  if (!Page || !m) {
    if (c?.card.custom) return <CustomCase c={c} />;
    notFound();
  }
  const ld = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: m.title, headline: m.seoTitle, description: m.desc,
    image: `${SITE_URL}${m.cover}`, author: authorRef, creator: authorRef, url: `${SITE_URL}/work/${slug}`, genre: m.kind, inLanguage: 'en' };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Page ov={{ card: c?.card, brief: c?.brief, links }} />
      <CaseFlow flow={c?.card.flow} />
    </>
  );
}
