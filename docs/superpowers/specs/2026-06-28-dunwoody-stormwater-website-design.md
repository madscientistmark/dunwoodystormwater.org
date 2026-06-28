# Dunwoody Stormwater Stewardship Initiative — Website Design Spec

**Date:** 2026-06-28
**Status:** Approved

## Overview

A clean, modern, mobile-friendly website for the **Dunwoody Stormwater Stewardship Initiative**, a citizen-led effort promoting transparent and consistent stormwater management in Dunwoody, GA. The site's primary goals are to (1) collect petition signatures, (2) collect resident stories, (3) build credibility/trust, and (4) clearly communicate the mission.

Tone: civic-minded, trustworthy, community-focused. Tagline: *"Because when the rain falls, we all live downstream."*

## Architecture

**Frontend:** Vue 3 (Composition API) + Vite, Vue Router for multi-page navigation, plain CSS with CSS variables for theming (water/civic palette — blues and greens). Builds to static files for deployment to a static host (Netlify / Vercel / GitHub Pages).

**Backend (serverless, no managed infrastructure):** A single **Google Apps Script Web App** bound to a Google Sheet. Custom-branded Vue forms submit to it; data lands in the Sheet; photos land in a Drive folder. This mirrors the Google-backed petition approach used previously, but with fully custom forms rather than Google's own form UI.

The Apps Script Web App exposes one endpoint:
- `POST` (body = JSON as `text/plain`) → append a petition signature OR a story row; handle photo upload to Drive.
- `GET ?action=count` → return `{count: <number>}`, the current petition signature count.

**Data flow:**
```
Vue form  ──POST──►  Apps Script Web App  ──►  Google Sheet (Petitions / Stories tabs) + Drive folder (photos)
Vue page  ──GET───►  Apps Script (count)  ──►  number rendered on Home + Petition
```

**Configuration:** The frontend needs exactly one config value — the Apps Script Web App URL — supplied via env var `VITE_APPS_SCRIPT_URL`. Everything else is static.

## Site Structure & Pages

Vue Router routes. Shared `SiteHeader` (logo + sticky nav, hamburger on mobile) and `SiteFooter` (contact + tagline) on every page.

| Route | Page | Key content |
|---|---|---|
| `/` | Home | Hero ("We All Live Downstream" + Sign CTA), Welcome, Our Mission (6 bullets), Why We Need Your Help, **live signature count**, Sign-the-Petition callout, Share-Your-Story callout |
| `/petition` | Petition | Full petition statement + 5 affirmation points, petition form, live count |
| `/share-your-story` | Share Your Story | Prompt + issue-type list, story form (with photo upload) |
| `/about` | About | Mission/objective copy ("Our objective is not conflict…") |
| `/faq` | FAQ | 4 Q&As: Kingsley Lake, opposing the City, why sign, what happens after |
| `/contact` | Contact | Email + website |

**Navigation:** sticky top nav with the 6 links. Prominent CTA buttons ("Sign the Petition", "Share Your Story") on Home route to `/petition` and `/share-your-story`. Mobile: hamburger menu.

**Shared components:** `SiteHeader`, `SiteFooter`, `PetitionForm`, `StoryForm`, `SignatureCount`, `CtaButton`. Plus a `useSubmit` composable handling the fetch to Apps Script with loading/success/error states.

## Page Content (verbatim from build notes)

### Home
- **Welcome:** "If you are visiting this website, you have probably just read 'We All Live Downstream' in the Dunwoody Crier. Thank you for taking the next step. Stormwater affects every neighborhood in Dunwoody…" (full welcome copy). "This initiative is not about one neighborhood. It is about one city."
- **Our Mission:** "We believe Dunwoody can become a model for stormwater stewardship." 6 bullets: Transparent government; Consistent application of stormwater policies; Responsible stewardship; Sound engineering; Meaningful citizen involvement; Equal treatment for every neighborhood.
- **Why We Need Your Help:** "One signature will not solve this problem. Thousands of signatures can change the conversation…" CTA to sign.

### Petition
- Heading: "Citizens' Petition for Transparent and Consistent Stormwater Management"
- "By signing this petition, I affirm that:" — 5 points: every neighborhood deserves fair/consistent management; policies should be transparent; lakes/ponds/streams/drainage deserve responsible stewardship; citizens deserve meaningful participation; Dunwoody should become a model.

### Share Your Story
- "Every neighborhood has a stormwater story." Issue list: Flooding, Erosion, Drainage problems, Pond issues, Lake issues, Stream bank erosion, Stormwater pipe failures. "We would like to hear your story…"

