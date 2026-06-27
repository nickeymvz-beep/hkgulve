# H&K Gulventreprise — Hjemmeside

**Alt indenfor gulve** | [hk-gulv.dk](https://www.hk-gulv.dk)

---

## 🚀 Kom i gang

### 1. Pak ud og placér på skrivebordet

```
Skrivebord/
└── hk-gulv/
    ├── build.js
    ├── package.json
    ├── src/
    │   ├── data/site.js   ← ⭐ AL INDHOLD her
    │   ├── css/
    │   └── js/
    └── public/            ← Dette uploades til One.com
```

### 2. Åbn Terminal og kør

```bash
cd ~/Desktop/hk-gulv
node build.js
```

### 3. Se siden lokalt

```bash
npx serve public -l 3000
```

Åbn [http://localhost:3000](http://localhost:3000)

> Første gang: npm spørger om at installere `serve` — skriv `y` og tryk Enter.

---

## ✏️ Rediger indhold

**Al tekst, priser og firmainformation** redigeres i én fil:

```
src/data/site.js
```

Åbn den i VS Code, Sublime Text eller TextEdit.

**Eksempler:**

```js
// Skift telefonnummer:
phone: '+4530284796',
phoneDisplay: '+45 30 28 47 96',

// Tilføj en reference:
{ name: 'Ny Kunde A/S', icon: '🏢', type: 'Erhverv', cat: 'erhverv',
  desc: 'Beskrivelse af opgaven.' },

// Skift pris:
{ slug: 'afslibning', priceFrom: 130, ... }
```

**Husk at genbygge efter ændringer:**
```bash
node build.js
```

---

## 📁 Hvad bygges

```
public/
├── index.html                 ← Forside
├── galleri/index.html
├── kontakt/index.html
├── booking/index.html
├── tilbud/index.html
├── referencer/index.html
├── om/index.html
├── afslibning/index.html      ← Service-undersider (SEO)
├── hoevling/index.html
├── lud/index.html
├── lak/index.html
├── olie/index.html
├── saebe/index.html
├── koebenhavn/index.html      ← By-SEO sider
├── frederiksberg/index.html
├── hellerup/index.html
├── gentofte/index.html
├── lyngby/index.html
├── hvidovre/index.html
├── roskilde/index.html
├── hilleroed/index.html
├── sitemap.xml
├── robots.txt
└── .htaccess
```

---

## 🌐 Upload til One.com

1. Kør `node build.js`
2. Gå til [one.com](https://www.one.com) → Log ind → Filhåndtering
3. Naviger til `public_html/`
4. Upload **indholdet** af `public/` mappen (ikke selve mappen!)
5. Aktivér SSL: Kontrolpanel → SSL certifikat → Aktivér Let's Encrypt

---

## 🖼️ Tilføj rigtige billeder

1. Læg billedfiler i `src/images/galleri/`
2. Opdatér `gallery` arrayet i `src/data/site.js`:

```js
{ id: 0, cat: 'olie', cls: 'ft-olie', img: 'images/galleri/projekt1.jpg',
  title: 'Dit projektnavn', loc: 'Adresse, by', tag: 'Olie' },
```

3. Kør `node build.js`

---

## 📞 Kontakt & support

- **Telefon:** +45 30 28 47 96
- **E-mail:** kontakt@hk-gulv.dk
