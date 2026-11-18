'use server';
// LEARN (lesson 5): a Server Action. The form in the browser calls this function directly, but it runs
// on the server, so it can save to the database and use the email key without exposing either.
import { getServices, saveEnquiry } from '@/lib/content';
import { estimate, money, type Currency, type Selection } from '@/lib/services';

export interface EnquiryResult { ok: boolean; error?: string; summary?: string }

const clean = (v: FormDataEntryValue | null, max = 2000) => String(v ?? '').trim().slice(0, max);

export async function submitEnquiry(_prev: EnquiryResult | null, form: FormData): Promise<EnquiryResult> {
  // Honeypot: real people never fill this hidden field; bots usually do.
  if (clean(form.get('company_site'))) return { ok: true };

  const name = clean(form.get('name'), 120);
  const email = clean(form.get('email'), 200);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Please add your name and a valid email.' };

  const d = await getServices();
  const currency = (clean(form.get('currency')) === 'USD' ? 'USD' : 'NGN') as Currency;
  const kind = clean(form.get('kind'), 20) === 'consultation' ? 'consultation' : 'project';
  const sel: Selection = {
    type: clean(form.get('type'), 40), size: clean(form.get('size'), 10),
    extras: form.getAll('extras').map((x) => clean(x, 40)), process: clean(form.get('process'), 20), team: clean(form.get('team'), 20),
  };
  const est = kind === 'project' ? estimate(d, sel) : null;
  const addons = form.getAll('addons').map((x) => clean(x, 40));

  const enquiry = {
    receivedAt: new Date().toISOString(), kind, name, email,
    phone: clean(form.get('phone'), 40), company: clean(form.get('company'), 120),
    plan: clean(form.get('plan'), 20), budget: clean(form.get('budget'), 60), start: clean(form.get('start'), 60),
    message: clean(form.get('message'), 4000), currency, selection: sel, addons, estimate: est,
  };
  try {
    await saveEnquiry(enquiry);
  } catch (e) {
    console.error('Saving enquiry failed', e);
    return { ok: false, error: 'Sorry, your brief could not be sent just now. Please email or WhatsApp me instead.' };
  }

  const typeName = d.estimator.projectTypes.find((t) => t.id === sel.type)?.name ?? '';
  const summary = kind === 'consultation'
    ? `Design consultation${addons.length ? ' + ' + addons.map((a) => d.consultation.addons.find((x) => x.id === a)?.name).filter(Boolean).join(', ') : ''}`
    : est
      ? `${typeName}, about ${est.totalWeeks} weeks, ${money(d, currency, est.low[currency])}–${money(d, currency, est.high[currency])}`
      : 'Project enquiry';

  await notify(enquiry, summary).catch(() => {});
  return { ok: true, summary };
}

// Email via Resend's free plan, only when RESEND_API_KEY and ENQUIRY_EMAIL_TO are set in Netlify.
// The email has one-tap buttons to reply in Gmail or on WhatsApp.
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
async function notify(e: Record<string, any>, summary: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL_TO;
  if (!key || !to) return;
  const first = String(e.name || '').split(' ')[0];
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(e.email)}&su=${encodeURIComponent('Re: your brief for Noskshade Studio')}&body=${encodeURIComponent(`Hi ${first},\n\nThanks for your brief (${summary}). `)}`;
  const phone = String(e.phone || '').replace(/[^\d+]/g, '').replace(/^0/, '234').replace(/^\+/, '');
  const skip = new Set(['receivedAt', 'company_site']);
  const rows = Object.entries(e).filter(([k, v]) => !skip.has(k) && v !== '' && v != null && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;font-size:14px;color:#0c1d3d">${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`).join('');
  const btn = (href: string, label: string, bg: string) => `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:50px;background:${bg};color:#fff;font-weight:700;font-size:14px;text-decoration:none">${label}</a>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#f5f8fb;border-radius:20px">
    <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0369a1">New brief · Noskshade Studio</div>
    <h1 style="margin:8px 0 4px;font-size:22px;color:#0c1d3d">${esc(e.name)} sent a brief</h1>
    <p style="margin:0 0 18px;color:#334155">${esc(summary)}</p>
    ${btn(gmail, 'Reply in Gmail', '#0284c7')}${phone ? btn(`https://wa.me/${phone}`, 'Reply on WhatsApp', '#16a34a') : ''}
    <table style="margin-top:12px;width:100%;border-collapse:collapse;background:#fff;border-radius:14px;padding:12px">${rows}</table>
    <p style="margin-top:16px;font-size:12px;color:#64748b">Also saved in your admin under Enquiries.</p></div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Noskshade site <onboarding@resend.dev>', to: [to], reply_to: e.email, subject: `New brief from ${e.name}: ${summary}`, html }),
  });
}
