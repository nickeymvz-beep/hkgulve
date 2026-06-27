#!/usr/bin/env node
// patch-ba.js — Opdater før/efter slides til at bruge site.beforeAfter
const fs = require('fs');

let b = fs.readFileSync('build.js', 'utf8');

const oldBA = `  const baCards = [
    { cls:'',      title:'Eg bræddegulv — afslibning + oliebehandling', meta:'Privat villa, Hellerup · 85 m²',   tag:'Olie' },
    { cls:'lud',   title:'Ask bræddegulv — hvid lud + sæbebehandling',  meta:'Lejlighed, Østerbro · 62 m²',     tag:'Lud'  },
    { cls:'lak',   title:'Parketgulv — afslibning + mat lak 3 lag',      meta:'Erhverv, Frederiksberg · 210 m²', tag:'Lak'  },
    { cls:'parket',title:'Fiskebens-parket — restaurering + olie',        meta:'Hotel Sanders · 320 m²',          tag:'Parket'},
  ].map((b,i) => \`
    <div class="ba-card fade-in">
      <div class="ba-wrap\${b.cls ? ' '+b.cls : ''}" id="ba\${i+1}">
        <div class="ba-before"></div>
        <div class="ba-after"></div>
        <div class="ba-divider" aria-hidden="true"></div>
        <div class="ba-handle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6" transform="translate(6,0)"/>
          </svg>
        </div>
        <span class="ba-label before">Før</span>
        <span class="ba-label after">Efter</span>
      </div>
      <div class="ba-card-info">
        <h4>\${esc(b.title)}</h4>
        <p>\${esc(b.meta)}</p>
        <span class="ba-tag">\${esc(b.tag)}</span>
      </div>
    </div>\`).join('');`;

const newBA = `  const baCards = (site.beforeAfter || []).map((b,i) => {
    const beforeEl = b.before
      ? \`<img src="/\${b.before}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">\`
      : \`<div class="ba-before"></div>\`;
    const afterEl = b.after
      ? \`<img src="/\${b.after}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:inset(0 50% 0 0)">\`
      : \`<div class="ba-after"></div>\`;
    return \`
    <div class="ba-card fade-in">
      <div class="ba-wrap" id="ba\${i+1}">
        \${beforeEl}
        \${afterEl}
        <div class="ba-divider" aria-hidden="true"></div>
        <div class="ba-handle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6" transform="translate(6,0)"/>
          </svg>
        </div>
        <span class="ba-label before">Før</span>
        <span class="ba-label after">Efter</span>
      </div>
      <div class="ba-card-info">
        <h4>\${esc(b.title)}</h4>
        <p>\${esc(b.meta)}</p>
        <span class="ba-tag">\${esc(b.tag)}</span>
      </div>
    </div>\`;
  }).join('');`;

if (b.includes(oldBA)) {
  b = b.replace(oldBA, newBA);
  fs.writeFileSync('build.js', b);
  console.log('✓ build.js opdateret');
} else {
  console.log('⚠ Kunne ikke finde sektionen — tjek build.js manuelt');
}
