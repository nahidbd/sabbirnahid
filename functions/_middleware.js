// Cloudflare Pages Function: fills each HTML page with its content from content/site.json
// before it leaves the server, so search engines, LinkedIn/WhatsApp/Facebook previews and
// visitors without JavaScript all see the full page. If anything goes wrong, the plain page is served.
import { renderPage, headFor } from "../assets/js/render.mjs";

const PAGES = { "/": "home", "/index.html": "home", "/cv": "cv", "/cv/": "cv", "/cv.html": "cv" };

export async function onRequest(ctx) {
  const res = await ctx.next();
  const url = new URL(ctx.request.url);
  const page = PAGES[url.pathname];
  if (!page || !(res.headers.get("content-type") || "").includes("text/html")) return res;

  try {
    const jr = await ctx.env.ASSETS.fetch(new URL("/content/site.json", url));
    if (!jr.ok) return res;
    const d = await jr.json();
    d.year = new Date().getUTCFullYear();
    const parts = renderPage(d, page);
    const head = headFor(d, page);

    let rw = new HTMLRewriter()
      .on("title", { element(e) { e.setInnerContent(head.title); } })
      .on('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"]', {
        element(e) { e.remove(); }
      })
      .on("head", { element(e) { e.append(head.html, { html: true }); } })
      .on("body", { element(e) { e.setAttribute("data-ssr", ""); } });
    for (const [id, html] of Object.entries(parts)) {
      rw = rw.on("#" + id, { element(e) { e.setInnerContent(html, { html: true }); } });
    }
    const out = rw.transform(res);
    const h = new Headers(out.headers);
    h.set("Cache-Control", "public, max-age=0, s-maxage=300");
    return new Response(out.body, { status: out.status, headers: h });
  } catch (err) {
    return res;
  }
}
