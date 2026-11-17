import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import meta from '@/legacy/cases-meta.json';
import { SITE_URL, authorRef } from '@/lib/site';
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
const PAGES: Record<string, React.ComponentType> = {
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

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = M[(await params).slug];
  if (!m) return {};
  return {
    title: m.seoTitle, description: m.desc, alternates: { canonical: `/work/${(await params).slug}` },
    openGraph: { type: 'article', title: m.seoTitle, description: m.desc, images: [{ url: m.og }] },
    twitter: { card: 'summary_large_image', title: m.seoTitle, description: m.desc, images: [m.og] },
  };
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const Page = PAGES[slug];
  const m = M[slug];
  if (!Page || !m) notFound();
  const ld = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: m.title, headline: m.seoTitle, description: m.desc,
    image: `${SITE_URL}${m.cover}`, author: authorRef, creator: authorRef, url: `${SITE_URL}/work/${slug}`, genre: m.kind, inLanguage: 'en' };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Page />
    </>
  );
}
