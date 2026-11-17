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

// Email via Resend's free plan, only when RESEND_API_KEY is set (step-by-step setup in LEARN.md).
async function notify(e: Record<string, unknown>, summary: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL_TO;
  if (!key || !to) return;
  const lines = Object.entries(e).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Noskshade site <onboarding@resend.dev>', to: [to], reply_to: e.email, subject: `New enquiry: ${summary}`, text: lines }),
  });
}
