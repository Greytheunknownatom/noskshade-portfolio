import briefs from './briefs.json';
import type { CaseStudy } from '@/lib/content/types';

// LEARN (lesson 11): the data Story mode needs, built on the server and handed to the client as plain JSON.
// One exhibit per case study: its colour, the screens for its story, and the short case-study text.

export interface Exhibit {
  slug: string; name: string; kind: string; href: string; accent: string;
  screens: { src: string; t: string }[];
  problem?: string; did?: string; result?: string; trade?: string; next?: string;
  handmade?: boolean;
}

type B = { problem?: string; did?: string; result?: string; trade?: string; next?: string };
const BR = briefs as Record<string, B>;
const A = '/assets/';

const BUILT_IN: [string, string, string, string, string, [string, string][]][] = [
  // [brief key, site slug, name, kind, accent, screens]
  ['heatbud', 'heatbud', 'HeatBud', 'Health & climate · Web app', '#f97316', [['hb-home.webp', 'Home'], ['hb-forecast.jpg', 'Forecast'], ['hb-water.webp', 'Water plan'], ['hb-alerts.webp', 'Alerts'], ['hb-buddy.webp', 'Pick a buddy']]],
  ['koynx-admin', 'koynx-admin', 'KOYNX Admin', 'Fintech · Admin portal', '#10b981', [['kx-a02.webp', 'Overview'], ['kx-a05.webp', 'Users'], ['kx-a11.webp', 'Savings'], ['kx-a17.webp', 'KYC review']]],
  ['koynx', 'koynx', 'KOYNX', 'Fintech · Savings app', '#14b8a6', [['kx-m01.webp', 'Welcome'], ['kx-m02.webp', 'Sign up'], ['kx-m03.webp', 'Home'], ['kx-m04.webp', 'Savings']]],
  ['blissbill', 'blissbill', 'BlissBill', 'Payments · Mobile app', '#eab308', [['bb-cover.webp', 'Welcome'], ['bb-home.webp', 'Home'], ['bb-data-1.webp', 'Buy data'], ['bb-kyc-1.webp', 'Verify identity']]],
  ['hcportal', 'hillcross-university-student-portal', 'HillCross Portal', 'Edtech · Student portal', '#2563eb', [['portal-20.webp', 'Under review'], ['portal-21.webp', 'Admission offer'], ['portal-27.webp', 'Active semester'], ['portal-29.webp', 'Study plan']]],
  ['wemove', 'wemove-fitness', 'WeMove', 'Fitness · Mobile app', '#8b5cf6', [['wm-home.webp', 'Home'], ['wm-ob-2.webp', 'Onboarding'], ['wm-progress.webp', 'Progress'], ['wm-rewards.webp', 'Rewards']]],
  ['laundromate', 'laundromate', 'Laundromate', 'Services · Mobile app', '#0ea5e9', [['lm-home.webp', 'Home'], ['lm-prices.webp', 'Prices'], ['lm-collect.webp', 'Pickup'], ['lm-receipt.webp', 'Receipt']]],
  ['hcstudent', 'hillcross-student-dashboard', 'HillCross Student', 'Edtech · Dashboard', '#ec4899', [['hcs-1.webp', 'Start registration'], ['hcs-2.webp', 'Continue registration'], ['hcs-3.webp', 'Admitted']]],
  ['hcteacher', 'hillcross-teacher-dashboard', 'HillCross Teacher', 'Edtech · Dashboard', '#f43f5e', [['hct-new.webp', 'New teacher'], ['hct-ret.webp', 'Returning teacher'], ['hct-ann.webp', 'Announcements']]],
  ['hillcross', 'hillcross-college-website', 'HillCross College Website', 'Edtech · Website', '#c41e3a', [['hillcross-after.webp', 'New homepage'], ['hillcross-before.webp', 'Old homepage']]],
  ['lucenture', 'lucenture-consult', 'Lucenture', 'Consulting · Website', '#d4a017', [['lc-hero.webp', 'Homepage'], ['lc-why.webp', 'Why us']]],
];

/** Built-in case studies (with any admin edits applied), then new ones made in the admin. */
export function buildExhibits(rows: CaseStudy[]): Exhibit[] {
  const edits = new Map(rows.map((r) => [r.slug, r]));
  const list: Exhibit[] = BUILT_IN.map(([key, slug, name, kind, accent, screens]) => {
    const r = edits.get(slug);
    const b = { ...BR[key], ...Object.fromEntries(Object.entries(r?.brief ?? {}).filter(([, v]) => v)) } as B;
    return { slug, name: r?.title || name, kind, href: `/work/${slug}`, accent, screens: screens.map(([f, t]) => ({ src: A + f, t })), ...b, handmade: slug === 'heatbud' };
  });
  const colours = ['#6366f1', '#0ea5e9', '#f97316', '#10b981', '#ec4899'];
  rows.filter((r) => r.card.custom && !r.card.hidden && r.status === 'published').forEach((r, i) => {
    const screens = [...(r.card.cover ? [{ src: r.card.cover, t: r.title }] : []), ...(r.card.flow ?? []).map((f) => ({ src: f.img, t: f.t }))];
    if (!screens.length) return;
    list.unshift({ slug: r.slug, name: r.title, kind: r.kind, href: `/work/${r.slug}`, accent: colours[i % colours.length], screens, ...r.brief });
  });
  return list;
}
