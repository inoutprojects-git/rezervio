# Rezervio — Structura Proiectului

## Arhitectura fișierelor

```
rezervio/
├── index.html                    # LANDING PAGE publică (marketing, prețuri, FAQ)
├── app.html                      # APLICAȚIA REALĂ (login + tot ce era înainte în index.html)
├── booking.html                  # Pagina PUBLICĂ de rezervare online (fără login, auth anonimă)
├── js/
│   ├── config.js                 # Firebase config, constante globale
│   ├── helpers.js                # Funcții helper (date, URL-uri, validări)
│   ├── icons.js                  # Iconițe SVG React
│   ├── templates.js              # Șabloane WhatsApp
│   └── app.js                    # Toate componentele React (App, NetworkAdminDashboard, etc.)
├── css/
│   └── styles.css                # Tot CSS-ul
├── sw.js                         # Service Worker (PWA)
├── manifest.json                 # PWA manifest — start_url = /app.html
├── database.rules.json           # Reguli Firebase Realtime Database
├── SETUP_ROLURI.md               # Ghid bootstrap Network Admin
└── SPLIT_INFO.md                 # Acest fișier
```

## ⚠️ Schimbare importantă de rutare (de la split-ul cu landing page)

- **`rezervio.netlify.app/`** → landing page public (marketing)
- **`rezervio.netlify.app/app.html`** → aplicația reală (login/rezervări) — **folosește acest link tu și clienții existenți**
- **`rezervio.netlify.app/booking.html?p=PENSION_ID`** → pagină publică de rezervare, unică per pensiune (link generat din aplicație: Configurare → Prețuri → tab Link)

Dacă ai bookmark-uri vechi către root sau `index.html`, actualizează-le spre `app.html`.

## ⚠️ Pas obligatoriu: activează Autentificarea Anonimă în Firebase

`booking.html` are nevoie de autentificare anonimă (vizitatorii nu se loghează, dar tot au nevoie de un `auth.uid` valid pentru ca regulile Firebase să le permită să citească prețurile și să trimită o cerere). Fără acest pas, pagina de rezervare nu va funcționa.

1. Firebase Console → **Authentication** → tab **Sign-in method**
2. Găsește **Anonymous** în listă → click → **Enable** → Save

## De ce split-ul ăsta?

1. **Separare clară de scop** — landing page (marketing, SEO, achiziție) vs aplicație (produs) vs booking (public, fără cont)
2. **`config.js`/`helpers.js`/`icons.js`** — reutilizate de `app.html` ȘI `booking.html` (booking.html încarcă doar `config.js`+`helpers.js`, nu tot `app.js`, ca să rămână ușor)
3. **Securitate** — `booking.html` rulează cu autentificare anonimă, cu permisiuni Firebase strict limitate (citește doar prețuri/camere, poate doar crea cereri noi marcate distinct, nu poate citi/edita rezervări existente)

## Fluxul de rezervare online

1. Owner-ul copiază link-ul din Configurare → Prețuri → Link (include automat `?p=PENSION_ID`)
2. Trimite link-ul clienților (WhatsApp, site propriu, rețele sociale)
3. Clientul alege cameră + dată, completează nume/telefon, trimite cererea
4. Cererea apare automat în aplicație, secțiunea Rezervări, cu status "Pending" — vizibilă și în Configurare → Prețuri → tab Cereri
5. Owner-ul confirmă (devine rezervare normală) sau refuză (se șterge)

## Cod vechi: index-backup.html

În `/home/claude/rezervio/index-backup.html` există o copie a versiunii monolitice foarte veche (dinainte de orice split), păstrată doar ca referință istorică, nu e folosită de aplicație.
