import 'server-only';
import { LIMITS, TONES, type APSettings } from './defaults';
import type { Item } from './content';

// LEARN (Autopilot): drafting. With AI_PROVIDER set (anthropic or openai) it asks a model. Without,
// it falls back to simple templates built from your own page text, so it always works.
const HOOKS: Record<string, string[]> = {
  Warm: ['Something I made recently:', 'A small win from this week:', 'Sharing a little of the work:'],
  Direct: ['New on the site:', 'Just published:', 'Case in point:'],
  Playful: ['Fresh off the design desk:', 'Plot twist, it shipped:', 'Pixels, but make it useful:'],
  Formal: ['Now available on my portfolio:', 'Recently completed:', 'Featured work:'],
};

export const avoidList = (a: string) => String(a || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
export function scrub(text: string, avoid: string) {
  let t = text;
  for (const w of avoidList(avoid)) t = t.replace(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '').replace(/ {2,}/g, ' ');
  return t.trim();
}
export function fit(text: string, platform: string) {
  const limit = LIMITS[platform] || 2000;
  if (text.length <= limit) return text;
  return text.slice(0, limit - 1).replace(/\s+\S*$/, '') + '…';
}
/** Meta descriptions are often cut with an ellipsis. End on a full sentence instead. */
export function cleanDesc(d = '') {
  const s = d.replace(/\s+/g, ' ').trim();
  if (!/(…|\.\.\.)$/.test(s)) return s;
  const t = s.replace(/(…|\.\.\.)$/, '').trim();
  const cut = t.lastIndexOf('. ');
  return cut > 40 ? t.slice(0, cut + 1) : t.replace(/[,;:\s]+\S*$/, '') + '.';
}

export function templatePost(o: { platform: string; item: Pick<Item, 'kind' | 'title' | 'description' | 'url'>; tone: number; avoid: string; pick?: number }) {
  const t = TONES[o.tone] || 'Warm';
  const hook = HOOKS[t][(o.pick || 0) % HOOKS[t].length];
  const desc = cleanDesc(o.item.description);
  const tag = o.item.kind === 'work' ? '#ProductDesign #UIUX' : '#DesignNotes #ProductDesign';
  let text: string;
  if (o.platform === 'X') {
    const room = 280 - o.item.url.length - 4 - (hook.length + 1);
    text = `${hook} ${desc.length > room ? desc.slice(0, Math.max(40, room)).replace(/\s+\S*$/, '') + '…' : desc}\n${o.item.url}`;
    if (text.length > 280) text = `${o.item.title.slice(0, 280 - o.item.url.length - 2)}\n${o.item.url}`;
  } else if (o.platform === 'LinkedIn') text = `${hook} ${o.item.title}\n\n${desc}\n\nRead it here: ${o.item.url}\n\n${tag}`;
  else if (o.platform === 'Instagram' || o.platform === 'TikTok') text = `${o.item.title}\n\n${desc}\n\nLink in bio. ${tag}`;
  else text = `${o.item.title}\n\n${desc}\n\nFull case study: ${o.item.url}`;
  return fit(scrub(text, o.avoid), o.platform);
}

async function chat(system: string, user: string): Promise<string | null> {
  const provider = process.env.AI_PROVIDER || 'none';
  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': process.env.AI_API_KEY || '', 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-4-5', max_tokens: 700, system, messages: [{ role: 'user', content: user }] }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}`);
    return ((await res.json()).content?.[0]?.text || '').trim() || null;
  }
  if (provider === 'openai') {
    const res = await fetch(process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.AI_MODEL, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 700 }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}`);
    return ((await res.json()).choices?.[0]?.message?.content || '').trim() || null;
  }
  return null;
}
export const aiProvider = () => process.env.AI_PROVIDER || 'none';

const SYSTEM = (s: APSettings) => `You write social posts for Philip Nosike, a product designer in Abuja. Voice: ${TONES[s.tone] || 'Warm'}, first person, plain words, no hype. Never use these words: ${s.avoid}. No emojis unless the platform expects them. Never invent facts, numbers or clients: use only what is given. Output only the post text.`;

