// ── FIREBASE HELPERS ──────────────────────────────────────────────────────────
function waitForPensionId(timeoutMs) {
  return new Promise(function(resolve, reject) {
    var start = Date.now();
    var interval = setInterval(function() {
      if (PENSION_ID) {
        clearInterval(interval);
        resolve(PENSION_ID);
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('PENSION_ID timeout'));
      }
    }, 100);
  });
}

var fb = {
  on: function(path, cb) {
    if (!PENSION_ID) { console.warn('fb.on called before PENSION_ID set:', path); return function(){}; }
    var ref = firebaseDB.ref('pensions/' + PENSION_ID + '/' + path);
    ref.on('value', function(s) { cb(s.val()); }, function(err) { console.error('fb.on error:', path, err); });
    return function() { ref.off('value'); };
  },
  set: function(path, val) {
    return waitForPensionId(3000).then(function(pid) {
      return firebaseDB.ref('pensions/' + pid + '/' + path).set(val);
    });
  },
  push: function(path, val) {
    return waitForPensionId(3000).then(function(pid) {
      return firebaseDB.ref('pensions/' + pid + '/' + path).push(val).then(function(r) { return r.key; });
    });
  },
  remove: function(path) {
    return waitForPensionId(3000).then(function(pid) {
      return firebaseDB.ref('pensions/' + pid + '/' + path).remove();
    });
  },
  update: function(path, partial) {
    return waitForPensionId(3000).then(function(pid) {
      return firebaseDB.ref('pensions/' + pid + '/' + path).update(partial);
    });
  }
};

