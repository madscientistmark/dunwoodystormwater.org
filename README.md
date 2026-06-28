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
The build output in `dist/` is a static SPA. Deploy to any static host:
- **Netlify / Vercel:** set build command `npm run build`, publish dir `dist`, and add env var `VITE_APPS_SCRIPT_URL`. Add an SPA redirect (`/* -> /index.html`).
- **GitHub Pages:** build and publish `dist/` (configure a 404 fallback to `index.html` for SPA routing).

## Architecture
- `src/pages` — one component per route (Home, Petition, Share Your Story, About, FAQ, Contact).
- `src/components` — header, footer, forms, signature count, CTA button.
- `src/composables` — `useSubmit` (POST to Apps Script), `useSignatureCount` (GET count).
- `src/lib` — pure validation + field constants.
- `apps-script/Code.gs` — the backend (deploy separately to Google).

All submissions land in a Google Sheet; story photos land in a Google Drive folder.
