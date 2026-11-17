export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenoskshade.netlify.app';

const person = { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Philip Nosike', url: `${SITE_URL}/`, jobTitle: 'Product Designer' };

export const personJsonLd = [
  {
    '@context': 'https://schema.org', ...person, alternateName: ['Noskshade', 'Grey The Nosk'],
    image: `${SITE_URL}/assets/portrait-about.webp`, email: 'mailto:thenoskshade@gmail.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Abuja', addressCountry: 'NG' },
    sameAs: ['https://www.linkedin.com/in/philipnosike'],
    knowsAbout: ['Product design', 'UI/UX design', 'Fintech product design', 'Edtech product design', 'Brand identity', 'Design systems', 'MVP design', 'Design consulting'],
  },
  {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${SITE_URL}/#service`, name: 'Noskshade · Philip Nosike',
    url: `${SITE_URL}/`, image: `${SITE_URL}/assets/og/home.jpg`, founder: { '@id': `${SITE_URL}/#person` },
    areaServed: ['Nigeria', 'Africa', 'Worldwide'], address: { '@type': 'PostalAddress', addressLocality: 'Abuja', addressCountry: 'NG' },
    serviceType: ['Product design', 'UI/UX design', 'Brand identity design', 'Design systems', 'Design consulting', 'MVP design'],
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Noskshade', url: `${SITE_URL}/`, inLanguage: 'en' },
];

export const authorRef = person;
