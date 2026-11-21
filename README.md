# Sabbir Ahmed Nahid — personal website

Professional website and online CV, hosted free on Cloudflare Pages and deployed automatically from this GitHub repository.

- Website: `/`
- CV: `/cv` (the "Download as PDF" button opens the browser's print dialog; choose "Save as PDF")

## How to update the content

All text on the website **and** the CV comes from one file: **`content/site.json`**.

1. Open `content/site.json` on GitHub and click the pencil icon (Edit).
2. Change the text you need — for example add a job to `experience`, a certificate to `certifications`, or a new item to `research`.
3. Click **Commit changes**.
4. Cloudflare rebuilds the site automatically; the change is live within about a minute.

Rules for editing JSON:
- Keep text inside double quotes `"..."`. To use a double quote inside text, write `\"`.
- Items in a list are separated by commas, with **no comma after the last item**.
- If the site shows a red "Could not load content/site.json" bar after an edit, the JSON has a typo — check commas and quotes, or paste the file into https://jsonlint.com.

### Adding a past job (example)

```json
{
  "role": "Your job title",
  "org": "Organisation · Project name",
  "period": "2019 – 2022",
  "points": [
    "First achievement.",
    "Second achievement."
  ]
}
```

Add it inside the `"experience": [ ... ]` list, separated from its neighbours by commas.

### Adding an article (example)

Add an entry to the `"writing": [ ... ]` list. Articles are sorted newest first automatically and appear on the website (Writing section) and on the CV page.

```json
{
  "title": "Headline of the article",
  "outlet": "Business Mirror",
  "date": "2026-11-19",
  "type": "Op-ed",
  "url": "https://...",
  "print": { "label": "Print: Nogor Edition, 19 Nov 2026, p. 4", "url": "https://epaper..." },
  "summary": "One or two sentences on what the article argues.",
  "tags": ["E-Governance"]
}
```

## SEO

- `functions/_middleware.js` (a Cloudflare Pages Function) fills each page with its content from `content/site.json` before it is sent, so search engines and LinkedIn/WhatsApp/Facebook link previews see the full page. `_routes.json` limits it to the two HTML pages.
- Page titles, descriptions, keywords and the social image are set in the `"seo"` block of `content/site.json`.
- Structured data (schema.org Person, ProfilePage, WebSite and one NewsArticle per entry in `writing`) is generated automatically.
- **Search engine verification:** paste the code from Google Search Console into `"googleVerification"` (or from Bing Webmaster Tools into `"bingVerification"`) and commit.
- When you add a page or move to a custom domain, update `seo.url`, `robots.txt` and `sitemap.xml`.

## Files

| File | Purpose |
|---|---|
| `content/site.json` | All website and CV text |
| `index.html` | Website page layout |
| `cv.html` | CV page layout (served at `/cv`) |
| `assets/css/style.css` | Design: colours, fonts, layout |
| `assets/js/site.js` | Browser script (print button; renders pages when previewed locally) |
| `_headers` | Security and caching headers for Cloudflare Pages |
| `functions/_middleware.js` | Server-side rendering for search engines and link previews |
| `assets/js/render.mjs` | Shared renderer used by the browser and the Function |
| `robots.txt`, `sitemap.xml` | Search engine crawling instructions and page list |
| `assets/img/og.png` | Image shown when the site is shared on social media |

## Hosting

Cloudflare Pages, connected to this repository (branch `main`). No build command; output directory is the repository root (`/`). Each commit to `main` deploys automatically; other branches get preview URLs.

To use a custom domain: Cloudflare dashboard → Workers & Pages → this project → Custom domains.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
