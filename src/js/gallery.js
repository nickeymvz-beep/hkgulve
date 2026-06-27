/* H&K Gulventreprise — Gallery JS
   Before/After sliders · Filter · Lightbox
*/

// ── BEFORE/AFTER SLIDERS ──────────────────────
function initBeforeAfter() {
  document.querySelectorAll('.ba-wrap').forEach(wrap => {
    let active = false;
    const after  = wrap.querySelector('.ba-after');
    const handle = wrap.querySelector('.ba-handle');
    const divider= wrap.querySelector('.ba-divider');

    function setPos(clientX) {
      const rect = wrap.getBoundingClientRect();
      const pct  = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
      if (after)   after.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
      if (handle)  handle.style.left     = pct + '%';
      if (divider) divider.style.left    = pct + '%';
    }

    // Default 50%
    requestAnimationFrame(() => {
      const rect = wrap.getBoundingClientRect();
      setPos(rect.left + rect.width * 0.5);
    });

    wrap.addEventListener('mousedown',  e => { active = true; setPos(e.clientX); e.preventDefault(); });
    wrap.addEventListener('touchstart', e => { active = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mousemove',  e => { if (active) setPos(e.clientX); });
    window.addEventListener('touchmove',  e => { if (active) setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup',  () => { active = false; });
    window.addEventListener('touchend', () => { active = false; });
  });
}

// ── GALLERY FILTER ────────────────────────────
function initGalleryFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      items.forEach(item => {
        const show = f === 'alle' || item.dataset.cat === f;
        item.style.display = show ? '' : 'none';
        if (show) {
          item.classList.remove('visible');
          requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('visible')));
        }
      });
    });
  });
}

// ── LIGHTBOX ──────────────────────────────────
let lbData  = [];
let lbIndex = 0;

function openLightbox(id) {
  const idx = lbData.findIndex(g => g.id === id);
  if (idx < 0) return;
  lbIndex = idx;
  renderLb();
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; }
}
function lbNav(dir) {
  if (!lbData.length) return;
  lbIndex = (lbIndex + dir + lbData.length) % lbData.length;
  renderLb();
}
function renderLb() {
  const g = lbData[lbIndex];
  if (!g) return;
  const img   = document.getElementById('lbImg');
  const title = document.getElementById('lbTitle');
  const loc   = document.getElementById('lbLoc');
  if (img)   img.className = 'floor-thumb ' + (g.cls || '');
  if (title) title.textContent = g.title || '';
  if (loc)   loc.textContent   = g.loc   || '';
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBeforeAfter();
  initGalleryFilter();

  // Collect gallery data from DOM
  document.querySelectorAll('.gallery-item').forEach(el => {
    lbData.push({
      id:    parseInt(el.dataset.id),
      cat:   el.dataset.cat,
      cls:   el.querySelector('.floor-thumb')?.className.replace('floor-thumb','').trim() || '',
      title: el.querySelector('.gallery-overlay-content h4')?.textContent || '',
      loc:   el.querySelector('.gallery-overlay-content p')?.textContent  || '',
    });
  });

  // Gallery click
  document.querySelectorAll('.gallery-item').forEach(el => {
    const open = () => openLightbox(parseInt(el.dataset.id));
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });

  // Lightbox controls
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lbPrev')?.addEventListener('click', () => lbNav(-1));
  document.getElementById('lbNext')?.addEventListener('click', () => lbNav( 1));
  document.getElementById('lightbox')?.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbNav(-1);
    if (e.key === 'ArrowRight') lbNav( 1);
  });
});
