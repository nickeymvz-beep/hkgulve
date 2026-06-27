/* H&K Gulventreprise — Main JS */

// ── NAVBAR ────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

window.addEventListener('scroll', () => {
  navbar && (window.scrollY > 60 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled'));
  const st = document.getElementById('scrollTop');
  st && (window.scrollY > 400 ? st.classList.add('show') : st.classList.remove('show'));
});

function openMobileNav() {
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
hamburger  && hamburger.addEventListener('click', openMobileNav);
mobileClose && mobileClose.addEventListener('click', closeMobileNav);

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobileNav));

// ── FADE IN OBSERVER ──────────────────────────
function initFadeIns() {
  const els = document.querySelectorAll('.fade-in:not(.visible)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// ── CALCULATOR ────────────────────────────────
function calcPris() {
  const areal    = parseFloat(document.getElementById('calcAreal')?.value || 0);
  const ydelse   = document.getElementById('calcYdelse')?.value;
  const tilstand = document.getElementById('calcTilstand')?.value;
  const result   = document.getElementById('calcResult');
  if (!areal || areal < 1) { alert('Angiv venligst et gyldigt areal'); return; }

  const priser   = { slibning:120, hoevling:95, lud:65, lak:85, olie:75, saebe:60, kombineret:175 };
  const faktorer = { god:1, middel:1.2, darlig:1.5 };
  const base     = (priser[ydelse] || 120) * areal * (faktorer[tilstand] || 1);

  document.getElementById('calcResultMin').textContent = Math.round(base * 0.85).toLocaleString('da-DK');
  document.getElementById('calcResultMax').textContent = Math.round(base * 1.15).toLocaleString('da-DK');
  if (result) { result.classList.add('show'); result.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// ── RANGE SLIDER ──────────────────────────────
function syncRange() {
  const slider  = document.getElementById('arealSlider');
  const display = document.getElementById('arealVal');
  const input   = document.getElementById('calcAreal');
  if (!slider) return;
  slider.addEventListener('input', () => {
    const v = slider.value;
    if (display) display.textContent = parseInt(v).toLocaleString('da-DK') + ' m²';
    if (input)   input.value = v;
  });
  input && input.addEventListener('input', () => {
    const v = Math.min(500, Math.max(10, parseInt(input.value) || 10));
    slider.value = v;
    if (display) display.textContent = v.toLocaleString('da-DK') + ' m²';
  });
}

// ── BOOKING FORM ──────────────────────────────
function submitBooking(e) {
  e && e.preventDefault();
  const form    = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');
  if (!form) return;
  form.style.opacity = '0.4';
  form.style.pointerEvents = 'none';
  setTimeout(() => {
    if (success) success.classList.add('show');
    form.style.opacity = '1';
    form.style.pointerEvents = '';
    form.reset();
  }, 800);
}

// ── CONTACT FORM ──────────────────────────────
function submitContact(e) {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  if (!form) return;
  form.style.opacity = '0.4';
  setTimeout(() => {
    if (success) success.classList.add('show');
    form.style.opacity = '1';
    form.reset();
  }, 800);
}

// ── MARQUEE ───────────────────────────────────
function initMarquee() {
  const marquee = document.querySelector('.ref-marquee');
  if (marquee && !marquee.dataset.duped) {
    marquee.innerHTML += marquee.innerHTML;
    marquee.dataset.duped = '1';
  }
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFadeIns();
  initMarquee();
  syncRange();

  const calcBtn = document.getElementById('calcBtn');
  calcBtn && calcBtn.addEventListener('click', calcPris);

  const bkForm = document.getElementById('bookingForm');
  bkForm && bkForm.addEventListener('submit', submitBooking);

  const ctForm = document.getElementById('contactForm');
  ctForm && ctForm.addEventListener('submit', submitContact);
});
