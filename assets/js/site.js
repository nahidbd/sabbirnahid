/* Browser side: re-renders from content/site.json (so local previews and fresh edits always show),
   wires up buttons. The Cloudflare Pages Function already sends fully rendered HTML to visitors and crawlers. */
import { renderPage } from "./render.mjs";

var page = document.body.getAttribute("data-page");

function spy() {
  var rail = document.querySelector(".rail");
  if (!rail || page !== "home") return;
  var map = {};
  [].slice.call(rail.querySelectorAll('nav a[href^="#"]')).forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));
    if (s) map[a.getAttribute("href").slice(1)] = { a: a, s: s };
  });
  var ticking = false;
  function update() {
    ticking = false;
    var cur = null, y = window.innerHeight * 0.4;
    Object.keys(map).forEach(function (id) { if (map[id].s.getBoundingClientRect().top <= y) cur = id; });
    Object.keys(map).forEach(function (id) { if (id === cur) map[id].a.setAttribute("aria-current", "location"); else map[id].a.removeAttribute("aria-current"); });
    var h = document.documentElement, max = h.scrollHeight - window.innerHeight;
    rail.style.setProperty("--p", max > 0 ? Math.min(1, h.scrollTop / max).toFixed(3) : 0);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function wire() {
  var pr = document.getElementById("print-cv");
  if (pr) pr.addEventListener("click", function () { window.print(); });
  spy();
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
