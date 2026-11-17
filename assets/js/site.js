/* Renders the website and CV from content/site.json.
   To change any text on the site, edit content/site.json — no HTML needed. */
(function () {
  "use strict";

  var esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };
  var $ = function (id) { return document.getElementById(id); };
  var set = function (id, html) { var el = $(id); if (el) el.innerHTML = html; };
  var map = function (arr, fn) { return (arr || []).map(fn).join(""); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  function header(d, page) {
    var p = d.person;
    var home = page === "cv" ? "/" : "";
    var cur = function (name) { return page === name ? ' aria-current="page"' : ""; };
    return '' +
      '<div class="wrap">' +
        '<a class="mark" href="/"><b>' + esc(p.initials) + '</b> ' + esc(p.name) + '</a>' +
        '<nav aria-label="Sections"><ul>' +
          '<li><a href="' + home + '#expertise">Expertise</a></li>' +
          '<li class="opt"><a href="' + home + '#work">Work</a></li>' +
          '<li class="opt"><a href="' + home + '#credentials">Credentials</a></li>' +
          '<li><a href="/cv" class="cv-link"' + cur("cv") + '>CV</a></li>' +
          '<li><a href="' + home + '#contact">Contact</a></li>' +
        '</ul></nav>' +
      '</div>';
  }

  function footer(d) {
    return '<div class="wrap"><span>© ' + new Date().getFullYear() + ' ' + esc(d.person.name) +
      '</span><span>' + esc(d.person.headline) + '</span></div>';
  }

  function home(d) {
    var p = d.person, h = d.hero;

    set("hero", '' +
      '<div class="wrap">' +
        '<div>' +
          '<p class="label">' + esc(h.eyebrow) + '</p>' +
          '<h1>' + esc(h.title) + ' <em>' + esc(h.titleEmphasis) + '</em></h1>' +
          '<p class="lede">' + esc(h.lede) + '</p>' +
          '<div class="who">' + map(h.facts, function (f) {
            return '<div><strong>' + esc(f.title) + '</strong><span>' + esc(f.text) + '</span></div>';
          }) + '</div>' +
          '<div class="cta">' +
            '<a class="btn primary" href="#contact">Discuss an assignment</a>' +
            '<a class="btn ghost" href="/cv">View CV</a>' +
          '</div>' +
        '</div>' +
        '<figure class="tee" aria-label="T-shaped expertise: ' + esc(d.specialism.title) + ' applied across sectors">' +
          '<div class="bar">' + map(d.sectors, function (s) {
            return '<div class="cell">' + esc(s.name) + '<small>' + esc(s.tag) + '</small></div>';
          }) + '</div>' +
          '<div class="stem"><span class="label">Deep specialism</span><h3>' + esc(d.specialism.title) + '</h3><ol>' +
            map(d.specialism.layers, function (l) { return '<li>' + esc(l) + '</li>'; }) +
          '</ol></div>' +
          '<figcaption>One governance discipline, applied across sectors.</figcaption>' +
        '</figure>' +
      '</div>');

    set("facts", '<div class="wrap">' + map(d.stats, function (s) {
      return '<div class="fact"><div class="n">' + esc(s.value) + '</div><p>' + esc(s.label) + '</p></div>';
    }) + '</div>');

    set("sectors", map(d.sectors, function (s, i) {
      return '<div class="sector"><span class="label">Sector ' + pad(i + 1) + '</span><h3>' + esc(s.name) +
        '</h3><p>' + esc(s.text) + '</p></div>';
    }));
    set("competencies", map(d.competencies, function (c) { return '<li>' + esc(c) + '</li>'; }));

    var w = d.featuredWork, lead = d.experience[0] || {};
    set("work-head", '<h2>' + esc(w.heading) + '</h2><p>' + esc(w.intro) + '</p>');
    set("work-side", esc(w.sideLabel));
    set("work-role", '' +
      '<div class="meta"><div><h3>' + esc(lead.role) + '</h3><p class="org">' + esc(lead.org) + '</p></div>' +
      '<span class="chip">' + esc(lead.period) + '</span></div>' +
      '<p>' + esc(w.summary) + '</p>' +
      '<div class="ledger">' + map(w.highlights, function (x) {
        return '<div><b>' + esc(x.title) + '</b><span>' + esc(x.text) + '</span></div>';
      }) + '</div>');
    set("partners", map(d.partners, function (x) { return '<span class="p">' + esc(x) + '</span>'; }));

    var f = d.firm;
    set("firm", '' +
      '<div><p class="label">' + esc(f.kind) + '</p><p class="tag">' + esc(f.tagline) + '</p><p>' + esc(f.text) + '</p></div>' +
      '<ul class="services">' + map(f.services, function (s) {
        return '<li><div><b>' + esc(s.title) + '</b><span>' + esc(s.text) + '</span></div></li>';
      }) + '</ul>');
    set("firm-name", esc(f.name));

    set("research", map(d.research, function (r) {
      return '<article class="paper' + (r.featured ? ' feature' : '') + '"><span class="label">' + esc(r.type) +
        '</span><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></article>';
    }));

    var list = function (items) {
      return map(items, function (x) { return '<li>' + esc(x.title) + '<span>' + esc(x.detail) + '</span></li>'; });
    };
    set("education", list(d.education));
    set("certifications", list(d.certifications));
    set("community", list(d.community));

    set("contact-copy", '<p class="label" style="color:color-mix(in srgb,var(--paper) 60%,transparent)">06 / Contact</p>' +
      '<h2>' + esc(d.contact.heading) + '</h2><p>' + esc(d.contact.text) + '</p>');
    set("contact-list", contactList(p));
  }

  function contactList(p) {
    var li = p.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    return '' +
      '<div><dt>Location</dt><dd>' + esc(p.location) + '</dd></div>' +
      '<div><dt>Email</dt><dd><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></dd></div>' +
      '<div><dt>LinkedIn</dt><dd><a href="' + esc(p.linkedin) + '">' + esc(li) + '</a></dd></div>' +
      '<div><dt>Firm</dt><dd>' + esc(p.firm) + '</dd></div>';
  }

  function cv(d) {
    var p = d.person;
    var li = p.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    var two = function (items) {
      return '<ul class="two">' + map(items, function (x) {
        return '<li>' + esc(x.title) + (x.detail ? ', ' + esc(x.detail) : '') + '</li>';
      }) + '</ul>';
    };
    document.title = p.name + " — CV";
    set("cv-doc", '' +
      '<div class="cv-top"><div><h1>' + esc(p.name) + '</h1><p class="sub">' + esc(p.headline) + '</p></div>' +
        '<address>' + esc(p.location) + '<br><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a><br>' +
        '<a href="' + esc(p.linkedin) + '">' + esc(li) + '</a></address></div>' +
      '<h2>Profile</h2><p>' + esc(d.cvProfile) + '</p>' +
      '<h2>Core competencies</h2><ul class="two">' + map(d.competencies, function (c) { return '<li>' + esc(c) + '</li>'; }) + '</ul>' +
      '<h2>Professional experience</h2>' + map(d.experience, function (e) {
        return '<div class="item"><b>' + esc(e.role) + '</b><span class="when">' + esc(e.period) + '</span>' +
          '<span class="org">' + esc(e.org) + '</span>' +
          (e.points && e.points.length ? '<ul>' + map(e.points, function (x) { return '<li>' + esc(x) + '</li>'; }) + '</ul>' : '') +
          '</div>';
      }) +
      '<h2>Education</h2>' + two(d.education) +
      '<h2>Certifications</h2>' + two(d.certifications) +
      '<h2>Research &amp; analysis</h2><ul>' + map(d.research, function (r) {
        return '<li>' + esc(r.title) + ': ' + esc(r.text) + '</li>';
      }) + '</ul>' +
      '<h2>Professional community</h2>' + two(d.community));
  }

  function start(d) {
    var page = document.body.getAttribute("data-page");
    set("site-header", header(d, page));
    set("site-footer", footer(d));
    if (page === "cv") cv(d); else home(d);
    var pr = $("print-cv");
    if (pr) pr.addEventListener("click", function () { window.print(); });
    if (location.hash && page !== "cv") {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }

  fetch("/content/site.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(start)
    .catch(function (e) {
      document.body.insertAdjacentHTML("afterbegin",
        '<p style="padding:16px;background:#8b1a1a;color:#fff">Could not load content/site.json (' + esc(e.message) +
        '). If you just edited it, check the file is valid JSON.</p>');
    });
})();
