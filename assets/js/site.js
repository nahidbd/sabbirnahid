/* Renders the website and CV from content/site.json.
   To change any text on the site, edit content/site.json — no HTML needed. */
(function () {
  "use strict";

  var esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  var $ = function (id) { return document.getElementById(id); };
  var set = function (id, html) { var el = $(id); if (el) el.innerHTML = html; };
  var map = function (arr, fn) { return (arr || []).map(fn).join(""); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var shortUrl = function (u) { return String(u || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); };

  var icon = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    in: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>'
  };

  function header(d, page) {
    var p = d.person, h = page === "cv" ? "/" : "";
    var item = function (href, label, opt) {
      return '<li' + (opt ? ' class="opt"' : '') + '><a href="' + h + href + '">' + label + '</a></li>';
    };
    return '<div class="wrap">' +
      '<a class="mark" href="/"><b>' + esc(p.initials) + '</b><span><strong>' + esc(p.name) + '</strong><small>' + esc(p.headline) + '</small></span></a>' +
      '<nav aria-label="Sections"><ul>' +
        item("#about", "About", true) + item("#expertise", "Expertise", true) + item("#experience", "Experience", true) +
        item("#case", "Work", true) + item("#credentials", "Credentials", true) + item("#contact", "Contact", false) +
        '<li><a class="nav-cv" href="/cv"' + (page === "cv" ? ' aria-current="page"' : '') + '>CV</a></li>' +
      '</ul></nav></div>';
  }

  function footer(d) {
    return '<div class="wrap"><span>© ' + new Date().getFullYear() + ' ' + esc(d.person.name) + '</span><span>' +
      esc(d.person.headline) + '</span></div>';
  }

  function avatar(p) {
    return '<div class="avatar">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">' : esc(p.initials)) + '</div>';
  }

  function home(d) {
    var p = d.person;

    set("profile", '<div class="wrap">' +
      '<div>' +
        '<div class="id">' + avatar(p) + '<p class="mono">' + esc(p.location) + ' · ' + esc(p.timezone) + '</p></div>' +
        '<h1>' + esc(p.name) + '</h1>' +
        '<p class="title">' + esc(p.title) + '</p>' +
        '<p class="summary">' + esc(d.summary) + '</p>' +
        '<div class="actions">' +
          '<a class="btn solid" href="mailto:' + esc(p.email) + '">' + icon.mail + 'Email me</a>' +
          '<a class="btn line" href="' + esc(p.linkedin) + '" rel="noopener">' + icon.in + 'LinkedIn</a>' +
          '<a class="btn line" href="/cv">' + icon.doc + 'View CV</a>' +
        '</div>' +
      '</div>' +
      '<aside class="glance" aria-label="At a glance"><h2>At a glance</h2><dl>' +
        map(d.glance, function (g) { return '<div><dt>' + esc(g.label) + '</dt><dd>' + esc(g.value) + '</dd></div>'; }) +
      '</dl><p class="avail"><i></i>' + esc(p.availability) + '</p></aside>' +
    '</div>');

    set("stats", map(d.stats, function (s) { return '<li><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></li>'; }));

    set("about-text", map(d.about, function (t) { return '<p>' + esc(t) + '</p>'; }));
    set("tee", '<p class="cap">T-shaped expertise: one deep discipline, applied across sectors.</p>' +
      '<div class="bar">' + map(d.sectors, function (s) { return '<div class="cell">' + esc(s.name) + '</div>'; }) + '</div>' +
      '<div class="stem"><strong>' + esc(d.specialism.title) + '</strong><ol style="list-style:none;margin:0;padding:0">' +
        map(d.specialism.layers, function (l) { return '<li>' + esc(l) + '</li>'; }) + '</ol></div>');

    set("skills", map(d.skillGroups, function (g, i) {
      return '<div class="card skill"><h3><span>' + pad(i + 1) + '</span>' + esc(g.title) + '</h3><ul>' +
        map(g.items, function (x) { return '<li>' + esc(x) + '</li>'; }) + '</ul></div>';
    }));
    set("sectors", map(d.sectors, function (s) {
      return '<div class="card sector"><span class="chip">' + esc(s.tag) + '</span><h4>' + esc(s.name) + '</h4><p>' + esc(s.text) + '</p></div>';
    }));

    set("timeline", map(d.experience, function (e) {
      var now = /current|present/i.test(e.period);
      return '<div class="job' + (now ? ' now' : '') + '"><div class="card"><header><h3>' + esc(e.role) + '</h3>' +
        '<span class="chip">' + esc(e.period) + '</span></header><p class="org">' + esc(e.org) + '</p>' +
        (e.points && e.points.length ? '<ul>' + map(e.points, function (x) { return '<li>' + esc(x) + '</li>'; }) + '</ul>' : '') +
        '</div></div>';
    }));
    set("partners", '<span class="mono">Programmes funded by</span>' +
      map(d.partners, function (x) { return '<span class="p">' + esc(x) + '</span>'; }));

    var c = d.caseStudy;
    set("case-study", '<div class="case-head"><div><p class="mono">Case study</p><h3>' + esc(c.name) + '</h3></div>' +
        '<dl><div><dt>Client</dt><dd>' + esc(c.client) + '</dd></div><div><dt>Funded by</dt><dd>' + esc(c.funder) + '</dd></div>' +
        '<div><dt>My role</dt><dd>' + esc(c.role) + '</dd></div></dl></div>' +
      '<div class="case-body"><div class="case-cols">' +
        '<div><h4>The challenge</h4><p>' + esc(c.challenge) + '</p></div>' +
        '<div><h4>The solution</h4><p>' + esc(c.solution) + '</p></div>' +
        '<div><h4>Who uses it</h4><ul>' + map(c.users, function (u) { return '<li>' + esc(u) + '</li>'; }) + '</ul></div>' +
      '</div>' +
      '<div class="contrib">' + map(c.contributions, function (x) {
        return '<div><b>' + esc(x.title) + '</b><span>' + esc(x.text) + '</span></div>';
      }) + '</div></div>');

    set("steps", map(d.approach, function (s) { return '<div class="step"><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div>'; }));

    var f = d.firm;
    set("firm-name", esc(f.name));
    set("firm", '<div><p class="mono">' + esc(f.kind) + '</p><p class="tag">' + esc(f.tagline) + '</p><p>' + esc(f.text) + '</p></div>' +
      '<div class="services">' + map(f.services, function (s) {
        return '<div class="card"><h4>' + esc(s.title) + '</h4><p>' + esc(s.text) + '</p></div>';
      }) + '</div>');

    set("papers", map(d.research, function (r) {
      return '<article class="card paper' + (r.featured ? ' feature' : '') + '"><span class="chip" style="align-self:start">' + esc(r.type) +
        '</span><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></article>';
    }));

    var edu = function (items) {
      return map(items, function (x) { return '<li><b>' + esc(x.title) + '</b>' + (x.detail ? '<span>' + esc(x.detail) + '</span>' : '') + '</li>'; });
    };
    set("education", edu(d.education));
    set("community", edu(d.community));
    set("badges", map(d.certifications, function (c) {
      return '<div class="badge"><b>' + esc(c.short || c.title) + '</b>' + (c.short && c.short !== c.title ? '<span>' + esc(c.title) + '</span>' : '') +
        (c.detail ? '<small>' + esc(c.detail) + '</small>' : '') + '</div>';
    }));

    set("contact", '<div class="wrap"><div><h2>' + esc(d.contact.heading) + '</h2><p>' + esc(d.contact.text) + '</p>' +
        '<div class="actions"><a class="btn solid" href="mailto:' + esc(p.email) + '">' + icon.mail + 'Email me</a>' +
        '<a class="btn line" href="' + esc(p.linkedin) + '" rel="noopener">' + icon.in + 'Connect on LinkedIn</a></div></div>' +
      '<dl>' +
        '<div><dt>Email</dt><dd><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></dd></div>' +
        '<div><dt>LinkedIn</dt><dd><a href="' + esc(p.linkedin) + '" rel="noopener">' + esc(shortUrl(p.linkedin)) + '</a></dd></div>' +
        '<div><dt>Location</dt><dd>' + esc(p.location) + ' (' + esc(p.timezone) + ')</dd></div>' +
        '<div><dt>Availability</dt><dd>' + esc(p.availability) + '</dd></div>' +
      '</dl></div>');
  }

  function cv(d) {
    var p = d.person;
    var two = function (items) {
      return '<ul class="two">' + map(items, function (x) {
        return '<li>' + esc(x.title) + (x.detail ? ', ' + esc(x.detail) : '') + '</li>';
      }) + '</ul>';
    };
    document.title = p.name + " — CV";
    set("cv-doc", '<div class="cv-top"><div><h1>' + esc(p.name) + '</h1><p class="sub">' + esc(p.title) + '</p></div>' +
        '<address>' + esc(p.location) + ' (' + esc(p.timezone) + ')<br><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a><br>' +
        '<a href="' + esc(p.linkedin) + '">' + esc(shortUrl(p.linkedin)) + '</a></address></div>' +
      '<h2>Profile</h2><p>' + esc(d.cvProfile) + '</p>' +
      '<h2>Core competencies</h2><ul class="two">' + map(d.competencies, function (c) { return '<li>' + esc(c) + '</li>'; }) + '</ul>' +
      '<h2>Professional experience</h2>' + map(d.experience, function (e) {
        return '<div class="item"><b>' + esc(e.role) + '</b><span class="when">' + esc(e.period) + '</span>' +
          '<span class="org">' + esc(e.org) + '</span>' +
          (e.points && e.points.length ? '<ul class="bul">' + map(e.points, function (x) { return '<li>' + esc(x) + '</li>'; }) + '</ul>' : '') +
          '</div>';
      }) +
      '<h2>Education</h2>' + two(d.education) +
      '<h2>Certifications</h2>' + two(d.certifications) +
      '<h2>Research &amp; analysis</h2><ul class="bul">' + map(d.research, function (r) {
        return '<li><b>' + esc(r.title) + '.</b> ' + esc(r.text) + '</li>';
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
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(start)
    .catch(function (e) {
      document.body.insertAdjacentHTML("afterbegin",
        '<p style="padding:16px;background:#8b1a1a;color:#fff;margin:0">Could not load content/site.json (' + esc(e.message) +
        '). If you just edited it, check the file is valid JSON.</p>');
    });
})();