// ── DATE/TIME HELPERS (extras exact din versiunea originala) ──────────────────
function addDays(d, n) {
  if (!d) return '';
  var x = new Date(d);
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
}
function fmt(d) {
  if (!d) return '-';
  var p = d.split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function overlaps(s1, n1, s2, n2) {
  if (!s1 || !s2 || !n1 || !n2) return false;
  var e1 = addDays(s1, n1), e2 = addDays(s2, n2);
  return s1 < e2 && e1 > s2 && e1 !== s2 && e2 !== s1;
}
function nightsInRange(ci, n, from, to) {
  if (!ci || !n) return 0;
  var c = 0;
  for (var i = 0; i < n; i++) { var d = addDays(ci, i); if (d >= from && d <= to) c++; }
  return c;
}
function getMonthDays(y, m) {
  var days = [], d = new Date(y, m, 1);
  while (d.getMonth() === m) { days.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
  return days;
}
function getWeekDays(anchor) {
  var d = new Date(anchor), day = d.getDay(), diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  var days = [];
  for (var i = 0; i < 7; i++) { var x = new Date(d); x.setDate(d.getDate() + i); days.push(x.toISOString().slice(0, 10)); }
  return days;
}
function uid() { return Math.random().toString(36).slice(2, 10); }
function getCol(srcs, name) { var i = srcs.indexOf(name); return PAL[i >= 0 ? i % PAL.length : 0]; }
function fullName(r) { return [r.firstName, r.lastName].filter(Boolean).join(' ') || '(fara nume)'; }
function isActiveFuture(r) { return r.checkIn && addDays(r.checkIn, r.nights || 0) >= todayStr(); }

// ── CATEGORIZARE REZERVARI (partajata intre TodayBar si ResTab) ────────────────
// Grupeaza rezervarile active in 4 categorii fata de "today". O rezervare cu
// check-in azi si checkedIn=true e tratata ca "staying" (turist deja sosit).
function categorizeReservations(reservations, today) {
  var checkinToday = [], checkoutToday = [], staying = [], future = [];
  reservations.forEach(function(r) {
    if (!r.checkIn || r.status === 'cancelled') return;
    var checkOut = addDays(r.checkIn, r.nights || 0);
    if (checkOut < today) return;
    if (r.checkIn === today) {
      if (r.checkedIn) { staying.push(r); } else { checkinToday.push(r); }
    } else if (checkOut === today) {
      checkoutToday.push(r);
    } else if (r.checkIn < today && checkOut > today) {
      staying.push(r);
    } else if (r.checkIn > today) {
      future.push(r);
    }
  });
  var byCheckIn = function(a, b) { return (a.checkIn || '') < (b.checkIn || '') ? -1 : (a.checkIn || '') > (b.checkIn || '') ? 1 : ((a.room || '') < (b.room || '') ? -1 : 1); };
  checkinToday.sort(byCheckIn);
  checkoutToday.sort(byCheckIn);
  staying.sort(byCheckIn);
  future.sort(byCheckIn);
  return { checkinToday: checkinToday, checkoutToday: checkoutToday, staying: staying, future: future };
}

// ── CAMERE LIBERE ACUM (partajata intre TodayBar si ResTab) ────────────────────
// O camera e "libera" daca nicio rezervare activa (indiferent de status ocupat/blocat,
// dar EXCLUZAND cele anulate) nu o acopera azi. Rezervarile "Toata locatia" (WHOLE)
// blocheaza toate camerele.
function getFreeRooms(rooms, reservations, today) {
  var occupied = new Set();
  reservations.forEach(function(r) {
    if (!r.checkIn || r.status === 'cancelled') return;
    var checkOut = addDays(r.checkIn, r.nights || 0);
    if (r.checkIn <= today && checkOut > today) {
      if (r.room === WHOLE) { rooms.forEach(function(rm) { occupied.add(rm); }); }
      else { occupied.add(r.room); }
    }
  });
  return rooms.filter(function(r) { return !occupied.has(r); });
}


// ── URL HELPERS (extras exact din versiunea originala) ─────────────────────────
function phoneUrl(phone, simPhone) {
  // tel: with phone hint for 2-SIM — if user set their own number, use it for routing
  return 'tel:' + phone;
}
function waUrl(phone) {
  // Clean phone for WhatsApp — remove spaces, dashes, keep +
  var clean = phone.replace(/[\s\-().]/g,'');
  if (!clean.startsWith('+')) clean = '+40' + clean.replace(/^0/,'');
  return 'https://wa.me/' + clean.replace('+','');
}
function smsUrl(phone) { return 'sms:' + phone; }

// Firebase RTDB keys nu pot contine '.' — transformam email-ul intr-o cheie valida
// (pattern comun: inlocuim '.' cu ',' — reversibil, usor de recunoscut la nevoie).
function sanitizeEmailKey(email) {
  return (email || '').toLowerCase().replace(/\./g, ',');
}

// Validare CNP (13 cifre + cifra de control conform algoritmului oficial).
// Partajata intre app.js si paginile publice (checkin.html) — nu duplicata.
function isValidCNP(cnp) {
  if (!/^\d{13}$/.test(cnp)) return false;
  var weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  var sum = 0;
  for (var i = 0; i < 12; i++) sum += parseInt(cnp[i], 10) * weights[i];
  var ctrl = sum % 11;
  if (ctrl === 10) ctrl = 1;
  return ctrl === parseInt(cnp[12], 10);
}

// Validare CUI: 2-10 cifre, cu cifra de control conform algoritmului ANAF.
// Acceptam si cu prefix "RO" (platitor de TVA) — il curatam inainte de validare.
function isValidCUI(cuiRaw) {
  var cui = (cuiRaw || '').toUpperCase().replace(/^RO/, '').trim();
  if (!/^\d{2,10}$/.test(cui)) return false;
  var weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];
  var digits = cui.slice(0, -1).padStart(9, '0').split('').map(Number);
  var ctrlDigit = parseInt(cui.slice(-1), 10);
  var sum = 0;
  for (var i = 0; i < 9; i++) sum += digits[i] * weights[i];
  var rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === ctrlDigit;
}

// NOTA: isValidCNP si isValidCUI sunt definite in app.js (langa BillingInfo component)
// pentru a evita duplicarea — acolo e versiunea completa folosita de formular.