### About
- "The Dunwoody Stormwater Stewardship Initiative is a citizen-led effort… Our objective is not conflict. Our objective is stewardship. We believe the best solutions occur when citizens, engineers, city staff, elected officials, and neighborhoods work together."

### FAQ
- **Is this only about Kingsley Lake?** No. Kingsley simply reminds us that stormwater affects every neighborhood in Dunwoody.
- **Is this an organization opposing the City?** No. We support responsible stewardship, transparency, and constructive dialogue.
- **Why should I sign?** Your signature demonstrates that residents throughout Dunwoody believe stormwater deserves greater attention and consistent management.
- **What happens after I sign?** You will receive periodic updates about the Initiative, opportunities to participate, and information regarding future meetings and progress.

### Contact
- Email: info@DunwoodyStormwater.org
- Website: www.DunwoodyStormwater.org

## Form Fields & Google Sheet Schema

### Petition form (`/petition`) → **Petitions** sheet tab

| Form field | Type | Required | Sheet column |
|---|---|---|---|
| Full name | text | ✓ | `name` |
| Email | email | ✓ | `email` |
| Street address or neighborhood | text | — | `address` |
| Are you a Dunwoody resident? | radio: Yes / No / I own property but live elsewhere | ✓ | `residency` |
| Comments | textarea | — | `comments` |
| Send me periodic updates | checkbox (Yes/No) | — | `updates_optin` |
| Affirmation: "I affirm the statements above" | checkbox | ✓ (must be checked to submit) | `affirmed` |
| _(auto)_ timestamp | — | — | `timestamp` |
| _(auto)_ source/page | — | — | `source` |

### Story form (`/share-your-story`) → **Stories** sheet tab

| Form field | Type | Required | Sheet column |
|---|---|---|---|
| Name | text | ✓ | `name` |
| Email | email | ✓ | `email` |
| Neighborhood | text | — | `neighborhood` |
| Issue type(s) | checkboxes: Flooding, Erosion, Drainage, Pond, Lake, Stream bank erosion, Pipe failures | — | `issue_types` (comma-joined) |
| Your story | textarea | ✓ | `story` |
| Photo | file (image, optional, single) | — | `photo_url` (Drive link) |
| _(auto)_ timestamp / source | — | — | `timestamp`, `source` |

### Count endpoint
`GET ?action=count` → `{count: <number of data rows in Petitions>}`. Real count, starting at 0.

## Photo Upload Mechanics

File is base64-encoded client-side and POSTed in the JSON body. Apps Script decodes it, saves to a designated Drive folder, sets sharing to "anyone with link can view," and writes the resulting URL into `photo_url`. Limits: one image, ~5 MB max, types jpg/png/webp. Validated both client-side (before encoding) and server-side.

## Validation & Error Handling

**Client-side validation:** required fields enforced before submit; email format checked; affirmation checkbox must be checked or the Sign button stays disabled; photo type/size validated before encoding. Inline error messages under each field.

**Submission states** (`useSubmit` composable): idle → submitting (button spinner, disabled) → success (form replaced with thank-you message; petition success nudges sharing) → error (friendly message + "try again," plus a mailto fallback to info@DunwoodyStormwater.org so a submission is never fully lost).

**Apps Script side:** validates required fields server-side; applies honeypot + minimum time-on-page spam checks (silently drops failures); handles request as `text/plain` to avoid CORS preflight (documented Apps Script workaround); returns JSON `{ok: true}` or `{ok: false, error}`.

**Count failure:** if the count fetch fails, `SignatureCount` hides gracefully; the rest of the page is unaffected.

**Spam protection (no email service):** hidden honeypot field + minimum time-on-page check, validated in Apps Script.

## Testing

- **Vitest + Vue Test Utils** unit/component tests: form validation logic, affirmation-gating (Sign button disabled until checked), `useSubmit` composable (mocked fetch, success/error states), `SignatureCount` rendering states (loading / number / hidden-on-error).
- Apps Script tested manually against a test sheet (external infra, not unit-testable in the Vue repo).

## Deliverables

1. Vue 3 + Vite project producing static build output.
2. All 6 pages with real content from build notes.
3. Custom-branded petition + story forms wired to Apps Script.
4. `apps-script/Code.gs` — complete Google Apps Script, ready to paste into script.google.com, with setup instructions.
5. `README.md` — local dev, build, deploy (Netlify/Vercel/GitHub Pages), and step-by-step Google Sheet + Apps Script setup including the env var.
6. Vitest test suite.

## Non-Goals (YAGNI)

- No own server or database (Google Sheets/Drive is the backend).
- No double opt-in email verification at launch (honeypot/timing spam protection only).
- No seed/offset on the signature count (real count, starting at 0).
- No CMS — content is in Vue components/source.
