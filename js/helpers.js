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

// NOTA: isValidCNP si isValidCUI sunt definite in app.js (langa BillingInfo component)
// pentru a evita duplicarea — acolo e versiunea completa folosita de formular.
