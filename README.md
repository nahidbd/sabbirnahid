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
  "edition": "Nogor Edition",
  "date": "2026-11-19",
  "type": "Newspaper article",
  "url": "https://...",
  "summary": "One sentence on what the article argues."
}
```

## Files

| File | Purpose |
|---|---|
| `content/site.json` | All website and CV text |
| `index.html` | Website page layout |
| `cv.html` | CV page layout (served at `/cv`) |
| `assets/css/style.css` | Design: colours, fonts, layout |
| `assets/js/site.js` | Builds the pages from `site.json` |
| `_headers` | Security headers for Cloudflare Pages |

## Hosting

Cloudflare Pages, connected to this repository (branch `main`). No build command; output directory is the repository root (`/`). Each commit to `main` deploys automatically; other branches get preview URLs.

To use a custom domain: Cloudflare dashboard → Workers & Pages → this project → Custom domains.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
