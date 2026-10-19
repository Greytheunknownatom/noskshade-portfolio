# Noskshade portfolio: deploy

Static site, no build step.

## Repo layout (this folder IS the repo root)
```
index.html
support.js
image-slot.js
netlify.toml
assets/
```

## Update via Git → GitHub → Netlify
1. Unzip the download.
2. Copy everything inside `deploy/` over your local repo root (replace existing files; delete old files that no longer exist).
3. `git add -A && git commit -m "Update site" && git push`
4. Netlify redeploys automatically. Netlify settings: Base directory empty, Build command empty, Publish directory `.`

If the live site looks old, hard refresh (Ctrl/Cmd + Shift + R) or in Netlify: Deploys → Trigger deploy → Clear cache and deploy site.
