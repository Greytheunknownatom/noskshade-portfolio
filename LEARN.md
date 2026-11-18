# Learning notes for this codebase

These are short pointers. The full lessons live in the **"Rebuilding Noskshade: Next.js + Supabase build log"** doc.
Look for `// LEARN (lesson N):` comments in the code to see where each lesson applies.

## Map of the project

| Path | What it is | Lesson |
|---|---|---|
| `src/app/layout.tsx` | Wraps every page: fonts, SEO tags, nav | 2 |
| `src/components/SiteNav.tsx` | Top nav + mobile tab bar (client component) | 2 |
| `src/app/blog/page.tsx` | Journal list, rendered on the server | 4 |
| `src/app/blog/BlogIndex.tsx` | Filters + search (client component) | 4 |
| `src/app/blog/[slug]/page.tsx` | One article, static + cached | 4 |
| `src/lib/content/` | Where content comes from: local JSON now, Supabase later | 3 |
| `content/*.json` | The local stand-in for the database | 3 |
| `supabase/schema.sql` | Tables, security rules and storage for Supabase | 3 |
| `tools/dc2jsx.py` | One-off tool that converted the old site's markup to JSX | 2 |

## Commands

```bash
npm install        # once, to download the libraries
npm run dev        # local site at http://localhost:3000, updates as you save
npm run build      # the production build Netlify runs
```

## The three ideas to hold onto

1. **Server components by default.** A page runs on the server and sends finished HTML. Only files that start with `'use client'` send JavaScript to the phone.
2. **Content is data.** Pages ask `src/lib/content` for posts; they never know if it came from JSON or Supabase.
3. **Cache, then refresh on demand.** Pages are built once and cached. When you save in the admin, only the pages that changed are rebuilt.

## Services page (lesson 5)

| Path | What it is |
|---|---|
| `content/services.json` | All plans, prices (₦ and $), timelines, add-ons and processes. **Sample figures: replace them.** |
| `src/lib/services.ts` | The estimate maths (timeline + price range) |
| `src/app/services/ServicesClient.tsx` | Plans, consultation, process tabs, onboarding form, live estimate |
| `src/app/services/actions.ts` | Server Action: saves the brief, emails you |
| `src/components/ProjectCta.tsx` | "Want a project like this?" tile, links to `/services?type=…` |

### Turning on email notifications (free)
1. Sign up at resend.com (free plan) and create an API key.
2. In Netlify: Site configuration → Environment variables → add `RESEND_API_KEY` (the key) and `ENQUIRY_EMAIL_TO` (your email).
3. Redeploy. Every brief now arrives in your inbox; replying goes straight to the client.

## Admin (lesson 6)

| Path | What it is |
|---|---|
| `src/app/admin/login` | Sign-in page (email + password, checked by Supabase) |
| `src/app/admin/(panel)/layout.tsx` | Guards every admin page; sidebar |
| `src/app/admin/(panel)/posts` | Posts list and the block editor |
| `src/app/admin/(panel)/services` | Prices, plans, add-ons, contact buttons |
| `src/app/admin/(panel)/enquiries` | Client briefs with status |
| `src/app/admin/actions.ts` | All admin Server Actions (save, delete, upload, status) |
| `src/lib/admin/auth.ts` | Login, cookies, token refresh |
| `src/lib/admin/data.ts` | Reads/writes: Supabase, or local JSON when not connected |

Local admin without Supabase: put `ADMIN_DEV_PASSWORD=something` in `.env.development.local`, run `npm run dev`, open `/admin`.

## Lesson 8: editing case studies from the admin
Designed case studies keep their hand-made layout. The admin saves *overrides* in the `case_studies` table:
title, intro, the "at a glance" text, cover, sharing description and a design-flow gallery. Empty fields keep the
designed text. `LegacyShell` merges the overrides into the page values (`v.cb`, `v.ov`), and the case page adds
`<CaseFlow>` under it. New case studies (`card.custom = true`) use the standard template in `CaseExtras.tsx`, and
`/work/[slug]` builds them on their first visit (`dynamicParams = true`).

## Lesson 9: counting visits without slowing anything down
`components/Track.tsx` sends one small row per page view straight to Supabase (page, source, device, rough country
from the time zone). No cookies, no IP addresses. The admin's Visits page calls `visit_stats()` in the database,
so the sums happen there and the admin never downloads every row. Setup: run `supabase/update-2.sql` once.

## Lesson 10: brief emails with Resend
When `RESEND_API_KEY` and `ENQUIRY_EMAIL_TO` are set in Netlify, every brief is emailed to you with
"Reply in Gmail" and "Reply on WhatsApp" buttons. Resend's test sender (onboarding@resend.dev) can only send to
the email you signed up with, which is exactly what we need.
