#!/usr/bin/env node
// ============================================================
//  H&K Gulventreprise — Build Script
//  Kør med: node build.js
// ============================================================

const fs   = require('fs');
const path = require('path');
const site = require('./src/data/site.js');

const SRC  = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'public');

// ── HELPERS ─────────────────────────────────────────────────
function mkdir(p)         { fs.mkdirSync(p, { recursive: true }); }
function write(p, content) {
  mkdir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  const kb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
  console.log(`  ✓ ${path.relative(__dirname, p).padEnd(42)} ${kb.padStart(6)} KB`);
}
function copyFile(src, dest) {
  if (!fs.existsSync(src)) { console.warn(`  ⚠ missing: ${src}`); return; }
  mkdir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`  ✓ copied  ${path.relative(__dirname, src)}`);
}

const esc   = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

// ── SVG LOGO ─────────────────────────────────────────────────
function logoSVG() {
  return `<svg class="logo-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="48" height="48" rx="6" fill="#C9A84C"/>
  <line x1="4" y1="12" x2="44" y2="12" stroke="#A07830" stroke-width="1.5" opacity="0.5"/>
  <line x1="4" y1="20" x2="44" y2="20" stroke="#A07830" stroke-width="1" opacity="0.4"/>
  <line x1="4" y1="28" x2="44" y2="28" stroke="#A07830" stroke-width="1.5" opacity="0.5"/>
  <line x1="4" y1="36" x2="44" y2="36" stroke="#A07830" stroke-width="1" opacity="0.4"/>
  <path d="M7 10V38M7 24H19M19 10V38" stroke="#1A1A18" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M23 20C23 18 24.5 16 26.5 16C28.5 16 30 17.5 30 19.5C30 21 29 22.5 27 24L22 30C22 30 21 31.5 21 33C21 35.5 23 37.5 26 37.5C28 37.5 30 36.5 31 35" stroke="#1A1A18" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M34 10V38M34 24L43 10M34 24L43 38" stroke="#1A1A18" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// ── SCHEMA.ORG ───────────────────────────────────────────────
function globalSchema() {
  const f = site.firm;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${f.domain}/#business`,
        "name": f.name,
        "description": site.seo.description,
        "url": f.domain,
        "telephone": f.phone,
        "email": f.email,
        "address": { "@type":"PostalAddress","addressLocality":"København","addressCountry":"DK" },
        "openingHoursSpecification": [{ "@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"07:00","closes":"17:00" }],
        "priceRange": "kr.kr.",
        "areaServed": f.area,
        "aggregateRating": { "@type":"AggregateRating","ratingValue":"5","reviewCount":"4200" },
      },
      {
        "@type": "FAQPage",
        "mainEntity": site.faq.map(f => ({
          "@type":"Question","name":f.q,
          "acceptedAnswer":{"@type":"Answer","text":f.a}
        }))
      }
    ]
  }, null, 2);
}

// ── NAV HTML ─────────────────────────────────────────────────
function navHTML(activePage) {
  const links = site.nav.map(n => {
    const cls = [n.cta ? 'nav-cta' : '', n.page === activePage ? '' : ''].filter(Boolean).join(' ');
    const cur = n.page === activePage ? ' aria-current="page"' : '';
    return `<li><a href="${n.href}"${cls ? ` class="${cls}"` : ''}${cur}>${esc(n.label)}</a></li>`;
  }).join('\n        ');
  const mobile = site.nav.map(n =>
    `<a href="${n.href}">${esc(n.label)}</a>`
  ).join('\n  ');
  return { links, mobile };
}

