// LEARN (Autopilot): settings that the Autopilot page edits. Stored as one row in ap_settings.
export const PLATFORMS = ['LinkedIn', 'Instagram', 'X', 'TikTok', 'Behance', 'Dribbble'] as const;
export type Platform = (typeof PLATFORMS)[number];
export const LIMITS: Record<string, number> = { LinkedIn: 3000, Instagram: 2200, X: 280, TikTok: 2200, Behance: 2000, Dribbble: 1000 };
export const TONES = ['Warm', 'Direct', 'Playful', 'Formal'];
export const LEVELS = ['Off', 'Draft only', 'Ask first', 'Automatic'];
export const FORMATS = [
  { name: 'Visual one-pager + DM', short: 'One-pager', desc: 'A colourful glass pitch page as an image or PDF, plus a short DM.' },
  { name: 'Mini pitch page (link)', short: 'Pitch page', desc: 'A single glass page you send as a link, plus the message.' },
  { name: 'DM + short intro card', short: 'Intro card', desc: 'A tight message and one small card with your highlights.' },
];
export const CHANNELS = [
  { name: 'Direct message', short: 'DM', note: 'Goes as a DM from your own LinkedIn, X or Instagram account, whichever they use most.' },
  { name: 'Email', short: 'Email', note: 'Goes from your own Gmail with a subject line. It stays a draft until you approve.' },
  { name: 'Warm up first, then DM', short: 'Warm up', note: 'Day 1: like and comment on their latest public post. Day 3: send the DM.' },
];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export interface APSettings {
  tone: number; avoid: string; perWeek: number; days: Record<string, boolean>; postTime: string; utcOffsetHours: number;
  platforms: Record<string, boolean>;
  autonomy: { publish: number; outreach: number; jobs: number };
  pitchFmt: number; pitchChan: number; skills: string[]; minMatch: number; signature: string;
  privacy: Record<string, 'share' | 'blur' | 'never'>; // item key → how it may be posted
}

export const DEFAULT_SETTINGS: APSettings = {
  tone: 0, avoid: 'game-changer, unlock, delve', perWeek: 3,
  days: { Mon: false, Tue: true, Wed: false, Thu: true, Fri: false, Sat: true, Sun: false },
  postTime: '10:00', utcOffsetHours: 1,
  platforms: { LinkedIn: true, Instagram: true, X: true, TikTok: true, Behance: true, Dribbble: true },
  autonomy: { publish: 2, outreach: 1, jobs: 1 },
  pitchFmt: 0, pitchChan: 0,
  skills: ['product designer', 'ui/ux', 'ux designer', 'ui designer', 'design system', 'brand identity', 'brand designer', 'web designer', 'figma', 'fintech', 'edtech', 'mobile app', 'product design'],
  minMatch: 60, signature: 'Philip Nosike, Product Designer', privacy: {},
};

export function mergeSettings(saved: Partial<APSettings> | null | undefined): APSettings {
  const s = saved || {};
  return {
    ...DEFAULT_SETTINGS, ...s,
    days: { ...DEFAULT_SETTINGS.days, ...(s.days || {}) },
    platforms: { ...DEFAULT_SETTINGS.platforms, ...(s.platforms || {}) },
    autonomy: { ...DEFAULT_SETTINGS.autonomy, ...(s.autonomy || {}) },
    privacy: { ...(s.privacy || {}) },
  };
}
