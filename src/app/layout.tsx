import type { Metadata, Viewport } from 'next';
import { SITE_URL, personJsonLd } from '@/lib/site';
import './globals.css';

// LEARN (lesson 2): the root layout wraps every page. Metadata here becomes <title>, <meta> and
// Open Graph tags in the HTML the server sends, which is what Google and LinkedIn read.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Philip Nosike · Product Designer in Abuja, Nigeria | Noskshade',
    template: '%s | Philip Nosike, Product Designer',
  },
  description:
    'Philip Nosike is a product designer in Abuja, Nigeria. UI/UX for fintech and edtech, brand identity, design systems, and design consulting for startups building their MVP.',
  authors: [{ name: 'Philip Nosike' }],
  icons: { icon: [{ url: '/favicon.ico', sizes: '32x32' }, { url: '/favicon.svg', type: 'image/svg+xml' }], apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website', siteName: 'Noskshade · Philip Nosike', locale: 'en_NG',
    title: 'Philip Nosike · Product Designer in Abuja, Nigeria',
    description: 'Fintech and edtech product design, brand identity, design systems and MVP consulting. Case studies and a journal on design and building what I design.',
    images: [{ url: '/assets/og/home.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
};

export const viewport: Viewport = { themeColor: '#f1f1ef', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin-800-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
