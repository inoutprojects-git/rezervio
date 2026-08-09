# Roluri și Planuri — Ghid de Setup (o singură dată)

## 1. Publică regulile Firebase (OBLIGATORIU — fără asta, rolurile sunt doar UI, nu securitate reală)

1. Mergi pe https://console.firebase.google.com → proiectul `master-rezervari`
2. Meniu stânga → **Realtime Database** → tab **Rules**
3. Șterge tot conținutul din editor
4. Copiază **exact** conținutul din `database.rules.json` (fișierul din acest folder)
5. Click **Publish**

Fără acest pas, oricine autentificat poate încă citi/scrie orice pensiune — regulile din acest fișier sunt cele care aplică real separarea Owner/Staff/Network Admin.

## 2. Creează-ți contul de Administrator Rețea (o singură dată, manual)

Nu există înregistrare automată pentru `network_admin` — e intenționat, ca să nu poată nimeni altcineva să-și acorde singur acest rol. Pași:

1. **Înregistrează-te normal** în aplicație (devii automat `owner` al unei pensiuni noi — normal, asta se întâmplă oricui)
2. Mergi pe **Firebase Console → Realtime Database → Data** (tab-ul de date, nu Rules)
3. Găsește nodul `users/{UID-ul tău}` (UID-ul apare și în Firebase Console → Authentication → Users)
4. Editează manual câmpul `role` din `"owner"` în `"network_admin"`
5. Reîncarcă aplicația (`Ctrl+Shift+R`) — acum vezi automat **Network Admin Dashboard** în loc de aplicația normală

**Notă:** pensiunea creată automat la înregistrarea inițială rămâne în date (orfană, fără owner activ pe ea) — poți s-o ignori sau s-o ștergi manual din Firebase Console, nu afectează funcționarea.

## 3. Cum funcționează de-acum înainte

### Pentru tine (Network Admin)
- La login, vezi direct dashboard-ul cu toate pensiunile
- Poți schimba planul oricărei pensiuni (Basic/Standard/Premium)
- Poți suspenda/reactiva orice cont
- Poți extinde trial-ul cu +7 zile per click

### Pentru un Owner nou (client care se înregistrează)
- Devine automat Owner, plan Basic, 1 cont disponibil
- Poate invita Staff din meniu → Cont și facturare → Echipă (dacă planul permite)
- Invitarea unui Staff creează un cont nou Firebase Auth (owner trebuie să comunice manual email + parola temporară noului coleg)

### Pentru un Staff invitat
- Se loghează cu email + parola primită de la Owner
- Vede aceeași aplicație, dar meniul e restrâns: **nu** vede Echipă, Date facturare, Reguli de cazare, Toată locația, Setări pensiune
- Poate opera normal: rezervări, calendar, mesaje, disponibilitate

## 4. Limitare cunoscută — ștergere completă cont Staff

Când Owner-ul "elimină" un membru Staff, contul pierde accesul la datele pensiunii (Firebase Rules îl blochează), dar **contul Firebase Auth propriu-zis nu e șters complet** — ștergerea completă necesită Firebase Admin SDK / Cloud Functions, în afara arhitecturii curente 100% client-side. Practic, fostul Staff nu mai poate face nimic util, dar tehnic contul "există" în lista de autentificare. Nu e un risc de securitate (nu mai are acces la date), doar o mică inconsistență cosmetică pe care o poți ignora pentru moment.

## 5. Testare rapidă după publicarea regulilor

1. Loghează-te cu contul tău de Owner obișnuit → ar trebui să meargă normal
2. Din meniu → Cont și facturare → Echipă → invită un cont de test cu un email nou
3. Deloghează-te, loghează-te cu noul cont de Staff → verifică că meniul e restrâns
4. Loghează-te cu contul tău de Network Admin → verifică că vezi dashboard-ul cu toate pensiunile