// ── FOOTER ───────────────────────────────────────────────────
function footerHTML() {
  const f = site.firm;
  return `<footer role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-firm-name">${esc(f.name)}</div>
        <span class="footer-firm-tag">${esc(f.tagline)}</span>
        <p>Storkøbenhavns betroede specialist i gulvafslibning, gulvafhøvling og alle typer gulvbehandling. Professionelt håndværk med stolthed siden ${f.founded}.</p>
        <div class="footer-contact-quick">
          <a href="tel:${f.phone}">📞 ${f.phoneDisplay}</a>
          <a href="mailto:${f.email}">${esc(f.email)}</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Ydelser</h4>
        <ul>
          ${site.services.map(s => `<li><a href="/${s.slug}/">${esc(s.title)}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <ul>
          ${site.nav.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Kontakt</h4>
        <ul>
          <li><a href="tel:${f.phone}">${f.phoneDisplay}</a></li>
          <li><a href="mailto:${f.email}">${esc(f.email)}</a></li>
          <li class="footer-hours">${esc(f.hours)}</li>
          <li class="footer-area">${esc(f.area)}</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div style="display:flex;align-items:center;gap:1.5rem"><img src="/images/danmarks-kort.svg" alt="Danmark kort" style="width:120px;opacity:0.6;filter:invert(1)"/><span>© ${new Date().getFullYear()} ${esc(f.name)}. Alle rettigheder forbeholdt</span></div>
      <div class="cert-badges">
        <span class="cert-badge">🏅 Autoriseret</span>
        <span class="cert-badge">🌱 Miljøcertificeret</span>
        <span class="cert-badge">🛡️ 2 års garanti</span>
      </div>
    </div>
  </div>
</footer>`;
}

// ── PAGE WRAPPER ─────────────────────────────────────────────
function page({ title, description, canonical, content, active = '' }) {
  const f = site.firm;
  const s = site.seo;
  const { links, mobile } = navHTML(active);
  const desc = description || s.description;
  const canon = canonical || f.domain + '/';

  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}"/>
  <meta name="keywords"    content="${esc(s.keywords)}"/>
  <meta name="author"      content="${esc(f.name)}"/>
  <meta name="robots"      content="index, follow"/>
  <link rel="canonical"    href="${canon}"/>
  <meta property="og:type"        content="website"/>
  <meta property="og:url"         content="${canon}"/>
  <meta property="og:title"       content="${esc(title)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:image"       content="${f.domain}${s.ogImage}"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(desc)}"/>
  <script type="application/ld+json">${globalSchema()}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/css/style.css"/>
  <link rel="stylesheet" href="/css/gallery.css"/>
</head>
<body>

<div class="alert-banner" role="banner">
  🏆 Gratis besigtigelse og tilbud inden 24 timer — Ring nu: <a href="tel:${f.phone}">${f.phoneDisplay}</a>
</div>

<nav id="navbar" role="navigation" aria-label="Hovednavigation">
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="${esc(f.name)} – forsiden">
      ${logoSVG()}
      <div class="logo-text">
        <span class="logo-main">${esc(f.name)}</span>
        <span class="logo-sub">${esc(f.tagline)}</span>
      </div>
    </a>
    <ul class="nav-links" role="list">${links}</ul>
    <button class="hamburger" id="hamburger" aria-label="Åbn menu" aria-expanded="false" aria-controls="mobileNav">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div class="mobile-nav" id="mobileNav" aria-hidden="true" role="dialog" aria-label="Mobilmenu">
  <button class="mobile-nav-close" id="mobileClose" aria-label="Luk menu">✕</button>
  ${mobile}
</div>

<main id="main-content">
${content}
</main>

${footerHTML()}

<button class="scroll-top" id="scrollTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Scroll til toppen">↑</button>

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Billedvisning" aria-hidden="true">
  <div class="lightbox-inner">
    <button class="lightbox-close" id="lightboxClose" aria-label="Luk billede">✕</button>
    <div class="lightbox-img"><div id="lbImg" class="floor-thumb ft-olie"></div></div>
    <div class="lightbox-info">
      <div><h3 id="lbTitle"></h3><p id="lbLoc"></p></div>
      <div class="lightbox-nav">
        <button class="lightbox-btn" id="lbPrev" aria-label="Forrige">←</button>
        <button class="lightbox-btn" id="lbNext" aria-label="Næste">→</button>
      </div>
    </div>
  </div>
</div>

<script src="/js/main.js"></script>
<script src="/js/gallery.js"></script>
</body>
</html>`;
}

// ── PAGE GENERATORS ──────────────────────────────────────────

function genHome() {
  const f = site.firm;
  const years = new Date().getFullYear() - f.founded;

  const statsHTML = f.stats.map(s => `
    <div class="stat-item">
      <div class="number">${esc(s.number)}</div>
      <div class="label">${esc(s.label)}</div>
    </div>`).join('');

  const servicesHTML = site.services.map(s => `
    <article class="service-card fade-in">
      <div class="service-icon" aria-hidden="true">${s.icon}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.short)}</p>
      <a href="/${s.slug}/" class="btn btn-dark">Læs mere →</a>
    </article>`).join('');

  const processHTML = site.process.map(p => `
    <div class="process-step fade-in">
      <div class="step-num" aria-hidden="true">${p.num}</div>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.text)}</p>
    </div>`).join('');

  const baCards = (site.beforeAfter || []).map((b,i) => {
    const beforeEl = b.before
      ? `<img class="ba-before" src="/${b.before}">`
      : `<div class="ba-before"></div>`;
    const afterEl = b.after
      ? `<img class="ba-after" src="/${b.after}">`
      : `<div class="ba-after"></div>`;
    return `
    <div class="ba-card fade-in">
      <div class="ba-wrap" id="ba${i+1}">
        ${beforeEl}
        ${afterEl}
        <div class="ba-divider" aria-hidden="true"></div>
        <div class="ba-handle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6" transform="translate(6,0)"/>
          </svg>
        </div>
        <span class="ba-label before">Før</span>
        <span class="ba-label after">${b.afterLabel || 'Efter'}</span>
      </div>
      <div class="ba-card-info">
        <h4>${esc(b.title)}</h4>
        <p>${esc(b.meta)}</p>
        <span class="ba-tag">${esc(b.tag)}</span>
      </div>
    </div>`;
  }).join('');

  const refMarquee = [...site.references, ...site.references].map(r => `
    <div class="ref-item">
      <div class="ref-icon" aria-hidden="true">${r.icon}</div>
      <div>
        <div class="ref-name">${esc(r.name)}</div>
        <div class="ref-type">${esc(r.type)}</div>
      </div>
    </div>`).join('');

  const testimonialsHTML = site.testimonials.map(t => `
    <article class="testimonial-card fade-in">
      <div class="stars" aria-label="${t.stars} ud af 5 stjerner">${stars(t.stars)}</div>
      <p>${esc(t.text)}</p>
      <div class="testimonial-author">
        <div class="author-avatar" aria-hidden="true">${esc(t.initials)}</div>
        <div>
          <div class="author-name">${esc(t.name)}</div>
          <div class="author-place">${esc(t.place)}</div>
        </div>
      </div>
    </article>`).join('');

  const faqHTML = site.faq.map(fq => `
    <details class="faq-item fade-in">
      <summary>${esc(fq.q)}</summary>
      <p>${esc(fq.a)}</p>
    </details>`).join('');

  return `
  <!-- HERO -->
  <section class="hero" aria-label="Forside hero">
    <video class="hero-video" autoplay muted loop playsinline preload="auto" poster="/images/hero.jpg" aria-hidden="true"><source src="/images/hero.mp4" type="video/mp4"></video><div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-grain" aria-hidden="true"></div>
    <div class="hero-content">
      <div class="hero-badge"><div class="dot" aria-hidden="true"></div><span>Tilgængelig for opgaver i hele Storkøbenhavn & Sjælland</span></div>
      <h1>Vi genskaber <em>skønheden</em><br>i dit trægulv</h1>
      <p>${esc(f.name)} er din betroede specialist i gulvafslibning, gulvafhøvling og alle former for gulvbehandling. Fra private hjem til landets største institutioner.</p>
      <div class="hero-actions">
        <a href="/booking/" class="btn btn-primary">📅 Book gratis besigtigelse</a>
        <a href="/tilbud/"  class="btn btn-outline">🧮 Beregn din pris</a>
      </div>
      <div class="hero-stats" aria-label="Nøgletal">${statsHTML}</div>
    </div>
    <div class="hero-scroll" aria-hidden="true"><span>Scroll</span><div class="scroll-line"></div></div>
  </section>

  <!-- SERVICES -->
  <section class="section" id="ydelser" aria-labelledby="ydelser-heading">
    <div class="container">
      <header class="section-header fade-in">
        <span class="eyebrow">Vores ydelser</span>
        <h2 id="ydelser-heading">Alt indenfor gulve – under ét tag</h2>
        <p>Vi tilbyder et komplet spektrum af gulvrelaterede ydelser til både erhverv og private kunder. Gulvafslibning, gulvafhøvling, lak, lud, olie og sæbebehandling – vi har ekspertisen.</p>
      </header>
      <div class="services-grid">${servicesHTML}</div>
    </div>
  </section>

  <!-- WHY US -->
  <section class="section" style="background:var(--cream)" aria-labelledby="why-heading">
    <div class="container">
      <div class="why-grid">
        <div class="fade-in">
          <div class="floor-preview" style="background-image:url(/images/galleri/f%C3%B8r%26efter%20lud.PNG);background-size:cover;background-position:center">
            <div class="floor-badge"><div class="years">${years}+</div><div class="years-label">Års erfaring</div></div>
          </div>
        </div>
        <div class="fade-in">
          <span class="eyebrow">Hvorfor vælge os</span>
          <h2 id="why-heading">Håndværk, præcision og stolthed</h2>
          <p>Vi er ikke bare et gulvfirma. Vi er håndværkere der brænder for træ og behandler hvert gulv som om det var vores eget.</p>
          <div class="why-points">
            <div class="why-point"><div class="wp-icon" aria-hidden="true">🏆</div><div><h4>Erfarne specialister</h4><p>Over ${years} års erfaring i Storkøbenhavn. Vi har set og løst alle tænkelige udfordringer med trægulve.</p></div></div>
            <div class="why-point"><div class="wp-icon" aria-hidden="true">🔇</div><div><h4>Støvfrit udstyr</h4><p>Vi anvender udelukkende moderne støvfrit udstyr så du kan forblive hjemme under arbejdet.</p></div></div>
            <div class="why-point"><div class="wp-icon" aria-hidden="true">🌿</div><div><h4>Miljøvenlige produkter</h4><p>Kun certificerede lavemissionsprodukter – til beskyttelse af dig, din familie og miljøet.</p></div></div>
            <div class="why-point"><div class="wp-icon" aria-hidden="true">📋</div><div><h4>Fast pris – 2 års garanti</h4><p>Du får altid en fast pris inden vi starter. Vi giver 2 års garanti på alt vores arbejde.</p></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section class="section process-section" aria-labelledby="process-heading">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Vores arbejdsproces</span>
        <h2 id="process-heading" style="color:var(--warm-white)">Fra første kontakt til perfekt gulv</h2>
        <p style="color:rgba(255,255,255,0.5)">En gennemprøvet proces der sikrer det bedst mulige resultat hver gang.</p>
      </header>
      <div class="process-steps">${processHTML}</div>
      <div style="text-align:center;margin-top:3rem">
        <a href="/booking/" class="btn btn-primary">📅 Book gratis besigtigelse nu</a>
      </div>
    </div>
  </section>

  <!-- BEFORE/AFTER -->
  <section class="ba-section" aria-labelledby="ba-heading">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Resultater taler for sig selv</span>
        <h2 id="ba-heading" style="color:var(--warm-white)">Træk og se forskellen</h2>
        <p style="color:rgba(255,255,255,0.5)">Træk i slideren og oplev forvandlingen. Samme gulv – før og efter ${esc(f.name)}.</p>
      </header>
      <div class="ba-grid">${baCards}</div>
      <div style="text-align:center;margin-top:3rem">
        <a href="/galleri/" class="btn btn-primary">Se hele galleriet →</a>
      </div>
    </div>
  </section>

  <!-- REFERENCES MARQUEE -->
  <section class="section references-section" aria-labelledby="ref-marquee-heading">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Vores referencer</span>
        <h2 id="ref-marquee-heading">Betroet af Danmarks mest kendte institutioner</h2>
        <p>Vi har behandlet gulve for nogle af landets mest prestigefyldte virksomheder og kulturinstitutioner.</p>
      </header>
    </div>
    <div class="ref-marquee-wrap" aria-label="Referencer"><div class="ref-marquee">${refMarquee}</div></div>
    <div class="container" style="margin-top:2rem;text-align:center">
      <a href="/referencer/" class="btn btn-dark">Se alle referencer →</a>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="section testimonials-section" aria-labelledby="test-heading">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Kundeanmeldelser</span>
        <h2 id="test-heading">Hvad vores kunder siger</h2>
      </header>
      <div class="testimonials-grid">${testimonialsHTML}</div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section" style="background:var(--cream)" aria-labelledby="faq-heading">
    <div class="container">
      <header class="section-header fade-in">
        <span class="eyebrow">Spørgsmål & svar</span>
        <h2 id="faq-heading">Ofte stillede spørgsmål</h2>
      </header>
      <div class="faq-list" style="margin-top:2.5rem">${faqHTML}</div>
    </div>
  </section>

  <!-- CITY SEO LINKS -->
  <section class="section" aria-labelledby="city-heading">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Arbejdsområde</span>
        <h2 id="city-heading">Vi betjener hele Storkøbenhavn</h2>
        <p>Gratis besigtigelse og transport til alle adresser i vores dækningsområde.</p>
      </header>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;margin-top:2.5rem">
        ${site.cities.map(c => `<a href="/${c.slug}/" class="btn btn-dark" style="font-size:0.85rem;padding:0.6rem 1.25rem">📍 ${esc(c.name)}</a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section style="background:linear-gradient(135deg,var(--gold-dark),var(--gold));padding:5rem 0" aria-label="Call to action">
    <div class="container" style="text-align:center">
      <h2 style="color:var(--charcoal);margin-bottom:0.75rem">Klar til et smukt gulv?</h2>
      <p style="color:rgba(26,26,24,0.7);margin-bottom:2rem;font-size:1.05rem">Ring til os i dag og få en gratis og uforpligtende besigtigelse inden for 48 timer.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="tel:${f.phone}" class="btn btn-dark">📞 Ring: ${f.phoneDisplay}</a>
        <a href="/booking/" class="btn" style="background:rgba(255,255,255,0.25);color:var(--charcoal);border:2px solid rgba(255,255,255,0.5)">📅 Book online</a>
      </div>
    </div>
  </section>
`;
}

function genGallery() {
  const filters = ['alle','olie','lak','lud','saebe','parket','erhverv','foer'];
  const filterLabels = { alle:'Alle', olie:'Olie', lak:'Lak', lud:'Lud', saebe:'Sæbe', parket:'Parket', erhverv:'Erhverv', foer:'Før/efter' };

  const baCards = (site.beforeAfter || []).map(b => `
    <div class="ba-card fade-in">
      <div class="ba-wrap" id="${b.id || 'ba'+Math.random()}">
        ${b.before ? `<img class="ba-before" src="/${b.before}">` : '<div class="ba-before"></div>'}
        ${b.after  ? `<img class="ba-after"  src="/${b.after}">`  : '<div class="ba-after"></div>'}
        <div class="ba-divider"></div>
        <div class="ba-handle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6" transform="translate(6,0)"/></svg></div>
        <span class="ba-label before">Før</span>
        <span class="ba-label after">${esc(b.afterLabel)}</span>
      </div>
      <div class="ba-card-info"><h4>${esc(b.title)}</h4><p>${esc(b.meta)}</p><span class="ba-tag">${esc(b.tag)}</span></div>
    </div>`).join('');

  const filterBtns = filters.map((f,i) =>
    `<button class="filter-btn${i===0?' active':''}" data-filter="${f}">${esc(filterLabels[f])}</button>`
  ).join('\n        ');

  const galleryItems = site.gallery.map(g => `
    <div class="gallery-item fade-in" data-cat="${g.cat}" data-id="${g.id}" tabindex="0" role="button" aria-label="${esc(g.title)} – ${esc(g.loc)}">
      ${g.img ? `<img src="/${g.img}" alt="${esc(g.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease">` : `<div class="floor-thumb ${g.cls}"></div>`}
      <span class="gallery-tag">${esc(g.tag)}</span>
      <div class="gallery-overlay" aria-hidden="true">
        <div class="gallery-overlay-content">
          <h4>${esc(g.title)}</h4>
          <p>${esc(g.loc)}</p>
        </div>
      </div>
    </div>`).join('');

  return `
  <section class="page-header" aria-labelledby="galleri-heading">
    <div class="container">
      <nav class="breadcrumb" aria-label="Sti"><a href="/">Forside</a><span>›</span><span aria-current="page">Galleri</span></nav>
      <span class="eyebrow">Udført arbejde</span>
      <h1 id="galleri-heading">Billedgalleri</h1>
      <p>Se eksempler på vores arbejde. Fra slidte misfarvede gulve til smukke renoverede trægulve med lud, lak, olie og sæbebehandling.</p>
    </div>
  </section>

  <section class="ba-section" aria-labelledby="ba-galleri-heading">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Før &amp; efter</span>
        <h2 id="ba-galleri-heading" style="color:var(--warm-white)">Træk og se forskellen</h2>
        <p style="color:rgba(255,255,255,0.5)">Træk i sliderne og oplev forvandlingen med egne øjne.</p>
      </header>
      <div class="ba-grid">${baCards}</div>
    </div>
  </section>

  <section class="gallery-section" aria-labelledby="gallery-heading">
    <div class="container">
      <header class="section-header fade-in">
        <span class="eyebrow">Alle projekter</span>
        <h2 id="gallery-heading">Udvalgte opgaver</h2>
        <p>Filtrer efter behandlingstype og se eksempler fra private boliger og erhvervsopgaver.</p>
      </header>
      <div class="gallery-filters fade-in" role="group" aria-label="Filtrer galleri">
        ${filterBtns}
      </div>
      <div class="gallery-grid" id="galleryGrid" aria-live="polite">${galleryItems}</div>
      <div style="text-align:center;margin-top:3rem" class="fade-in">
        <a href="/booking/" class="btn btn-primary">📅 Book gratis besigtigelse</a>
      </div>
    </div>
  </section>
`;
}

function genContact() {
  const f = site.firm;
  return `
  <section class="page-header" aria-labelledby="kontakt-heading">
    <div class="container">
      <nav class="breadcrumb" aria-label="Sti"><a href="/">Forside</a><span>›</span><span aria-current="page">Kontakt</span></nav>
      <span class="eyebrow">Kom i kontakt</span>
      <h1 id="kontakt-heading">Kontakt ${esc(f.name)}</h1>
      <p>Vi glæder os til at høre fra dig. Ring, skriv eller brug kontaktformularen herunder.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="contact-grid">
        <div>
          <div class="contact-info-card fade-in">
            <h2 style="color:var(--warm-white);font-size:1.3rem;margin-bottom:1.5rem">Kontaktoplysninger</h2>
            <div class="booking-contact-items">
              <div class="contact-item"><div class="ci-icon">📞</div><div class="ci-text"><span class="ci-label">Telefon</span><a href="tel:${f.phone}">${f.phoneDisplay}</a></div></div>
              <div class="contact-item"><div class="ci-icon">✉️</div><div class="ci-text"><span class="ci-label">E-mail</span><a href="mailto:${f.email}">${esc(f.email)}</a></div></div>
              <div class="contact-item"><div class="ci-icon">🕐</div><div class="ci-text"><span class="ci-label">Åbningstider</span><span>${esc(f.hours)}</span></div></div>
              <div class="contact-item"><div class="ci-icon">📍</div><div class="ci-text"><span class="ci-label">Arbejdsområde</span><span>${esc(f.area)}</span></div></div>
            </div>
          </div>
          <div style="margin-top:1.5rem;padding:1.5rem;background:linear-gradient(135deg,var(--gold-dark),var(--gold));border-radius:12px">
            <h3 style="color:var(--charcoal);margin-bottom:0.4rem;font-size:1.05rem">Ring direkte til os</h3>
            <p style="color:rgba(26,26,24,0.7);font-size:0.88rem;margin-bottom:1rem">Hverdage kl. 07–17</p>
            <a href="tel:${f.phone}" class="btn btn-dark" style="width:100%;justify-content:center">📞 ${f.phoneDisplay}</a>
          </div>
        </div>
        <div class="contact-big-form fade-in">
          <h2 style="color:var(--warm-white);font-size:1.3rem;margin-bottom:1.5rem">Send os en besked</h2>
          <form id="contactForm" action="https://formspree.io/f/mlgynrpp" method="POST" novalidate>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form-group"><label for="cf-fname">Fornavn *</label><input id="cf-fname" name="fornavn" type="text" placeholder="Dit fornavn" required autocomplete="given-name"/></div>
              <div class="form-group"><label for="cf-lname">Efternavn *</label><input id="cf-lname" name="efternavn" type="text" placeholder="Dit efternavn" required autocomplete="family-name"/></div>
              <div class="form-group"><label for="cf-phone">Telefon</label><input id="cf-phone" name="telefon" type="tel" placeholder="${f.phoneDisplay}" autocomplete="tel"/></div>
              <div class="form-group"><label for="cf-email">E-mail *</label><input id="cf-email" name="email" type="email" placeholder="din@email.dk" required autocomplete="email"/></div>
            </div>
            <div class="form-group" style="margin-top:1rem">
              <label for="cf-subject">Emne</label>
              <select id="cf-subject" name="emne">
                <option>Anmod om tilbud</option><option>Spørgsmål om behandlinger</option>
                <option>Spørgsmål om priser</option><option>Book besigtigelse</option>
                <option>Erhvervsforespørgsel</option><option>Andet</option>
              </select>
            </div>
            <div class="form-group" style="margin-top:1rem">
              <label for="cf-msg">Besked *</label>
              <textarea id="cf-msg" name="besked" placeholder="Beskriv din forespørgsel så detaljeret som muligt…" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:1rem;margin-top:1.5rem">✉️ Send besked</button>
            <div class="success-msg" id="contactSuccess" role="alert">✅ Tak for din besked! Vi vender tilbage inden for 24 timer.</div>
          </form>
        </div>
      </div>
    </div>
  </section>
`;
}

function genBooking() {
  const f = site.firm;
  return `
  <section class="page-header" aria-labelledby="booking-heading">
    <div class="container">
      <nav class="breadcrumb" aria-label="Sti"><a href="/">Forside</a><span>›</span><span aria-current="page">Book besigtigelse</span></nav>
      <span class="eyebrow">Gratis og uforpligtende</span>
      <h1 id="booking-heading">Book gratis besigtigelse</h1>
      <p>Udfyld formularen og vi kontakter dig inden for 24 timer for at aftale et tidspunkt.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="booking-grid">
        <div class="booking-info fade-in">
          <span class="eyebrow">Kontakt</span>
          <h2>Ring til os eller book online</h2>
          <p>Tilgængelige på telefon alle hverdage kl. 07–17.</p>
          <div class="booking-contact-items">
            <div class="contact-item"><div class="ci-icon">📞</div><div class="ci-text"><span class="ci-label">Telefon</span><a href="tel:${f.phone}">${f.phoneDisplay}</a></div></div>
            <div class="contact-item"><div class="ci-icon">✉️</div><div class="ci-text"><span class="ci-label">E-mail</span><a href="mailto:${f.email}">${esc(f.email)}</a></div></div>
            <div class="contact-item"><div class="ci-icon">🕐</div><div class="ci-text"><span class="ci-label">Åbningstider</span><span>${esc(f.hours)}</span></div></div>
            <div class="contact-item"><div class="ci-icon">⏱️</div><div class="ci-text"><span class="ci-label">Svartid</span><span>Inden for 24 timer</span></div></div>
          </div>
        </div>
        <div>
          <div class="booking-form fade-in">
            <h3 style="color:var(--warm-white);margin-bottom:1.5rem">Bookingformular</h3>
            <form id="bookingForm" action="https://formspree.io/f/mlgynrpp" method="POST" novalidate>
              <div class="form-grid">
                <div class="form-group"><label for="bk-fname">Fornavn *</label><input id="bk-fname" name="fornavn" type="text" placeholder="Fornavn" required autocomplete="given-name"/></div>
                <div class="form-group"><label for="bk-lname">Efternavn *</label><input id="bk-lname" name="efternavn" type="text" placeholder="Efternavn" required autocomplete="family-name"/></div>
                <div class="form-group"><label for="bk-phone">Telefon *</label><input id="bk-phone" name="telefon" type="tel" placeholder="${f.phoneDisplay}" required autocomplete="tel"/></div>
                <div class="form-group"><label for="bk-email">E-mail *</label><input id="bk-email" name="email" type="email" placeholder="din@email.dk" required autocomplete="email"/></div>
                <div class="form-group full"><label for="bk-addr">Adresse *</label><input id="bk-addr" name="adresse" type="text" placeholder="Vej, husnummer, by og postnummer" required autocomplete="street-address"/></div>
                <div class="form-group"><label for="bk-areal">Areal (ca. m²)</label><input id="bk-areal" name="areal" type="number" placeholder="80" min="1"/></div>
                <div class="form-group"><label for="bk-ydelse">Ønsket ydelse</label>
                  <select id="bk-ydelse">
                    ${site.services.map(s => `<option>${esc(s.title)}</option>`).join('')}
                    <option>Usikker – ønsker rådgivning</option>
                  </select>
                </div>
                <div class="form-group"><label for="bk-date">Ønsket dato</label><input id="bk-date" name="dato" type="date"/></div>
                <div class="form-group"><label for="bk-time">Tidspunkt</label>
                  <select id="bk-time">
                    <option>Morgen (07–10)</option><option>Formiddag (10–12)</option>
                    <option>Eftermiddag (12–15)</option><option>Sidst på dagen (15–17)</option>
                  </select>
                </div>
                <div class="form-group full"><label for="bk-msg">Beskrivelse (valgfri)</label><textarea id="bk-msg" name="besked" placeholder="Beskriv gulvets tilstand, særlige udfordringer…"></textarea></div>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:1rem;margin-top:1rem">📅 Send bookingforespørgsel</button>
              <div class="success-msg" id="bookingSuccess" role="alert">✅ Tak! Vi kontakter dig inden for 24 timer for at aftale besigtigelse.</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
}

function genCalc() {
  return `
  <section class="page-header" aria-labelledby="calc-heading">
    <div class="container">
      <nav class="breadcrumb" aria-label="Sti"><a href="/">Forside</a><span>›</span><span aria-current="page">Tilbudsberegner</span></nav>
      <span class="eyebrow">Prisestimering</span>
      <h1 id="calc-heading">Tilbudsberegner</h1>
      <p>Få et hurtigt prisestimat. For en præcis pris sender vi en håndværksmester til gratis besigtigelse.</p>
    </div>
  </section>
  <section class="section calc-section">
    <div class="container">
      <div class="calc-card fade-in">
        <h2 style="color:var(--warm-white);margin-bottom:0.4rem">Beregn din pris</h2>
        <p>Udfyld felterne for et vejledende prisestimat.</p>
        <div class="calc-grid" style="margin-top:2rem">
          <div>
            <label class="calc-label" for="arealSlider">Gulvareal</label>
            <input type="range" id="arealSlider" class="range-input" min="10" max="500" value="80" style="width:100%"/>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3rem">
              <span style="font-size:0.76rem;color:rgba(255,255,255,0.35)">10 m²</span>
              <span class="range-val" id="arealVal">80 m²</span>
              <span style="font-size:0.76rem;color:rgba(255,255,255,0.35)">500 m²</span>
            </div>
            <input type="number" id="calcAreal" class="calc-input" style="margin-top:0.75rem" placeholder="Eller indtast præcist m²" value="80" min="1"/>
          </div>
          <div>
            <label class="calc-label" for="calcYdelse">Ydelse</label>
            <select id="calcYdelse" class="calc-input">
              <option value="slibning">Gulvafslibning (fra 125 kr./m²)</option>
              <option value="hoevling">Gulvafhøvling (fra 129 kr./m²)</option>
              <option value="kombineret">Gulvafslibning og behandling (fra 125 kr./m²)</option>
              
            </select>
          </div>
          <div>
            <label class="calc-label" for="calcTilstand">Gulvets tilstand</label>
            <select id="calcTilstand" class="calc-input">
              <option value="god">God stand</option>
              <option value="middel" selected>Middel stand</option>
              <option value="darlig">Dårlig stand / meget slidt</option>
            </select>
          </div>
          <div>
            <label class="calc-label" for="calcType">Gulvtype</label>
            <select id="calcType" class="calc-input">
              <option>Massiv træ – bræddegulv</option>
              <option>Massiv træ – parket</option>
              <option>Massiv træ – fiskebens</option>
              <option>Massiv træ – chevron / herringbone</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="calcBtn" style="margin-top:2rem;width:100%;justify-content:center;padding:1rem;font-size:1rem">🧮 Beregn estimeret pris</button>
        <div class="calc-result" id="calcResult" role="region" aria-live="polite">
          <p style="color:rgba(255,255,255,0.45);font-size:0.82rem;margin-bottom:0.5rem">Estimeret totalpris inkl. moms</p>
          <div style="display:flex;align-items:baseline;gap:0.5rem;flex-wrap:wrap">
            <div class="result-price" id="calcResultMin">—</div>
            <div style="color:rgba(255,255,255,0.35);font-size:1.5rem">–</div>
            <div class="result-price" id="calcResultMax">—</div>
            <div style="color:rgba(255,255,255,0.4);font-size:1rem;align-self:center">kr.</div>
          </div>
          <p class="result-note">Vejledende estimat. Endelig pris afhænger af gulvets tilstand, etageforhold og adgangsforhold. Vi giver altid en fast pris inden vi starter.</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.5rem">
            <a href="/booking/" class="btn btn-primary">📅 Book gratis besigtigelse</a>
            <a href="/kontakt/" class="btn btn-outline">✉️ Kontakt os</a>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
}

function genRefs() {
  const cats  = { offentlig:'🏛️ Offentlige & institutioner', hotel:'🏨 Hoteller & restauranter', erhverv:'🏢 Erhverv & virksomheder', ejendom:'🏠 Ejendomme & boligprojekter' };
  const bycat = {};
  site.references.forEach(r => { if (!bycat[r.cat]) bycat[r.cat] = []; bycat[r.cat].push(r); });

  const sections = Object.entries(cats).map(([cat, label]) => {
    if (!bycat[cat]) return '';
    const items = bycat[cat].map(r => `
      <article class="ref-card fade-in">
        <span class="ref-emoji">${r.icon}</span>
        <h4>${esc(r.name)}</h4>
        <p>${esc(r.desc)}</p>
      </article>`).join('');
    return `<h2 style="margin:3.5rem 0 1.5rem;font-size:1.5rem">${esc(label)}</h2><div class="ref-grid">${items}</div>`;
  }).join('');

  return `
  <section class="page-header" aria-labelledby="ref-heading">
    <div class="container">
      <nav class="breadcrumb" aria-label="Sti"><a href="/">Forside</a><span>›</span><span aria-current="page">Referencer</span></nav>
      <span class="eyebrow">Vores arbejde</span>
      <h1 id="ref-heading">Referencer</h1>
      <p>Vi er stolte af de mange store og kendte kunder der har valgt ${esc(site.firm.name)} til at behandle deres gulve.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">${sections}</div>
  </section>
`;
}

function genAbout() {
  const f     = site.firm;
  const years = new Date().getFullYear() - f.founded;
  return `
  <section class="page-header" aria-labelledby="om-heading">
    <div class="container">
      <nav class="breadcrumb" aria-label="Sti"><a href="/">Forside</a><span>›</span><span aria-current="page">Om os</span></nav>
      <span class="eyebrow">Vores historie</span>
      <h1 id="om-heading">Om ${esc(f.name)}</h1>
      <p>Siden ${f.founded} har vi behandlet gulve med passion og håndværkerstolthed. I dag er vi Storkøbenhavns betroede gulvspecialist med mere end ${years} års erfaring.</p>
    </div>
  </section>

  <section class="section" style="background:var(--cream)">
    <div class="container">
      <div class="why-grid">
        <div class="fade-in">
          <span class="eyebrow">Vores baggrund</span>
          <h2>${years}+ års passion for gulve</h2>
          <p>${esc(f.name)} blev grundlagt i ${f.founded} med én klar vision: at levere den højeste kvalitet indenfor gulvbehandling til en fair og transparent pris.</p>
          <p style="margin-top:1rem">I dag har vi behandlet over 500.000 m² gulv for mere end 4.200 kunder – fra private hjem på Frederiksberg til Rigshospitalets korridorer og Tivolis administrationsbygninger.</p>
          <p style="margin-top:1rem">Vi er ikke et stort upersonligt firma. Vi er håndværkere der brænder for det vi laver, og sætter os ind i hvert enkelt projekt med omhu og respekt for materialet.</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:2rem">
            <a href="/booking/" class="btn btn-primary">📅 Book besigtigelse</a>
            <a href="tel:${f.phone}" class="btn btn-dark">📞 ${f.phoneDisplay}</a>
          </div>
        </div>
        <div class="fade-in">
          <div class="floor-preview">
            <div class="floor-badge"><div class="years">${years}+</div><div class="years-label">Års erfaring</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section process-section">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Det vi tror på</span>
        <h2 style="color:var(--warm-white)">Vores værdier</h2>
      </header>
      <div class="process-steps">
        <div class="process-step fade-in"><div class="step-num">🏆</div><h4>Kvalitet frem for kvantitet</h4><p>Vi tager de opgaver vi kan gøre ordentligt. Aldrig stress, aldrig kompromis.</p></div>
        <div class="process-step fade-in"><div class="step-num">🤝</div><h4>Ærlighed og transparens</h4><p>Fast pris, ingen overraskelser. Vi siger det som det er.</p></div>
        <div class="process-step fade-in"><div class="step-num">🌿</div><h4>Miljøansvar</h4><p>Kun certificerede lavemissionsprodukter og støvfrit udstyr.</p></div>
        <div class="process-step fade-in"><div class="step-num">🛡️</div><h4>Garanti og tryghed</h4><p>2 års garanti på alt vores arbejde. Ingen diskussion.</p></div>
      </div>
    </div>
  </section>

  <section class="section testimonials-section">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Kunderne siger</span>
        <h2>Hvad folk siger om os</h2>
      </header>
      <div class="testimonials-grid" style="margin-top:2.5rem">
        ${site.testimonials.map(t => `
        <article class="testimonial-card fade-in">
          <div class="stars">${stars(t.stars)}</div>
          <p>${esc(t.text)}</p>
          <div class="testimonial-author">
            <div class="author-avatar">${esc(t.initials)}</div>
            <div><div class="author-name">${esc(t.name)}</div><div class="author-place">${esc(t.place)}</div></div>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>
`;
}

function genServicePage(svc) {
  const f    = site.firm;
  const years= new Date().getFullYear() - f.founded;
  const featureList = svc.features.map(ft => `<li style="display:flex;gap:0.6rem;align-items:flex-start;margin-bottom:0.5rem"><span style="color:var(--gold);flex-shrink:0">✓</span><span>${esc(ft)}</span></li>`).join('');
  const related = site.services.filter(s => s.slug !== svc.slug).slice(0,3).map(s => `
    <a href="/${s.slug}/" class="service-card fade-in" style="text-decoration:none;color:inherit">
      <div class="service-icon">${s.icon}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.short)}</p>
    </a>`).join('');

  const svcSchema = JSON.stringify({
    "@context":"https://schema.org","@type":"Service",
    "serviceType": svc.title,
    "provider":{"@type":"LocalBusiness","name":f.name,"telephone":f.phone,"url":f.domain},
    "areaServed": f.area,
    "description": svc.long,
    "offers":{"@type":"Offer","priceSpecification":{"@type":"UnitPriceSpecification","price":svc.priceFrom,"priceCurrency":"DKK","unitText":svc.unit}}
  });

  return `
  <script type="application/ld+json">${svcSchema}</script>
  <section class="page-header">
    <div class="container">
      <nav class="breadcrumb"><a href="/">Forside</a><span>›</span><a href="/ydelser/">Ydelser</a><span>›</span><span aria-current="page">${esc(svc.title)}</span></nav>
      <span class="eyebrow">${svc.icon} Professionel service</span>
      <h1>${esc(svc.title)} i ${esc(f.area)}</h1>
      <p>${esc(svc.short)}</p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.75rem">
        <a href="/booking/" class="btn btn-primary">📅 Book gratis besigtigelse</a>
        <a href="/tilbud/"  class="btn btn-outline">🧮 Beregn pris</a>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--cream)">
    <div class="container">
      <div class="why-grid">
        <div class="fade-in">
          <span class="eyebrow">Hvad er ${esc(svc.title.toLowerCase())}?</span>
          <h2>Alt om ${esc(svc.title.toLowerCase())}</h2>
          <p>${esc(svc.long)}</p>
          <p style="margin-top:1rem">${esc(f.name)} har mere end ${years} års erfaring med ${esc(svc.title.toLowerCase())} i Storkøbenhavn og på Sjælland. Vi behandler alt fra private boliger til store erhvervslejemål.</p>
          <ul style="list-style:none;padding:0;margin-top:1.5rem">${featureList}</ul>
        </div>
        <div class="fade-in">
          <div class="price-card">
            <div class="eyebrow">Pris</div>
            <div class="price-big">Fra ${svc.priceFrom} ${esc(svc.unit)}</div>
            <p>Prisen er vejledende og afhænger af gulvets tilstand, areal og adgangsforhold. Vi giver altid en fast pris inden vi starter.</p>
            <hr class="price-divider"/>
            ${site.services.map(s => `<div class="price-service-row"><span>${esc(s.icon)} ${esc(s.title)}</span><span>Fra ${s.priceFrom} ${esc(s.unit)}</span></div>`).join('')}
            <a href="/tilbud/" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1.5rem">🧮 Beregn dit estimat</a>
            <div style="margin-top:1.25rem;text-align:center">
              <a href="tel:${f.phone}" style="color:var(--gold);font-weight:600;font-size:0.9rem">📞 Ring: ${f.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section process-section">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Processen</span>
        <h2 style="color:var(--warm-white)">Sådan foregår det</h2>
      </header>
      <div class="process-steps">
        ${site.process.map(p => `<div class="process-step fade-in"><div class="step-num">${p.num}</div><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--cream)">
    <div class="container">
      <header class="section-header fade-in">
        <span class="eyebrow">FAQ</span>
        <h2>Spørgsmål om ${esc(svc.title.toLowerCase())}</h2>
      </header>
      <div class="faq-list" style="margin-top:2rem">
        ${site.faq.slice(0,5).map(fq => `<details class="faq-item fade-in"><summary>${esc(fq.q)}</summary><p>${esc(fq.a)}</p></details>`).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <header class="section-header fade-in">
        <span class="eyebrow">Andre ydelser</span>
        <h2>Se hvad vi ellers tilbyder</h2>
      </header>
      <div class="services-grid" style="margin-top:2rem">${related}</div>
    </div>
  </section>

  <section style="background:linear-gradient(135deg,var(--gold-dark),var(--gold));padding:5rem 0">
    <div class="container" style="text-align:center">
      <h2 style="color:var(--charcoal)">Klar til professionel ${esc(svc.title.toLowerCase())}?</h2>
      <p style="color:rgba(26,26,24,0.7);margin-bottom:2rem">Ring i dag og book en gratis og uforpligtende besigtigelse.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="tel:${f.phone}" class="btn btn-dark">📞 ${f.phoneDisplay}</a>
        <a href="/booking/" class="btn" style="background:rgba(255,255,255,0.25);color:var(--charcoal);border:2px solid rgba(255,255,255,0.5)">📅 Book besigtigelse</a>
      </div>
    </div>
  </section>
`;
}

function genCityPage(city) {
  const f    = site.firm;
  const years= new Date().getFullYear() - f.founded;

  const citySchema = JSON.stringify({
    "@context":"https://schema.org","@type":"LocalBusiness",
    "name":`${f.name} – Gulvafslibning ${city.name}`,
    "description":`Professionel gulvafslibning og gulvbehandling i ${city.name}. ${f.name} tilbyder gulvafslibning, gulvafhøvling, lak, lud, olie og sæbebehandling i ${city.area}.`,
    "url":`${f.domain}/${city.slug}/`, "telephone":f.phone, "areaServed": city.name,
  });

  const serviceList = site.services.map(s => `
    <a href="/${s.slug}/" class="service-card fade-in" style="text-decoration:none;color:inherit">
      <div class="service-icon">${s.icon}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.short)}</p>
      <span style="color:var(--gold);font-weight:600;font-size:0.88rem">Fra ${s.priceFrom} ${esc(s.unit)}</span>
    </a>`).join('');

  const reviews = site.testimonials.slice(0,3).map(t => `
    <article class="testimonial-card fade-in">
      <div class="stars">${stars(t.stars)}</div>
      <p>${esc(t.text)}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${esc(t.initials)}</div>
        <div><div class="author-name">${esc(t.name)}</div><div class="author-place">${esc(t.place)}</div></div>
      </div>
    </article>`).join('');

  return `
  <script type="application/ld+json">${citySchema}</script>
  <section class="page-header">
    <div class="container">
      <nav class="breadcrumb"><a href="/">Forside</a><span>›</span><span aria-current="page">Gulvafslibning ${esc(city.name)}</span></nav>
      <span class="eyebrow">📍 ${esc(city.name)}</span>
      <h1>Gulvafslibning i ${esc(city.name)}</h1>
      <p>${esc(f.name)} er din lokale specialist i gulvafslibning og gulvbehandling i ${esc(city.name)}. Vi betjener ${esc(city.area)} med professionelt håndværk og støvfrit udstyr.</p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.75rem">
        <a href="/booking/" class="btn btn-primary">📅 Book gratis besigtigelse i ${esc(city.name)}</a>
        <a href="tel:${f.phone}" class="btn btn-outline">📞 ${f.phoneDisplay}</a>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--cream)">
    <div class="container">
      <div class="why-grid">
        <div class="fade-in">
          <span class="eyebrow">Lokal ekspertise</span>
          <h2>Gulvspecialist i ${esc(city.name)}</h2>
          <p>Vi har behandlet hundredevis af gulve i ${esc(city.name)} og omegnen – fra klassiske parketvilla-gulve til moderne lejlighedsgulve og store erhvervsarealer.</p>
          <p style="margin-top:1rem">Med ${years}+ års erfaring kender vi de lokale udfordringer til perfektion: historiske gulve, pressede lejligheder og særlige krav til støjniveau.</p>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.5rem;margin-top:1.5rem">
            <li style="display:flex;gap:0.6rem"><span style="color:var(--gold)">✓</span> Gratis besigtigelse i ${esc(city.name)}</li>
            <li style="display:flex;gap:0.6rem"><span style="color:var(--gold)">✓</span> Tilbud inden 24 timer</li>
            <li style="display:flex;gap:0.6rem"><span style="color:var(--gold)">✓</span> Støvfrit udstyr – bliv boende hjemme</li>
            <li style="display:flex;gap:0.6rem"><span style="color:var(--gold)">✓</span> 2 års garanti på alt arbejde</li>
            <li style="display:flex;gap:0.6rem"><span style="color:var(--gold)">✓</span> Miljøvenlige produkter</li>
          </ul>
        </div>
        <div class="fade-in">
          <div class="price-card">
            <div class="eyebrow">Priser i ${esc(city.name)}</div>
            ${site.services.map(s => `<div class="price-service-row"><span>${esc(s.icon)} ${esc(s.title)}</span><span>Fra ${s.priceFrom} ${esc(s.unit)}</span></div>`).join('')}
            <a href="/tilbud/" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1.5rem">🧮 Beregn din pris</a>
            <div style="text-align:center;margin-top:1rem">
              <a href="tel:${f.phone}" style="color:var(--gold);font-weight:600;font-size:0.9rem">📞 ${f.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <header class="section-header fade-in">
        <span class="eyebrow">Ydelser i ${esc(city.name)}</span>
        <h2>Alle gulvydelser – én leverandør</h2>
      </header>
      <div class="services-grid" style="margin-top:2.5rem">${serviceList}</div>
    </div>
  </section>

  <section class="section testimonials-section">
    <div class="container">
      <header class="section-header centered fade-in">
        <span class="eyebrow">Kunderne siger</span>
        <h2>Anmeldelser fra Storkøbenhavn</h2>
      </header>
      <div class="testimonials-grid" style="margin-top:2.5rem">${reviews}</div>
    </div>
  </section>

  <section style="background:linear-gradient(135deg,var(--gold-dark),var(--gold));padding:5rem 0">
    <div class="container" style="text-align:center">
      <h2 style="color:var(--charcoal)">Book gratis besigtigelse i ${esc(city.name)}</h2>
      <p style="color:rgba(26,26,24,0.7);margin-bottom:2rem">Vi kommer til dig og vurderer dit gulv – helt gratis og uforpligtende.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="tel:${f.phone}" class="btn btn-dark">📞 ${f.phoneDisplay}</a>
        <a href="/booking/" class="btn" style="background:rgba(255,255,255,0.25);color:var(--charcoal);border:2px solid rgba(255,255,255,0.5)">📅 Book online</a>
      </div>
    </div>
  </section>
`;
}

// ── MAIN BUILD ───────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════╗');
console.log('║   H&K Gulventreprise — Build                 ║');
console.log('╚══════════════════════════════════════════════╝\n');

mkdir(DIST);
['css','js','images/galleri'].forEach(d => mkdir(path.join(DIST, d)));

// Copy assets
['css/style.css','css/gallery.css','js/main.js','js/gallery.js'].forEach(f => {
  copyFile(path.join(SRC, f), path.join(DIST, f));
});

// Copy images rekursivt
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(f => {
    const s = path.join(src, f), d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  });
}
if (fs.existsSync(path.join(SRC,'images'))) {
  copyDir(path.join(SRC,'images'), path.join(DIST,'images'));
}

// Generate all pages
const pages = [
  // Core
  { file:'index.html',            content:genHome(),    title:site.seo.titleDefault,                                          desc:site.seo.description, canonical:`${site.firm.domain}/`, active:'' },
  { file:'galleri/index.html',    content:genGallery(), title:'Galleri – Gulvprojekter | H&K Gulventreprise',                 active:'galleri'    },
  { file:'kontakt/index.html',    content:genContact(), title:'Kontakt H&K Gulventreprise – Gulvafslibning København',         active:'kontakt'    },
  { file:'booking/index.html',    content:genBooking(), title:'Book gratis besigtigelse | H&K Gulventreprise',                 active:''           },
  { file:'tilbud/index.html',     content:genCalc(),    title:'Tilbudsberegner – Beregn pris på gulvafslibning | H&K Gulv',   active:'tilbud'     },
  { file:'referencer/index.html', content:genRefs(),    title:'Referencer – Rigshospitalet, Tivoli & mere | H&K Gulventreprise', active:'referencer' },
  { file:'om/index.html',         content:genAbout(),   title:'Om os – H&K Gulventreprise siden 1999',                        active:'om'         },
];

// Service pages
site.services.forEach(svc => {
  pages.push({
    file:    `${svc.slug}/index.html`,
    content: genServicePage(svc),
    title:   `${svc.title} i København – Professionel gulvbehandling | H&K Gulventreprise`,
    desc:    `${svc.short} ${site.firm.name} tilbyder professionel ${svc.title.toLowerCase()} i hele Storkøbenhavn. Fra ${svc.priceFrom} ${svc.unit}. Ring +45 30 28 47 96.`,
    canonical: `${site.firm.domain}/${svc.slug}/`,
    active:  'ydelser',
  });
});

// City SEO pages
site.cities.forEach(city => {
  pages.push({
    file:    `${city.slug}/index.html`,
    content: genCityPage(city),
    title:   `Gulvafslibning ${city.name} – Professionel gulvbehandling | H&K Gulventreprise`,
    desc:    `Professionel gulvafslibning og gulvbehandling i ${city.name}. H&K Gulventreprise tilbyder gulvafslibning, lak, lud, olie og sæbebehandling i ${city.area}. Gratis besigtigelse. Ring +45 30 28 47 96.`,
    canonical: `${site.firm.domain}/${city.slug}/`,
    active:  '',
  });
});

pages.forEach(p => {
  write(path.join(DIST, p.file), page({ title:p.title, description:p.desc, canonical:p.canonical, content:p.content, active:p.active||'' }));
});

// Sitemap
const allUrls = [
  { url:'', priority:'1.0', freq:'weekly'  },
  ...['galleri','kontakt','booking','tilbud','referencer','om'].map(u => ({ url:`${u}/`, priority:'0.8', freq:'monthly' })),
  ...site.services.map(s => ({ url:`${s.slug}/`, priority:'0.9', freq:'monthly' })),
  ...site.cities.map(c  => ({ url:`${c.slug}/`, priority:'0.85', freq:'monthly' })),
];

write(path.join(DIST,'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${site.firm.domain}/${u.url}</loc>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`);

write(path.join(DIST,'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.firm.domain}/sitemap.xml\n`);

write(path.join(DIST,'.htaccess'), `# H&K Gulventreprise — One.com Apache
Options -Indexes
ErrorDocument 404 /index.html

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# www redirect
RewriteCond %{HTTP_HOST} !^www\\.
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css              "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png             "access plus 6 months"
  ExpiresByType image/jpeg            "access plus 6 months"
  ExpiresByType image/webp            "access plus 6 months"
  ExpiresByType text/html             "access plus 1 hour"
</IfModule>

# Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript text/xml
</IfModule>

# Security
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
`);

const total = pages.length;
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  ✅ Build complete → public/`);
console.log(`  📄 ${total} sider genereret`);
console.log(`  💻 Preview: npx serve public -l 3000`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
