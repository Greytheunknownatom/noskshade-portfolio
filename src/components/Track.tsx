'use client';
// LEARN (lesson 9): a tiny, private visit counter. On each page change it sends one row
// (page, where the visitor came from, phone or computer, rough country) straight to Supabase.
// No cookies, no names, no IP addresses stored, and it never touches Netlify, so it costs no credits.
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Time zones that point clearly at one country; anything else falls back to the browser's language region.
const TZ: Record<string, string> = { 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA', 'Africa/Accra': 'GH', 'Africa/Nairobi': 'KE', 'Europe/London': 'GB',
  'Africa/Cairo': 'EG', 'Asia/Kolkata': 'IN', 'Asia/Dubai': 'AE', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'America/Toronto': 'CA', 'Australia/Sydney': 'AU' };

function country() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code = TZ[tz] || (tz?.startsWith('America/') && !tz.includes('Toronto') ? 'US' : '') || navigator.language.split('-')[1] || '';
    return code ? new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code : '';
  } catch { return ''; }
}

function source() {
  const q = new URLSearchParams(location.search).get('utm_source');
  if (q) return q.toLowerCase();
  try {
    const r = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
    if (!r || r === location.hostname) return '';
    if (r.includes('linkedin') || r === 'lnkd.in') return 'LinkedIn';
    if (r.includes('google')) return 'Google';
    if (r.includes('instagram')) return 'Instagram';
    if (r.includes('tiktok')) return 'TikTok';
    if (r.includes('whatsapp') || r === 'wa.me') return 'WhatsApp';
    if (r === 't.co' || r.includes('twitter') || r === 'x.com') return 'X';
    if (r.includes('facebook')) return 'Facebook';
    if (r.includes('behance')) return 'Behance';
    if (r.includes('dribbble')) return 'Dribbble';
    return r;
  } catch { return ''; }
}

export default function Track() {
  const path = usePathname();
  useEffect(() => {
    if (!url || !key || navigator.webdriver || location.hostname === 'localhost') return;
    let sid = '';
    try { sid = sessionStorage.getItem('nk_sid') || ''; if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('nk_sid', sid); } } catch {}
    const ua = navigator.userAgent;
    const device = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'Phone' : 'Computer';
    fetch(`${url}/rest/v1/page_views`, {
      method: 'POST', keepalive: true,
      headers: { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ path: path.slice(0, 280), ref: source().slice(0, 180), device, country: country(), sid }),
    }).catch(() => {});
  }, [path]);
  return null;
}
