# Autopilot: setup (once)

Autopilot lives at **/admin/autopilot**. It turns your published journal posts and case studies into drafts for LinkedIn, Instagram, X, TikTok, Behance and Dribbble, turns your Services briefs into client leads, and finds jobs from public feeds you add. Nothing posts unless you approve it, or you switch Posting to Automatic.

## 1. Database (2 minutes)
Supabase → SQL Editor → New query → paste `supabase/update-4-autopilot.sql` → Run.

## 2. Secret settings
Add these on your host (Netlify → Site configuration → Environment variables, or Vercel → Settings → Environment Variables), then redeploy once.

| Name | What | Needed for |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → Secret keys → default (starts with `sb_secret_`; older projects: the `service_role` key). Never share it. | scheduled runs |
| `CRON_SECRET` | Any long random text (20+ characters) you make up | scheduled runs |
| `AI_PROVIDER` | `anthropic` or `openai` (leave out for simple templates) | better writing |
| `AI_API_KEY`, `AI_MODEL` | from that provider | better writing |
| `LINKEDIN_TOKEN`, `LINKEDIN_AUTHOR_URN` | LinkedIn developer app | auto-post to LinkedIn |
| `X_TOKEN` | X developer app (user token) | auto-post to X |
| `IG_TOKEN`, `IG_USER_ID` | Instagram professional account via Meta | auto-post to Instagram |

Without a platform token Autopilot still writes the post and you press Copy and post it yourself. TikTok, Behance and Dribbble are always copy-and-post.

## 3. Three runs a day (free, uses GitHub not Netlify credits)
GitHub repo → Settings → Secrets and variables → Actions → New secret:
- `AUTOPILOT_URL` = your site address, e.g. `https://thenoskshade.netlify.app`
- `CRON_SECRET` = the same text you used above

The workflow `.github/workflows/autopilot.yml` then runs at 06:00, 12:00 and 18:00 Abuja time. Test it from the Actions tab → Autopilot → Run workflow.

## How the pieces connect
- Content: `src/lib/autopilot/content.ts` reads the same published posts and case studies your site shows.
- Brain: `src/lib/autopilot/engine.ts` (draft, approve, publish, scan).
- Page: `src/app/admin/(panel)/autopilot/`.
- Scheduled entry point: `src/app/api/autopilot/run/route.ts` (locked by `CRON_SECRET`).
