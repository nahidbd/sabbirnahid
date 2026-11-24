/* Shared renderer: turns content/site.json into HTML.
   Used by the browser (assets/js/site.js) and by the Cloudflare Pages Function
   (functions/_middleware.js) so search engines and link previews get full HTML.
   To change any text on the site, edit content/site.json — no HTML needed. */

var esc = function (v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
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
  var links = [["#about", "About"], ["#expertise", "Expertise"], ["#experience", "Experience"], ["#case", "Projects"],
    ["#writing", "Writing"], ["#credentials", "Credentials"], ["#contact", "Contact"]];
  return '<div class="rail">' +
    '<a class="mark" href="/"><b>' + esc(p.name) + '</b><small>' + esc(p.shortHeadline || p.headline) + '</small></a>' +
    '<nav aria-label="Sections"><ul>' +
      map(links, function (l) { return '<li><a href="' + h + l[0] + '">' + l[1] + '</a></li>'; }) +
      '<li class="cvlink"><a href="/cv"' + (page === "cv" ? ' aria-current="page"' : '') + '>Full CV</a></li>' +
    '</ul></nav>' +
    '<p class="rail-foot"><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></p></div>';
}

function footer(d) {
  return '<p>© ' + (d.year || new Date().getFullYear()) + ' ' + esc(d.person.name) + '. ' + esc(d.person.location) + '.</p>';
}

/* The delta: one river of DPI governance splitting into the sectors worked in. Drawn from the content, so it updates with site.json. */
function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function smooth(pts) {
  var f = function (n) { return n.toFixed(1); };
  var dd = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 0; i < pts.length - 1; i++) {
    var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    dd += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " +
      f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
  }
  return dd;
}
function delta(d) {
  var secs = d.sectors || [], n = secs.length || 1, r = rng(11), idx = 0;
  var sx = 270, sy = 250, ey = 528;
  var out = [];
  var path = function (pts, w, cls) {
    out.push('<path class="' + cls + '" style="--i:' + (idx++) + '" pathLength="1" stroke-width="' + w + '" d="' + smooth(pts) + '"/>');
  };
  var trunk = [[sx - 6, -4], [sx - 24, 62], [sx + 10, 140], [sx - 8, 200], [sx, sy]];
  // small tributaries joining the main river from both banks
  path([[30, 70], [110, 92], [190, 128], [sx - 12, 170]], 1.4, "trib");
  path([[510, 40], [440, 100], [350, 120], [sx + 8, 148]], 1.4, "trib");
  path([[60, 190], [130, 200], [210, 214], [sx - 6, 214]], 1, "trib");
  path(trunk, 5, "main");
  var ends = [];
  secs.forEach(function (s, i) {
    var ex = n === 1 ? sx : 80 + i * (380 / (n - 1)), t = ex - sx, j = function () { return (r() - 0.5) * 22; };
    var pts = [[sx, sy], [sx + t * 0.16 + j(), sy + 52], [sx + t * 0.52 + j(), sy + 120], [ex + j() * 0.5, sy + 205], [ex, ey]];
    path(pts, 3, "arm");
    // twigs: tiny side channels off each arm
    var tw = pts[2];
    path([tw, [tw[0] + (t >= 0 ? 22 : -22) + j() * 0.4, tw[1] + 34], [tw[0] + (t >= 0 ? 34 : -34), tw[1] + 78]], 1.2, "twig");
    var tw2 = pts[3];
    path([tw2, [tw2[0] + (t >= 0 ? -16 : 16), tw2[1] + 20], [tw2[0] + (t >= 0 ? -22 : 22), tw2[1] + 46]], 1, "twig");
    ends.push('<g class="end" style="--i:' + (idx + i) + '"><circle cx="' + ex.toFixed(1) + '" cy="' + ey + '" r="5"/><text x="' + ex.toFixed(1) + '" y="' + (ey + 30) + '" text-anchor="middle">' + esc(s.tag || s.name) + '</text></g>');
  });
  var src = '<g class="end" style="--i:0"><circle cx="' + (sx - 6) + '" cy="2" r="5"/><text x="' + (sx + 14) + '" y="30">' + esc((d.specialism && d.specialism.title) || "") + '</text></g>';
  var label = "Illustration: one river, " + ((d.specialism && d.specialism.title) || "DPI governance") + ", splitting into " +
    secs.map(function (s) { return s.name; }).join(", ");
  return '<svg viewBox="0 0 540 590" role="img" aria-label="' + esc(label) + '" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    out.join("") + src + ends.join("") + '</svg>';
}

