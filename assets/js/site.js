/* Browser side: re-renders from content/site.json (so local previews and fresh edits always show),
   wires up buttons. The Cloudflare Pages Function already sends fully rendered HTML to visitors and crawlers. */
import { renderPage } from "./render.mjs";

var page = document.body.getAttribute("data-page");

function wire() {
  var pr = document.getElementById("print-cv");
  if (pr) pr.addEventListener("click", function () { window.print(); });
}

if (document.body.hasAttribute("data-ssr")) {
  wire();
} else {
  fetch("/content/site.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (d) {
      var parts = renderPage(d, page);
      Object.keys(parts).forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = parts[id]; });
      wire();
      if (location.hash && page !== "cv") { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    })
    .catch(function (e) {
      document.body.insertAdjacentHTML("afterbegin",
        '<p style="padding:16px;background:#8b1a1a;color:#fff;margin:0">Could not load content/site.json (' + String(e.message) +
        '). If you just edited it, check the file is valid JSON.</p>');
    });
}
