# Dunwoody Stormwater Stewardship Initiative — Website

Vue 3 + Vite static site with custom petition and story forms backed by Google Apps Script + Google Sheets.

## Prerequisites
- Node 18+

## Setup
```bash
npm install
cp .env.example .env   # then edit VITE_APPS_SCRIPT_URL
```

Set `VITE_APPS_SCRIPT_URL` to your deployed Apps Script Web App URL. See `apps-script/README.md` to create it.

## Develop
```bash
npm run dev
```

## Test
```bash
npm run test
```

## Build (static output in dist/)
```bash
npm run build
npm run preview   # preview the production build locally
```

## Deploy

### GitHub Pages (current setup)
This repo auto-deploys to GitHub Pages on every push to `main` via
`.github/workflows/deploy.yml`. The workflow runs tests, builds, copies
`index.html` → `404.html` (SPA fallback), and publishes `dist/`.

Required one-time config in the GitHub repo:
- **Settings → Secrets and variables → Actions →** add secret
  `VITE_APPS_SCRIPT_URL` = the Apps Script `/exec` URL (kept out of git).
- **Settings → Pages →** Source: **GitHub Actions**.
- Custom domain `www.dunwoodystormwater.org` is set via `public/CNAME`
  (copied into the build). Configure DNS at your registrar (see below).

### Other static hosts
The build output in `dist/` is a static SPA and works on any static host:
- **Netlify / Vercel:** build command `npm run build`, publish dir `dist`,
  env var `VITE_APPS_SCRIPT_URL`, SPA redirect (`/* -> /index.html`).

## Architecture
- `src/pages` — one component per route (Home, Petition, Share Your Story, About, FAQ, Contact).
- `src/components` — header, footer, forms, signature count, CTA button.
- `src/composables` — `useSubmit` (POST to Apps Script), `useSignatureCount` (GET count).
- `src/lib` — pure validation + field constants.
- `apps-script/Code.gs` — the backend (deploy separately to Google).

All submissions land in a Google Sheet; story photos land in a Google Drive folder.