function home(d) {
  var p = d.person, out = {};
  var set = function (id, html) { out[id] = html; };

  set("profile", '<div class="hero-copy">' +
      '<p class="where">' + esc(p.location) + ', ' + esc(p.timezone) + '</p>' +
      (p.photo ? '<img class="portrait" src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">' : '') +
      '<h1>' + esc(p.name) + '</h1>' +
      '<p class="title">' + esc(p.title) + '</p>' +
      '<p class="summary">' + esc(d.summary) + '</p>' +
      '<div class="actions">' +
        '<a class="btn solid" href="mailto:' + esc(p.email) + '">Email me</a>' +
        '<a class="lnk" href="' + esc(p.linkedin) + '" rel="noopener">LinkedIn</a>' +
        '<a class="lnk" href="/cv">Read the full CV</a>' +
      '</div>' +
      '<p class="avail"><i></i>' + esc(p.availability) + '</p>' +
    '</div>' +
    '<figure class="delta">' + delta(d) + '</figure>');

  set("stats", map(d.stats, function (s) { return '<li><b>' + esc(s.value) + '</b> ' + esc(s.label) + '</li>'; }));

  set("about-text", map(d.about, function (t) { return '<p>' + esc(t) + '</p>'; }));
  set("tee", '<h3>' + esc(d.specialism.title) + ' covers</h3><ul>' +
      map(d.specialism.layers, function (l) { return '<li>' + esc(l) + '</li>'; }) + '</ul>' +
    '<p class="note">Applied in ' + esc(d.sectors.map(function (s) { return s.name; }).join(", ")) + '.</p>');

  set("glance", map(d.glance, function (g) { return '<div><dt>' + esc(g.label) + '</dt><dd>' + esc(g.value) + '</dd></div>'; }));

  set("expertise-grid", map(d.expertise, function (x) {
    return '<div class="xi"><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p>' +
      (x.tags && x.tags.length ? '<p class="xt">' + esc(x.tags.join(", ")) + '</p>' : '') + '</div>';
  }));
  set("sectors", map(d.sectors, function (s) {
    return '<div class="sec"><h4>' + esc(s.name) + '</h4><p>' + esc(s.text) + '</p></div>';
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
    return '<article class="job' + (e.current ? ' now' : '') + '"><p class="when">' + esc(e.period) + '</p><div class="what">' +
      '<h3>' + esc(e.role) + '</h3><p class="org">' + esc(e.org) + '</p>' + (e.project ? '<p class="proj">' + esc(e.project) + '</p>' : '') +
      (n ? (open ? body : '<details><summary><span class="more">Show responsibilities (' + n + ')</span><span class="less">Hide responsibilities</span></summary>' + body + '</details>') : '') +
      '</div></article>';
  }));
  set("partners", '<p>Programmes funded by ' + esc((d.partners || []).slice(0, -1).join(", ")) + ' and ' + esc((d.partners || []).slice(-1)[0] || "") + '.</p>');

  var c = d.caseStudy;
  set("case-study", '<div class="case-head"><div><h3>' + esc(c.name) + '</h3></div>' +
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
    return '<article class="pi"><h3>' + esc(x.name) + '</h3><p class="meta">' + esc(x.funder) + ', ' + esc(x.period) + '</p><p>' + esc(x.text) + '</p></article>';
  }));

  set("steps", map(d.approach, function (s, i) { return '<li><span>' + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></li>'; }));

  var f = d.firm;
  set("firm-name", esc(f.name));
  set("firm", '<div class="firm-copy"><p class="kind">' + esc(f.kind) + '</p><p class="tag">' + esc(f.tagline) + '</p><p>' + esc(f.text) + '</p></div>' +
    '<div class="services">' + map(f.services, function (s) {
      return '<div><h4>' + esc(s.title) + '</h4><p>' + esc(s.text) + '</p></div>';
    }) + '</div>');

  set("papers", map(d.research, function (r) {
    return '<article class="ri' + (r.featured ? ' feature' : '') + '"><p class="kind">' + esc(r.type) + '</p><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></article>';
  }));

  set("writing-list", byDate(d.writing).length ? map(byDate(d.writing), function (w) {
    return '<article class="wpost"><time datetime="' + esc(w.date) + '">' + longDate(w.date) + '</time><div>' +
      '<h3><a href="' + esc(w.url) + '" rel="noopener">' + esc(w.title) + '</a></h3>' +
      '<p class="src">' + esc(w.type || "Article") + ' in ' + esc(w.outlet) + (w.edition ? ', ' + esc(w.edition) : '') + '</p>' +
      (w.summary ? '<p class="sum">' + esc(w.summary) + '</p>' : '') +
      '<p class="wlinks"><a href="' + esc(w.url) + '" rel="noopener">Read online</a>' +
      (w.print && w.print.url ? '<a href="' + esc(w.print.url) + '" rel="noopener">' + esc(w.print.label || "Print edition") + '</a>' : '') + '</p>' +
      (w.tags && w.tags.length ? '<p class="xt">' + esc(w.tags.join(", ")) + '</p>' : '') +
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
    return '<li><b>' + esc(c.short || c.title) + '</b>' + (c.short && c.short !== c.title ? '<span>' + esc(c.title) + '</span>' : '') +
      (c.detail ? '<small>' + esc(c.detail) + '</small>' : '') + '</li>';
  }));

  set("contact", '<div class="contact-in"><h2>' + esc(d.contact.heading) + '</h2><p>' + esc(d.contact.text) + '</p>' +
    '<p class="big"><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></p>' +
    '<p class="more-links"><a href="' + esc(p.linkedin) + '" rel="noopener">LinkedIn</a><a href="/cv">Full CV</a>' +
    (p.phone ? '<a href="tel:' + esc(p.phone.replace(/\\s/g, '')) + '">' + esc(p.phone) + '</a>' : '') + '</p>' +
    '<p class="avail"><i></i>' + esc(p.availability) + ', ' + esc(p.location) + ' (' + esc(p.timezone) + ')</p></div>');
  return out;
}

function cv(d) {
  var p = d.person, out = {};
  var set = function (id, html) { out[id] = html; };
  var two = function (items) {
    return '<ul class="two">' + map(items, function (x) {
      return '<li>' + esc(x.title) + (x.detail ? ', ' + esc(x.detail) : '') + '</li>';
    }) + '</ul>';
  };
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
  return out;
}


/* ---------- SEO: <head> metadata and structured data ---------- */
function abs(base, path) { return path ? (/^https?:/.test(path) ? path : base.replace(/\/$/, "") + path) : ""; }

export function headFor(d, page) {
  var p = d.person, s = d.seo || {}, base = s.url || "";
  var isCv = page === "cv";
  var title = isCv ? (s.cvTitle || p.name + " — CV") : (s.title || p.name + " — " + p.title);
  var desc = isCv ? (s.cvDescription || s.description || d.summary) : (s.description || d.summary);
  var url = abs(base, isCv ? "/cv" : "/");
  var img = abs(base, s.image);
  var personId = abs(base, "/#person");
  var person = {
    "@type": "Person", "@id": personId, "name": p.name, "url": abs(base, "/"),
    "jobTitle": p.title, "description": d.summary, "email": "mailto:" + p.email,
    "image": p.photo ? abs(base, p.photo) : img || undefined,
    "address": { "@type": "PostalAddress", "addressLocality": "Dhaka", "addressCountry": "BD" },
    "nationality": { "@type": "Country", "name": "Bangladesh" },
    "sameAs": [p.linkedin].concat(s.sameAs || []).filter(Boolean),
    "knowsAbout": s.keywords || [],
    "knowsLanguage": (d.languages || []).map(function (l) { return l.title; }),
    "alumniOf": [
      { "@type": "CollegeOrUniversity", "name": "East West University" },
      { "@type": "CollegeOrUniversity", "name": "Presidency University" }
    ],
    "worksFor": [
      { "@type": "Organization", "name": "United Nations Development Programme (UNDP) Bangladesh" },
      { "@type": "Organization", "name": p.firm }
    ],
    "hasCredential": (d.certifications || []).map(function (c) {
      return { "@type": "EducationalOccupationalCredential", "name": c.title, "credentialCategory": "certification",
        "recognizedBy": c.detail ? { "@type": "Organization", "name": c.detail.split(" · ")[0] } : undefined };
    }),
    "memberOf": (d.memberships || []).map(function (m) { return { "@type": "Organization", "name": m.split(" (")[0] }; })
  };
  var graph = [
    { "@type": "WebSite", "@id": abs(base, "/#website"), "url": abs(base, "/"), "name": p.name, "inLanguage": "en", "publisher": { "@id": personId } },
    { "@type": "ProfilePage", "@id": url + "#page", "url": url, "name": title, "description": desc,
      "isPartOf": { "@id": abs(base, "/#website") }, "mainEntity": { "@id": personId }, "inLanguage": "en",
      "dateModified": s.updated || undefined },
    person
  ];
  byDate(d.writing).forEach(function (w) {
    graph.push({ "@type": "NewsArticle", "headline": w.title, "url": w.url, "datePublished": w.date,
      "author": { "@id": personId }, "publisher": { "@type": "Organization", "name": w.outlet },
      "description": w.summary || undefined, "keywords": (w.tags || []).join(", ") || undefined });
  });
  var json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  var m = function (attr, key, val) { return val ? '<meta ' + attr + '="' + key + '" content="' + esc(val) + '">\n' : ""; };
  return {
    title: title,
    html:
      m("name", "description", desc) +
      m("name", "author", p.name) +
      m("name", "keywords", (s.keywords || []).join(", ")) +
      '<meta name="robots" content="index, follow, max-image-preview:large">\n' +
      (base ? '<link rel="canonical" href="' + esc(url) + '">\n' : "") +
      m("property", "og:type", "profile") +
      m("property", "og:site_name", p.name) +
      m("property", "og:title", title) +
      m("property", "og:description", desc) +
      m("property", "og:url", url) +
      m("property", "og:image", img) +
      (img ? '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n' : "") +
      m("property", "og:image:alt", p.name + " — " + p.title) +
      m("property", "og:locale", "en_GB") +
      m("property", "profile:first_name", "Sabbir Ahmed") +
      m("property", "profile:last_name", "Nahid") +
      m("name", "twitter:card", "summary_large_image") +
      m("name", "twitter:title", title) +
      m("name", "twitter:description", desc) +
      m("name", "twitter:image", img) +
      (s.googleVerification ? m("name", "google-site-verification", s.googleVerification) : "") +
      (s.bingVerification ? m("name", "msvalidate.01", s.bingVerification) : "") +
      '<script type="application/ld+json">' + json + '</script>\n'
  };
}

export function renderPage(d, page) {
  var parts = page === "cv" ? cv(d) : home(d);
  parts["site-header"] = header(d, page);
  parts["site-footer"] = footer(d);
  return parts;
}
