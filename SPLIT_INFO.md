# Rezervario Split Structure

## Arhitectura după split

Aplicația e împărțită în fișiere logice pentru ușurință de mentenanță și scalabilitate:

```
rezervio/
├── index.html                    # HTML pură + Firebase init + auth UI
├── js/
│   ├── config.js                 # Firebase config, constante globale, variables
│   ├── helpers.js                # Funcții helper (date, URL-uri, validări)
│   ├── icons.js                  # Iconițe SVG React
│   ├── templates.js              # Șabloane WhatsApp + variabile
│   └── app.js                    # App root + stări + toți callback-urile
│                                 # (nu include componente — alea vin mai târziu)
├── css/
│   └── styles.css                # Tot CSS-ul, **nu** inline în script
├── sw.js                         # Service Worker (PWA + push notifications)
├── manifest.json                 # PWA manifest
└── SPLIT_INFO.md                 # Acest fișier
```

## De ce split-ul ăsta?

1. **index.html e curat** — doar HTML, fără o sută de linii de JS inline
2. **config.js e singular** — o singură sursă de adevăr pentru Firebase + constante
3. **helpers.js e reutilizabil** — funcții importantă de oriunde
4. **templates.js e update-abil** — adaugă șabloane WhatsApp fără să atingi alt cod
5. **app.js va fi componentul root** — gestionează stare și lanseaza toți hook-urile
6. **styles.css e separată** — CSS mai ușor de debugged și de customizat
7. **Componente viitoare** — vor fi în fișiere separate (`components/ResTab.js`, etc.)

## Flow-ul de inițializare

1. **index.html** încarcă Firebase CDN + React + linkuri la scripturi
2. **config.js** e primul — definește variabilele globale și constante
3. **helpers.js** e după — depinde de constante din config.js
4. **icons.js** e după — iconițe pure, fără dependențe
5. **templates.js** e după — depinde de helpers
6. **app.js** e ultima — cuprinde App root + state management
7. **Firebase init** (în index.html script block 1) apelează `window.startApp()` după ce `PENSION_ID` e populat

## TODO: Componente de mutat în fișiere separate

Aceste componente sunt momentan **la comentariu** în `index-backup.html`, dar ar trebui să le extragi în fișiere proprii după ce confirm asta:

```
js/components/
├── Drawer.js
├── ResTab.js
├── ResRow.js
├── ResDetail.js
├── CalTab.js
├── StatsTab.js
├── ArchiveTab.js
├── ArchiveRow.js
├── MessagesMgr.js
├── TodayBar.js
├── RoomMgr.js
├── SrcMgr.js
├── ICalMgr.js
├── PdfExport.js
├── PricesMgr.js
├── ResMdl.js
├── Confirm.js
├── PensionSettings.js
├── AccountSettings.js
└── BillingInfo.js
```

## Schimburi necesare pentru a merge

1. **app.js** trebuie să importe (sau să-și definească local) pe **App component** și **startApp()**
2. **Fiecare componentă** dinspre backup.html trebuie copiată în fișierul ei propriu — de preferat, după ce ai confirmat că todo-ul ăsta e OK
3. **app.js** va face `import Drawer from './components/Drawer.js'` (sau echivalentul în UMD dacă vrem să evităm module)
4. **index.html** linkează la `js/app.js` și pune `<div id="root"></div>`

## De moment: ce-i gata?

✅ config.js
✅ helpers.js
✅ icons.js
✅ templates.js
✅ styles.css (separate)
✅ index.html (curat)
❌ app.js (pe jumătate — conține App root + state, NU componentele)
❌ components/*.js (nu sunt extrase încă)

## Cod vechi: index-backup.html

În `/home/claude/rezervio/index-backup.html` am o copie integrală a versiunii Brut-4283-linii de dinainte de split. Dacă ceva lipsește, e acolo.

## Pasul următor

După ce validez split-ul ăsta cu tine, o să:
1. Extrag **App component** și **startApp()** din backup și le pun în app.js
2. Extrag fiecare componentă React într-un fișier dedicat
3. Test că tot merge
4. Upload pe GitHub

---

**Ai întrebări despre split? Zii și-ți explic mai detaliat orice parte!**
