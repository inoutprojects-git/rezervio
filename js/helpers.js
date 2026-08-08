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

// ── DATE/TIME HELPERS ──────────────────────────────────────────────────────────
function addDays(d, n) {
  var date = new Date(d);
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

function fmt(d) {
  if (!d) return '-';
  var parts = d.split('-');
  return parts[2] + '.' + parts[1];
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function overlaps(s1, n1, s2, n2) {
  var e1 = addDays(s1, n1);
  var e2 = addDays(s2, n2);
  return !(e1 <= s2 || e2 <= s1);
}

function nightsInRange(ci, n, from, to) {
  var co = addDays(ci, n);
  var max = from > ci ? from : ci;
  var min = to < co ? to : co;
  return max < min ? Math.floor((new Date(min) - new Date(max)) / 86400000) : 0;
}

function getMonthDays(y, m) {
  var days = [];
  for (var i = 1; i <= new Date(y, m, 0).getDate(); i++) {
    var d = new Date(y, m - 1, i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getWeekDays(anchor) {
  var d = new Date(anchor);
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6 : 1);
  var monday = new Date(d.setDate(diff)).toISOString().slice(0, 10);
  var days = [];
  for (var i = 0; i < 7; i++) {
    days.push(addDays(monday, i));
  }
  return days;
}

// ── UTILITY HELPERS ────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }

function getCol(srcs, name) {
  var i = srcs.indexOf(name);
  return PAL[i >= 0 ? i % PAL.length : 0];
}

function fullName(r) {
  return [r.firstName, r.lastName].filter(Boolean).join(' ') || '(fara nume)';
}

function isActiveFuture(r) {
  return r.checkIn && addDays(r.checkIn, r.nights || 0) >= todayStr();
}

// ── URL HELPERS ────────────────────────────────────────────────────────────────
function phoneUrl(phone, simPhone) {
  return 'tel:' + phone;
}

function waUrl(phone) {
  var clean = phone.replace(/[\s\-().]/g,'');
  if (!clean.startsWith('+')) clean = '+40' + clean.replace(/^0/,'');
  return 'https://wa.me/' + clean.replace('+','');
}

function smsUrl(phone) { return 'sms:' + phone; }

// ── VALIDATION HELPERS ────────────────────────────────────────────────────────
function isValidCNP(cnp) {
  if (!cnp || cnp.length !== 13 || !/^\d+$/.test(cnp)) return false;
  var weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  var sum = 0;
  for (var i = 0; i < 12; i++) sum += parseInt(cnp[i]) * weights[i];
  var ctrl = sum % 11;
  if (ctrl === 10) ctrl = 1;
  return parseInt(cnp[12]) === ctrl;
}

function isValidCUI(cuiRaw) {
  var cui = cuiRaw.toUpperCase().replace(/^RO/, '').padStart(9, '0');
  if (!/^\d{9}$/.test(cui)) return false;
  var weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];
  var sum = 0;
  for (var i = 0; i < 9; i++) sum += parseInt(cui[i]) * weights[i];
  var rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return parseInt(cui[8]) === rest;
}
