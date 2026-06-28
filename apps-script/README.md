# Google Apps Script Backend Setup

1. Create a new Google Sheet (this stores all submissions).
2. In the Sheet: **Extensions → Apps Script**.
3. Delete any boilerplate and paste the contents of `Code.gs`.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Description: Dunwoody Stormwater API
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when prompted (it needs Sheets + Drive access for photo uploads).
6. Copy the **Web app URL** (ends in `/exec`).
7. In the frontend, set `VITE_APPS_SCRIPT_URL` to that URL (see project `.env`).

The script auto-creates the `Petitions` and `Stories` tabs and a Drive folder
named **Dunwoody Stormwater Photos** on first use. To export, use the Sheet's
**File → Download → CSV**.

### Notes
- Re-deploy (Deploy → Manage deployments → Edit → New version) after editing `Code.gs`.
- Spam protection: a hidden honeypot field silently drops bot submissions.

### Signer roster endpoint
- `GET ?action=list&key=<ROSTER_KEY>` returns `{ok:true, signers:[{name,address,residency,timestamp}]}`.
  Email is intentionally excluded. A wrong/missing key returns `{ok:false}`.
- Set `ROSTER_KEY` in `Code.gs` to a long random string and keep it private. It must
  match `VITE_ROSTER_KEY` in the frontend build (GitHub Actions secret).
- The hidden page that consumes this is the unlinked `/roster-x7k2` route, marked noindex.
