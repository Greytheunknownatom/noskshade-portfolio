import type { Metadata } from 'next';
import { getServices } from '@/lib/content';
import ServicesClient from './ServicesClient';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: 'Product design studio in Abuja: plans, timelines and pricing | Noskshade' },
  description: 'Hire Noskshade Studio for product design, design systems, brand identity and development. See plans, get a timeline and price estimate, or book a design consultation.',
  alternates: { canonical: '/services' },
};

// LEARN (lesson 5): this page stays static (fast, cached). The form reads ?type=… in the browser
// so a link like "Want a project like this?" can pre-select the project type without a server render.
export default async function ServicesPage() {
  const d = await getServices();
  const ld = {
    '@context': 'https://schema.org', '@type': 'Service', name: 'Product design and development', provider: { '@id': `${SITE_URL}/#service` },
    areaServed: ['Nigeria', 'Africa', 'Worldwide'], url: `${SITE_URL}/services`,
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Plans', itemListElement: d.plans.map((p) => ({
      '@type': 'Offer', name: p.name, description: p.tagline, priceSpecification: { '@type': 'PriceSpecification', minPrice: p.priceRange.USD[0], maxPrice: p.priceRange.USD[1], priceCurrency: 'USD' } })) },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ServicesClient d={d} />
    </>
  );
}
