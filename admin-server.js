#!/usr/bin/env node
// admin-server.js
const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const { execSync } = require('child_process');

const app  = express();
const PORT = 4000;
const SITE_JS  = path.join(__dirname, 'src/data/site.js');
const GALLERI  = path.join(__dirname, 'src/images/galleri');
const PUB_GALL = path.join(__dirname, 'public/images/galleri');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, GALLERI),
  filename:    (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getSite() {
  delete require.cache[require.resolve(SITE_JS)];
  return require(SITE_JS);
}

function saveSite(site) {
  fs.writeFileSync(SITE_JS, 'module.exports = ' + JSON.stringify(site, null, 2) + ';', 'utf8');
}

function build() {
  try { execSync('node build.js', { cwd: __dirname, stdio: 'inherit' }); }
  catch (e) { console.error('Build fejl:', e.message); }
}

app.get('/admin-api/site', (req, res) => res.json(getSite()));

app.post('/admin-api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ingen fil' });
  fs.copyFileSync(path.join(GALLERI, req.file.originalname), path.join(PUB_GALL, req.file.originalname));
  res.json({ filename: req.file.originalname, path: 'images/galleri/' + req.file.originalname });
});

app.post('/admin-api/gallery/:id', (req, res) => {
  try {
    const site = getSite();
    const idx  = site.gallery.findIndex(g => g.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Ikke fundet' });
    Object.assign(site.gallery[idx], req.body);
    saveSite(site); build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin-api/ba/:idx', (req, res) => {
  try {
    const site = getSite();
    if (!site.beforeAfter) site.beforeAfter = [];
    Object.assign(site.beforeAfter[req.params.idx], req.body);
    saveSite(site); build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin-api/firm', (req, res) => {
  try {
    const site = getSite();
    Object.assign(site.firm, req.body);
    saveSite(site); build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin-api/service/:slug', (req, res) => {
  try {
    const site = getSite();
    const svc  = site.services.find(s => s.slug === req.params.slug);
    if (!svc) return res.status(404).json({ error: 'Ikke fundet' });
    Object.assign(svc, req.body);
    saveSite(site); build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin-api/testimonial/:idx', (req, res) => {
  try {
    const site = getSite();
    Object.assign(site.testimonials[req.params.idx], req.body);
    saveSite(site); build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin-api/faq/:idx', (req, res) => {
  try {
    const site = getSite();
    Object.assign(site.faq[req.params.idx], req.body);
    saveSite(site); build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin-api/calc', (req, res) => {
  try {
    const { id, price } = req.body;
    let b = fs.readFileSync(path.join(__dirname, 'build.js'), 'utf8');
    b = b.replace(new RegExp("('" + id + "':\\s*)\\d+"), "$1" + price);
    fs.writeFileSync(path.join(__dirname, 'build.js'), b);
    build();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/admin-api/images', (req, res) => {
  const files = fs.readdirSync(GALLERI).filter(f => /\.(jpg|jpeg|png|webp|PNG|JPG)/i.test(f));
  res.json(files);
});

app.get('/admin', (req, res) => res.send(getHTML()));
app.get('/admin/', (req, res) => res.send(getHTML()));

function getHTML() {
return `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>H&K Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#0f0f0d;color:#fff;min-height:100vh}
.topbar{background:#1a1a18;border-bottom:1px solid #333;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.topbar h1{font-size:1.1rem;color:#C9A84C}
.dot{width:8px;height:8px;border-radius:50%;background:#4CAF50;display:inline-block;margin-right:6px;animation:p 2s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
.layout{display:grid;grid-template-columns:200px 1fr;min-height:calc(100vh - 57px)}
.sidebar{background:#141412;border-right:1px solid #222;padding:1.5rem 0}
.sidebar a{display:block;padding:.75rem 1.5rem;color:#888;text-decoration:none;font-size:.88rem;border-left:3px solid transparent;cursor:pointer}
.sidebar a:hover,.sidebar a.active{color:#C9A84C;background:rgba(201,168,76,.05);border-left-color:#C9A84C}
.slabel{padding:1rem 1.5rem .4rem;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#444}
.content{padding:2rem 2rem 6rem}
.panel{display:none}.panel.active{display:block}
h2{font-size:1.3rem;margin-bottom:1.5rem}
h3{font-size:1rem;margin-bottom:1rem;color:#C9A84C}
.card{background:#1a1a18;border:1px solid #2a2a28;border-radius:10px;padding:1.5rem;margin-bottom:1.5rem}
.field{margin-bottom:1rem}
.field label{display:block;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:#C9A84C;margin-bottom:.4rem}
.field input,.field textarea,.field select{width:100%;background:#0f0f0d;border:1px solid #333;border-radius:6px;padding:.65rem .85rem;color:#fff;font-family:inherit;font-size:.9rem}
.field input:focus,.field textarea:focus{outline:none;border-color:#C9A84C}
.field textarea{min-height:80px;resize:vertical}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.btn{padding:.65rem 1.5rem;border-radius:6px;border:none;cursor:pointer;font-size:.88rem;font-weight:600;transition:all .2s}
.btn-gold{background:#C9A84C;color:#1a1a18}.btn-gold:hover{background:#E8C96A}
.btn-dark{background:#2a2a28;color:#fff}
.btn-sm{padding:.4rem .9rem;font-size:.8rem}
.ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
.gcart{background:#1a1a18;border:1px solid #2a2a28;border-radius:10px;overflow:hidden}
.gcart img{width:100%;height:140px;object-fit:cover;display:block;cursor:pointer}
.gcart-body{padding:.75rem}
.gcart-body input,.gcart-body select{width:100%;background:#0f0f0d;border:1px solid #333;border-radius:4px;padding:.4rem .6rem;color:#fff;font-size:.82rem;margin-bottom:.4rem}
.drop-zone{border:2px dashed #444;border-radius:8px;padding:1.5rem;text-align:center;color:#666;cursor:pointer;margin-top:.5rem}
.drop-zone:hover{border-color:#C9A84C;color:#C9A84C}
.notice{background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:.88rem;color:#C9A84C}
.toast{position:fixed;bottom:2rem;right:2rem;background:#4CAF50;color:#fff;padding:.75rem 1.5rem;border-radius:8px;font-weight:600;display:none;z-index:999}
.toast.show{display:block}
.toast.err{background:#cc3333}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:1000;align-items:center;justify-content:center}
.modal.open{display:flex}
.modal-inner{background:#1a1a18;border:1px solid #333;border-radius:12px;padding:2rem;width:min(90vw,600px);max-height:80vh;overflow-y:auto}
.ipicker{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.5rem;max-height:260px;overflow-y:auto;margin-top:.5rem}
.ipicker img{width:100%;height:70px;object-fit:cover;border-radius:4px;cursor:pointer;border:2px solid transparent}
.ipicker img:hover,.ipicker img.sel{border-color:#C9A84C}
select option{background:#1a1a18}
</style>
</head>
<body>
<div class="topbar">
  <div style="display:flex;align-items:center;gap:1rem">
    <h1>H&amp;K Gulventreprise &mdash; Admin</h1>
    <span><span class="dot"></span><span style="font-size:.78rem;color:#666" id="status">Indlaeder...</span></span>
  </div>
  <a href="http://localhost:3000" target="_blank" style="color:#C9A84C;font-size:.82rem;text-decoration:none">Se siden live</a>
</div>
<div class="layout">
  <nav class="sidebar">
    <div class="slabel">Indhold</div>
    <a id="nav-galleri" onclick="show('galleri')" class="active">Galleri</a>
    <a id="nav-baslider" onclick="show('baslider')">Foer/efter slides</a>
    <a id="nav-firma" onclick="show('firma')">Firma info</a>
    <a id="nav-priser" onclick="show('priser')">Priser</a>
    <a id="nav-anmeldelser" onclick="show('anmeldelser')">Anmeldelser</a>
    <a id="nav-faq" onclick="show('faq')">FAQ</a>
    <a id="nav-calc" onclick="show('calc')">Tilbudsberegner</a>
  </nav>
  <main class="content">
    <div class="panel active" id="panel-galleri">
      <h2>Billedgalleri</h2>
      <div class="notice">Klik paa et billede for at skifte det ud. Siden opdaterer sig automatisk.</div>
      <div class="ggrid" id="gallery-grid">Indlaeder...</div>
    </div>
    <div class="panel" id="panel-baslider">
      <h2>Foer/efter slides</h2>
      <div class="notice">Klik paa et billede for at skifte det ud.</div>
      <div id="ba-list">Indlaeder...</div>
    </div>
    <div class="panel" id="panel-firma">
      <h2>Firma information</h2>
      <div class="card">
        <div class="grid2" id="firma-fields">Indlaeder...</div>
        <button class="btn btn-gold" style="margin-top:1rem" onclick="saveFirm()">Gem firma info</button>
      </div>
    </div>
    <div class="panel" id="panel-priser">
      <h2>Priser og ydelser</h2>
      <div id="services-list">Indlaeder...</div>
    </div>
    <div class="panel" id="panel-anmeldelser">
      <h2>Anmeldelser</h2>
      <div id="testimonials-list">Indlaeder...</div>
    </div>
    <div class="panel" id="panel-faq">
      <h2>FAQ</h2>
      <div id="faq-list">Indlaeder...</div>
    </div>
    <div class="panel" id="panel-calc">
      <h2>Tilbudsberegner priser</h2>
      <div class="notice">Rediger priserne og tryk Gem. Siden opdaterer sig automatisk.</div>
      <div id="calc-list">Indlaeder...</div>
    </div>
  </main>
</div>
<div class="modal" id="modal">
  <div class="modal-inner">
    <h3>Vaelg eller upload billede</h3>
    <div class="drop-zone" onclick="document.getElementById('fup').click()">
      <input type="file" id="fup" accept="image/*" style="display:none" onchange="handleUpload(event)"/>
      Klik her eller traek et billede ind
    </div>
    <p style="color:#666;font-size:.82rem;margin:1rem 0 .5rem">Eller vaelg eksisterende:</p>
    <div class="ipicker" id="ipicker"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem">
      <button class="btn btn-gold" onclick="confirmImg()">Vaelg</button>
      <button class="btn btn-dark" onclick="closeModal()">Annuller</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
var site = {};
var modalFor = null;
var modalField = null;
var selImg = null;

function show(id) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.sidebar a').forEach(function(a) { a.classList.remove('active'); });
  document.getElementById('panel-' + id).classList.add('active');
  document.getElementById('nav-' + id).classList.add('active');
}

function toast(msg, err) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = err ? 'toast show err' : 'toast show';
  setTimeout(function() { t.className = 'toast'; }, 3000);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  modalFor = null; modalField = null; selImg = null;
}

async function init() {
  try {
    var r = await fetch('/admin-api/site');
    site = await r.json();
    document.getElementById('status').textContent = 'Live';
    renderGallery();
    renderBA();
    renderFirm();
    renderServices();
    renderTestimonials();
    renderFaq();
    renderCalc();
  } catch(e) {
    document.getElementById('status').textContent = 'Fejl';
  }
}

function renderGallery() {
  var html = '';
  site.gallery.forEach(function(g) {
    var safeTitle = (g.title||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    var safeLoc   = (g.loc||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    html += '<div class="gcart">';
    html += '<img src="http://localhost:3000/' + g.img + '" onerror="this.src=String.fromCharCode(39,39)" style="cursor:pointer" data-gid="' + g.id + '" onclick="openModal(' + g.id + ')" title="Klik for at skifte"/>';
    html += '<div class="gcart-body">';
    html += '<input value="' + safeTitle + '" placeholder="Titel" data-id="' + g.id + '" data-field="title" onblur="saveFromEl(this)"/>';
    html += '<input value="' + safeLoc + '" placeholder="Lokation" data-id="' + g.id + '" data-field="loc" onblur="saveFromEl(this)"/>';
    html += '<select data-id="' + g.id + '" onchange="saveGalleryCat(' + g.id + ',this.value)">';
    ['olie','lak','lud','saebe','parket','erhverv','foer'].forEach(function(c) {
      html += '<option value="' + c + '"' + (g.cat === c ? ' selected' : '') + '>' + c + '</option>';
    });
    html += '</select>';
    html += '</div></div>';
  });
  document.getElementById('gallery-grid').innerHTML = html;
}

function saveFromEl(el) {
  saveGallery(parseInt(el.getAttribute('data-id')), el.getAttribute('data-field'), el.value);
}

async function saveGalleryCat(id, val) {
  saveGallery(id, 'cat', val);
}

async function saveGallery(id, field, value) {
  var body = {}; body[field] = value;
  var r = await fetch('/admin-api/gallery/' + id, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d = await r.json();
  if (d.ok) toast('Gemt og bygget!'); else toast('Fejl: ' + d.error, true);
}

function renderBA() {
  if (!site.beforeAfter || !site.beforeAfter.length) {
    document.getElementById('ba-list').innerHTML = '<p style="color:#666">Ingen slides.</p>';
    return;
  }
  var html = '';
  site.beforeAfter.forEach(function(b, i) {
    html += '<div class="card">';
    html += '<div class="grid2" style="margin-bottom:1rem">';
    html += '<div><p style="color:#C9A84C;font-size:.75rem;margin-bottom:.5rem">FOER BILLEDE</p>';
    html += '<img src="http://localhost:3000/' + b.before + '" style="width:100%;height:140px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid #333" onclick="openBAModal(' + i + ',\'before\')" />';
    html += '</div><div><p style="color:#C9A84C;font-size:.75rem;margin-bottom:.5rem">EFTER BILLEDE</p>';
    html += '<img src="http://localhost:3000/' + b.after + '" style="width:100%;height:140px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid #333" onclick="openBAModal(' + i + ',\'after\')" />';
    html += '</div></div>';
    html += '<div class="grid2">';
    html += '<div class="field"><label>Titel</label><input value="' + (b.title||'') + '" onblur="saveBA(' + i + ',\'title\',this.value)"/></div>';
    html += '<div class="field"><label>Tag</label><input value="' + (b.tag||'') + '" onblur="saveBA(' + i + ',\'tag\',this.value)"/></div>';
    html += '</div></div>';
  });
  document.getElementById('ba-list').innerHTML = html;
}

async function openModal(id) {
  modalFor = id; modalField = 'img'; selImg = null;
  document.getElementById('modal').classList.add('open');
  var r = await fetch('/admin-api/images');
  var files = await r.json();
  var html = '';
  files.forEach(function(f) {
    html += '<img src="http://localhost:3000/images/galleri/' + encodeURIComponent(f) + '" title="' + f + '" onclick="selectImg(\'' + f + '\',this)"/>';
  });
  document.getElementById('ipicker').innerHTML = html;
}

async function openBAModal(idx, field) {
  modalFor = 'ba'; modalField = field; selImg = null;
  var baIdx = idx;
  document.getElementById('modal').classList.add('open');
  var r = await fetch('/admin-api/images');
  var files = await r.json();
  var html = '';
  files.forEach(function(f) {
    html += '<img src="http://localhost:3000/images/galleri/' + encodeURIComponent(f) + '" title="' + f + '" onclick="selectImg(\'' + f + '\',this)" data-baidx="' + idx + '"/>';
  });
  document.getElementById('ipicker').innerHTML = html;
  window._baIdx = baIdx;
}

function selectImg(f, el) {
  document.querySelectorAll('.ipicker img').forEach(function(i) { i.classList.remove('sel'); });
  el.classList.add('sel');
  selImg = 'images/galleri/' + f;
}

async function handleUpload(e) {
  var file = e.target.files[0];
  if (!file) return;
  toast('Uploader...');
  var fd = new FormData();
  fd.append('image', file);
  var r = await fetch('/admin-api/upload', {method:'POST',body:fd});
  var d = await r.json();
  if (d.path) { selImg = d.path; toast('Uploadet! Klik Vaelg.'); }
  else toast('Fejl ved upload', true);
}

async function confirmImg() {
  if (!selImg) { toast('Vaelg et billede foerst', true); return; }
  if (modalFor === 'ba') {
    var body = {}; body[modalField] = selImg;
    var r = await fetch('/admin-api/ba/' + window._baIdx, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    var d = await r.json();
    if (d.ok) { site.beforeAfter[window._baIdx][modalField] = selImg; renderBA(); closeModal(); toast('Slide opdateret!'); }
    else toast('Fejl: ' + d.error, true);
  } else {
    var body = {}; body[modalField] = selImg;
    var r = await fetch('/admin-api/gallery/' + modalFor, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    var d = await r.json();
    if (d.ok) { var g = site.gallery.find(function(x){return x.id===modalFor;}); if(g) g[modalField]=selImg; renderGallery(); closeModal(); toast('Billede gemt!'); }
    else toast('Fejl: ' + d.error, true);
  }
}

async function saveBA(idx, field, value) {
  var body = {}; body[field] = value;
  var r = await fetch('/admin-api/ba/' + idx, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d = await r.json();
  if (d.ok) toast('Gemt!'); else toast('Fejl', true);
}

function renderFirm() {
  var f = site.firm || {};
  var html = '';
  html += '<div class="field"><label>Navn</label><input id="ff-name" value="' + (f.name||'') + '"/></div>';
  html += '<div class="field"><label>Telefon visning</label><input id="ff-phone" value="' + (f.phoneDisplay||'') + '"/></div>';
  html += '<div class="field"><label>E-mail</label><input id="ff-email" value="' + (f.email||'') + '"/></div>';
  html += '<div class="field"><label>Aabningstider</label><input id="ff-hours" value="' + (f.hours||'') + '"/></div>';
  html += '<div class="field"><label>Arbejdsomraade</label><input id="ff-area" value="' + (f.area||'') + '"/></div>';
  document.getElementById('firma-fields').innerHTML = html;
}

async function saveFirm() {
  var body = {
    name: document.getElementById('ff-name').value,
    phoneDisplay: document.getElementById('ff-phone').value,
    email: document.getElementById('ff-email').value,
    hours: document.getElementById('ff-hours').value,
    area:  document.getElementById('ff-area').value,
  };
  var r = await fetch('/admin-api/firm', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d = await r.json();
  if (d.ok) toast('Firma info gemt og bygget!'); else toast('Fejl: ' + d.error, true);
}

function renderServices() {
  var html = '';
  (site.services||[]).forEach(function(s, i) {
    html += '<div class="card"><h3>' + s.icon + ' ' + s.title + '</h3>';
    html += '<div class="grid2">';
    html += '<div class="field"><label>Pris fra (kr./m2)</label><input type="number" id="sp-' + i + '" value="' + s.priceFrom + '"/></div>';
    html += '<div class="field"><label>Kort beskrivelse</label><input id="ss-' + i + '" value="' + (s.short||'').replace(/"/g,'&quot;') + '"/></div>';
    html += '</div>';
    html += '<button class="btn btn-gold btn-sm" onclick="saveService(\'' + s.slug + '\',' + i + ')">Gem</button>';
    html += '</div>';
  });
  document.getElementById('services-list').innerHTML = html;
}

async function saveService(slug, i) {
  var body = { priceFrom: parseInt(document.getElementById('sp-'+i).value), short: document.getElementById('ss-'+i).value };
  var r = await fetch('/admin-api/service/' + slug, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d = await r.json();
  if (d.ok) toast('Gemt og bygget!'); else toast('Fejl', true);
}

function renderTestimonials() {
  var html = '';
  (site.testimonials||[]).forEach(function(t, i) {
    html += '<div class="card"><div class="grid2">';
    html += '<div class="field"><label>Navn</label><input id="tn-' + i + '" value="' + (t.name||'') + '"/></div>';
    html += '<div class="field"><label>By/titel</label><input id="tp-' + i + '" value="' + (t.place||'') + '"/></div>';
    html += '<div class="field" style="grid-column:1/-1"><label>Anmeldelse</label><textarea id="tt-' + i + '">' + (t.text||'') + '</textarea></div>';
    html += '</div><button class="btn btn-gold btn-sm" onclick="saveTestimonial(' + i + ')">Gem</button></div>';
  });
  document.getElementById('testimonials-list').innerHTML = html;
}

async function saveTestimonial(i) {
  var body = { name: document.getElementById('tn-'+i).value, place: document.getElementById('tp-'+i).value, text: document.getElementById('tt-'+i).value };
  var r = await fetch('/admin-api/testimonial/' + i, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d = await r.json();
  if (d.ok) toast('Gemt og bygget!'); else toast('Fejl', true);
}

function renderFaq() {
  var html = '';
  (site.faq||[]).forEach(function(f, i) {
    html += '<div class="card">';
    html += '<div class="field"><label>Spoergsmaal</label><input id="fq-' + i + '" value="' + (f.q||'').replace(/"/g,'&quot;') + '"/></div>';
    html += '<div class="field"><label>Svar</label><textarea id="fa-' + i + '">' + (f.a||'') + '</textarea></div>';
    html += '<button class="btn btn-gold btn-sm" onclick="saveFaq(' + i + ')">Gem</button></div>';
  });
  document.getElementById('faq-list').innerHTML = html;
}

async function saveFaq(i) {
  var body = { q: document.getElementById('fq-'+i).value, a: document.getElementById('fa-'+i).value };
  var r = await fetch('/admin-api/faq/' + i, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d = await r.json();
  if (d.ok) toast('Gemt og bygget!'); else toast('Fejl', true);
}

function renderCalc() {
  var priser = [
    {id:'slibning',   label:'Gulvafslibning (kr./m2)',       pris:120},
    {id:'hoevling',   label:'Gulvafhoevling (kr./m2)',        pris:95},
    {id:'kombineret', label:'Slibning + behandling (kr./m2)', pris:175},
    {id:'lud',        label:'Lud behandling (kr./m2)',        pris:65},
    {id:'lak',        label:'Lak behandling (kr./m2)',        pris:85},
    {id:'olie',       label:'Olie behandling (kr./m2)',       pris:75},
    {id:'saebe',      label:'Saebe behandling (kr./m2)',      pris:60},
  ];
  var html = '';
  priser.forEach(function(p) {
    html += '<div class="card"><div class="grid2">';
    html += '<div class="field"><label>' + p.label + '</label><input type="number" id="cp-' + p.id + '" value="' + p.pris + '" min="0"/></div>';
    html += '<div style="display:flex;align-items:flex-end;padding-bottom:1rem"><button class="btn btn-gold btn-sm" onclick="saveCalcPrice(\'' + p.id + '\')">Gem</button></div>';
    html += '</div></div>';
  });
  document.getElementById('calc-list').innerHTML = html;
}

async function saveCalcPrice(id) {
  var val = document.getElementById('cp-' + id).value;
  var r = await fetch('/admin-api/calc', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,price:parseInt(val)})});
  var d = await r.json();
  if (d.ok) toast('Pris gemt og bygget!'); else toast('Fejl: ' + (d.error||'ukendt'), true);
}

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

init();
</script>
</body>
</html>`;
}

app.listen(PORT, function() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   H&K Admin Panel                            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\n  Admin:  http://localhost:' + PORT + '/admin');
  console.log('  Side:   http://localhost:3000\n');
});
