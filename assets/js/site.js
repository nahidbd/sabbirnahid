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

  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var parts = function (iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); return m ? { y: m[1], m: MONTHS[+m[2] - 1], d: +m[3] } : null; };
  var longDate = function (iso) { var p = parts(iso); return p ? p.d + " " + p.m + " " + p.y : esc(iso); };
  var byDate = function (arr) { return (arr || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }); };

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
      '<a class="mark" href="/"><b>' + esc(p.initials) + '</b><span><strong>' + esc(p.name) + '</strong><small>' + esc(p.shortHeadline || p.headline) + '</small></span></a>' +
      '<nav aria-label="Sections"><ul>' +
        item("#about", "About", true) + item("#expertise", "Expertise", true) + item("#experience", "Experience", true) +
        item("#case", "Work", true) + item("#writing", "Writing", true) + item("#credentials", "Credentials", true) + item("#contact", "Contact", false) +
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

    set("expertise-grid", map(d.expertise, function (x, i) {
      return '<div class="card xcard"><h3><span>' + pad(i + 1) + '</span>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p>' +
        (x.tags && x.tags.length ? '<div class="tags">' + map(x.tags, function (t) { return '<span class="chip">' + esc(t) + '</span>'; }) + '</div>' : '') +
        '</div>';
    }));
    set("sectors", map(d.sectors, function (s) {
      return '<div class="card sector"><span class="chip">' + esc(s.tag) + '</span><h4>' + esc(s.name) + '</h4><p>' + esc(s.text) + '</p></div>';
    }));

    var groupsHtml = function (groups) {
      return map(groups, function (g) {
        return '<div class="grp">' + (g.title ? '<h4>' + esc(g.title) + '</h4>' : '') +
          '<ul>' + map(g.items, function (x) { return '<li>' + esc(x) + '</li>'; }) + '</ul></div>';
      });
    };
    set("timeline", map(d.experience, function (e, i) {
      var n = (e.groups || []).reduce(function (t, g) { return t + (g.items || []).length; }, 0);
      var body = groupsHtml(e.groups);
      var open = i < 2 || n <= 1;
      return '<div class="job' + (e.current ? ' now' : '') + '"><div class="card"><header><h3>' + esc(e.role) + '</h3>' +
        '<span class="chip">' + esc(e.period) + '</span></header>' +
        '<p class="org">' + esc(e.org) + '</p>' + (e.project ? '<p class="proj">' + esc(e.project) + '</p>' : '') +
        (n ? (open ? body : '<details><summary><span class="more">Show responsibilities (' + n + ')</span><span class="less">Hide responsibilities</span></summary>' + body + '</details>') : '') +
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

    set("projects", map(d.projects, function (x) {
      return '<article class="card pcard"><h3>' + esc(x.name) + '</h3><p class="meta">' + esc(x.funder) + ' · ' + esc(x.period) + '</p><p>' + esc(x.text) + '</p></article>';
    }));

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

    set("writing-list", byDate(d.writing).length ? map(byDate(d.writing), function (w) {
      var dt = parts(w.date);
      return '<article class="card wpost">' +
        '<time datetime="' + esc(w.date) + '">' + (dt ? '<b>' + dt.d + '</b>' + dt.m + ' ' + dt.y : esc(w.date)) + '</time>' +
        '<div><span class="chip">' + esc(w.type || "Article") + '</span>' +
        '<h3><a href="' + esc(w.url) + '" rel="noopener">' + esc(w.title) + '</a></h3>' +
        '<p class="src">' + esc(w.outlet) + (w.edition ? ' · ' + esc(w.edition) : '') + '</p>' +
        (w.summary ? '<p class="sum">' + esc(w.summary) + '</p>' : '') +
        '<p class="wlinks"><a href="' + esc(w.url) + '" rel="noopener">Read online →</a>' +
        (w.print && w.print.url ? '<a href="' + esc(w.print.url) + '" rel="noopener">' + esc(w.print.label || "Print edition") + ' →</a>' : '') + '</p>' +
        (w.tags && w.tags.length ? '<div class="tags">' + map(w.tags, function (t) { return '<span class="chip">' + esc(t) + '</span>'; }) + '</div>' : '') +
        '</div></article>';
    }) : '<p>Articles will appear here.</p>');

    var edu = function (items) {
      return map(items, function (x) { return '<li><b>' + esc(x.title) + '</b>' + (x.detail ? '<span>' + esc(x.detail) + '</span>' : '') + '</li>'; });
    };
    set("education", edu(d.education));
    set("languages", edu(d.languages));
    set("memberships", map(d.memberships, function (m) { return '<li>' + esc(m) + '</li>'; }));
    set("additional", map(d.additional, function (x) {
      return '<li><b>' + esc(x.role) + '</b><span>' + esc(x.org) + ' · ' + esc(x.period) + '</span>' + (x.text ? '<p>' + esc(x.text) + '</p>' : '') + '</li>';
    }));
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
        (p.phone ? '<div><dt>Phone</dt><dd><a href="tel:' + esc(p.phone.replace(/\s/g, '')) + '">' + esc(p.phone) + '</a></dd></div>' : '') +
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
    set("cv-doc", '<div class="cv-top"><div><h1>' + esc(p.name) + '</h1><p class="sub">' + esc(p.title) + '</p>' +
        '<p style="font-size:13.5px;color:var(--muted);margin-top:6px">' + esc(p.headline) + '</p></div>' +
        '<address>' + esc(p.location) + '<br>' + (p.phone ? esc(p.phone) + '<br>' : '') +
        '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a><br>' +
        '<a href="' + esc(p.linkedin) + '">' + esc(shortUrl(p.linkedin)) + '</a></address></div>' +
      '<h2>Professional profile</h2><p>' + esc(d.cvProfile) + '</p>' +
      '<h2>Thematic expertise</h2><dl class="x">' + map(d.expertise, function (x) {
        return '<dt>' + esc(x.title) + '</dt><dd>' + esc(x.text) + '</dd>';
      }) + '</dl>' +
      '<h2>Professional experience</h2>' + map(d.experience, function (e) {
        return '<div class="item"><b>' + esc(e.org) + '</b><span class="when">' + esc(e.period) + '</span>' +
          (e.project ? '<span class="proj">' + esc(e.project) + '</span>' : '') +
          '<span class="org"><i>' + esc(e.role) + '</i></span>' +
          map(e.groups, function (g) {
            return (g.title ? '<h5>' + esc(g.title) + '</h5>' : '') +
              '<ul class="bul">' + map(g.items, function (x) { return '<li>' + esc(x) + '</li>'; }) + '</ul>';
          }) + '</div>';
      }) +
      '<h2>Additional activities</h2>' + map(d.additional, function (x) {
        return '<div class="item"><b>' + esc(x.role) + '</b><span class="when">' + esc(x.period) + '</span><span class="org">' + esc(x.org) + '</span>' +
          (x.text ? '<ul class="bul"><li>' + esc(x.text) + '</li></ul>' : '') + '</div>';
      }) +
      '<h2>Selected project deliverables</h2><dl class="x">' +
        '<dt>' + esc(d.caseStudy.name) + ' (' + esc(d.caseStudy.funder) + ')</dt><dd>' + esc(d.caseStudy.solution) + '</dd>' +
        map(d.projects, function (x) { return '<dt>' + esc(x.name) + ' (' + esc(x.funder) + ')</dt><dd>' + esc(x.text) + '</dd>'; }) +
      '</dl>' +
      '<h2>Education</h2>' + two(d.education) +
      '<h2>Certifications</h2>' + two(d.certifications) +
      '<h2>Professional memberships</h2><ul class="two">' + map(d.memberships, function (m) { return '<li>' + esc(m) + '</li>'; }) + '</ul>' +
      '<h2>Languages</h2>' + two(d.languages) +
      (d.writing && d.writing.length ? '<h2>Articles &amp; publications</h2><ul class="bul">' + map(byDate(d.writing), function (w) {
        return '<li><b>' + esc(w.title) + '.</b> ' + esc(w.outlet) + (w.edition ? ', ' + esc(w.edition) : '') + ', ' + longDate(w.date) +
          (w.print && w.print.label ? ' (' + esc(w.print.label.replace(/^Print:\s*/, 'print: ')) + ')' : '') +
          '. <a href="' + esc(w.url) + '">' + esc(shortUrl(w.url)) + '</a></li>';
      }) + '</ul>' : '') +
      '<h2>Research &amp; analysis</h2><ul class="bul">' + map(d.research, function (r) {
        return '<li><b>' + esc(r.title) + '.</b> ' + esc(r.text) + '</li>';
      }) + '</ul>' +
      '<p style="margin-top:28px;font-size:14px;color:var(--muted)">References available upon request.</p>');
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
