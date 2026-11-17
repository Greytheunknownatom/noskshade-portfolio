// LEARN (lesson 5): every number on the Services page lives in content/services.json (later: the
// Supabase `settings` table). The estimate is a pure function of that data and the client's picks,
// so the same maths runs in the browser (live estimate) and on the server (saved with the enquiry).

export type Currency = 'NGN' | 'USD';
export type Money = Record<Currency, number>;
export type Range = Record<Currency, [number, number]>;

export interface ServicesData {
  currencies: Record<Currency, { symbol: string; label: string }>;
  plans: { id: string; name: string; tagline: string; priceRange: Range; weeks: string; bestFor: string; includes: string[]; accent: string; popular?: boolean }[];
  consultation: { name: string; tagline: string; priceRange: Range; unit: string; includes: string[]; addons: { id: string; name: string; desc: string; priceRange: Range; unit: string }[] };
  processes: { id: string; name: string; fit: string; steps: { name: string; desc: string }[] }[];
  estimator: {
    projectTypes: { id: string; name: string; desc: string; price: Money; designWeeks: number; devWeeks: number }[];
    sizes: { id: string; name: string; desc: string; multiplier: number }[];
    extras: { id: string; name: string; price: Money; designWeeks: number; devWeeks: number; devOnly?: boolean }[];
    devRate: number;
    rangeSpread: number;
    teams: { id: string; name: string; process: string }[];
    budgets: string[];
  };
  contact: { email: string; calendarUrl: string; whatsapp: string };
}

export interface Selection {
  type: string;
  size: string;
  extras: string[];
  process: string;
  team: string;
}

export interface Estimate {
  designWeeks: number;
  devWeeks: number;
  totalWeeks: number;
  low: Money;
  high: Money;
  plan: string; // suggested plan id
}

export function estimate(d: ServicesData, s: Selection): Estimate | null {
  const e = d.estimator;
  const type = e.projectTypes.find((t) => t.id === s.type);
  const size = e.sizes.find((z) => z.id === s.size);
  if (!type || !size) return null;
  const extras = e.extras.filter((x) => s.extras.includes(x.id));
  const withDev = s.extras.includes('dev');

  const designWeeks = Math.ceil(type.designWeeks * Math.sqrt(size.multiplier) + extras.reduce((a, x) => a + x.designWeeks, 0));
  const devWeeks = withDev ? Math.ceil(type.devWeeks * Math.sqrt(size.multiplier) + extras.reduce((a, x) => a + x.devWeeks, 0)) : 0;
  // Sprints overlap design and build a little; the 5D and handoff processes run them back to back.
  const overlap = s.process === 'sprint' && devWeeks ? Math.floor(Math.min(designWeeks, devWeeks) / 2) : 0;

  const price = (c: Currency) => {
    const base = type.price[c] * size.multiplier;
    const add = extras.filter((x) => !x.devOnly).reduce((a, x) => a + x.price[c], 0);
    const dev = withDev ? base * e.devRate : 0;
    return base + add + dev;
  };
  const round = (n: number, c: Currency) => {
    const step = c === 'NGN' ? 50000 : 50;
    return Math.round(n / step) * step;
  };
  const mid = { NGN: price('NGN'), USD: price('USD') };
  const low = { NGN: round(mid.NGN * (1 - e.rangeSpread / 2), 'NGN'), USD: round(mid.USD * (1 - e.rangeSpread / 2), 'USD') };
  const high = { NGN: round(mid.NGN * (1 + e.rangeSpread / 2), 'NGN'), USD: round(mid.USD * (1 + e.rangeSpread / 2), 'USD') };

  // Suggest the plan whose typical price range the estimate falls into (by its midpoint).
  const midN = mid.NGN;
  const fits = d.plans.find((p) => midN <= p.priceRange.NGN[1]) ?? d.plans[d.plans.length - 1];
  const plan = fits.id;
  return { designWeeks, devWeeks, totalWeeks: designWeeks + devWeeks - overlap, low, high, plan };
}

export const money = (d: ServicesData, c: Currency, n: number) => {
  const sym = d.currencies[c].symbol;
  if (c === 'NGN' && n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}m`;
  if (c === 'NGN' && n >= 1000) return `${sym}${Math.round(n / 1000)}k`;
  return `${sym}${n.toLocaleString('en-US')}`;
};

export const moneyRange = (d: ServicesData, c: Currency, r: [number, number]) => `${money(d, c, r[0])} – ${money(d, c, r[1])}`;
