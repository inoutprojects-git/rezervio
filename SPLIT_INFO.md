# Rezervio — Structura Proiectului

## Arhitectura fișierelor

```
rezervio/
├── index.html                    # LANDING PAGE publică (marketing, prețuri, FAQ)
├── app.html                      # APLICAȚIA REALĂ (login + tot ce era înainte în index.html)
├── booking.html                  # Rezervare online — wizard 4 pași, calendar vizual interactiv
├── checkin.html                  # Self check-in — fișă client multi-persoană + verificare CUI ANAF
├── factura.html                  # Colectare date facturare (link separat, post-sejur)
├── view.html                     # Dashboard read-only pentru colaboratori (necesită login)
├── prezentare.html               # Pagina publică de prezentare a pensiunii (galerie, facilități, etc.)
├── js/
│   ├── config.js                 # Firebase config, constante globale (inclusiv AMENITIES_LIST etc.)
│   ├── helpers.js                # Funcții helper (date, URL-uri, validări CNP/CUI, fb.update)
│   ├── icons.js                  # Iconițe SVG React
│   ├── templates.js              # Șabloane WhatsApp
│   └── app.js                    # Toate componentele React (App, NetworkAdminDashboard, etc.)
├── css/
│   └── styles.css                # Tot CSS-ul
├── sw.js                         # Service Worker (PWA)
├── manifest.json                 # PWA manifest — start_url = /app.html
├── database.rules.json           # Reguli Firebase Realtime Database
├── storage.rules                 # Reguli Firebase STORAGE (separat de RTDB) — galerie foto
├── SETUP_ROLURI.md               # Ghid bootstrap Network Admin
└── SPLIT_INFO.md                 # Acest fișier
```

## Linkuri publice generate din aplicație

Toate 4 paginile publice urmează același pattern: `?p=PENSION_ID` (obligatoriu pe toate), plus `&r=RESERVATION_ID` pentru cele legate de o rezervare specifică:

- **`booking.html?p=PENSION_ID`** — rezervare nouă (fără `r`, oricine poate accesa)
- **`prezentare.html?p=PENSION_ID`** — pagina de prezentare a pensiunii (galerie, descriere, facilități) — link disponibil în Configurare → Prețuri → tab Link, lângă cel de rezervare
- **`checkin.html?p=PENSION_ID&r=RESERVATION_ID`** — self check-in pentru o rezervare existentă
- **`factura.html?p=PENSION_ID&r=RESERVATION_ID`** — colectare date facturare pentru o rezervare existentă

Link-urile pentru `checkin.html`/`factura.html` trebuie generate din aplicație (buton "Trimite link check-in" / "Trimite link facturare" pe o rezervare — **de adăugat ca UI**, backend-ul e gata).

## Firebase Storage — pas obligatoriu suplimentar

Galeria foto (până la 10 poze per pensiune, din Configurare → Pagina de prezentare) folosește **Firebase Storage**, un serviciu separat de Realtime Database, cu propriul sistem de reguli (`storage.rules`, diferit de `database.rules.json`).

**Pași obligatorii în Firebase Console:**
1. Firebase Console → **Storage** → activează serviciul (dacă nu e deja activ) — alege aceeași regiune ca baza de date (europe-west1)
2. Storage → tab **Rules** → copiază conținutul din `storage.rules` → **Publish**

Fără acest pas, încărcarea pozelor va eșua cu eroare de permisiuni.

## Nodul `blockedDates` — de ce există

`booking.html` are nevoie să "vadă" ce date sunt ocupate, ca să coloreze calendarul public. Dar regulile Firebase interzic intenționat citirea publică a rezervărilor complete (nume, telefoane — date personale). Soluția: un nod separat, sincronizat automat, care conține **doar** cameră+dată+nopți, niciodată date personale. Sincronizarea se întâmplă automat din `app.js` (funcțiile `saveRes`, `delRes`, `CancelMdl`) — nu necesită nicio acțiune manuală.

## Decizie de securitate — `view.html`

Versiunea originală (single-tenant) nu avea autentificare — oricine cu link-ul vedea toate rezervările. Am decis să nu implementez asta — contravine principiilor de confidențialitate menținute peste tot în acest proiect. Varianta actuală cere login (același email/parolă ca aplicația principală), doar interfața e simplificată și read-only.

## Verificare CUI prin ANAF — notă tehnică

`checkin.html` și `factura.html` apelează API-ul public ANAF (`webservicesp.anaf.ro`) direct din browser. Nu am putut testa live acest apel extern (necesită conexiune reală la ANAF) — dacă la testare reală întâmpini erori de tip CORS (blocare din partea browserului), verificarea CUI va eșua silențios (arată "CUI negăsit"), dar restul formularului rămâne funcțional — anunță-mă dacă se întâmplă, ca să investigăm o soluție alternativă (proxy prin Firebase Functions, de exemplu).

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
