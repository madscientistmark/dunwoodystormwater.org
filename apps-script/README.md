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
- Spam protection: a honeypot field and a minimum fill-time check silently drop bot submissions.