export async function draftPost(o: { platform: string; item: Item; settings: APSettings; pick?: number }): Promise<{ text: string; by: string }> {
  // A caption you already approved in the social asset pipeline always wins.
  const ready = o.item.captions?.[o.platform];
  if (ready) return { text: fit(scrub(ready, o.settings.avoid), o.platform), by: 'ready-made caption' };
  try {
    const out = await chat(SYSTEM(o.settings), `Platform: ${o.platform} (max ${LIMITS[o.platform]} characters).\nSource: ${o.item.kind === 'work' ? 'case study' : 'blog post'} titled "${o.item.title}".\nSummary: ${o.item.description}\nExcerpt: ${o.item.body.slice(0, 1200)}\nLink to include: ${o.item.url}`);
    if (out) return { text: fit(scrub(out, o.settings.avoid), o.platform), by: 'ai' };
  } catch { /* fall back to the template */ }
  return { text: templatePost({ platform: o.platform, item: o.item, tone: o.settings.tone, avoid: o.settings.avoid, pick: o.pick }), by: 'template' };
}

export async function draftOutreach(o: { lead: { name: string; signal: string }; settings: APSettings; projects: string[] }) {
  const names = o.projects.slice(0, 2).join(' and ') || 'recent product work';
  const fallback = {
    why: `Your portfolio work on ${names} is close to what ${o.lead.name} is building.`,
    approach: 'Offer a one-page review of their current flow, with three fixes.',
    msg: `Hi, I saw that ${o.lead.signal || 'you are growing your product team'}. I design product experiences for African markets, most recently ${names}. I put together a short pitch on what I would look at first. Want me to send it over?`,
    art: 'Calm, light glass layout. One bold headline. Show a before and after from your closest project.',
    follow: 'Follow up once in 4 days with the closest case study.',
  };
  try {
    const out = await chat(SYSTEM(o.settings), `Write outreach for a possible client. Return JSON only with keys why, approach, msg, art, follow.\nCompany: ${o.lead.name}\nSignal found on a public page: ${o.lead.signal}\nMy closest projects: ${names}\nmsg must be under 90 words and end with a question.`);
    if (out) return { ...fallback, ...JSON.parse(out.replace(/^```json|```$/g, '')) } as typeof fallback;
  } catch { /* fall back */ }
  return fallback;
}

export function replyToBrief(b: { name: string; kind?: string; message?: string }) {
  const first = (b.name || 'there').split(' ')[0];
  return {
    why: 'They found you and sent a brief themselves, so this is a warm lead.',
    approach: 'Reply within a day. Confirm you read it, name one thing you noticed, and offer a short call.',
    msg: `Hi ${first}, thank you for your brief${b.kind === 'consultation' ? ' and for booking a consultation' : ''}. I read it carefully${b.message ? ` and the part about “${b.message.replace(/\s+/g, ' ').slice(0, 80)}${b.message.length > 80 ? '…' : ''}” stood out` : ''}. Would a 20-minute call this week work to go through scope and timeline?`,
    art: 'Reply with a short intro card and the closest case study.',
    follow: 'Follow up once in 3 days if there is no reply.',
  };
}

export async function draftCover(o: { job: { title: string; company: string; description: string }; settings: APSettings; projects: string[]; siteUrl: string }) {
  const names = o.projects.slice(0, 2).join(' and ');
  const fallback = `Hi,\n\nI am applying for the ${o.job.title} role${o.job.company ? ' at ' + o.job.company : ''}. I am a product designer with 2+ years in industry and 4+ years freelance across fintech, edtech and consumer products${names ? ', including ' + names : ''}. My portfolio is at ${o.siteUrl}.\n\nI would be glad to talk.\n\n${o.settings.signature}`;
  try {
    const out = await chat(SYSTEM(o.settings), `Write a short cover note (under 140 words) for this job. Use only facts given.\nRole: ${o.job.title}${o.job.company ? ' at ' + o.job.company : ''}\nDescription: ${o.job.description.slice(0, 1200)}\nMy projects: ${names}\nPortfolio: ${o.siteUrl}\nSign off: ${o.settings.signature}`);
    if (out) return out;
  } catch { /* fall back */ }
  return fallback;
}
