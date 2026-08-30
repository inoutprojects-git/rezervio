// ── APP ROOT + REACT HOOKS ──────────────────────────────────────────────────────
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useCallback = React.useCallback;
var useMemo = React.useMemo;
var Fragment = React.Fragment;
var createRoot = ReactDOM.createRoot;

function App() {
  var ls = useState(true); var loading = ls[0], setLoading = ls[1];
  var ss = useState('online'); var sync = ss[0], setSync = ss[1];
  var ts = useState('rez'); var tab = ts[0], setTab = ts[1];
  var drs = useState(false); var drawerOpen = drs[0], setDrawerOpen = drs[1];
  var ros = useState(function() { return lc.get('p_rooms', DEF_ROOMS); }); var rooms = ros[0], setRooms = ros[1];
  var sos = useState(function() { return lc.get('p_src', DEF_SRC); }); var sources = sos[0], setSources = sos[1];
  var prs = useState(function() { return lc.get('p_prices', {}); }); var roomPrices = prs[0], setRoomPrices = prs[1];
  var pns = useState(function() { return lc.get('p_name', ''); }); var pensionName = pns[0], setPensionName = pns[1];
  var pps = useState(function() { return lc.get('p_photo', ''); }); var pensionPhoto = pps[0], setPensionPhoto = pps[1];
  var prs2 = useState(function() { return lc.get('p_presentation', {}); }); var presentation = prs2[0], setPresentation = prs2[1];
  var res = useState([]); var reservations = res[0], setRes = res[1];
  var ms = useState(null); var modal = ms[0], setModal = ms[1];
  var cs = useState(null); var confirm = cs[0], setConfirm = cs[1];
  var srs = useState(false); var showRooms = srs[0], setShowRooms = srs[1];
  var sss = useState(false); var showSrc = sss[0], setShowSrc = sss[1];
  var ics = useState(false); var showIcal = ics[0], setShowIcal = ics[1];
  var pds = useState(false); var showPdf = pds[0], setShowPdf = pds[1];
  var prs2 = useState(false); var showPrices = prs2[0], setShowPrices = prs2[1];
  var pss = useState(false); var showPensionSettings = pss[0], setShowPensionSettings = pss[1];
  var pes = useState(false); var showPresentationEditor = pes[0], setShowPresentationEditor = pes[1];
  var acs = useState(false); var showAccountSettings = acs[0], setShowAccountSettings = acs[1];
  var sms = useState(false); var showMessages = sms[0], setShowMessages = sms[1];
  var mrs = useState(null); var msgRes = mrs[0], setMsgRes = mrs[1];
  var bis = useState(null); var billingInfo = bis[0], setBillingInfo = bis[1];
  var sbi = useState(false); var showBillingInfo = sbi[0], setShowBillingInfo = sbi[1];
  var wes = useState(function() { return lc.get('p_whole_enabled', true); }); var wholeEnabled = wes[0], setWholeEnabled = wes[1];
  var pls = useState('basic'); var plan = pls[0], setPlan = pls[1];
  var pst = useState('active'); var pensionStatus = pst[0], setPensionStatus = pst[1];
  var tea = useState(null); var trialEndsAt = tea[0], setTrialEndsAt = tea[1];
  var pac = useState(1); var accountCount = pac[0], setAccountCount = pac[1];
  var pmb = useState({}); var members = pmb[0], setMembers = pmb[1];
  var stm = useState(false); var showTeam = stm[0], setShowTeam = stm[1];
  var sgd = useState(false); var showGuide = sgd[0], setShowGuide = sgd[1];
  var ssc = useState(false); var showSupportChat = ssc[0], setShowSupportChat = ssc[1];
  var hus = useState(false); var hasUnreadSupport = hus[0], setHasUnreadSupport = hus[1];
  var afs = useState('future'); var activeFilter = afs[0], setActiveFilter = afs[1];
  var brs = useState(function() { return lc.get('p_bookrules', { minGapDays: 0, minNights: 0, minAdvanceDays: 0 }); }); var bookingRules = brs[0], setBookingRules = brs[1];
  var sbr = useState(false); var showBookingRules = sbr[0], setShowBookingRules = sbr[1];
  var sav = useState(false); var showAvailability = sav[0], setShowAvailability = sav[1];

  // Titlul paginii reflecta numele pensiunii (setat din Firebase)
  useEffect(function() {
    if (pensionName) {
      document.title = pensionName + ' — Rezervio';
      var titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = pensionName + ' — Rezervio';
    }
  }, [pensionName]);

  useEffect(function() {
    if (!firebaseDB) { setLoading(false); return; }
    var u1 = fb.on('config', function(cfg) {
      if (cfg) {
        if (cfg.rooms) { setRooms(cfg.rooms); lc.set('p_rooms', cfg.rooms); }
        if (cfg.sources) { setSources(cfg.sources); lc.set('p_src', cfg.sources); }
        if (cfg.roomPrices) { setRoomPrices(cfg.roomPrices); lc.set('p_prices', cfg.roomPrices); }
        if (cfg.pensionName !== undefined) { setPensionName(cfg.pensionName); lc.set('p_name', cfg.pensionName); }
        if (cfg.pensionPhoto !== undefined) { setPensionPhoto(cfg.pensionPhoto); lc.set('p_photo', cfg.pensionPhoto); }
        if (cfg.presentation !== undefined) { setPresentation(cfg.presentation); lc.set('p_presentation', cfg.presentation); }
        if (cfg.bookingRules) { setBookingRules(cfg.bookingRules); lc.set('p_bookrules', cfg.bookingRules); }
        if (cfg.wholeEnabled !== undefined) { setWholeEnabled(cfg.wholeEnabled); lc.set('p_whole_enabled', cfg.wholeEnabled); }
      }
    });
    var u2 = fb.on('reservations', function(data) {
      var arr = data ? Object.keys(data).map(function(id) { return Object.assign({}, data[id], { id: id }); }) : [];
      setRes(arr); lc.set('p_res', arr); setSync('online'); setLoading(false);
    });
    // Date de business (plan, status, echipa) — la radacina pensiunii, nu in config
    var u3 = fb.on('plan', function(v) { if (v) setPlan(v); });
    var u4 = fb.on('status', function(v) { if (v) setPensionStatus(v); });
    var u5 = fb.on('accountCount', function(v) { if (v) setAccountCount(v); });
    var u6 = fb.on('members', function(v) { setMembers(v || {}); });
    var u7 = fb.on('trialEndsAt', function(v) { setTrialEndsAt(v || null); });
    var u8 = fb.on('supportChat/messages', function(data) {
      if (!data || !PENSION_ID) { setHasUnreadSupport(false); return; }
      var arr = Object.values(data);
      arr.sort(function(a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
      var last = arr[arr.length - 1];
      var lastSeen = lc.get('p_lastSeenSupport_' + PENSION_ID, 0);
      setHasUnreadSupport(!!last && last.senderRole === 'network_admin' && last.timestamp > lastSeen);
    });
    firebaseDB.ref('.info/connected').on('value', function(snap) {
      if (snap.val() === false) { setSync('offline'); setRes(lc.get('p_res', [])); setLoading(false); }
      else setSync('online');
    });
    return function() { u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8(); };
  }, []);

  // Date de facturare: legate de USER (cont), nu de pensiune — separat de fb.on() de mai sus,
  // care e mereu scopat pe pensions/{PENSION_ID}. Aici ascultam direct users/{uid}/billingInfo.
  useEffect(function() {
    var user = firebase.auth().currentUser;
    if (!firebaseDB || !user) return;
    var ref = firebaseDB.ref('users/' + user.uid + '/billingInfo');
    var cb = function(snap) { setBillingInfo(snap.val() || null); };
    ref.on('value', cb, function(err) { console.warn('billingInfo read error:', err); });
    return function() { ref.off('value', cb); };
  }, []);

  // saveConfig face MERGE peste config-ul existent (nu overwrite), ca sa nu piarda
  // campuri precum pensionName/pensionPhoto cand se salveaza doar camere/surse, sau invers.
  function saveConfig(partial) {
    setSync('syncing');
    var merged = Object.assign({}, { rooms: rooms, sources: sources, roomPrices: roomPrices, pensionName: pensionName, pensionPhoto: pensionPhoto, presentation: presentation, bookingRules: bookingRules, wholeEnabled: wholeEnabled }, partial);
    return fb.set('config', merged).then(function() { setSync('online'); }).catch(function(err) {
      console.error('saveConfig error:', err);
      setSync('error');
      setTimeout(function() { setSync('online'); }, 4000);
      alert('Eroare la salvare: ' + err.message);
      throw err;
    });
  }

  var conflicts = useMemo(function() {
    var result = [];
    for (var i = 0; i < reservations.length; i++) {
      var a = reservations[i]; if (!a.checkIn || !a.room) continue;
      for (var j = i + 1; j < reservations.length; j++) {
        var b = reservations[j]; if (!b.checkIn || b.room !== a.room) continue;
        if (overlaps(a.checkIn, a.nights, b.checkIn, b.nights)) {
          var oS = a.checkIn > b.checkIn ? a.checkIn : b.checkIn;
          var oE = addDays(a.checkIn, a.nights) < addDays(b.checkIn, b.nights) ? addDays(a.checkIn, a.nights) : addDays(b.checkIn, b.nights);
          result.push({ room: a.room, a: fullName(a), b: fullName(b), from: oS, to: oE });
        }
      }
    }
    return result;
  }, [reservations]);

  function saveRes(data, force) {
    if (!force && data.room && data.checkIn && data.nights) {
      var cl = reservations.find(function(r) { return r.room === data.room && r.id !== data.id && r.status !== 'cancelled' && overlaps(data.checkIn, data.nights, r.checkIn, r.nights); });
      if (cl) {
        setConfirm({ msg: 'Camera ' + data.room + ' e rezervata de ' + fullName(cl) + '! Salvezi totusi?', okLbl: 'Salveaza (OB)', ok: function() { setConfirm(null); saveRes(data, true); } });
        return;
      }
    }
    setSync('syncing');
    var p;
    if (data.id && reservations.find(function(r) { return r.id === data.id; })) {
      var id = data.id;
      var rest = Object.assign({}, data); delete rest.id;
      p = fb.set('reservations/' + id, rest).then(function() { return syncBlockedDates(id, rest); });
    } else {
      var rest2 = Object.assign({}, data); delete rest2.id;
      var newId = null;
      p = fb.push('reservations', Object.assign(rest2, { createdAt: Date.now() })).then(function(key) {
        newId = key;
        return syncBlockedDates(key, rest2);
      });
    }
    p.then(function() { setSync('online'); setModal(null); }).catch(function(err) {
      console.error('saveRes error:', err);
      setSync('error');
      setTimeout(function() { setSync('online'); }, 4000);
      alert('Eroare la salvare: ' + err.message);
    });
  }

  // Sincronizeaza intrarea PII-free din blockedDates (folosita de booking.html public
  // pentru a colora calendarul, fara sa expuna nume/telefoane) — aceeasi cheie ca
  // rezervarea. O rezervare anulata elibereaza automat data (nu mai blocheaza calendarul).
  function syncBlockedDates(id, resData) {
    if (resData.status === 'cancelled') {
      return fb.remove('blockedDates/' + id).catch(function() {});
    }
    return fb.set('blockedDates/' + id, { room: resData.room, checkIn: resData.checkIn, nights: resData.nights }).catch(function() {});
  }

  function delRes(id, name) {
    setConfirm({
      msg: 'Stergi rezervarea pentru "' + name + '"?',
      okLbl: 'Sterge',
      ok: function() {
        setSync('syncing');
        fb.remove('reservations/' + id).then(function() { return fb.remove('blockedDates/' + id).catch(function(){}); }).then(function() { setSync('online'); setConfirm(null); }).catch(function(err) {
          console.error('delRes error:', err);
          setSync('online');
          setConfirm(null);
          alert('Eroare la stergere: ' + err.message);
        });
      }
    });
  }

  // Bifa "turist sosit" — muta rezervarea din "Intrari azi" in "Cazati in curs"
  function toggleCheckedIn(res) {
    fb.set('reservations/' + res.id + '/checkedIn', !res.checkedIn).catch(function(err) {
      console.error('toggleCheckedIn error:', err);
      alert('Eroare: ' + err.message);
    });
  }

  // Bifa "camera curatata" — doar informativ, nu muta rezervarea
  function toggleRoomCleaned(res) {
    fb.set('reservations/' + res.id + '/roomCleaned', !res.roomCleaned).catch(function(err) {
      console.error('toggleRoomCleaned error:', err);
      alert('Eroare: ' + err.message);
    });
  }

  // Salveaza fisa de client (date suplimentare pentru fisa de sosire)
  function saveGuestDetails(resId, details) {
    return fb.set('reservations/' + resId + '/guestDetails', details);
  }

  function saveRooms(newR) {
    var del = rooms.filter(function(r) { return !newR.includes(r); });
    var promises = del.length ? reservations.filter(function(r) { return del.includes(r.room); }).map(function(r) { return fb.remove('reservations/' + r.id); }) : [];
    Promise.all(promises).then(function() {
      return saveConfig({ rooms: newR });
    }).then(function() {
      setRooms(newR); lc.set('p_rooms', newR);
      setShowRooms(false);
    }).catch(function(err) {
      console.error('saveRooms error:', err);
      // Eroare deja afisata de saveConfig; nu inchidem modalul ca userul sa poata reincerca
    });
  }

  function saveSrc(newS) {
    saveConfig({ sources: newS }).then(function() {
      setSources(newS); lc.set('p_src', newS);
      setShowSrc(false);
    }).catch(function(err) {
      console.error('saveSrc error:', err);
    });
  }

  function savePensionSettings(name, photo) {
    return saveConfig({ pensionName: name, pensionPhoto: photo }).then(function() {
      setPensionName(name); lc.set('p_name', name);
      setPensionPhoto(photo); lc.set('p_photo', photo);
    });
  }

  // Datele paginii publice de prezentare (descriere, facilitati, galerie, date legale
  // recomandate) — separate de savePensionSettings (nume+poza principala) ca sa nu
  // amestecam formulare diferite conceptual.
  function savePresentation(data) {
    return saveConfig({ presentation: data }).then(function() {
      setPresentation(data); lc.set('p_presentation', data);
    });
  }

  // Reguli de cazare (pauza minima intre rezervari, sejur minim, preaviz minim)
  function saveBookingRules(rules) {
    return saveConfig({ bookingRules: rules }).then(function() {
      setBookingRules(rules); lc.set('p_bookrules', rules);
      setShowBookingRules(false);
    });
  }

  // Activeaza/dezactiveaza optiunea "Toata locatia" din formularul de rezervare
  function toggleWholeEnabled() {
    var next = !wholeEnabled;
    saveConfig({ wholeEnabled: next }).then(function() {
      setWholeEnabled(next); lc.set('p_whole_enabled', next);
    }).catch(function(err) { console.error('toggleWholeEnabled error:', err); });
  }

  // ── GESTIUNE ECHIPA (Owner invita/elimina conturi Staff) ────────────────────
  // Limita de conturi (Owner + Staff) e blocare HARD, verificata inainte de invitare.
  function inviteStaff(email, tempPassword) {
    var limit = PLAN_LIMITS[plan] || 1;
    if (accountCount >= limit) {
      return Promise.reject(new Error('Ai atins limita planului ' + (PLAN_LABELS[plan] || plan) + ' (' + limit + ' conturi). Elimina un cont sau treci la un plan superior.'));
    }
    // Truc necesar: crearea unui cont nou cu Firebase Auth client SDK logheaza automat
    // acel cont, inlocuind sesiunea curenta. Folosim o instanta Firebase secundara,
    // izolata, doar pentru crearea contului, ca sa nu deconectam owner-ul.
    var secondaryName = 'Secondary_' + Date.now();
    var secondaryApp = firebase.initializeApp(firebaseConfig, secondaryName);
    return secondaryApp.auth().createUserWithEmailAndPassword(email, tempPassword)
      .then(function(cred) {
        var newUid = cred.user.uid;
        return firebaseDB.ref('users/' + newUid).set({
          email: email, role: 'staff', pensionId: PENSION_ID, createdAt: Date.now()
        }).then(function() {
          return firebaseDB.ref('pensions/' + PENSION_ID + '/members/' + newUid).set({
            email: email, role: 'staff', addedAt: Date.now()
          });
        }).then(function() {
          return firebaseDB.ref('pensions/' + PENSION_ID + '/accountCount').set(accountCount + 1);
        });
      })
      .then(function() { return secondaryApp.auth().signOut(); })
      .then(function() { return secondaryApp.delete(); })
      .catch(function(err) {
        secondaryApp.delete().catch(function(){});
        throw err;
      });
  }

  // NOTA: eliminarea unui membru sterge accesul lui la datele pensiunii (prin stergerea
  // din users/ si members/), dar contul Firebase Auth in sine ramane tehnic valid —
  // stergerea completa a contului Auth necesita Admin SDK / Cloud Function, in afara
  // arhitecturii curente 100% client. Odata eliminat, membrul nu mai are pensionId
  // valid, deci Firebase Rules ii refuza orice citire/scriere pe datele pensiunii.
  function removeStaff(uid) {
    return firebaseDB.ref('pensions/' + PENSION_ID + '/members/' + uid).remove()
      .then(function() { return firebaseDB.ref('users/' + uid).remove(); })
      .then(function() { return firebaseDB.ref('pensions/' + PENSION_ID + '/accountCount').set(Math.max(1, accountCount - 1)); });
  }

  // Datele de facturare se scriu sub users/{uid}, NU sub pensions/{PENSION_ID} — sunt legate
  // de persoana/firma care detine contul, nu de pensiune (relevant mai ales daca un cont va
  // putea gestiona multiple pensiuni in viitor).
  function saveBillingInfo(data) {
    var user = firebase.auth().currentUser;
    if (!user) return Promise.reject(new Error('Nu esti autentificat. Reincarca pagina.'));
    return firebaseDB.ref('users/' + user.uid + '/billingInfo').set(data)
      .then(function() { setBillingInfo(data); })
      .catch(function(err) {
        console.error('saveBillingInfo error:', err);
        throw err;
      });
  }

  function openNew(room, prefill) { setModal({ mode: 'new', data: Object.assign({}, EMPTY_RES, { room: room || '', source: sources[0] || '' }, prefill || {}) }); }
  function openEdit(r) { setModal({ mode: 'edit', data: Object.assign({}, r) }); }
  function openCopy(r) { setModal({ mode: 'copy', data: Object.assign({}, r, { id: null }) }); }
  function openMove(r) { setModal({ mode: 'move', data: Object.assign({}, r) }); }

  var syncColor = { online: '#22c55e', syncing: '#f59e0b', offline: '#ef4444', error: '#ef4444' }[sync] || '#94a3b8';
  var syncLabel = { online: 'Sincronizat', syncing: 'Se salveaza...', offline: 'Offline', error: 'Eroare salvare' }[sync] || sync;
  var pageLabels = { rez: 'Rezervari', 'cal-month': 'Calendar lunar', 'cal-week': 'Calendar saptamanal', 'cal-custom': 'Calendar interval', stats: 'Statistici', archive: 'Istoric rezervari' };
  var calViewMap = { 'cal-month': 'month', 'cal-week': 'week', 'cal-custom': 'custom' };

  if (loading) {
    return h('div', { className: 'ldg' },
      h('div', { className: 'spin' }),
      h('div', { style: { fontSize: 15, fontWeight: 600, color: '#64748b' } }, 'Se incarca...')
    );
  }

  // Cont suspendat de Administratorul retea — blocheaza accesul complet la continut,
  // indiferent de rol (owner/staff). Doar network_admin nu ajunge niciodata aici.
  if (pensionStatus === 'suspended') {
    return h('div', { className: 'ldg' },
      h('div', { style: { fontSize: 48 } }, '\uD83D\uDD12'),
      h('div', { style: { fontSize: 18, fontWeight: 800, color: '#1a202c' } }, 'Cont suspendat'),
      h('div', { style: { fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 300 } }, 'Accesul la aceasta pensiune a fost suspendat. Contacteaza administratorul pentru detalii.'),
      h('button', { style: { marginTop: 12, padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }, onClick: function() { firebase.auth().signOut(); } }, 'Deconectare')
    );
  }

  // Perioada gratuita (30 zile) a expirat si Network Admin nu a confirmat inca plata
  // (trialEndsAt nu a fost extins). Blocheaza accesul, dar cu mesaj diferit de suspendare —
  // aici nu e o penalizare, doar un memento ca abonamentul trebuie activat.
  if (trialEndsAt && trialEndsAt < Date.now()) {
    return h(Fragment, null,
      h('div', { className: 'ldg' },
        h('div', { style: { fontSize: 48 } }, '\u23F3'),
        h('div', { style: { fontSize: 18, fontWeight: 800, color: '#1a202c' } }, 'Perioada gratuita a expirat'),
        h('div', { style: { fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 320 } }, 'Cele 30 de zile de proba s-au incheiat. Contacteaza-ne pentru a activa abonamentul si a continua sa folosesti Rezervio.'),
        h('button', { style: { marginTop: 4, padding: '12px 22px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }, onClick: function() { setShowSupportChat(true); } }, '\uD83D\uDCAC Contacteaza suport'),
        h('button', { style: { marginTop: 4, padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }, onClick: function() { firebase.auth().signOut(); } }, 'Deconectare')
      ),
      showSupportChat && h(SupportChat, {
        pensionId: PENSION_ID, viewerRole: USER_ROLE, viewerEmail: firebase.auth().currentUser ? firebase.auth().currentUser.email : '',
        onClose: function() { setShowSupportChat(false); }
      })
    );
  }

  return h('div', { className: 'app' },
    // HEADER
    h('header', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', color: '#fff', padding: '13px 16px', paddingTop: 'max(13px,env(safe-area-inset-top))', position: 'sticky', top: 0, zIndex: 60, boxShadow: '0 2px 16px rgba(0,0,0,.22)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, maxWidth: 700, margin: '0 auto', width: '100%' } },
        h('button', { style: { width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, flexShrink: 0 }, onClick: function() { setDrawerOpen(true); } },
          h('span', { style: { width: 18, height: 2, background: '#fff', borderRadius: 2, display: 'block' } }),
          h('span', { style: { width: 18, height: 2, background: '#fff', borderRadius: 2, display: 'block' } }),
          h('span', { style: { width: 18, height: 2, background: '#fff', borderRadius: 2, display: 'block' } })
        ),
        h('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, minWidth: 0 } },
          pensionPhoto
            ? h('img', { src: pensionPhoto, style: { width: 30, height: 30, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(255,255,255,.35)' } })
            : h('span', { style: { fontSize: 22, flexShrink: 0 } }, '\uD83C\uDFE1'),
          h('div', { style: { minWidth: 0, overflow: 'hidden' } },
            h('div', { style: { fontSize: 18, fontWeight: 800, letterSpacing: '-.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, pensionName || 'Rezervari'),
            h('div', { style: { fontSize: 11, opacity: .7, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, pageLabels[tab] || 'Rezervari')
          )
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.15)', borderRadius: 8, padding: '5px 9px', flexShrink: 0 } },
          h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: syncColor, display: 'inline-block', transition: 'background .3s', animation: sync === 'syncing' ? 'pulse .8s infinite' : 'none' } }),
          h('span', { style: { fontSize: 11, fontWeight: 600 } }, sync === 'online' ? 'OK' : sync === 'syncing' ? '...' : 'Off')
        ),
        h('button', { title: 'Logout', style: { width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }, onClick: function() { setConfirm({ msg: 'Iesi din cont?', okLbl: 'Iesi', ok: function() { setConfirm(null); firebase.auth().signOut(); } }); } }, '🚪')
      ),
    ),
    // DRAWER
    drawerOpen && h(Drawer, {
      tab: tab, setTab: setTab, sources: sources, rooms: rooms, conflicts: conflicts,
      syncColor: syncColor, syncLabel: syncLabel,
      pensionName: pensionName, pensionPhoto: pensionPhoto,
      userEmail: (firebase.auth().currentUser && firebase.auth().currentUser.email) || '',
      billingInfo: billingInfo,
      pendingCount: reservations.filter(function(r){ return r.pendingConfirmation; }).length,
      onOpenSrc: function() { setShowSrc(true); },
      onOpenRooms: function() { setShowRooms(true); },
      onOpenIcal: function() { setShowIcal(true); },
      onOpenPdf: function() { setShowPdf(true); },
      onOpenPrices: function() { setShowPrices(true); },
      onOpenPensionSettings: function() { setShowPensionSettings(true); },
      onOpenPresentation: function() { setShowPresentationEditor(true); },
      onOpenAccountSettings: function() { setShowAccountSettings(true); },
      onOpenBillingInfo: function() { setShowBillingInfo(true); },
      onOpenMessages: function() { setMsgRes(null); setShowMessages(true); },
      onOpenBookingRules: function() { setShowBookingRules(true); },
      onOpenAvailability: function() { setShowAvailability(true); },
      wholeEnabled: wholeEnabled,
      onToggleWholeEnabled: toggleWholeEnabled,
      userRole: USER_ROLE, plan: plan, accountCount: accountCount,
      onOpenTeam: function() { setShowTeam(true); },
      onOpenGuide: function() { setShowGuide(true); },
      onOpenSupportChat: function() { setShowSupportChat(true); lc.set('p_lastSeenSupport_' + PENSION_ID, Date.now()); setHasUnreadSupport(false); },
      hasUnreadSupport: hasUnreadSupport,
      onClose: function() { setDrawerOpen(false); }
    }),
    // PENDING BANNER
    reservations.filter(function(r){ return r.pendingConfirmation; }).length > 0 && h('div', {
      style:{background:'#fffbeb',borderBottom:'2px solid #fbbf24',color:'#92400e',padding:'11px 16px',fontSize:14,display:'flex',gap:10,alignItems:'center',cursor:'pointer'},
      onClick: function(){ setShowPrices(true); }
    },
      h('span',{style:{fontSize:20,flexShrink:0}},'\uD83D\uDD14'),
      h('div',null,
        h('strong',null, reservations.filter(function(r){return r.pendingConfirmation;}).length + ' cerere(i) de rezervare in asteptare'),
        h('div',{style:{fontSize:14,marginTop:1}},'Click pentru a vedea si confirma')
      )
    ),
    // OB BANNER
    conflicts.length > 0 && h('div', { style: { background: '#fef2f2', borderBottom: '2px solid #ef4444', color: '#991b1b', padding: '12px 16px', fontSize: 14, display: 'flex', gap: 10, alignItems: 'flex-start' } },
      h('span', { style: { fontSize: 20, flexShrink: 0 } }, '\u26A0\uFE0F'),
      h('div', null,
        h('strong', null, 'Overbooking detectat!'),
        conflicts.map(function(c, i) {
          return h('div', { key: i, style: { fontSize: 13, marginTop: 3 } }, c.room + ': ' + c.a + ' & ' + c.b + ' (' + fmt(c.from) + ' - ' + fmt(c.to) + ')');
        })
      )
    ),
    h(TodayBar, { reservations: reservations, rooms: rooms, sources: sources, activeFilter: activeFilter, onFilterChange: function(f) { setActiveFilter(f); if (tab !== 'rez') setTab('rez'); } }),
    // CONTENT
    tab === 'rez' && h(ResTab, { rooms: rooms, sources: sources, reservations: reservations, conflicts: conflicts, onNew: openNew, onEdit: openEdit, onCopy: openCopy, onMove: openMove, onDelete: delRes, onSendMsg: function(r) { setMsgRes(r); setShowMessages(true); }, onToggleCheckedIn: toggleCheckedIn, onToggleRoomCleaned: toggleRoomCleaned, onSaveGuestDetails: saveGuestDetails, pensionName: pensionName, activeFilter: activeFilter, bookingRules: bookingRules }),
    tab.startsWith('cal') && h(CalTab, { rooms: rooms, sources: sources, reservations: reservations, initView: calViewMap[tab] || 'month', onNew: openNew, onEdit: openEdit }),
    tab === 'stats' && h(StatsTab, { rooms: rooms, sources: sources, reservations: reservations }),
    tab === 'archive' && h(ArchiveTab, { rooms: rooms, sources: sources, reservations: reservations, onEdit: openEdit, onCopy: openCopy, onMove: openMove, onDelete: delRes, onSendMsg: function(r) { setMsgRes(r); setShowMessages(true); }, onSaveGuestDetails: saveGuestDetails, pensionName: pensionName }),
    // MODALS
    modal && h(ResMdl, { modal: modal, onSave: saveRes, onClose: function() { setModal(null); }, rooms: rooms, sources: sources, reservations: reservations, bookingRules: bookingRules, wholeEnabled: wholeEnabled }),
    showRooms && h(RoomMgr, { rooms: rooms, reservations: reservations, onSave: saveRooms, onClose: function() { setShowRooms(false); } }),
    showSrc && h(SrcMgr, { sources: sources, onSave: saveSrc, onClose: function() { setShowSrc(false); } }),
    showPensionSettings && h(PensionSettings, { pensionName: pensionName, pensionPhoto: pensionPhoto, onSave: savePensionSettings, onClose: function() { setShowPensionSettings(false); } }),
    showPresentationEditor && h(PresentationEditor, { presentation: presentation, onSave: savePresentation, onClose: function() { setShowPresentationEditor(false); } }),
    showAccountSettings && h(AccountSettings, { onClose: function() { setShowAccountSettings(false); } }),
    showBillingInfo && h(BillingInfo, { billingInfo: billingInfo, onSave: saveBillingInfo, onClose: function() { setShowBillingInfo(false); } }),
    showMessages && h(MessagesMgr, { res: msgRes, pensionName: pensionName, onClose: function() { setShowMessages(false); setMsgRes(null); } }),
    showIcal && h(ICalMgr, { rooms: rooms, reservations: reservations, onClose: function() { setShowIcal(false); }, onSync: function() {} }),
    showPdf && h(PdfExport, { rooms: rooms, sources: sources, reservations: reservations, onClose: function() { setShowPdf(false); } }),
    showPrices && h(PricesMgr, {
      rooms: rooms,
      roomPrices: roomPrices,
      pensionName: pensionName || 'Pensiune',
      pendingRes: reservations.filter(function(r){ return r.pendingConfirmation; }),
      onSave: function(newPrices) {
        saveConfig({ roomPrices: newPrices }).then(function() {
          setRoomPrices(newPrices);
          lc.set('p_prices', newPrices);
        }).catch(function(err) { console.error('PricesMgr save error:', err); });
      },
      onConfirmPending: function(res) {
        // Convert pending to confirmed reservation
        var id = res.id;
        var updated = Object.assign({}, res, { pendingConfirmation: false, status: 'occupied' });
        delete updated.id;
        fb.set('reservations/' + id, updated).catch(function(err) {
          console.error('onConfirmPending error:', err);
          alert('Eroare la confirmare: ' + err.message);
        });
      },
      onDeletePending: function(id) {
        setConfirm({
          msg: 'Refuzi si stergi aceasta cerere de rezervare?',
          okLbl: 'Refuza',
          ok: function() {
            fb.remove('reservations/' + id).catch(function(err) {
              console.error('onDeletePending error:', err);
              alert('Eroare la stergere: ' + err.message);
            });
            setConfirm(null);
          }
        });
      },
      onClose: function() { setShowPrices(false); }
    }),
    showBookingRules && h(BookingRulesSettings, {
      rules: bookingRules,
      onSave: saveBookingRules,
      onClose: function() { setShowBookingRules(false); }
    }),
    showAvailability && h(AvailabilitySearch, {
      rooms: rooms, reservations: reservations, bookingRules: bookingRules, wholeEnabled: wholeEnabled,
      onNew: function(room, prefill) { setShowAvailability(false); openNew(room, prefill); },
      onClose: function() { setShowAvailability(false); }
    }),
    showTeam && h(TeamMgr, {
      plan: plan, accountCount: accountCount, members: members,
      onInvite: inviteStaff, onRemove: removeStaff,
      onClose: function() { setShowTeam(false); }
    }),
    showGuide && h(OnboardingGuide, {
      pensionName: pensionName, rooms: rooms, sources: sources, reservations: reservations, billingInfo: billingInfo,
      onClose: function() { setShowGuide(false); }
    }),
    showSupportChat && h(SupportChat, {
      pensionId: PENSION_ID, viewerRole: USER_ROLE, viewerEmail: firebase.auth().currentUser ? firebase.auth().currentUser.email : '',
      onClose: function() { setShowSupportChat(false); }
    }),
    confirm && h(Confirm, { msg: confirm.msg, okLbl: confirm.okLbl, ok: confirm.ok, onCancel: function() { setConfirm(null); } })
  );
}

// ══════════════════════════════════════════════════════════════════════════
// NETWORK ADMIN DASHBOARD — ecran separat, doar pentru role === 'network_admin'
// Vede toate pensiunile, poate schimba plan/status/trial. NU editeaza rezervari
// direct (pentru asta, Firebase Console ramane calea pentru cazuri exceptionale).
// ══════════════════════════════════════════════════════════════════════════
// ── EDITOR TARIFE GENERALE (Network Admin, doar desktop) ─────────────────────
// Preturile afisate la alegerea planului (inregistrare noua) si, in viitor, pe landing
// page. Schimbarea de aici NU modifica retroactiv pensiunile deja pe un plan — doar
// pretul aratat clientilor NOI la momentul alegerii.
function PlanPricesEditor(props) {
  var ps = useState(Object.assign({ basic: 49, standard: 99, premium: 189 }, props.prices));
  var prices = ps[0], setPrices = ps[1];
  var svs = useState(false); var saving = svs[0], setSaving = svs[1];
  var oks = useState(false); var saved = oks[0], setSaved = oks[1];

  function update(plan, val) {
    setPrices(Object.assign({}, prices, { [plan]: parseInt(val) || 0 }));
    setSaved(false);
  }

  function handleSave() {
    setSaving(true);
    props.onSave(prices).then(function() {
      setSaving(false); setSaved(true);
      setTimeout(function() { setSaved(false); }, 2500);
    }).catch(function(e) { setSaving(false); alert('Eroare: ' + e.message); });
  }

  var planMeta = [
    { id: 'basic', label: 'Basic', color: '#64748b', desc: '1 cont — gestiune interna' },
    { id: 'standard', label: 'Standard', color: '#2563eb', desc: '3 conturi — pagina publica + rezervare online' },
    { id: 'premium', label: 'Premium', color: '#7c3aed', desc: '10 conturi — echipe mai mari' }
  ];

  return h('div', { className: 'page', style: { maxWidth: 700 } },
    h('div', { className: 'card', style: { padding: 20 } },
      h('div', { style: { fontSize: 17, fontWeight: 800, color: '#1e3a5f', marginBottom: 4 } }, '\uD83D\uDCB0 Tarife generale'),
      h('div', { style: { fontSize: 13.5, color: '#64748b', marginBottom: 20 } }, 'Preturile afisate clientilor la alegerea planului, in timpul inregistrarii. Nu afecteaza retroactiv pensiunile deja abonate.'),

      planMeta.map(function(pm) {
        return h('div', { key: pm.id, style: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #f1f5f9' } },
          h('div', { style: { width: 90, flexShrink: 0 } },
            h('div', { style: { fontWeight: 800, fontSize: 15, color: pm.color } }, pm.label)
          ),
          h('div', { style: { flex: 1, fontSize: 12.5, color: '#94a3b8' } }, pm.desc),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
            h('input', {
              type: 'number', min: 0, value: prices[pm.id],
              style: { width: 80, padding: '9px 10px', borderRadius: 8, border: '1.5px solid #d1d9e0', fontSize: 15, fontWeight: 700, textAlign: 'right' },
              onChange: function(e) { update(pm.id, e.target.value); }
            }),
            h('span', { style: { fontSize: 13, color: '#64748b', fontWeight: 600 } }, 'lei/lun\u0103')
          )
        );
      }),

      h('button', {
        style: { marginTop: 18, padding: '13px 22px', background: saved ? '#16a34a' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer' },
        disabled: saving, onClick: handleSave
      }, saving ? 'Se salveaza...' : saved ? '\u2713 Salvat!' : 'Salveaza tarifele')
    )
  );
}

function NetworkAdminDashboard() {
  var ls = useState(true); var loading = ls[0], setLoading = ls[1];
  var ps = useState([]); var pensionsListRaw = ps[0], setPensionsListRaw = ps[1];
  var us = useState({}); var usersMap = us[0], setUsersMap = us[1];
  var pps = useState({}); var planPrices = pps[0], setPlanPrices = pps[1];
  var bp = useState({}); var busy = bp[0], setBusy = bp[1]; // { [pensionId]: true } cat timp o actiune e in curs
  var dts = useState(null); var deleteTarget = dts[0], setDeleteTarget = dts[1];
  var atb = useState('pensions'); var activeTab = atb[0], setActiveTab = atb[1]; // 'pensions' | 'support' | 'tarife'
  var scp = useState(null); var chatPension = scp[0], setChatPension = scp[1];
  var isDesktop = useState(function() { return typeof window !== 'undefined' && window.innerWidth >= 1024; })[0];

  // Pensiunile afisate exclud orice pensiune al carei owner are ACUM rolul network_admin —
  // ramasita de la bootstrap-ul contului de admin (inregistrare normala ca Owner, apoi
  // schimbare manuala de rol in Firebase Console). Nu e un client real, nu trebuie sa
  // apara in lista. Adaugam si datele de facturare ale fiecarui owner (users/{uid}/billingInfo),
  // disponibile acum ca citim si users/ in bloc.
  var pensionsList = useMemo(function() {
    return pensionsListRaw.filter(function(p) {
      var ownerRole = p.ownerUid && usersMap[p.ownerUid] ? usersMap[p.ownerUid].role : null;
      return ownerRole !== 'network_admin';
    }).map(function(p) {
      var ownerUser = p.ownerUid ? usersMap[p.ownerUid] : null;
      return Object.assign({}, p, { billingInfo: ownerUser ? ownerUser.billingInfo : null });
    });
  }, [pensionsListRaw, usersMap]);

  // Inbox de suport, derivat direct din pensionsList (care contine deja supportChat, fiind
  // citit integral din /pensions). Sortat pe prioritate: conversatii care asteapta raspuns
  // primele, ordonate dupa plan (Premium > Standard > Basic), apoi cele mai vechi in asteptare.
  var supportThreads = useMemo(function() {
    var planRank = { premium: 3, standard: 2, basic: 1 };
    var threads = pensionsList.map(function(p) {
      var msgs = (p.supportChat && p.supportChat.messages) ? Object.values(p.supportChat.messages) : [];
      msgs.sort(function(a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
      var last = msgs[msgs.length - 1];
      return { pension: p, messageCount: msgs.length, lastMessage: last, needsReply: !!last && last.senderRole !== 'network_admin' };
    }).filter(function(t) { return t.messageCount > 0; });

    threads.sort(function(a, b) {
      if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1;
      if (a.needsReply) {
        var rankDiff = (planRank[b.pension.plan] || 0) - (planRank[a.pension.plan] || 0);
        if (rankDiff !== 0) return rankDiff;
        return (a.lastMessage.timestamp || 0) - (b.lastMessage.timestamp || 0);
      }
      return (b.lastMessage.timestamp || 0) - (a.lastMessage.timestamp || 0);
    });
    return threads;
  }, [pensionsList]);
  var needsReplyCount = supportThreads.filter(function(t) { return t.needsReply; }).length;

  useEffect(function() {
    if (!firebaseDB) { setLoading(false); return; }
    var ref = firebaseDB.ref('pensions');
    var cb = function(snap) {
      var data = snap.val() || {};
      var arr = Object.keys(data).map(function(id) { return Object.assign({ id: id }, data[id]); });
      arr.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      setPensionsListRaw(arr);
      setLoading(false);
    };
    ref.on('value', cb, function(err) { console.error('NetworkAdminDashboard read error:', err); setLoading(false); });

    var usersRef = firebaseDB.ref('users');
    var usersCb = function(snap) { setUsersMap(snap.val() || {}); };
    usersRef.on('value', usersCb, function(err) { console.error('users read error:', err); });

    var pricesRef = firebaseDB.ref('planPrices');
    var pricesCb = function(snap) { setPlanPrices(snap.val() || { basic: 49, standard: 99, premium: 189 }); };
    pricesRef.on('value', pricesCb);

    return function() { ref.off('value', cb); usersRef.off('value', usersCb); pricesRef.off('value', pricesCb); };
  }, []);

  function setBusyFor(id, val) { setBusy(function(prev) { return Object.assign({}, prev, { [id]: val }); }); }

  function changePlan(id, newPlan) {
    setBusyFor(id, true);
    firebaseDB.ref('pensions/' + id + '/plan').set(newPlan)
      .catch(function(err) { alert('Eroare: ' + err.message); })
      .then(function() { setBusyFor(id, false); });
  }

  function toggleStatus(id, currentStatus) {
    var next = currentStatus === 'suspended' ? 'active' : 'suspended';
    setBusyFor(id, true);
    firebaseDB.ref('pensions/' + id + '/status').set(next)
      .catch(function(err) { alert('Eroare: ' + err.message); })
      .then(function() { setBusyFor(id, false); });
  }

  function extendTrial(id, currentTrialEndsAt) {
    var base = currentTrialEndsAt && currentTrialEndsAt > Date.now() ? currentTrialEndsAt : Date.now();
    var next = base + 7 * 24 * 60 * 60 * 1000;
    setBusyFor(id, true);
    firebaseDB.ref('pensions/' + id + '/trialEndsAt').set(next)
      .catch(function(err) { alert('Eroare: ' + err.message); })
      .then(function() { setBusyFor(id, false); });
  }

  // Confirmare plata manuala (Faza 1 din roadmap — transfer bancar) — extinde accesul
  // cu 30 de zile de la ACUM (nu de la vechiul trialEndsAt) si reactiveaza contul daca
  // fusese blocat de expirarea perioadei gratuite.
  function confirmPayment(id) {
    setBusyFor(id, true);
    var next = Date.now() + 30 * 24 * 60 * 60 * 1000;
    firebaseDB.ref('pensions/' + id + '/trialEndsAt').set(next)
      .then(function() { return firebaseDB.ref('pensions/' + id + '/status').set('active'); })
      .catch(function(err) { alert('Eroare: ' + err.message); })
      .then(function() { setBusyFor(id, false); });
  }

  // Tarife generale — vizibile la inregistrare (alegerea planului) si pe landing page (viitor).
  // Editabile doar de Network Admin, doar pe desktop (nu are sens pe telefon — actiune rara,
  // care necesita atentie, nu grabita intre doua task-uri operationale).
  function savePlanPrices(prices) {
    return firebaseDB.ref('planPrices').set(prices).then(function() { setPlanPrices(prices); });
  }

  // Stergere completa (Varianta 2): sterge toate inregistrarile users/{uid} ale membrilor
  // (Owner + Staff), adauga email-ul Owner-ului in lista neagra (bannedEmails) ca sa nu
  // poata recrea automat un cont nou gratuit, apoi sterge intreaga pensiune. Contul de
  // AUTENTIFICARE Firebase (email+parola) ramane tehnic valid — Firebase nu permite
  // stergerea lui de catre altcineva decat proprietarul sau printr-un backend cu Admin SDK
  // (in afara arhitecturii curente). Blocarea reala se face prin lista neagra.
  function deletePensionCompletely(p) {
    setBusyFor(p.id, true);
    var memberUids = Object.keys(p.members || {});
    Promise.all(memberUids.map(function(uid) { return firebaseDB.ref('users/' + uid).remove(); }))
      .then(function() {
        if (p.ownerEmail) {
          return firebaseDB.ref('bannedEmails/' + sanitizeEmailKey(p.ownerEmail)).set({
            bannedAt: Date.now(), pensionName: p.pensionName || ''
          });
        }
      })
      .then(function() { return firebaseDB.ref('pensions/' + p.id).remove(); })
      .then(function() { setBusyFor(p.id, false); setDeleteTarget(null); })
      .catch(function(err) { alert('Eroare la stergere: ' + err.message); setBusyFor(p.id, false); });
  }

  if (loading) {
    return h('div', { className: 'ldg' },
      h('div', { className: 'spin' }),
      h('div', { style: { fontSize: 15, fontWeight: 600, color: '#64748b' } }, 'Se incarca pensiunile...')
    );
  }

  return h('div', { className: 'app' },
    h('header', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', color: '#fff', padding: '16px', position: 'sticky', top: 0, zIndex: 60, boxShadow: '0 2px 16px rgba(0,0,0,.22)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto', flexWrap: 'wrap', gap: 10 } },
        h('div', null,
          h('div', { style: { fontSize: 19, fontWeight: 800 } }, '\uD83D\uDEE1\uFE0F Administrator retea'),
          h('div', { style: { fontSize: 13, opacity: .8, marginTop: 2 } }, pensionsList.length + ' pensiuni inregistrate')
        ),
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
          h('div', { style: { display: 'flex', background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: 3, gap: 2 } },
            h('button', {
              style: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeTab === 'pensions' ? '#fff' : 'none', color: activeTab === 'pensions' ? '#1e3a5f' : '#fff' },
              onClick: function() { setActiveTab('pensions'); }
            }, 'Pensiuni'),
            h('button', {
              style: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeTab === 'support' ? '#fff' : 'none', color: activeTab === 'support' ? '#1e3a5f' : '#fff', display: 'flex', alignItems: 'center', gap: 6 },
              onClick: function() { setActiveTab('support'); }
            }, '\uD83D\uDCAC Suport', needsReplyCount > 0 && h('span', { style: { background: '#dc2626', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11 } }, needsReplyCount)),
            isDesktop && h('button', {
              style: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeTab === 'tarife' ? '#fff' : 'none', color: activeTab === 'tarife' ? '#1e3a5f' : '#fff' },
              onClick: function() { setActiveTab('tarife'); }
            }, '\uD83D\uDCB0 Tarife')
          ),
          h('button', { style: { padding: '9px 16px', background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', color: '#fff', borderRadius: 9, fontWeight: 700, cursor: 'pointer' }, onClick: function() { firebase.auth().signOut(); } }, 'Deconectare')
        )
      )
    ),
    activeTab === 'pensions' && h('div', { className: 'page', style: { maxWidth: 900 } },
      pensionsList.length === 0
        ? h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' } }, 'Nicio pensiune inregistrata inca.')
        : pensionsList.map(function(p) {
            var limit = PLAN_LIMITS[p.plan] || 1;
            var isBusy = !!busy[p.id];
            var trialDate = p.trialEndsAt ? fmt(new Date(p.trialEndsAt).toISOString().slice(0, 10)) : '-';
            var trialExpired = p.trialEndsAt && p.trialEndsAt < Date.now();
            return h('div', { key: p.id, className: 'card', style: { padding: 16 } },
              h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 } },
                h('div', null,
                  h('div', { style: { fontSize: 17, fontWeight: 800, color: '#1a202c' } }, p.pensionName || '(fara nume)'),
                  h('div', { style: { fontSize: 13, color: '#64748b', marginTop: 2 } }, p.ownerEmail || '-')
                ),
                h('span', {
                  style: {
                    fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 20,
                    background: p.status === 'suspended' ? '#fee2e2' : '#dcfce7',
                    color: p.status === 'suspended' ? '#dc2626' : '#15803d'
                  }
                }, p.status === 'suspended' ? '\uD83D\uDD12 SUSPENDAT' : '\u2713 ACTIV')
              ),
              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 } },
                h('div', null,
                  h('div', { style: { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' } }, 'Conturi'),
                  h('div', { style: { fontSize: 15, fontWeight: 700, color: (p.accountCount || 1) >= limit ? '#dc2626' : '#1a202c' } }, (p.accountCount || 1) + ' / ' + limit)
                ),
                h('div', null,
                  h('div', { style: { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' } }, 'Trial expira'),
                  h('div', { style: { fontSize: 15, fontWeight: 700, color: trialExpired ? '#dc2626' : '#1a202c' } }, trialDate)
                ),
                h('div', null,
                  h('div', { style: { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' } }, 'Inregistrat'),
                  h('div', { style: { fontSize: 15, fontWeight: 700, color: '#1a202c' } }, p.createdAt ? fmt(new Date(p.createdAt).toISOString().slice(0, 10)) : '-')
                )
              ),
              p.billingInfo && (p.billingInfo.fullName || p.billingInfo.companyName) && h('div', { style: { background: '#f8fafc', borderRadius: 9, padding: '10px 12px', marginBottom: 14, fontSize: 12.5 } },
                h('div', { style: { fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: 10.5, marginBottom: 4 } }, '\uD83E\uDDFE Date facturare'),
                p.billingInfo.type === 'pj'
                  ? h('div', { style: { color: '#1a202c' } },
                      h('strong', null, p.billingInfo.companyName || '-'), ' \u00B7 CUI: ' + (p.billingInfo.cui || '-')
                    )
                  : h('div', { style: { color: '#1a202c' } },
                      h('strong', null, p.billingInfo.fullName || '-'), ' \u00B7 CNP: ' + (p.billingInfo.cnp || '-')
                    )
              ),
              h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                h('select', {
                  className: 'finp', style: { width: 'auto', padding: '8px 10px', fontSize: 13 },
                  value: p.plan || 'basic', disabled: isBusy,
                  onChange: function(e) { changePlan(p.id, e.target.value); }
                },
                  h('option', { value: 'basic' }, 'Basic (1 cont)'),
                  h('option', { value: 'standard' }, 'Standard (3 conturi)'),
                  h('option', { value: 'premium' }, 'Premium (10 conturi)')
                ),
                h('button', {
                  style: { padding: '8px 14px', background: p.status === 'suspended' ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
                  disabled: isBusy, onClick: function() { toggleStatus(p.id, p.status); }
                }, p.status === 'suspended' ? 'Reactiveaza' : 'Suspenda'),
                h('button', {
                  style: { padding: '8px 14px', background: '#f1f5f9', color: '#374151', border: '1.5px solid #d1d9e0', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
                  disabled: isBusy, onClick: function() { extendTrial(p.id, p.trialEndsAt); }
                }, '+7 zile trial'),
                h('button', {
                  style: { padding: '8px 14px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
                  disabled: isBusy, onClick: function() { confirmPayment(p.id); }
                }, '\u2713 Confirma plata (+30 zile)'),
                h('button', {
                  style: { padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
                  disabled: isBusy, onClick: function() { setDeleteTarget(p); }
                }, '\uD83D\uDDD1\uFE0F Sterge complet')
              )
            );
          })
    ),

    activeTab === 'support' && h('div', { className: 'page', style: { maxWidth: 900 } },
      supportThreads.length === 0
        ? h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' } }, 'Nicio conversatie de suport inca.')
        : supportThreads.map(function(t) {
            var p = t.pension;
            var planBadgeColor = { premium: '#7c3aed', standard: '#2563eb', basic: '#64748b' }[p.plan] || '#64748b';
            return h('div', {
              key: p.id, className: 'card',
              style: { padding: 14, cursor: 'pointer', border: t.needsReply ? '1.5px solid #dc2626' : '1.5px solid transparent' },
              onClick: function() { setChatPension(p); }
            },
              h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 } },
                  h('span', { style: { fontWeight: 800, fontSize: 15, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.pensionName || '(fara nume)'),
                  h('span', { style: { fontSize: 10.5, fontWeight: 800, color: '#fff', background: planBadgeColor, padding: '2px 8px', borderRadius: 10, flexShrink: 0 } }, (PLAN_LABELS[p.plan] || p.plan || '').toUpperCase())
                ),
                t.needsReply
                  ? h('span', { style: { fontSize: 11, fontWeight: 800, color: '#dc2626', flexShrink: 0 } }, '\u25CF Asteapta raspuns')
                  : h('span', { style: { fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0 } }, '\u2713 Raspuns trimis')
              ),
              h('div', { style: { fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                (t.lastMessage.senderRole === 'network_admin' ? 'Tu: ' : '') + t.lastMessage.text
              ),
              h('div', { style: { fontSize: 11, color: '#cbd5e1', marginTop: 4 } },
                new Date(t.lastMessage.timestamp).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
              )
            );
          })
    ),

    activeTab === 'tarife' && isDesktop && h(PlanPricesEditor, { prices: planPrices, onSave: savePlanPrices }),

    deleteTarget && h(Confirm, {
      msg: 'Stergi COMPLET pensiunea "' + (deleteTarget.pensionName || '(fara nume)') + '"? Toate rezervarile, configurarile si conturile asociate (Owner + Staff) vor fi sterse ireversibil, iar email-ul "' + (deleteTarget.ownerEmail || '-') + '" va fi blocat sa mai creeze un cont nou gratuit.',
      okLbl: 'Sterge definitiv',
      ok: function() { deletePensionCompletely(deleteTarget); },
      onCancel: function() { setDeleteTarget(null); }
    }),

    chatPension && h(SupportChat, {
      pensionId: chatPension.id, viewerRole: 'network_admin', viewerEmail: firebase.auth().currentUser ? firebase.auth().currentUser.email : '',
      pensionName: chatPension.pensionName,
      onClose: function() { setChatPension(null); }
    })
  );
}

function startApp() {
  var root = createRoot(document.getElementById('root'));
  if (USER_ROLE === 'network_admin') {
    root.render(h(NetworkAdminDashboard));
  } else {
    root.render(h(App));
  }
}
// Expus global: onAuthStateChanged (primul <script> din pagina, ruleaza inainte
// ca acest al doilea script sa fie parsat) are nevoie sa apeleze startApp() dupa
// ce PENSION_ID e populat. Fara window.startApp explicit, primul script ar arunca
// "ReferenceError: startApp is not defined" (acelasi tip de bug ca firebaseAuth
// rezolvat anterior) — eroarea oprea silentios fluxul de auth, ceea ce a dus la
// "solutia" gresita de mai jos: apelarea necondiționata a lui startApp().
window.startApp = startApp;
function Confirm(props) {
  return h('div', { className: 'cov', onClick: props.onCancel },
    h('div', { className: 'cbox', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'cico' }, '\u26A0\uFE0F'),
      h('div', { className: 'ctit' }, 'Confirmare'),
      h('div', { className: 'cmsg' }, props.msg),
      h('div', { className: 'cbtns' },
        h('button', { className: 'cno', onClick: props.onCancel }, 'Anuleaza'),
        h('button', { className: 'cyes', onClick: props.ok }, props.okLbl || 'Sterge')
      )
    )
  );
}

// ── FIELD COMPONENT ──────────────────────────────────────────────────────────
function Field(props) {
  return h('div', { className: 'fld' },
    h('label', { className: 'flbl' }, props.lbl, props.req ? h('span', { className: 'req' }, ' *') : null),
    props.children
  );
}

// ── SOURCES MANAGER ──────────────────────────────────────────────────────────
function SrcMgr(props) {
  var sources = props.sources, onSave = props.onSave, onClose = props.onClose;
  var ls = useState(sources.slice());
  var list = ls[0], setList = ls[1];
  var ns = useState('');
  var newName = ns[0], setNewName = ns[1];
  var ds = useState(null);
  var delSrc = ds[0], setDelSrc = ds[1];

  function addSrc() {
    var n = newName.trim();
    if (!n) return;
    if (list.some(function(x) { return x.toLowerCase() === n.toLowerCase(); })) { alert('Sursa exista!'); return; }
    setList(list.concat([n]));
    setNewName('');
  }

  return h(Fragment, null,
    h('div', { className: 'ov', onClick: onClose },
      h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'mhdr' },
          h('span', { className: 'mtit' }, 'Surse rezervari'),
          h('button', { className: 'mclose', onClick: onClose }, '\u2715')
        ),
        h('div', { className: 'mbody' },
          h('div', { className: 'ibox' }, 'Culorile se atribuie automat. Stergerea nu afecteaza rezervarile existente.'),
          h('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
            h('input', { className: 'finp', style: { flex: 1 }, value: newName, onChange: function(e) { setNewName(e.target.value); }, onKeyDown: function(e) { if (e.key === 'Enter') addSrc(); }, placeholder: 'Sursa noua (ex: Airbnb)...' }),
            h('button', { style: { padding: '12px 14px', background: '#2563eb', color: '#fff', borderRadius: 9, fontWeight: 700 }, onClick: addSrc }, '+ Add')
          ),
          list.map(function(src, i) {
            var c = PAL[i % PAL.length];
            return h('div', { key: src, className: 'mgrrow' },
              h('span', { className: 'cbdg', style: { background: c.light, color: c.text, fontSize: 14 } }, src),
              h('span', { style: { flex: 1 } }),
              h('button', { className: 'cbtn', style: { color: '#dc2626' }, onClick: function() { setDelSrc(src); } }, h(ITrash))
            );
          })
        ),
        h('div', { className: 'mfoot' },
          h('button', { className: 'mcanc', onClick: onClose }, 'Anuleaza'),
          h('button', { className: 'msave', onClick: function() { onSave(list); } }, '\u2713 Salveaza')
        )
      )
    ),
    delSrc && h(Confirm, {
      msg: 'Stergi sursa "' + delSrc + '"?',
      ok: function() { setList(list.filter(function(x) { return x !== delSrc; })); setDelSrc(null); },
      onCancel: function() { setDelSrc(null); }
    })
  );
}

// ── ROOMS MANAGER ────────────────────────────────────────────────────────────
function RoomMgr(props) {
  var rooms = props.rooms, reservations = props.reservations, onSave = props.onSave, onClose = props.onClose;
  var ls = useState(rooms.slice());
  var list = ls[0], setList = ls[1];
  var ns = useState('');
  var newName = ns[0], setNewName = ns[1];
  var ds = useState(null);
  var delRoom = ds[0], setDelRoom = ds[1];

  function addRoom() {
    var n = newName.trim();
    if (!n) return;
    if (list.some(function(r) { return r.toLowerCase() === n.toLowerCase(); })) { alert('Camera exista!'); return; }
    setList(list.concat([n]));
    setNewName('');
  }
  function cnt(room) { return reservations.filter(function(r) { return r.room === room; }).length; }

  return h(Fragment, null,
    h('div', { className: 'ov', onClick: onClose },
      h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'mhdr' },
          h('span', { className: 'mtit' }, 'Gestionare camere'),
          h('button', { className: 'mclose', onClick: onClose }, '\u2715')
        ),
        h('div', { className: 'mbody' },
          h('div', { className: 'ibox' }, 'Atentie: stergerea unei camere sterge si rezervarile ei!'),
          h('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
            h('input', { className: 'finp', style: { flex: 1 }, value: newName, onChange: function(e) { setNewName(e.target.value); }, onKeyDown: function(e) { if (e.key === 'Enter') addRoom(); }, placeholder: 'Numele camerei noi...' }),
            h('button', { style: { padding: '12px 14px', background: '#2563eb', color: '#fff', borderRadius: 9, fontWeight: 700 }, onClick: addRoom }, '+ Add')
          ),
          list.map(function(room) {
            return h('div', { key: room, className: 'mgrrow' },
              h('span', { style: { fontSize: 17 } }, '\uD83D\uDEAA'),
              h('span', { style: { fontWeight: 700, flex: 1, fontSize: 15 } }, room),
              cnt(room) > 0 && h('span', { style: { fontSize: 12, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: 7, fontWeight: 700 } }, cnt(room) + ' rez.'),
              h('button', { className: 'cbtn', style: { color: '#dc2626' }, onClick: function() { setDelRoom(room); } }, h(ITrash))
            );
          })
        ),
        h('div', { className: 'mfoot' },
          h('button', { className: 'mcanc', onClick: onClose }, 'Anuleaza'),
          h('button', { className: 'msave', onClick: function() { onSave(list); } }, '\u2713 Salveaza')
        )
      )
    ),
    delRoom && h(Confirm, {
      msg: cnt(delRoom) > 0 ? 'Camera "' + delRoom + '" are ' + cnt(delRoom) + ' rezervari. Stergi tot?' : 'Stergi camera "' + delRoom + '"?',
      ok: function() { setList(list.filter(function(r) { return r !== delRoom; })); setDelRoom(null); },
      onCancel: function() { setDelRoom(null); }
    })
  );
}

// ── CAUTA DISPONIBILITATE PE O DATA ──────────────────────────────────────────
function AvailabilitySearch(props) {
  var rooms = props.rooms, reservations = props.reservations, bookingRules = props.bookingRules || {};
  var cs = useState(todayStr()); var checkIn = cs[0], setCheckIn = cs[1];
  var ns = useState('1'); var nightsStr = ns[0], setNightsStr = ns[1];
  var nights = parseInt(nightsStr) || 0;

  var checkOut = addDays(checkIn, nights);

  // Pentru fiecare camera: 'free' | 'occupied' | 'gap' (tehnic libera dar incalca pauza minima)
  var results = useMemo(function() {
    if (!checkIn || !nights) return [];
    return rooms.map(function(room) {
      var conflict = reservations.find(function(r) {
        return blocksRoom(r, room) && r.status !== 'cancelled' && overlaps(checkIn, nights, r.checkIn, r.nights || 0);
      });
      if (conflict) return { room: room, status: 'occupied', detail: fullName(conflict) + ' (' + fmt(conflict.checkIn) + '\u2192' + fmt(addDays(conflict.checkIn, conflict.nights || 0)) + ')' };

      if (bookingRules.minGapDays > 0) {
        var gapConflict = reservations.find(function(r) {
          if (!blocksRoom(r, room) || r.status === 'cancelled') return false;
          var rCheckOut = addDays(r.checkIn, r.nights || 0);
          var gapBefore = r.checkIn < checkIn && rCheckOut <= checkIn && addDays(rCheckOut, bookingRules.minGapDays) > checkIn;
          var gapAfter = r.checkIn >= checkOut && addDays(checkOut, bookingRules.minGapDays) > r.checkIn;
          return gapBefore || gapAfter;
        });
        if (gapConflict) return { room: room, status: 'gap', detail: 'Necesita pauza fata de ' + fullName(gapConflict) };
      }

      return { room: room, status: 'free', detail: null };
    });
  }, [rooms, reservations, checkIn, nights, bookingRules]);

  // "Toata locatia" ca unitate separata de rezervare — libera doar daca TOATE camerele
  // individuale sunt libere (nicio camera ocupata sau cu gap necesar).
  var wholeStatus = useMemo(function() {
    if (!props.wholeEnabled || !checkIn || !nights) return null;
    var anyOccupied = results.some(function(r) { return r.status === 'occupied'; });
    var anyGap = results.some(function(r) { return r.status === 'gap'; });
    if (anyOccupied) return { status: 'occupied', detail: 'Cel putin o camera e deja ocupata in acest interval' };
    if (anyGap) return { status: 'gap', detail: 'Cel putin o camera necesita pauza inainte de aceasta data' };
    return { status: 'free', detail: null };
  }, [results, props.wholeEnabled, checkIn, nights]);

  var statusMeta = {
    free: { label: 'Libera', color: '#16a34a', bg: '#dcfce7', icon: '\uD83D\uDFE2' },
    gap: { label: 'Libera, dar necesita pauza', color: '#d97706', bg: '#fef3c7', icon: '\uD83D\uDFE1' },
    occupied: { label: 'Ocupata', color: '#dc2626', bg: '#fee2e2', icon: '\uD83D\uDD34' }
  };

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDD0D Verifica disponibilitate'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Data check-in', req: true }, h('input', { className: 'finp', type: 'date', value: checkIn, onChange: function(e) { setCheckIn(e.target.value); } })),
          h(Field, { lbl: 'Nopti' }, h('input', { className: 'finp', type: 'number', min: 1, value: nightsStr, onFocus: function(e) { e.target.select(); }, onChange: function(e) { setNightsStr(e.target.value); }, onBlur: function() { if (!parseInt(nightsStr)) setNightsStr('1'); } })),
          h(Field, { lbl: 'Check-out' }, h('input', { className: 'finp ro', readOnly: true, value: fmt(checkOut) }))
        ),
        h('div', { style: { marginTop: 16 } },
          // Rand separat pentru "Toata locatia", daca e activata din Configurare
          wholeStatus && h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: statusMeta[wholeStatus.status].bg, borderRadius: 10, marginBottom: 12, gap: 10, border: '1.5px dashed ' + statusMeta[wholeStatus.status].color } },
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h('span', null, '\uD83C\uDFE0'),
                h('span', { style: { fontWeight: 800, fontSize: 15, color: '#1a202c' } }, 'Toata locatia'),
                h('span', { style: { fontSize: 12, fontWeight: 700, color: statusMeta[wholeStatus.status].color } }, statusMeta[wholeStatus.status].label)
              ),
              wholeStatus.detail && h('div', { style: { fontSize: 12, color: '#64748b', marginTop: 2 } }, wholeStatus.detail)
            ),
            wholeStatus.status === 'free' && h('button', {
              style: { padding: '8px 14px', background: '#92400e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 },
              onClick: function() { props.onNew(WHOLE, { checkIn: checkIn, nights: nights }); }
            }, '+ Rezerva')
          ),
          results.map(function(r) {
            var meta = statusMeta[r.status];
            return h('div', { key: r.room, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: meta.bg, borderRadius: 10, marginBottom: 8, gap: 10 } },
              h('div', { style: { flex: 1, minWidth: 0 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                  h('span', null, meta.icon),
                  h('span', { style: { fontWeight: 700, fontSize: 15, color: '#1a202c' } }, r.room),
                  h('span', { style: { fontSize: 12, fontWeight: 700, color: meta.color } }, meta.label)
                ),
                r.detail && h('div', { style: { fontSize: 12, color: '#64748b', marginTop: 2 } }, r.detail)
              ),
              r.status !== 'occupied' && h('button', {
                style: { padding: '8px 14px', background: r.status === 'gap' ? '#d97706' : '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 },
                onClick: function() { props.onNew(r.room, { checkIn: checkIn, nights: nights }); }
              }, '+ Rezerva')
            );
          })
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: props.onClose }, 'Inchide')
      )
    )
  );
}

// ── REGULI DE CAZARE ─────────────────────────────────────────────────────────
function BookingRulesSettings(props) {
  var r = props.rules || { minGapDays: 0, minNights: 0, minAdvanceDays: 0 };
  var fs = useState({ minGapDays: r.minGapDays || 0, minNights: r.minNights || 0, minAdvanceDays: r.minAdvanceDays || 0 });
  var form = fs[0], setForm = fs[1];
  var sv = useState(false); var saving = sv[0], setSaving = sv[1];

  function set(k, v) { setForm(Object.assign({}, form, { [k]: Math.max(0, parseInt(v) || 0) })); }

  function handleSave() {
    setSaving(true);
    Promise.resolve(props.onSave(form)).catch(function(err) {
      setSaving(false);
      alert('Eroare la salvare: ' + err.message);
    });
  }

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDECF\uFE0F Reguli de cazare'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        h('div', { style: { fontSize: 12.5, color: '#64748b', marginBottom: 16, padding: '10px 12px', background: '#eff6ff', borderRadius: 8 } },
          '\u2139\uFE0F Regulile de mai jos afiseaza avertismente la crearea unei rezervari, dar nu blocheaza salvarea — poti oricand confirma explicit ca vrei sa continui ("Salveaza (risc)").'
        ),

        h(Field, { lbl: 'Pauza minima intre rezervari (zile)' },
          h('input', { className: 'finp', type: 'number', min: 0, value: form.minGapDays, onFocus: function(e) { e.target.select(); }, onChange: function(e) { set('minGapDays', e.target.value); } })
        ),
        h('div', { style: { fontSize: 12, color: '#94a3b8', margin: '-10px 0 16px' } }, '0 = dezactivat. Ex: 1 = camera trebuie sa ramana libera minim o zi intre doua rezervari (pentru curatenie).'),

        h(Field, { lbl: 'Sejur minim (nopti)' },
          h('input', { className: 'finp', type: 'number', min: 0, value: form.minNights, onFocus: function(e) { e.target.select(); }, onChange: function(e) { set('minNights', e.target.value); } })
        ),
        h('div', { style: { fontSize: 12, color: '#94a3b8', margin: '-10px 0 16px' } }, '0 = dezactivat. Ex: 2 = nu accepti rezervari de o singura noapte.'),

        h(Field, { lbl: 'Preaviz minim (zile)' },
          h('input', { className: 'finp', type: 'number', min: 0, value: form.minAdvanceDays, onFocus: function(e) { e.target.select(); }, onChange: function(e) { set('minAdvanceDays', e.target.value); } })
        ),
        h('div', { style: { fontSize: 12, color: '#94a3b8', margin: '-10px 0 4px' } }, '0 = dezactivat (accepti rezervari chiar in ziua sosirii). Ex: 1 = rezervarea trebuie facuta cu minim 1 zi inainte de check-in.')
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: props.onClose }, 'Anuleaza'),
        h('button', { className: 'msave', disabled: saving, onClick: handleSave }, saving ? 'Se salveaza...' : '\u2713 Salveaza')
      )
    )
  );
}

// ── GESTIUNE ECHIPA (Owner invita/elimina conturi Staff) ─────────────────────
function TeamMgr(props) {
  var limit = PLAN_LIMITS[props.plan] || 1;
  var atLimit = props.accountCount >= limit;
  var members = props.members || {};
  var memberList = Object.keys(members).map(function(uid) { return Object.assign({ uid: uid }, members[uid]); });
  memberList.sort(function(a, b) { return a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0; });

  var es = useState(''); var email = es[0], setEmail = es[1];
  var ps = useState(''); var pass = ps[0], setPass = ps[1];
  var sv = useState(false); var saving = sv[0], setSaving = sv[1];
  var er = useState(''); var error = er[0], setError = er[1];
  var delUid = useState(null); var toDelete = delUid[0], setToDelete = delUid[1];

  function handleInvite() {
    setError('');
    if (!email.trim() || !email.includes('@')) { setError('Introdu un email valid.'); return; }
    if (!pass || pass.length < 6) { setError('Parola temporara trebuie sa aiba minim 6 caractere.'); return; }
    setSaving(true);
    props.onInvite(email.trim(), pass)
      .then(function() { setSaving(false); setEmail(''); setPass(''); })
      .catch(function(err) { setSaving(false); setError(err.message); });
  }

  function handleRemove(uid) {
    props.onRemove(uid).then(function() { setToDelete(null); }).catch(function(err) { alert('Eroare: ' + err.message); });
  }

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDC65 Echipa'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: atLimit ? '#fef2f2' : '#eff6ff', borderRadius: 9 } },
          h('span', null, 'Plan ' + (PLAN_LABELS[props.plan] || props.plan) + ': ' + props.accountCount + '/' + limit + ' conturi folosite'),
          atLimit && h('span', { style: { color: '#dc2626' } }, '\u26A0\uFE0F Limita atinsa')
        ),

        // Lista membri existenti
        memberList.map(function(m) {
          return h('div', { key: m.uid, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px', background: '#f8fafc', borderRadius: 9, marginBottom: 8, gap: 10 } },
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { fontWeight: 700, fontSize: 14, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.email),
              h('div', { style: { fontSize: 11.5, fontWeight: 700, color: m.role === 'owner' ? '#7c3aed' : '#64748b', marginTop: 2 } }, m.role === 'owner' ? 'OWNER' : 'STAFF')
            ),
            m.role !== 'owner' && h('button', {
              style: { padding: '7px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 },
              onClick: function() { setToDelete(m.uid); }
            }, 'Elimina')
          );
        }),

        h('div', { className: 'ddiv', style: { margin: '16px 0' } }),

        // Formular invitare
        h('div', { style: { fontSize: 13, fontWeight: 800, color: '#1a202c', marginBottom: 10 } }, 'Invita cont nou (Staff)'),
        atLimit
          ? h('div', { style: { fontSize: 13, color: '#dc2626', padding: '12px', background: '#fef2f2', borderRadius: 9 } }, 'Ai atins limita planului ' + (PLAN_LABELS[props.plan] || props.plan) + '. Elimina un cont existent sau treci la un plan superior pentru a invita altii.')
          : h('div', { className: 'fgrid1' },
              error && h('div', { style: { color: '#dc2626', fontSize: 12.5, fontWeight: 600, marginBottom: 4 } }, error),
              h(Field, { lbl: 'Email' }, h('input', { className: 'finp', type: 'email', value: email, placeholder: 'staff@exemplu.ro', onChange: function(e) { setEmail(e.target.value); } })),
              h(Field, { lbl: 'Parola temporara' }, h('input', { className: 'finp', type: 'text', value: pass, placeholder: 'Minim 6 caractere', onChange: function(e) { setPass(e.target.value); } })),
              h('div', { style: { fontSize: 11.5, color: '#94a3b8' } }, 'Comunica parola manual noului membru — o poate schimba din Contul meu dupa prima logare.')
            )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: props.onClose }, 'Inchide'),
        !atLimit && h('button', { className: 'msave', disabled: saving, onClick: handleInvite }, saving ? 'Se invita...' : '+ Invita')
      )
    ),
    toDelete && h(Confirm, {
      msg: 'Elimini acest membru din echipa? Nu va mai avea acces la datele pensiunii.',
      okLbl: 'Elimina',
      ok: function() { handleRemove(toDelete); },
      onCancel: function() { setToDelete(null); }
    })
  );
}

// ── GHID DE PORNIRE (checklist operationalizare initiala) ───────────────────
function OnboardingGuide(props) {
  var steps = [
    { done: !!props.pensionName && props.pensionName !== 'Pensiunea Mea', title: 'Numeste-ti pensiunea', desc: 'Din meniu → Cont si facturare → seteaza numele real si o poza (optional).' },
    { done: (props.rooms || []).length > 0, title: 'Adauga camerele', desc: 'Din meniu → Configurare pensiune → Camere → adauga toate camerele disponibile.' },
    { done: (props.sources || []).length > 0, title: 'Adauga sursele de rezervare', desc: 'Din meniu → Configurare pensiune → Surse → adauga Booking, Airbnb, telefon direct etc.' },
    { done: (props.reservations || []).length > 0, title: 'Fa prima rezervare', desc: 'Din pagina principala → "+ Rezervare noua" → completeaza datele oaspetelui.' },
    { done: !!(props.billingInfo && (props.billingInfo.fullName || props.billingInfo.companyName)), title: 'Completeaza datele de facturare', desc: 'Din meniu → Cont si facturare → Date facturare (necesar pentru abonament dupa perioada gratuita).' }
  ];
  var doneCount = steps.filter(function(s) { return s.done; }).length;

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDCD6 Ghid de pornire'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, padding: '10px 12px', background: '#eff6ff', borderRadius: 9, textAlign: 'center' } },
          doneCount + ' din ' + steps.length + ' pasi completati'
        ),
        steps.map(function(s, i) {
          return h('div', { key: i, style: { display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < steps.length - 1 ? '1px solid #f1f5f9' : 'none' } },
            h('div', { style: { fontSize: 22, flexShrink: 0 } }, s.done ? '\u2705' : '\u2B1C'),
            h('div', null,
              h('div', { style: { fontWeight: 700, fontSize: 14.5, color: s.done ? '#94a3b8' : '#1a202c', textDecoration: s.done ? 'line-through' : 'none' } }, s.title),
              h('div', { style: { fontSize: 12.5, color: '#64748b', marginTop: 3 } }, s.desc)
            )
          );
        })
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: props.onClose }, 'Inchide')
      )
    )
  );
}

// ── CHAT SUPORT INTERN (Client <-> Network Admin) ────────────────────────────
// Componenta e reutilizata atat de client (Owner/Staff, scop implicit pe propria pensiune)
// cat si de Network Admin (poate deschide chat-ul oricarei pensiuni din inbox-ul de suport).
function SupportChat(props) {
  var pensionId = props.pensionId;
  var viewerRole = props.viewerRole; // 'owner' | 'staff' | 'network_admin'
  var isAdminView = viewerRole === 'network_admin';

  var ms = useState([]); var messages = ms[0], setMessages = ms[1];
  var txt = useState(''); var text = txt[0], setText = txt[1];
  var sv = useState(false); var sending = sv[0], setSending = sv[1];
  var bottomRef = useState(null); var bottomEl = bottomRef[0], setBottomEl = bottomRef[1];

  useEffect(function() {
    if (!pensionId || !firebaseDB) return;
    var ref = firebaseDB.ref('pensions/' + pensionId + '/supportChat/messages');
    var cb = function(snap) {
      var data = snap.val() || {};
      var arr = Object.keys(data).map(function(id) { return Object.assign({ id: id }, data[id]); });
      arr.sort(function(a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
      setMessages(arr);
    };
    ref.on('value', cb);
    // Marcheaza local ultimul mesaj vazut, pentru indicatorul de "mesaj nou" din meniu
    if (!isAdminView) {
      setTimeout(function() {
        var last = null;
        ref.once('value').then(function(snap) {
          var data = snap.val() || {};
          var arr = Object.values(data);
          if (arr.length) { arr.sort(function(a,b){return (a.timestamp||0)-(b.timestamp||0);}); last = arr[arr.length-1]; }
          lc.set('p_lastSeenSupport_' + pensionId, last ? last.timestamp : Date.now());
        });
      }, 800);
    }
    return function() { ref.off('value', cb); };
  }, [pensionId]);

  useEffect(function() {
    if (bottomEl) bottomEl.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend() {
    if (!text.trim() || !pensionId) return;
    setSending(true);
    var msg = {
      text: text.trim(),
      senderRole: viewerRole,
      senderEmail: props.viewerEmail || '',
      timestamp: Date.now()
    };
    firebaseDB.ref('pensions/' + pensionId + '/supportChat/messages').push(msg)
      .then(function() { setText(''); setSending(false); })
      .catch(function(err) { alert('Eroare la trimitere: ' + err.message); setSending(false); });
  }

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', style: { display: 'flex', flexDirection: 'column', height: '80vh', maxHeight: 600 }, onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDCAC ' + (isAdminView ? ('Chat: ' + (props.pensionName || pensionId)) : 'Chat suport')),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { style: { flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 } },
        messages.length === 0 && h('div', { style: { textAlign: 'center', color: '#94a3b8', fontSize: 13.5, marginTop: 30 } },
          isAdminView ? 'Nicio conversatie inca.' : 'Scrie-ne orice intrebare sau problema — iti raspundem cat mai curand.'
        ),
        messages.map(function(m) {
          var isMine = isAdminView ? (m.senderRole === 'network_admin') : (m.senderRole !== 'network_admin');
          var label = m.senderRole === 'network_admin' ? 'Suport Rezervio' : (m.senderRole === 'owner' ? 'Tu (Owner)' : 'Tu (Staff)');
          if (isAdminView && m.senderRole !== 'network_admin') label = m.senderEmail || 'Client';
          return h('div', { key: m.id, style: { alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '78%' } },
            h('div', { style: { fontSize: 11, color: '#94a3b8', marginBottom: 3, textAlign: isMine ? 'right' : 'left' } }, label),
            h('div', {
              style: {
                padding: '10px 13px', borderRadius: 14,
                background: isMine ? '#2563eb' : '#f1f5f9',
                color: isMine ? '#fff' : '#1a202c',
                fontSize: 14, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }
            }, m.text),
            h('div', { style: { fontSize: 10, color: '#cbd5e1', marginTop: 3, textAlign: isMine ? 'right' : 'left' } },
              new Date(m.timestamp).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            )
          );
        }),
        h('div', { ref: function(el) { if (el && !bottomEl) setBottomEl(el); } })
      ),
      h('div', { style: { padding: '12px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 } },
        h('input', {
          className: 'finp', style: { flex: 1 }, placeholder: 'Scrie un mesaj...', value: text,
          onChange: function(e) { setText(e.target.value); },
          onKeyDown: function(e) { if (e.key === 'Enter') handleSend(); }
        }),
        h('button', {
          style: { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer' },
          disabled: sending || !text.trim(), onClick: handleSend
        }, '\u27A4')
      )
    )
  );
}

// ── RESERVATION MODAL ────────────────────────────────────────────────────────
function ResMdl(props) {
  var modal = props.modal, onSave = props.onSave, onClose = props.onClose;
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;

  var initForm = Object.assign({}, EMPTY_RES, { source: sources[0] || '' }, modal.data);
  var fs = useState(initForm);
  var form = fs[0], setForm = fs[1];
  var nss = useState(String(initForm.nights || 1)); var nightsStr = nss[0], setNightsStr = nss[1];

  var isEdit = modal.mode === 'edit';
  var checkOut = addDays(form.checkIn, form.nights || 0);
  var total = (form.pricePerNight || 0) * (form.nights || 0);
  var diff = total - (form.advance || 0);

  function set(k, v) { setForm(Object.assign({}, form, { [k]: v })); }

  var bookingRules = props.bookingRules || { minGapDays: 0, minNights: 0, minAdvanceDays: 0 };

  // Toate avertismentele "soft" — nu blocheaza salvarea, doar cer confirmare explicita
  // ("Salveaza (risc)"), consistent cu comportamentul de overbooking deja existent.
  var warnings = useMemo(function() {
    var list = [];
    if (!form.room || !form.checkIn || !form.nights) return list;

    // 1. Overlap direct pe aceeasi camera
    var cl = reservations.find(function(r) { return r.room === form.room && r.id !== form.id && r.status !== 'cancelled' && overlaps(form.checkIn, form.nights, r.checkIn, r.nights); });
    if (cl) list.push('Camera deja rezervata de ' + fullName(cl) + '!');

    // 2. Sejur minim
    if (bookingRules.minNights > 0 && form.nights < bookingRules.minNights) {
      list.push('Sejur sub minimul stabilit (' + bookingRules.minNights + ' nopti).');
    }

    // 3. Preaviz minim
    if (bookingRules.minAdvanceDays > 0 && form.checkIn) {
      var minAllowedDate = addDays(todayStr(), bookingRules.minAdvanceDays);
      if (form.checkIn < minAllowedDate) {
        list.push('Rezervare facuta cu mai putin preaviz decat minimul (' + bookingRules.minAdvanceDays + ' zile).');
      }
    }

    // 4. Pauza minima intre rezervari pe aceeasi camera (nu conflict direct, ci prea aproape)
    if (bookingRules.minGapDays > 0) {
      var thisCheckOut = addDays(form.checkIn, form.nights);
      var gapViolation = reservations.find(function(r) {
        if (r.room !== form.room || r.id === form.id || r.status === 'cancelled') return false;
        var rCheckOut = addDays(r.checkIn, r.nights || 0);
        // Alta rezervare se termina chiar inainte de a noastra, dar prea aproape
        var gapBefore = r.checkIn < form.checkIn && rCheckOut <= form.checkIn && addDays(rCheckOut, bookingRules.minGapDays) > form.checkIn;
        // Alta rezervare incepe chiar dupa a noastra, dar prea aproape
        var gapAfter = r.checkIn >= thisCheckOut && addDays(thisCheckOut, bookingRules.minGapDays) > r.checkIn;
        return gapBefore || gapAfter;
      });
      if (gapViolation) {
        list.push('Pauza sub minimul stabilit fata de o alta rezervare pe aceeasi camera (' + bookingRules.minGapDays + ' zile necesare).');
      }
    }

    return list;
  }, [form.room, form.checkIn, form.nights, form.id, reservations, bookingRules]);

  var warn = warnings.length > 0;

  function submit() {
    if (!form.room) { alert('Selecteaza camera!'); return; }
    if (!form.firstName && !form.lastName) { alert('Introdu cel putin numele!'); return; }
    if (!form.checkIn) { alert('Selecteaza data check-in!'); return; }
    onSave(isEdit ? form : Object.assign({}, form, { id: null }));
  }

  var titles = { edit: 'Editeaza rezervare', copy: 'Copiaza', move: 'Muta', new: 'Rezervare noua' };
  var btnL = { edit: 'Salveaza', copy: 'Copiaza', move: 'Muta', new: 'Creeaza' };

  return h('div', { className: 'ov', onClick: function(e) { if (e.target === e.currentTarget) onClose(); } },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, titles[modal.mode] || titles.new),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        warnings.length > 0 && h('div', { className: 'obwarn' },
          warnings.map(function(w, i) { return h('div', { key: i, style: { marginBottom: i < warnings.length - 1 ? 4 : 0 } }, '\u26A0\uFE0F ' + w); })
        ),
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Camera', req: true },
            h('select', { className: 'finp', value: form.room, onChange: function(e) { set('room', e.target.value); } },
              h('option', { value: '' }, '-- Selecteaza --'),
              props.wholeEnabled !== false && h('option', { value: WHOLE, style: { fontWeight: 700, color: '#92400e' } }, '\uD83C\uDFE0 Toata locatia (toate camerele)'),
              rooms.map(function(r) { return h('option', { key: r }, r); })
            )
          ),
          h(Field, { lbl: 'Sursa' },
            h('select', { className: 'finp', value: form.source, onChange: function(e) { set('source', e.target.value); } },
              sources.map(function(s) { return h('option', { key: s }, s); })
            )
          ),
          h(Field, { lbl: 'Prenume' }, h('input', { className: 'finp', value: form.firstName || '', placeholder: 'Prenume', onChange: function(e) { set('firstName', e.target.value); } })),
          h(Field, { lbl: 'Nume' }, h('input', { className: 'finp', value: form.lastName || '', placeholder: 'Nume', onChange: function(e) { set('lastName', e.target.value); } })),
          h(Field, { lbl: 'Telefon' }, h('input', { className: 'finp', type: 'tel', value: form.phone || '', placeholder: '07xx xxx xxx', onChange: function(e) { set('phone', e.target.value); } })),
          h(Field, { lbl: 'Status' },
            h('select', { className: 'finp', value: form.status || 'occupied', onChange: function(e) { set('status', e.target.value); } },
              h('option', { value: 'occupied' }, 'Ocupata'),
              h('option', { value: 'blocked' }, 'Blocata')
            )
          ),
          h(Field, { lbl: 'Check-in', req: true }, h('input', { className: 'finp', type: 'date', value: form.checkIn || '', onChange: function(e) { set('checkIn', e.target.value); } })),
          h(Field, { lbl: 'Nopti' }, h('input', {
            className: 'finp', type: 'number', min: 1, value: nightsStr,
            onFocus: function(e) { e.target.select(); },
            onChange: function(e) {
              var v = e.target.value;
              setNightsStr(v);
              var n = parseInt(v);
              if (n > 0) set('nights', n);
            },
            onBlur: function() {
              if (!parseInt(nightsStr) || parseInt(nightsStr) < 1) setNightsStr(String(form.nights || 1));
            }
          })),
          h(Field, { lbl: 'Check-out' }, h('input', { className: 'finp ro', readOnly: true, value: fmt(checkOut) })),
          h(Field, { lbl: 'Tarif/noapte (lei)' }, h('input', { className: 'finp', type: 'number', min: 0, value: form.pricePerNight, onFocus: function(e) { e.target.select(); }, onChange: function(e) { set('pricePerNight', parseFloat(e.target.value) || 0); } })),
          h(Field, { lbl: 'Total (lei)' }, h('input', { className: 'finp tot', readOnly: true, value: total + ' lei' })),
          h(Field, { lbl: 'Avans primit (lei)' }, h('input', { className: 'finp', type: 'number', min: 0, value: form.advance, onFocus: function(e) { e.target.select(); }, onChange: function(e) { set('advance', parseFloat(e.target.value) || 0); } })),
          h(Field, { lbl: 'Rest de plata' }, h('input', { className: 'finp ' + (diff > 0 ? 'pos' : 'neg'), readOnly: true, value: diff + ' lei' }))
        ),
        h('div', { className: 'fgrid1' },
          h(Field, { lbl: 'Comentarii' }, h('textarea', { className: 'finp', style: { height: 76, resize: 'vertical' }, value: form.comments || '', onChange: function(e) { set('comments', e.target.value); }, placeholder: 'Note, cerinte speciale...' }))
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: onClose }, 'Anuleaza'),
        h('button', { className: 'msave' + (warn ? ' warn' : ''), onClick: submit }, warn ? 'Salveaza (risc)' : (btnL[modal.mode] || btnL.new))
      )
    )
  );
}

// ── PHONE ICONS ──────────────────────────────────────────────────────────────
function IPhone() { return h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'2.2',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.1 6.1l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'})); }
function IWa() { return h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'currentColor'},h('path',{d:'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z'})); }
function ISms() { return h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'2.2',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'})); }

// NOTA: SIM_KEY, getSimPhone, setSimPhone, phoneUrl, waUrl, smsUrl
// sunt definite in config.js si helpers.js — nu le redefinim aici.

// ── RESERVATION DETAIL MODAL ─────────────────────────────────────────────────
// ── ANULARE REZERVARE (soft — pastreaza istoric, nu sterge definitiv) ────────
function CancelMdl(props) {
  var res = props.res;
  var rs = useState('Client a anulat'); var reason = rs[0], setReason = rs[1];
  var ns = useState(''); var notes = ns[0], setNotes = ns[1];
  var sv = useState(false); var saving = sv[0], setSaving = sv[1];
  var user = (firebase.auth().currentUser && firebase.auth().currentUser.email) || 'Necunoscut';

  function doCancel() {
    setSaving(true);
    fb.update('reservations/' + res.id, {
      status: 'cancelled',
      cancelledAt: Date.now(),
      cancelledBy: user,
      cancelReason: reason,
      cancelNotes: notes.trim()
    }).then(function() {
      return fb.remove('blockedDates/' + res.id).catch(function() {});
    }).then(function() {
      props.onClose();
      if (props.onCancelled) props.onCancelled();
    }).catch(function(e) {
      setSaving(false);
      alert('Eroare: ' + e.message);
    });
  }

  return h('div', { className: 'ov', style: { zIndex: 220 }, onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); }, style: { maxWidth: 420 } },
      h('div', { className: 'mhdr', style: { background: '#dc2626' } },
        h('span', { className: 'mtit' }, '\uD83D\uDEAB Anuleaza rezervarea'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        h('div', { style: { background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 14, color: '#7f1d1d' } },
          h('div', { style: { fontWeight: 700, marginBottom: 4 } }, '\u26A0\uFE0F Atentie — aceasta actiune nu sterge rezervarea'),
          'Rezervarea va fi marcata ca anulata si pastrata in istoric pentru analiza.'
        ),
        h('div', { style: { background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 16 } },
          h('div', { style: { fontSize: 15, fontWeight: 700 } }, fullName(res)),
          h('div', { style: { fontSize: 13, color: '#64748b', marginTop: 4 } },
            res.room + ' \u00B7 ' + fmt(res.checkIn) + ' \u2192 ' + fmt(addDays(res.checkIn, res.nights || 0))
          )
        ),
        h(Field, { lbl: 'Motiv anulare' },
          h('select', { className: 'finp', value: reason, onChange: function(e) { setReason(e.target.value); } },
            CANCEL_REASONS.map(function(r) { return h('option', { key: r, value: r }, r); })
          )
        ),
        h(Field, { lbl: 'Note suplimentare (optional)' },
          h('textarea', {
            className: 'finp', rows: 3, style: { resize: 'vertical' },
            placeholder: 'Ex: Client a sunat si a solicitat anularea...',
            value: notes, onChange: function(e) { setNotes(e.target.value); }
          })
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', style: { flex: 1 }, onClick: props.onClose }, 'Renunta'),
        h('button', {
          style: { flex: 2, padding: '13px', background: saving ? '#94a3b8' : '#dc2626', color: '#fff', borderRadius: 11, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer' },
          disabled: saving, onClick: doCancel
        }, saving ? '\u23F3 Se salveaza...' : '\uD83D\uDEAB Confirma anularea')
      )
    )
  );
}

// ── JURNAL COMUNICARE (istoric interactiuni cu oaspetele, per rezervare) ─────
function CommLog(props) {
  var resId = props.resId;
  var ns = useState([]); var notes = ns[0], setNotes = ns[1];
  var ts = useState(''); var text = ts[0], setText = ts[1];
  var cs = useState('whatsapp'); var channel = cs[0], setChannel = cs[1];
  var sv = useState(false); var saving = sv[0], setSaving = sv[1];
  var us = useState(function() { return localStorage.getItem('comm_user') || ''; });
  var user = us[0], setUser = us[1];
  var es = useState(!user); var editUser = es[0], setEditUser = es[1];
  var uv = useState(user); var userVal = uv[0], setUserVal = uv[1];

  useEffect(function() {
    if (!resId) return;
    var unsub = fb.on('reservations/' + resId + '/commLog', function(data) {
      var arr = data ? Object.keys(data).map(function(k) { return Object.assign({}, data[k], { id: k }); }) : [];
      arr.sort(function(a, b) { return (a.ts || 0) - (b.ts || 0); });
      setNotes(arr);
    });
    return unsub;
  }, [resId]);

  function saveUser(v) {
    setUser(v); setUserVal(v);
    localStorage.setItem('comm_user', v);
    setEditUser(false);
  }

  function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    var note = { text: text.trim(), channel: channel, user: user || 'Necunoscut', ts: Date.now() };
    fb.push('reservations/' + resId + '/commLog', note).then(function() {
      setText(''); setSaving(false);
    }).catch(function(e) {
      console.error('CommLog push error:', e);
      setSaving(false);
      alert('Eroare: ' + e.message);
    });
  }

  function deleteNote(noteId) {
    fb.remove('reservations/' + resId + '/commLog/' + noteId);
  }

  var channelMeta = {};
  COMM_CHANNELS.forEach(function(c) { channelMeta[c.id] = c; });

  function fmtTs(ts) {
    var d = new Date(ts);
    var now = new Date();
    var diff = now - d;
    if (diff < 60000) return 'acum';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' h';
    return fmt(d.toISOString().slice(0, 10)) + ' ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  }

  return h('div', { className: 'ov', style: { zIndex: 220 }, onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDCAC Jurnal comunicare'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        editUser
          ? h('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
              h('input', { className: 'finp', placeholder: 'Numele tau (pentru jurnal)', value: userVal, onChange: function(e) { setUserVal(e.target.value); } }),
              h('button', { style: { padding: '0 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }, onClick: function() { saveUser(userVal); } }, 'OK')
            )
          : h('div', { style: { fontSize: 13, color: '#64748b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 } },
              '\uD83D\uDC64 Notezi ca: ', h('strong', null, user), h('a', { style: { color: '#2563eb', cursor: 'pointer', fontSize: 12 }, onClick: function() { setEditUser(true); } }, '(schimba)')
            ),

        notes.length === 0 && h('div', { style: { textAlign: 'center', color: '#94a3b8', padding: '20px 0', fontSize: 14 } }, 'Nicio interactiune notata inca.'),

        notes.map(function(n) {
          var meta = channelMeta[n.channel] || channelMeta.other;
          return h('div', { key: n.id, style: { display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9' } },
            h('span', { style: { fontSize: 18, flexShrink: 0 } }, meta.icon),
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { fontSize: 14, color: '#1a202c' } }, n.text),
              h('div', { style: { fontSize: 11.5, color: '#94a3b8', marginTop: 2 } }, n.user + ' \u00B7 ' + meta.label + ' \u00B7 ' + fmtTs(n.ts))
            ),
            h('button', { style: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 16, flexShrink: 0 }, onClick: function() { deleteNote(n.id); } }, '\u2715')
          );
        })
      ),
      h('div', { style: { padding: '12px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 } },
        h('select', { className: 'finp', style: { width: 'auto', flexShrink: 0 }, value: channel, onChange: function(e) { setChannel(e.target.value); } },
          COMM_CHANNELS.map(function(c) { return h('option', { key: c.id, value: c.id }, c.icon + ' ' + c.label); })
        ),
        h('input', {
          className: 'finp', style: { flex: 1 }, placeholder: 'Ex: am sunat, oaspetele confirma sosirea la 18:00',
          value: text, onChange: function(e) { setText(e.target.value); },
          onKeyDown: function(e) { if (e.key === 'Enter') addNote(); }
        }),
        h('button', {
          style: { padding: '0 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer' },
          disabled: saving || !text.trim(), onClick: addNote
        }, '\u27A4')
      )
    )
  );
}

function ResDetail(props) {
  var res = props.res, sources = props.sources;
  var checkOut = addDays(res.checkIn, res.nights);
  var total = (res.pricePerNight || 0) * (res.nights || 0);
  var diff = total - (res.advance || 0);
  var c = getCol(sources, res.source);
  var name = fullName(res);
  var ss = useState(getSimPhone());
  var simPhone = ss[0], setSimPhoneLocal = ss[1];
  var es = useState(false);
  var editingSim = es[0], setEditingSim = es[1];
  var gd = useState(false);
  var showGuestForm = gd[0], setShowGuestForm = gd[1];
  var cm = useState(false);
  var showCancel = cm[0], setShowCancel = cm[1];
  var cl = useState(false);
  var showCommLog = cl[0], setShowCommLog = cl[1];

  function saveSim(v) { setSimPhone(v); setSimPhoneLocal(v); setEditingSim(false); }

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e){e.stopPropagation();} },
      h('div', { className: 'mhdr' },
        h('div', { style:{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0} },
          h('span', { className: 'crow-src', style:{background:c.light,color:c.text,flexShrink:0} }, res.source||'N/A'),
          h('span', { style:{fontSize:17,fontWeight:800,color:'#1e3a5f',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'} }, name)
        ),
        h('button', { className: 'mclose', onClick: props.onClose }, '✕')
      ),
      h('div', { className: 'mbody' },
        // Phone section
        res.phone && h('div', null,
          h('div', { className: 'dmod-ph-row' },
            h('span', { className: 'dmod-ph-num' }, res.phone),
            h('div', { className: 'dmod-ph-btns' },
              h('a', { href: phoneUrl(res.phone, simPhone), className: 'dmod-ph-btn dmod-call', title: 'Suna' }, h(IPhone), 'Suna'),
              h('a', { href: waUrl(res.phone), target: '_blank', rel: 'noopener', className: 'dmod-ph-btn dmod-wa', title: 'WhatsApp' }, h(IWa), 'WhatsApp'),
              h('a', { href: smsUrl(res.phone), className: 'dmod-ph-btn dmod-sms', title: 'SMS' }, h(ISms), 'SMS')
            )
          ),
          // SIM selector
          !editingSim
            ? h('div', { style:{fontSize:14,color:'#94a3b8',padding:'6px 0 10px',display:'flex',alignItems:'center',gap:8} },
                h('span', null, simPhone ? 'Apelezi de pe: ' + simPhone : 'Seteaza numarul tau (pentru 2 SIM-uri)'),
                h('button', { style:{fontSize:14,color:'#2563eb',background:'none',border:'none',cursor:'pointer',fontWeight:700,padding:0}, onClick:function(){setEditingSim(true);} }, simPhone ? '✏ Schimba' : '+ Seteaza')
              )
            : h('div', { style:{display:'flex',gap:8,padding:'6px 0 10px',alignItems:'center'} },
                h('input', { className:'finp', style:{fontSize:14,padding:'8px 10px',flex:1}, placeholder:'Nr. tau (ex: 07xx...)', defaultValue:simPhone,
                  autoFocus:true,
                  onKeyDown:function(e){ if(e.key==='Enter') saveSim(e.target.value); if(e.key==='Escape') setEditingSim(false); },
                  onChange:function(e){} }),
                h('button', { style:{padding:'8px 12px',background:'#2563eb',color:'#fff',borderRadius:8,fontWeight:700,fontSize:14}, onClick:function(e){ saveSim(e.target.previousSibling.value||e.target.parentNode.querySelector('input').value); } }, 'OK'),
                h('button', { style:{padding:'8px 10px',background:'#f1f5f9',color:'#374151',borderRadius:8,fontWeight:700,fontSize:14}, onClick:function(){setEditingSim(false);} }, '✕')
              )
        ),
        // Info grid
        h('div', { className: 'dmod-grid' },
          h('div', null, h('div',{className:'dmod-fl'},'Check-in'), h('div',{className:'dmod-fv'},fmt(res.checkIn))),
          h('div', null, h('div',{className:'dmod-fl'},'Check-out'), h('div',{className:'dmod-fv'},fmt(checkOut))),
          h('div', null, h('div',{className:'dmod-fl'},'Nopti'), h('div',{className:'dmod-fv'},res.nights)),
          h('div', null, h('div',{className:'dmod-fl'},'Tarif/noapte'), h('div',{className:'dmod-fv'},(res.pricePerNight||0)+' lei')),
          h('div', null, h('div',{className:'dmod-fl'},'Total'), h('div',{className:'dmod-fv'},h('strong',null,total+' lei'))),
          h('div', null, h('div',{className:'dmod-fl'},'Avans'), h('div',{className:'dmod-fv'},(res.advance||0)+' lei')),
          h('div', {style:{gridColumn:'1/-1'}},
            h('div',{className:'dmod-fl'},'Rest de plata'),
            h('div',{className:'dmod-fv '+(diff>0?'dmod-pos':'dmod-neg')},diff+' lei')
          )
        ),
        res.comments && h('div',{className:'dmod-comm'},'\uD83D\uDCAC '+res.comments),
        res.status === 'cancelled' && h('div', { style: { background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#7f1d1d' } },
          h('div', { style: { fontWeight: 800, marginBottom: 2 } }, '\uD83D\uDEAB Rezervare anulata'),
          h('div', null, (res.cancelReason || '-') + (res.cancelledBy ? ' \u00B7 de ' + res.cancelledBy : '')),
          res.cancelNotes && h('div', { style: { marginTop: 4, fontStyle: 'italic' } }, res.cancelNotes)
        ),
        // Fisa client button (separat, deasupra actiunilor principale)
        h('button', {
          style: { width: '100%', padding: '12px', marginBottom: 12, background: '#f0f4f8', color: '#1e3a5f', border: '1.5px dashed #94a3b8', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
          onClick: function() { setShowGuestForm(true); }
        }, '\uD83D\uDCCB ', res.guestDetails ? 'Fisa client (completata)' : 'Completeaza fisa client'),
        // Jurnal comunicare button
        h('button', {
          style: { width: '100%', padding: '12px', marginBottom: 12, background: '#f0f4f8', color: '#1e3a5f', border: '1.5px dashed #94a3b8', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
          onClick: function() { setShowCommLog(true); }
        }, '\uD83D\uDCAC Jurnal comunicare'),
        // Action buttons
        h('div', { className: 'dmod-acts' },
          h('button',{className:'dmod-act-btn',style:{background:'#eff6ff',color:'#2563eb'},onClick:function(){props.onEdit(res);props.onClose();}},h(IEdit),' Editeaza'),
          h('button',{className:'dmod-act-btn',style:{background:'#f5f3ff',color:'#7c3aed'},onClick:function(){props.onCopy(res);props.onClose();}},h(ICopy),' Copiaza'),
          h('button',{className:'dmod-act-btn',style:{background:'#ecfeff',color:'#0891b2'},onClick:function(){props.onMove(res);props.onClose();}},h(IMove),' Muta'),
          res.status !== 'cancelled' && h('button',{className:'dmod-act-btn',style:{background:'#fff7ed',color:'#c2410c'},onClick:function(){setShowCancel(true);}},'\uD83D\uDEAB',' Anuleaza'),
          h('button',{className:'dmod-act-btn',style:{background:'#fef2f2',color:'#dc2626'},onClick:function(){props.onDelete(res.id,fullName(res));props.onClose();}},h(ITrash),' Sterge')
        )
      )
    ),
    showGuestForm && h(GuestDetailsForm, {
      res: res,
      pensionName: props.pensionName,
      onSave: props.onSaveGuestDetails,
      onClose: function() { setShowGuestForm(false); }
    }),
    showCancel && h(CancelMdl, {
      res: res,
      onClose: function() { setShowCancel(false); },
      onCancelled: function() { setShowCancel(false); props.onClose(); }
    }),
    showCommLog && h(CommLog, {
      resId: res.id,
      onClose: function() { setShowCommLog(false); }
    })
  );
}

// ── FISA CLIENT (date suplimentare + fisa de anuntare a sosirii, conform ────
// HG nr. 237/2001 si Ordinul MAI nr. 400/2004) ──────────────────────────────
function GuestDetailsForm(props) {
  var res = props.res;
  var existing = res.guestDetails || {};

  var fs = useState({
    fullName: existing.fullName || fullName(res),
    birthDate: existing.birthDate || '',
    birthPlace: existing.birthPlace || '',
    citizenship: existing.citizenship || 'Romana',
    domicileLocality: existing.domicileLocality || '',
    domicileStreet: existing.domicileStreet || '',
    domicileNumber: existing.domicileNumber || '',
    domicileCountry: existing.domicileCountry || 'Romania',
    cnp: existing.cnp || '',
    idType: existing.idType || 'CI',
    idSeries: existing.idSeries || '',
    idNumber: existing.idNumber || '',
    travelPurpose: existing.travelPurpose || 'Turism'
  });
  var form = fs[0], setForm = fs[1];
  var sv = useState(false); var saving = sv[0], setSaving = sv[1];
  var svd = useState(false); var saved = svd[0], setSaved = svd[1];

  function set(k, v) { setForm(Object.assign({}, form, { [k]: v })); setSaved(false); }

  var isRomanian = form.citizenship.trim().toLowerCase().indexOf('roman') === 0;
  var cnpValid = !isRomanian || isValidCNP(form.cnp);

  function handleSave() {
    if (isRomanian && form.cnp && !isValidCNP(form.cnp)) {
      alert('CNP invalid. Verifica cifrele introduse.');
      return;
    }
    setSaving(true);
    Promise.resolve(props.onSave(res.id, form)).then(function() {
      setSaving(false);
      setSaved(true);
    }).catch(function(err) {
      setSaving(false);
      alert('Eroare la salvare: ' + err.message);
    });
  }

  function handlePrint() {
    var printWin = window.open('', '_blank', 'width=800,height=900');
    var checkOut = addDays(res.checkIn, res.nights);
    var now = new Date().toLocaleString('ro-RO');
    var pension = props.pensionName || 'Pensiunea';

    var html = '<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"/>' +
      '<title>Fisa de anuntare a sosirii si plecarii</title>' +
      '<style>' +
        'body{font-family:Arial,sans-serif;font-size:13px;color:#1a202c;margin:24px;}' +
        'h1{font-size:16px;text-align:center;margin:0 0 2px;}' +
        'h2{font-size:12px;text-align:center;font-weight:400;color:#64748b;margin:0 0 4px;}' +
        '.sub{font-size:11px;text-align:center;color:#94a3b8;margin-bottom:18px;}' +
        '.pension{text-align:center;font-size:13px;font-weight:700;margin-bottom:20px;}' +
        'table{width:100%;border-collapse:collapse;margin-bottom:14px;}' +
        'td{border:1px solid #94a3b8;padding:8px 10px;vertical-align:top;}' +
        '.lbl{font-size:9px;color:#64748b;text-transform:uppercase;display:block;margin-bottom:3px;}' +
        '.lbl-en{font-size:8px;color:#94a3b8;font-style:italic;display:block;}' +
        '.val{font-size:13px;font-weight:600;min-height:16px;}' +
        '.sig{margin-top:40px;display:flex;justify-content:space-between;}' +
        '.sig div{width:45%;border-top:1px solid #1a202c;padding-top:6px;font-size:11px;text-align:center;color:#64748b;}' +
        '.foot{margin-top:24px;font-size:9px;color:#94a3b8;text-align:center;}' +
        '@media print{body{margin:12px;}}' +
      '</style></head><body>' +
      '<h1>FISA DE ANUNTARE A SOSIRII SI PLECARII</h1>' +
      '<h2>REGISTRATION FORM - TO BE COMPLETED ON ARRIVAL</h2>' +
      '<div class="sub">conform H.G. nr. 237/2001, Ordinul MAI nr. 400/2004</div>' +
      '<div class="pension">' + pension + '</div>' +
      '<table><tr><td colspan="2">' +
        '<span class="lbl">Numele si prenumele</span><span class="lbl-en">Surname and first name</span>' +
        '<div class="val">' + (form.fullName || '-') + '</div>' +
      '</td></tr>' +
      '<tr><td>' +
        '<span class="lbl">Data nasterii</span><span class="lbl-en">Date of birth</span>' +
        '<div class="val">' + (form.birthDate || '-') + '</div>' +
      '</td><td>' +
        '<span class="lbl">Locul nasterii</span><span class="lbl-en">Place of birth</span>' +
        '<div class="val">' + (form.birthPlace || '-') + '</div>' +
      '</td></tr>' +
      '<tr><td>' +
        '<span class="lbl">Cetatenia</span><span class="lbl-en">Nationality</span>' +
        '<div class="val">' + (form.citizenship || '-') + '</div>' +
      '</td><td>' +
        '<span class="lbl">CNP (daca e cazul)</span><span class="lbl-en">Personal ID number</span>' +
        '<div class="val">' + (form.cnp || '-') + '</div>' +
      '</td></tr>' +
      '<tr><td colspan="2">' +
        '<span class="lbl">Domiciliul — Localitatea, strada, nr., tara</span><span class="lbl-en">Residence — City, street, no., country</span>' +
        '<div class="val">' + [form.domicileLocality, form.domicileStreet, form.domicileNumber, form.domicileCountry].filter(Boolean).join(', ') + '</div>' +
      '</td></tr>' +
      '<tr><td>' +
        '<span class="lbl">Data sosirii</span><span class="lbl-en">Date of arrival</span>' +
        '<div class="val">' + fmt(res.checkIn) + '</div>' +
      '</td><td>' +
        '<span class="lbl">Data plecarii</span><span class="lbl-en">Date of departure</span>' +
        '<div class="val">' + fmt(checkOut) + '</div>' +
      '</td></tr>' +
      '<tr><td colspan="2">' +
        '<span class="lbl">Scopul calatoriei in Romania</span><span class="lbl-en">Purpose of travelling to Romania</span>' +
        '<div class="val">' + (form.travelPurpose || '-') + '</div>' +
      '</td></tr>' +
      '<tr><td>' +
        '<span class="lbl">Act de identitate — tip</span><span class="lbl-en">Identity document — type</span>' +
        '<div class="val">' + (form.idType || '-') + '</div>' +
      '</td><td>' +
        '<span class="lbl">Serie si numar</span><span class="lbl-en">Series and number</span>' +
        '<div class="val">' + (form.idSeries || '-') + ' ' + (form.idNumber || '-') + '</div>' +
      '</td></tr>' +
      '</table>' +
      '<div class="sig"><div>Semnatura turistului<br/>Tourist signature</div><div>Semnatura receptionerului<br/>Receptionist signature</div></div>' +
      '<div class="foot">Generat automat din Rezervio la ' + now + ' \u2014 pastrare 5 ani conform legii</div>' +
      '</body></html>';

    printWin.document.write(html);
    printWin.document.close();
    setTimeout(function() { printWin.print(); }, 300);
  }

  return h('div', { className: 'ov', style: { zIndex: 210 }, onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e){e.stopPropagation();} },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDCCB Fisa client'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        h('div', { style: { fontSize: 12, color: '#64748b', marginBottom: 14, padding: '8px 10px', background: '#eff6ff', borderRadius: 8 } },
          '\u2139\uFE0F Date suplimentare pentru fisa de anuntare a sosirii, conform legislatiei (H.G. 237/2001). Se pastreaza 5 ani.'
        ),
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Nume complet', req: true }, h('input', { className: 'finp', value: form.fullName, onChange: function(e) { set('fullName', e.target.value); } })),
          h(Field, { lbl: 'Data nasterii' }, h('input', { className: 'finp', type: 'date', value: form.birthDate, onChange: function(e) { set('birthDate', e.target.value); } })),
          h(Field, { lbl: 'Locul nasterii' }, h('input', { className: 'finp', value: form.birthPlace, onChange: function(e) { set('birthPlace', e.target.value); } })),
          h(Field, { lbl: 'Cetatenia' }, h('input', { className: 'finp', value: form.citizenship, onChange: function(e) { set('citizenship', e.target.value); } })),
          h(Field, { lbl: 'CNP' + (isRomanian ? ' (obligatoriu)' : ' (optional)') },
            h('input', { className: 'finp', value: form.cnp, maxLength: 13, placeholder: isRomanian ? '13 cifre' : 'daca este cazul', onChange: function(e) { set('cnp', e.target.value.replace(/\D/g,'')); } })
          ),
          !cnpValid && h('div', { style: { gridColumn: '1/-1', color: '#dc2626', fontSize: 12, fontWeight: 600, marginTop: -8 } }, '\u26A0\uFE0F CNP invalid'),
          h(Field, { lbl: 'Localitate domiciliu' }, h('input', { className: 'finp', value: form.domicileLocality, onChange: function(e) { set('domicileLocality', e.target.value); } })),
          h(Field, { lbl: 'Strada, nr.' }, h('input', { className: 'finp', value: form.domicileStreet, onChange: function(e) { set('domicileStreet', e.target.value); } })),
          h(Field, { lbl: 'Numar' }, h('input', { className: 'finp', value: form.domicileNumber, onChange: function(e) { set('domicileNumber', e.target.value); } })),
          h(Field, { lbl: 'Tara domiciliu' }, h('input', { className: 'finp', value: form.domicileCountry, onChange: function(e) { set('domicileCountry', e.target.value); } })),
          h(Field, { lbl: 'Tip act identitate' },
            h('select', { className: 'finp', value: form.idType, onChange: function(e) { set('idType', e.target.value); } },
              h('option', { value: 'CI' }, 'Carte de identitate'),
              h('option', { value: 'Pasaport' }, 'Pasaport')
            )
          ),
          h(Field, { lbl: 'Serie act' }, h('input', { className: 'finp', value: form.idSeries, onChange: function(e) { set('idSeries', e.target.value.toUpperCase()); } })),
          h(Field, { lbl: 'Numar act' }, h('input', { className: 'finp', value: form.idNumber, onChange: function(e) { set('idNumber', e.target.value); } })),
          h(Field, { lbl: 'Scopul calatoriei' }, h('input', { className: 'finp', value: form.travelPurpose, onChange: function(e) { set('travelPurpose', e.target.value); } }))
        )
      ),
      h('div', { className: 'mfoot', style: { flexWrap: 'wrap', gap: 8 } },
        h('button', { className: 'mcanc', onClick: props.onClose }, 'Inchide'),
        h('button', { className: 'msave', style: { background: '#7c3aed' }, onClick: handlePrint }, '\uD83D\uDDA8\uFE0F Genereaza PDF'),
        h('button', { className: 'msave', disabled: saving, onClick: handleSave }, saving ? 'Se salveaza...' : (saved ? '\u2713 Salvat' : 'Salveaza'))
      )
    )
  );
}

// ── COMPACT RESERVATION ROW — 3 linii ────────────────────────────────────────
function ResRow(props) {
  var res = props.res, sources = props.sources;
  var c = getCol(sources, res.source);
  var name = fullName(res);
  var checkOut = addDays(res.checkIn, res.nights);
  var isToday = res.checkIn === todayStr();
  var isTomorrow = res.checkIn === addDays(todayStr(), 1);
  var cardBg = isToday ? '#fffbeb' : isTomorrow ? '#f0f7ff' : '#fff';

  // Meniu hamburger pentru comunicare
  var ms = useState(false); var menuOpen = ms[0], setMenuOpen = ms[1];

  function closeMenu(e) { if (e) e.stopPropagation(); setMenuOpen(false); }

  return h('div', { className: 'card', style: { borderLeft: '5px solid ' + c.dot, background: cardBg, position: 'relative' } },

    // ── Linia 1: Sursa | Nume | Hamburger ────────────────────────────────────
    h('div', { className: 'cl1' },
      h('span', { className: 'cl1-src', style: { background: c.light, color: c.text } }, res.source || 'N/A'),
      h('span', { className: 'cl1-name' }, name),
      // Buton hamburger ⋮ deschide meniu comunicare
      h('button', {
        className: 'row-menu-btn',
        onClick: function(e) { e.stopPropagation(); setMenuOpen(!menuOpen); },
        title: 'Comunicare'
      }, '⋮')
    ),

    // ── Meniu comunicare (dropdown) ──────────────────────────────────────────
    menuOpen && h('div', {
      className: 'row-menu',
      onClick: function(e) { e.stopPropagation(); }
    },
      // Overlay invizibil ca sa inchida meniul la click in afara
      h('div', { style: { position: 'fixed', inset: 0, zIndex: 89 }, onClick: closeMenu }),

      h('div', { className: 'row-menu-inner' },
        h('div', { className: 'row-menu-hdr' },
          h('span', { style: { fontWeight: 700, fontSize: 13, color: '#1e3a5f' } }, name),
          res.phone && h('span', { style: { fontSize: 12, color: '#64748b' } }, res.phone)
        ),

        res.phone
          ? h('div', { className: 'row-menu-comm' },
              h('a', {
                href: phoneUrl(res.phone, ''),
                className: 'row-comm-btn call',
                onClick: closeMenu
              }, h(IPhone), 'Suna'),
              h('a', {
                href: waUrl(res.phone),
                target: '_blank', rel: 'noopener',
                className: 'row-comm-btn wa',
                onClick: closeMenu
              }, h(IWa), 'WhatsApp'),
              h('a', {
                href: smsUrl(res.phone),
                className: 'row-comm-btn sms',
                onClick: closeMenu
              }, h(ISms), 'SMS'),
              props.onSendMsg && h('button', {
                className: 'row-comm-btn tpl',
                onClick: function(e) { closeMenu(e); props.onSendMsg(res); }
              }, '\uD83D\uDCDD', 'Template')
            )
          : h('div', { style: { padding: '10px 12px', fontSize: 13, color: '#94a3b8', textAlign: 'center' } }, 'Fara numar de telefon'),

        h('div', { className: 'row-menu-divider' }),

        h('div', { className: 'row-menu-actions' },
          h('button', { className: 'row-act-btn edit', onClick: function(e) { closeMenu(e); props.onEdit(res); } }, h(IEdit), ' Editeaza'),
          h('button', { className: 'row-act-btn copy', onClick: function(e) { closeMenu(e); props.onCopy(res); } }, h(ICopy), ' Copiaza'),
          h('button', { className: 'row-act-btn move', onClick: function(e) { closeMenu(e); props.onMove(res); } }, h(IMove), ' Muta'),
          h('button', { className: 'row-act-btn del', onClick: function(e) { closeMenu(e); props.onDelete(res.id, name); } }, h(ITrash), ' Sterge')
        )
      )
    ),

    // ── Linia 3: Camera | Perioada | Detalii ─────────────────────────────────
    h('div', { className: 'cl3', onClick: props.onDetail },
      h('span', { className: 'cl3-room' }, res.room || '-'),
      h('span', { className: 'cl3-dates' },
        fmt(res.checkIn) + ' \u2192 ' + fmt(checkOut) + ' \u00B7 ' + res.nights + ' n.'
      ),
      isToday && h('span', { className: 'cl3-badge cl3-today' }, 'AZI'),
      isTomorrow && h('span', { className: 'cl3-badge cl3-tom' }, 'M\u00C2INE'),
      h('span', { className: 'cl3-hint' }, '\u2139 detalii')
    ),

    // ── Linia 4: Bifa check-in / check-out (doar in sectiunile relevante) ────
    props.checkType === 'checkin' && h('div', {
      className: 'cl4-check' + (res.checkedIn ? ' done' : ''),
      onClick: function(e) { e.stopPropagation(); if (props.onToggleCheckedIn) props.onToggleCheckedIn(res); }
    },
      h('span', { className: 'cl4-box' }, res.checkedIn ? '\u2611' : '\u2610'),
      h('span', null, res.checkedIn ? 'Turist sosit \u2014 apasa pentru a anula' : 'Marcheaza turist sosit')
    ),
    props.checkType === 'checkout' && h('div', {
      className: 'cl4-check' + (res.roomCleaned ? ' done' : ''),
      onClick: function(e) { e.stopPropagation(); if (props.onToggleRoomCleaned) props.onToggleRoomCleaned(res); }
    },
      h('span', { className: 'cl4-box' }, res.roomCleaned ? '\u2611' : '\u2610'),
      h('span', null, res.roomCleaned ? 'Camera curatata \u2014 apasa pentru a anula' : 'Marcheaza camera curatata')
    )
  );
}
// ── RESERVATIONS TAB ─────────────────────────────────────────────────────────
function ResTab(props) {
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;
  var conflicts = props.conflicts;
  var ds = useState(null); var detailRes = ds[0], setDetailRes = ds[1];
  // 'general' = toate camerele amestecate; 'room' = grupat pe camera (camera ca sub-sectiune)
  var vms = useState('general'); var viewMode = vms[0], setViewMode = vms[1];
  var filter = props.activeFilter || 'future';

  var today = todayStr();

  var categorized = useMemo(function() {
    return categorizeReservations(reservations, today);
  }, [reservations, today]);

  var libere = useMemo(function() {
    return getFreeRooms(rooms, reservations, today);
  }, [rooms, reservations, today]);

  function rowProps(res, checkType) {
    return {
      key: res.id, res: res, sources: sources,
      onDetail: function() { setDetailRes(res); },
      onEdit: props.onEdit,
      onCopy: props.onCopy,
      onMove: props.onMove,
      onDelete: props.onDelete,
      onSendMsg: props.onSendMsg,
      checkType: checkType,
      onToggleCheckedIn: props.onToggleCheckedIn,
      onToggleRoomCleaned: props.onToggleRoomCleaned
    };
  }

  // Randeaza lista curenta (filtrata deja pe categoria activa), optional impartita
  // pe camere daca viewMode === 'room'. checkType determina ce bifa apare pe carduri.
  function renderList(list, checkType) {
    if (viewMode === 'room') {
      var byRoom = {};
      list.forEach(function(r) {
        var rm = r.room || '(fara camera)';
        if (!byRoom[rm]) byRoom[rm] = [];
        byRoom[rm].push(r);
      });
      var roomOrder = rooms.concat(Object.keys(byRoom).filter(function(r) { return rooms.indexOf(r) === -1; }));
      return roomOrder.filter(function(rm) { return byRoom[rm] && byRoom[rm].length; }).map(function(rm) {
        return h('div', { key: rm, style: { marginBottom: 10 } },
          h('div', { style: { fontSize: 12.5, fontWeight: 700, color: '#64748b', padding: '4px 4px', display: 'flex', alignItems: 'center', gap: 6 } },
            '\uD83D\uDEAA ' + rm, h('span', { style: { opacity: .6, fontWeight: 600 } }, '(' + byRoom[rm].length + ')')
          ),
          byRoom[rm].map(function(res) { return h(ResRow, rowProps(res, checkType)); })
        );
      });
    }
    return list.map(function(res) { return h(ResRow, rowProps(res, checkType)); });
  }

  // Configuratia fiecarui filtru: titlu, lista, checkType, mesaj gol
  var filterConfig = {
    checkin: { title: 'Sosiri azi', icon: '\uD83D\uDFE2', list: categorized.checkinToday, checkType: 'checkin', emptyMsg: 'Nicio sosire azi', emptyIcon: '\uD83D\uDFE2' },
    checkout: { title: 'Plecari azi', icon: '\uD83D\uDD34', list: categorized.checkoutToday, checkType: 'checkout', emptyMsg: 'Nicio plecare azi', emptyIcon: '\uD83D\uDD34' },
    staying: { title: 'Cazati in curs', icon: '\uD83C\uDFE8', list: categorized.staying, checkType: null, emptyMsg: 'Nicio camera ocupata acum', emptyIcon: '\uD83C\uDFE8' },
    future: { title: 'Rezervari viitoare', icon: '\uD83D\uDCC5', list: categorized.future, checkType: null, emptyMsg: 'Nicio rezervare viitoare', emptyIcon: '\uD83D\uDCC5' }
  };

  var current = filterConfig[filter];

  return h('div', { className: 'page' },
    // Buton adauga nou + toggle General/Pe camere
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' } },
      h('div', { style: { display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 } },
        h('button', {
          style: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: viewMode === 'general' ? '#fff' : 'none', color: viewMode === 'general' ? '#2563eb' : '#64748b', boxShadow: viewMode === 'general' ? '0 1px 4px rgba(0,0,0,.1)' : 'none' },
          onClick: function() { setViewMode('general'); }
        }, '\uD83D\uDCCB General'),
        h('button', {
          style: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: viewMode === 'room' ? '#fff' : 'none', color: viewMode === 'room' ? '#2563eb' : '#64748b', boxShadow: viewMode === 'room' ? '0 1px 4px rgba(0,0,0,.1)' : 'none' },
          onClick: function() { setViewMode('room'); }
        }, '\uD83D\uDEAA Pe camere')
      ),
      h('button', {
        style: { padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
        onClick: function() { props.onNew(''); }
      }, '+ Rezervare noua')
    ),

    // OB warning per camera
    conflicts.length > 0 && h('div', { style: { background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#991b1b' } },
      h('strong', null, '\u26A0\uFE0F Overbooking: '),
      conflicts.map(function(c, i) { return c.room + ' (' + fmt(c.from) + ')'; }).join(', ')
    ),

    // ── CONTINUT: DOAR sectiunea filtrului activ ──────────────────────────────
    filter === 'free'
      ? h('div', null,
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#16a34a', borderRadius: 10, color: '#fff', marginBottom: 8 } },
            h('span', { style: { fontWeight: 800, fontSize: 15 } }, '\uD83D\uDFE2 Camere libere acum'),
            h('span', { style: { fontSize: 13, opacity: .8 } }, libere.length + ' camere')
          ),
          libere.length === 0
            ? h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' } },
                h('div', { style: { fontSize: 48, marginBottom: 12 } }, '\uD83D\uDD34'),
                h('div', { style: { fontSize: 16, fontWeight: 600 } }, 'Toate camerele sunt ocupate acum')
              )
            : h('div', null,
                libere.map(function(room) {
                  return h('div', { key: room, className: 'card', style: { padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                      h('span', { style: { fontSize: 22 } }, '\uD83D\uDFE2'),
                      h('span', { style: { fontSize: 16, fontWeight: 700, color: '#1a202c' } }, room)
                    ),
                    h('button', {
                      style: { padding: '9px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
                      onClick: function() { props.onNew(room); }
                    }, '+ Rezerva')
                  );
                })
              )
        )
      : h('div', null,
          current.list.length === 0
            ? h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' } },
                h('div', { style: { fontSize: 48, marginBottom: 12 } }, current.emptyIcon),
                h('div', { style: { fontSize: 16, fontWeight: 600 } }, current.emptyMsg)
              )
            : h('div', null,
                h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#1e3a5f', borderRadius: 10, color: '#fff', marginBottom: 8 } },
                  h('span', { style: { fontWeight: 800, fontSize: 15 } }, current.icon + ' ' + current.title),
                  h('span', { style: { fontSize: 13, opacity: .8 } }, current.list.length + ' rez.')
                ),
                renderList(current.list, current.checkType)
              )
        ),

    // Buton adauga per camera
    h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 20, marginBottom: 12 } },
      rooms.map(function(room) {
        return h('button', {
          key: room,
          style: { padding: '8px 12px', background: '#f1f5f9', color: '#374151', border: '1.5px solid #d1d9e0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
          onClick: function() { props.onNew(room); }
        }, '+ ' + room);
      })
    ),

    detailRes && h(ResDetail, {
      res: detailRes, sources: sources,
      onClose: function() { setDetailRes(null); },
      onEdit: props.onEdit,
      onCopy: props.onCopy,
      onMove: props.onMove,
      onDelete: function(id, name) { props.onDelete(id, name); setDetailRes(null); },
      onSaveGuestDetails: props.onSaveGuestDetails,
      pensionName: props.pensionName
    })
  );
}

// ── CALENDAR TAB ─────────────────────────────────────────────────────────────
function CalTab(props) {
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;
  var vs = useState(props.initView || 'month');
  var view = vs[0], setView = vs[1];
  var cds = useState(function() { var n = new Date(); return { year: n.getFullYear(), month: n.getMonth(), weekNum: 0, weekAnchor: n.toISOString().slice(0, 10) }; });
  var calDate = cds[0], setCalDate = cds[1];

  // Get the start of week N (0-indexed) in given month/year
  function getWeekStart(year, month, weekNum) {
    // Find first Monday of month
    var d = new Date(year, month, 1);
    var dow = d.getDay(); // 0=Sun,1=Mon...
    var toMon = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
    d.setDate(1 + toMon + weekNum * 7);
    return d.toISOString().slice(0, 10);
  }

  // Build 7 days from a monday anchor
  function getWeekDaysFrom(anchor) {
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(anchor, i));
    return days;
  }

  // How many weeks fit in this month (Mon-Sun that overlap with month)
  function weeksInMonth(year, month) {
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var dow = firstDay.getDay();
    var toMon = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
    var firstMon = new Date(year, month, 1 + toMon);
    var count = 0;
    var cur = new Date(firstMon);
    while (cur <= lastDay) { count++; cur.setDate(cur.getDate() + 7); }
    return Math.max(count, 1);
  }
  var cfs = useState(function() { var n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-01'; });
  var customFrom = cfs[0], setCustomFrom = cfs[1];
  var cts = useState(function() { return addDays(todayStr(), 30); });
  var customTo = cts[0], setCustomTo = cts[1];

  var days = useMemo(function() {
    if (view === 'month') return getMonthDays(calDate.year, calDate.month);
    if (view === 'week') {
      var anchor = getWeekStart(calDate.year, calDate.month, calDate.weekNum || 0);
      return getWeekDaysFrom(anchor);
    }
    var d = [], cur = customFrom;
    while (cur <= customTo && d.length < 62) { d.push(cur); cur = addDays(cur, 1); }
    return d;
  }, [view, calDate, customFrom, customTo]);

  var maps = useMemo(function() {
    var stay = {}, edge = {};
    reservations.forEach(function(res) {
      if (!res.checkIn || !res.nights || !res.room) return;
      var cout = addDays(res.checkIn, res.nights);
      var kI = res.room + '|' + res.checkIn;
      if (!edge[kI]) edge[kI] = {};
      if (edge[kI].in) edge[kI].inOB = true; else edge[kI].in = res;
      var kO = res.room + '|' + cout;
      if (!edge[kO]) edge[kO] = {};
      if (edge[kO].out) edge[kO].outOB = true; else edge[kO].out = res;
      for (var i = 1; i < res.nights; i++) {
        var d = addDays(res.checkIn, i);
        var k = res.room + '|' + d;
        if (!stay[k]) stay[k] = res; else stay[k] = Object.assign({}, stay[k], { _ob: true });
      }
    });
    return { stay: stay, edge: edge };
  }, [reservations]);

  var tod = todayStr();
  var mn = new Date(calDate.year, calDate.month, 1).toLocaleString('ro-RO', { month: 'long', year: 'numeric' });
  var monthTitle = mn.charAt(0).toUpperCase() + mn.slice(1);
  var weekTitle = days.length ? fmt(days[0]) + ' - ' + fmt(days[days.length - 1]) : '';
  var title = view === 'month' ? monthTitle : view === 'week' ? (monthTitle + ' \u2014 Saptamana ' + ((calDate.weekNum || 0) + 1)) : 'Interval personalizat';

  function prevP() {
    if (view === 'month') {
      var m = calDate.month - 1, y = calDate.year;
      if (m < 0) { m = 11; y--; }
      setCalDate(Object.assign({}, calDate, { year: y, month: m }));
    } else if (view === 'week') {
      var wn = (calDate.weekNum || 0) - 1;
      if (wn < 0) {
        var m2 = calDate.month - 1, y2 = calDate.year;
        if (m2 < 0) { m2 = 11; y2--; }
        var maxW = weeksInMonth(y2, m2) - 1;
        setCalDate(Object.assign({}, calDate, { year: y2, month: m2, weekNum: maxW }));
      } else {
        setCalDate(Object.assign({}, calDate, { weekNum: wn }));
      }
    }
  }
  function nextP() {
    if (view === 'month') {
      var m = calDate.month + 1, y = calDate.year;
      if (m > 11) { m = 0; y++; }
      setCalDate(Object.assign({}, calDate, { year: y, month: m }));
    } else if (view === 'week') {
      var maxW = weeksInMonth(calDate.year, calDate.month) - 1;
      var wn = (calDate.weekNum || 0) + 1;
      if (wn > maxW) {
        var m2 = calDate.month + 1, y2 = calDate.year;
        if (m2 > 11) { m2 = 0; y2++; }
        setCalDate(Object.assign({}, calDate, { year: y2, month: m2, weekNum: 0 }));
      } else {
        setCalDate(Object.assign({}, calDate, { weekNum: wn }));
      }
    }
  }

  function renderCell(room, day) {
    var k = room + '|' + day;
    var stay = maps.stay[k], edge = maps.edge[k];
    if (stay && !edge) {
      var isOB = stay._ob;
      var si = sources.indexOf(stay.source);
      var dot = isOB ? '#dc2626' : stay.status === 'blocked' ? '#f59e0b' : (si >= 0 ? PAL[si % PAL.length].dot : '#ef4444');
      var bg = isOB ? '#fecaca' : stay.status === 'blocked' ? '#fffbeb' : '#fef2f2';
      return h('td', { key: day, className: 'ctd', style: { background: bg }, title: fullName(stay) + ' (' + stay.source + ')', onClick: function() { props.onEdit(stay); } },
        h('div', { style: { width: '100%', height: '100%', background: dot, minHeight: 26 } })
      );
    }
    if (edge) {
      var rIn = edge.in, rOut = edge.out;
      var siIn = rIn ? sources.indexOf(rIn.source) : -1;
      var siOut = rOut ? sources.indexOf(rOut.source) : -1;
      var cIn = rIn ? (rIn.status === 'blocked' ? '#f59e0b' : (siIn >= 0 ? PAL[siIn % PAL.length].dot : '#ef4444')) : '#f0fdf4';
      var cOut = rOut ? (rOut.status === 'blocked' ? '#f59e0b' : (siOut >= 0 ? PAL[siOut % PAL.length].dot : '#ef4444')) : '#f0fdf4';
      var tips = [];
      if (rOut) tips.push('Pleaca: ' + fullName(rOut));
      if (rIn) tips.push('Soseste: ' + fullName(rIn));
      return h('td', { key: day, className: 'ctd', style: { background: '#fff' }, title: tips.join(' | ') || 'Libera', onClick: function() { rIn ? props.onEdit(rIn) : props.onNew(room); } },
        h('svg', { width: 28, height: 26, viewBox: '0 0 28 26', style: { display: 'block', margin: '0 auto' } },
          h('polygon', { points: '0,0 28,0 0,26', fill: rOut ? cOut : '#f0fdf4' }),
          h('polygon', { points: '28,0 28,26 0,26', fill: rIn ? cIn : '#f0fdf4' }),
          h('line', { x1: 28, y1: 0, x2: 0, y2: 26, stroke: '#fff', strokeWidth: 1.5 })
        )
      );
    }
    return h('td', { key: day, className: 'ctd', style: { background: '#f0fdf4' }, title: 'Libera', onClick: function() { props.onNew(room); } },
      h('div', { style: { width: 14, height: 14, borderRadius: 3, margin: '6px auto', background: '#22c55e' } })
    );
  }

  function renderGrid() {
    return h('div', { className: 'cwrap' },
      h('table', { className: 'ctbl' },
        h('thead', null,
          h('tr', null,
            h('th', { className: 'cthr' }, 'Camera'),
            days.map(function(d) {
              var wd = new Date(d).getDay(), we = wd === 0 || wd === 6, isT = d === tod;
              return h('th', { key: d, className: 'cthd' + (we ? ' we' : '') + (isT ? ' tod' : ''), title: d }, d.slice(8));
            })
          )
        ),
        h('tbody', null,
          rooms.map(function(room) {
            return h('tr', { key: room },
              h('td', { className: 'ctdr' }, room),
              days.map(function(day) { return renderCell(room, day); })
            );
          })
        )
      )
    );
  }

  // Week selector buttons (Sapt. 1, 2, 3, 4...)
  var weekCount = view === 'week' ? weeksInMonth(calDate.year, calDate.month) : 0;

  return h('div', { className: 'page' },
    h('div', { className: 'cvtabs' },
      [['month', 'Lunar'], ['week', 'Saptamanal'], ['custom', 'Interval']].map(function(vl) {
        return h('button', { key: vl[0], className: 'cvbtn' + (view === vl[0] ? ' on' : ''), onClick: function() { setView(vl[0]); } }, vl[1]);
      })
    ),
    view === 'custom' && h('div', { className: 'crange' },
      h('div', { className: 'fld' }, h('label', { className: 'flbl' }, 'De la'), h('input', { className: 'finp', type: 'date', value: customFrom, onChange: function(e) { setCustomFrom(e.target.value); } })),
      h('div', { className: 'fld' }, h('label', { className: 'flbl' }, 'Pana la'), h('input', { className: 'finp', type: 'date', value: customTo, onChange: function(e) { setCustomTo(e.target.value); } }))
    ),
    view !== 'custom' && h('div', { className: 'cnav' },
      h('button', { className: 'cnavbtn', onClick: prevP }, '\u25C0'),
      h('span', { className: 'ctitle' }, title),
      h('button', { className: 'cnavbtn', onClick: nextP }, '\u25B6')
    ),
    view === 'custom' && h('div', { style: { fontSize: 15, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 } }, title),
    view === 'week' && h('div', { style: { display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' } },
      Array.from({ length: weekCount }, function(_, i) {
        return h('button', { key: i,
          style: { padding: '7px 14px', borderRadius: 9, border: '1.5px solid ' + ((calDate.weekNum || 0) === i ? '#2563eb' : '#d1d9e0'), background: (calDate.weekNum || 0) === i ? '#2563eb' : '#fff', color: (calDate.weekNum || 0) === i ? '#fff' : '#374151', fontWeight: 700, fontSize: 14 },
          onClick: function() { setCalDate(Object.assign({}, calDate, { weekNum: i })); }
        }, 'Sapt. ' + (i + 1));
      })
    ),
    view === 'week' && days.length > 0 && h('div', { style: { fontSize: 13, color: '#64748b', marginBottom: 8, fontStyle: 'italic' } },
      fmt(days[0]) + ' \u2014 ' + fmt(days[days.length - 1])
    ),
    h('div', { className: 'clgnd' },
      h('span', null, '\uD83D\uDFE2 Libera'),
      h('span', null, '\uD83D\uDD34 Ocupata'),
      h('span', null, '\uD83D\uDFE1 Blocata'),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: 5 } },
        h('svg', { width: 16, height: 14, viewBox: '0 0 16 14' },
          h('polygon', { points: '0,0 16,0 0,14', fill: '#ef4444' }),
          h('polygon', { points: '16,0 16,14 0,14', fill: '#22c55e' }),
          h('line', { x1: 16, y1: 0, x2: 0, y2: 14, stroke: '#fff', strokeWidth: 1.3 })
        ),
        'Plecare/Sosire'
      )
    ),
    renderGrid()
  );
}

// ── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab(props) {
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;
  var rs = useState(function() {
    var n = new Date();
    return { from: n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-01', to: n.toISOString().slice(0, 10) };
  });
  var range = rs[0], setRange = rs[1];
  var from = range.from, to = range.to;

  var tod = todayStr();
  var tmr = addDays(tod, 1);
  var checkoutsToday = reservations.filter(function(r) { return addDays(r.checkIn, r.nights || 0) === tod; });
  var checkinsToday = reservations.filter(function(r) { return r.checkIn === tod; });
  var checkinsTmr = reservations.filter(function(r) { return r.checkIn === tmr; });

  var stats = useMemo(function() {
    var rev = 0, adv = 0, nts = 0, cnt = 0;
    var bR = rooms.map(function(r) { return { room: r, count: 0, nights: 0, revenue: 0 }; });
    var bS = sources.map(function(s) { return { src: s, count: 0, revenue: 0 }; });
    var rI = {}, sI = {};
    rooms.forEach(function(r, i) { rI[r] = i; });
    sources.forEach(function(s, i) { sI[s] = i; });
    reservations.forEach(function(r) {
      if (!r.checkIn) return;
      var n = nightsInRange(r.checkIn, r.nights || 0, from, to);
      if (!n) return;
      var rv = (r.pricePerNight || 0) * n;
      rev += rv; adv += (r.advance || 0); nts += n; cnt++;
      if (rI[r.room] != null) { bR[rI[r.room]].count++; bR[rI[r.room]].nights += n; bR[rI[r.room]].revenue += rv; }
      if (sI[r.source] != null) { bS[sI[r.source]].count++; bS[sI[r.source]].revenue += rv; }
    });
    return { rev: rev, adv: adv, nts: nts, cnt: cnt, bR: bR, bS: bS };
  }, [reservations, from, to, rooms, sources]);

  var maxR = Math.max.apply(null, stats.bR.map(function(r) { return r.revenue; }).concat([1]));

  return h('div', { className: 'page' },
    (checkoutsToday.length > 0 || checkinsToday.length > 0 || checkinsTmr.length > 0) && h('div', { className: 'stact' },
      h('div', { className: 'stboxt' }, 'Astazi si maine'),
      checkoutsToday.length > 0 && h('div', { style: { marginBottom: 10 } },
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 6 } }, '\uD83D\uDD34 Pleaca astazi (' + checkoutsToday.length + ')'),
        checkoutsToday.map(function(r) { return h('div', { key: r.id, style: { fontSize: 14, padding: '5px 0', borderBottom: '1px solid #f1f5f9' } }, fullName(r) + ' \u2014 ' + r.room); })
      ),
      checkinsToday.length > 0 && h('div', { style: { marginBottom: 10 } },
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 6 } }, '\uD83D\uDFE2 Soseste astazi (' + checkinsToday.length + ')'),
        checkinsToday.map(function(r) { return h('div', { key: r.id, style: { fontSize: 14, padding: '5px 0', borderBottom: '1px solid #f1f5f9' } }, fullName(r) + ' \u2014 ' + r.room); })
      ),
      checkinsTmr.length > 0 && h('div', null,
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 6 } }, '\uD83D\uDCC5 Soseste maine (' + checkinsTmr.length + ')'),
        checkinsTmr.map(function(r) { return h('div', { key: r.id, style: { fontSize: 14, padding: '5px 0', borderBottom: '1px solid #f1f5f9' } }, fullName(r) + ' \u2014 ' + r.room); })
      )
    ),
    h('div', { className: 'stper' },
      h('div', { style: { fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 10 } }, 'Interval de analiza'),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
        h('div', { className: 'fld' }, h('label', { className: 'flbl' }, 'De la'), h('input', { className: 'finp', type: 'date', value: from, onChange: function(e) { setRange(Object.assign({}, range, { from: e.target.value })); } })),
        h('div', { className: 'fld' }, h('label', { className: 'flbl' }, 'Pana la'), h('input', { className: 'finp', type: 'date', value: to, onChange: function(e) { setRange(Object.assign({}, range, { to: e.target.value })); } }))
      ),
      h('div', { style: { fontSize: 12, color: '#94a3b8', marginTop: 8 } }, 'Venit calculat proportional cu noptile din interval.')
    ),
    h('div', { className: 'stcards' },
      [
        { icon: '\uD83C\uDFE0', lbl: 'Rezervari', val: stats.cnt },
        { icon: '\uD83C\uDF19', lbl: 'Nopti', val: stats.nts },
        { icon: '\uD83D\uDCB0', lbl: 'Venituri', val: stats.rev + ' lei' },
        { icon: '\uD83D\uDD14', lbl: 'Rest incasat', val: (stats.rev - stats.adv) + ' lei', hi: true }
      ].map(function(item) {
        return h('div', { key: item.lbl, className: 'stcard' + (item.hi ? ' hi' : '') },
          h('div', { className: 'stico' }, item.icon),
          h('div', { className: 'stlbl' }, item.lbl),
          h('div', { className: 'stval' + (item.hi ? ' hi' : '') }, item.val)
        );
      })
    ),
    h('div', { className: 'stbox' },
      h('div', { className: 'stboxt' }, 'Venituri pe camera'),
      stats.bR.map(function(item) {
        return h('div', { key: item.room, className: 'brw' },
          h('div', { className: 'brl' }, item.room),
          h('div', { className: 'brt' }, h('div', { className: 'brf', style: { width: Math.round((item.revenue / maxR) * 100) + '%' } })),
          h('div', { className: 'brv' }, item.revenue + ' lei \u00B7 ' + item.nights + ' nopti \u00B7 ' + item.count + ' rez.')
        );
      })
    ),
    h('div', { className: 'stbox' },
      h('div', { className: 'stboxt' }, 'Rezervari pe sursa'),
      stats.bS.map(function(item, i) {
        var c = PAL[i % PAL.length];
        return h('div', { key: item.src, className: 'ssrow' },
          h('span', { className: 'cbdg', style: { background: c.light, color: c.text, fontSize: 14 } }, item.src),
          h('span', { style: { fontSize: 14, color: '#374151' } }, item.count + ' rez.'),
          h('span', { style: { fontSize: 14, color: c.text, fontWeight: 700, marginLeft: 'auto' } }, item.revenue + ' lei')
        );
      })
    )
  );
}

// ── PDF / PRINT EXPORT ───────────────────────────────────────────────────────
function PdfExport(props) {
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;
  var onClose = props.onClose;

  var fs = useState('all'); var filterRoom = fs[0], setFilterRoom = fs[1];
  var fp = useState('all'); var filterPeriod = fp[0], setFilterPeriod = fp[1];
  var fw = useState('all'); var filterSource = fw[0], setFilterSource = fw[1];

  var today = todayStr();
  var startOfMonth = today.slice(0,7) + '-01';
  var endOfMonth = addDays(startOfMonth, new Date(today.slice(0,4), parseInt(today.slice(5,7)), 0).getDate() - 1);
  var startOfYear = today.slice(0,4) + '-01-01';
  var endOfYear = today.slice(0,4) + '-12-31';

  var filtered = useMemo(function() {
    return reservations
      .filter(function(r) {
        if (filterRoom !== 'all' && r.room !== filterRoom) return false;
        if (filterSource !== 'all' && r.source !== filterSource) return false;
        if (filterPeriod === 'active') return isActiveFuture(r);
        if (filterPeriod === 'month') return r.checkIn >= startOfMonth && r.checkIn <= endOfMonth;
        if (filterPeriod === 'year')  return r.checkIn >= startOfYear  && r.checkIn <= endOfYear;
        return true; // all
      })
      .sort(function(a, b) { return (a.checkIn||'') < (b.checkIn||'') ? -1 : 1; });
  }, [reservations, filterRoom, filterSource, filterPeriod]);

  // Group by room for display
  var byRoom = useMemo(function() {
    var m = {};
    (filterRoom === 'all' ? rooms : [filterRoom]).forEach(function(r) { m[r] = []; });
    filtered.forEach(function(r) { if (m[r.room]) m[r.room].push(r); });
    return m;
  }, [filtered, rooms, filterRoom]);

  var printRooms = filterRoom === 'all' ? rooms : [filterRoom];

  function doPrint() {
    var printWin = window.open('', '_blank', 'width=900,height=700');
    var now = new Date().toLocaleString('ro-RO');
    var periodLabel = { all: 'Toate', active: 'Active/Viitoare', month: 'Luna curenta', year: 'Anul curent' }[filterPeriod];
    var roomLabel = filterRoom === 'all' ? 'Toate camerele' : filterRoom;
    var srcLabel = filterSource === 'all' ? 'Toate sursele' : filterSource;

    var rows = '';
    printRooms.forEach(function(room) {
      var rr = byRoom[room] || [];
      if (rr.length === 0) return;
      rows += '<tr><td colspan="9" style="background:#1e3a5f;color:#fff;font-weight:800;padding:8px 10px;font-size:13px;">' + room + ' (' + rr.length + ' rezervari)</td></tr>';
      rr.forEach(function(r) {
        var co = addDays(r.checkIn, r.nights);
        var total = (r.pricePerNight||0) * (r.nights||0);
        var rest = total - (r.advance||0);
        var restStyle = rest > 0 ? 'color:#dc2626;font-weight:700' : 'color:#16a34a;font-weight:700';
        rows += '<tr>' +
          '<td>' + (r.source||'-') + '</td>' +
          '<td><b>' + fullName(r) + '</b></td>' +
          '<td>' + (r.phone||'-') + '</td>' +
          '<td>' + fmt(r.checkIn) + '</td>' +
          '<td>' + fmt(co) + '</td>' +
          '<td style="text-align:center">' + (r.nights||0) + '</td>' +
          '<td style="text-align:right">' + (r.pricePerNight||0) + ' lei</td>' +
          '<td style="text-align:right;font-weight:700">' + total + ' lei</td>' +
          '<td style="text-align:right;' + restStyle + '">' + rest + ' lei</td>' +
        '</tr>';
      });
    });

    var html = '<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"/>' +
      '<title>Rezervari Pensiune</title>' +
      '<style>' +
        'body{font-family:Arial,sans-serif;font-size:12px;color:#1a202c;margin:20px;}' +
        'h1{font-size:18px;color:#1e3a5f;margin:0 0 4px;}' +
        '.meta{font-size:11px;color:#64748b;margin-bottom:16px;}' +
        'table{width:100%;border-collapse:collapse;}' +
        'th{background:#1e3a5f;color:#fff;padding:8px 10px;text-align:left;font-size:11px;}' +
        'td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;}' +
        'tr:nth-child(even) td{background:#f8fafc;}' +
        '.footer{margin-top:20px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;}' +
        '@media print{body{margin:10px;}button{display:none!important;}}' +
        '.no-print{margin-bottom:14px;}' +
      '</style></head><body>' +
      '<div class="no-print"><button onclick="window.print()" style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px;">🖨 Tipareste / Salveaza PDF</button>' +
      '<button onclick="window.close()" style="padding:10px 18px;background:#f1f5f9;color:#374151;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">✕ Inchide</button></div>' +
      '<h1>🏡 Rezervari Pensiune</h1>' +
      '<div class="meta">Generat: ' + now + ' &nbsp;|&nbsp; Perioada: ' + periodLabel + ' &nbsp;|&nbsp; ' + roomLabel + ' &nbsp;|&nbsp; Sursa: ' + srcLabel + ' &nbsp;|&nbsp; Total: ' + filtered.length + ' rezervari</div>' +
      '<table>' +
        '<thead><tr>' +
          '<th>Sursa</th><th>Nume</th><th>Telefon</th>' +
          '<th>Check-in</th><th>Check-out</th><th>Nopti</th>' +
          '<th>Tarif/n</th><th>Total</th><th>Rest</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<div class="footer">casutacuizvor-2017.netlify.app &nbsp;|&nbsp; ' + now + '</div>' +
      '</body></html>';

    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
  }

  // Summary totals
  var totals = useMemo(function() {
    var rev = 0, rest = 0, nts = 0;
    filtered.forEach(function(r) {
      var t = (r.pricePerNight||0)*(r.nights||0);
      rev += t; rest += t-(r.advance||0); nts += (r.nights||0);
    });
    return { rev: rev, rest: rest, nts: nts };
  }, [filtered]);

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e){e.stopPropagation();} },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDCCA Descarca / Tipareste Rezervari'),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      // Filters toolbar
      h('div', { className: 'prv-toolbar' },
        h('select', { className: 'prv-tsel', value: filterPeriod, onChange: function(e){setFilterPeriod(e.target.value);} },
          h('option', {value:'active'}, 'Active si viitoare'),
          h('option', {value:'month'}, 'Luna curenta'),
          h('option', {value:'year'}, 'Anul curent'),
          h('option', {value:'all'}, 'Toate rezervarile')
        ),
        h('select', { className: 'prv-tsel', value: filterRoom, onChange: function(e){setFilterRoom(e.target.value);} },
          h('option', {value:'all'}, 'Toate camerele'),
          rooms.map(function(r){ return h('option',{key:r,value:r},r); })
        ),
        h('select', { className: 'prv-tsel', value: filterSource, onChange: function(e){setFilterSource(e.target.value);} },
          h('option', {value:'all'}, 'Toate sursele'),
          sources.map(function(s){ return h('option',{key:s,value:s},s); })
        )
      ),
      h('div', { className: 'prv-content' },
        // Summary bar
        h('div', { style:{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12} },
          [
            {icon:'\uD83D\uDCCB', lbl:'Rezervari', val:filtered.length},
            {icon:'\uD83C\uDF19', lbl:'Nopti', val:totals.nts},
            {icon:'\uD83D\uDCB0', lbl:'Venituri', val:totals.rev+' lei'},
            {icon:'\uD83D\uDD14', lbl:'Rest', val:totals.rest+' lei', hi:totals.rest>0}
          ].map(function(item){
            return h('div',{key:item.lbl,style:{flex:1,minWidth:70,background:item.hi?'#fef2f2':'#f8fafc',border:'1.5px solid '+(item.hi?'#fca5a5':'#e2e8f0'),borderRadius:9,padding:'8px 10px',textAlign:'center'}},
              h('div',{style:{fontSize:16}},item.icon),
              h('div',{style:{fontSize:13,color:'#64748b',fontWeight:600}},item.lbl),
              h('div',{style:{fontSize:14,fontWeight:800,color:item.hi?'#dc2626':'#1a202c'}},item.val)
            );
          })
        ),
        // Preview table
        filtered.length === 0
          ? h('div',{style:{textAlign:'center',padding:'30px 0',color:'#94a3b8',fontSize:14}},'Nicio rezervare pentru filtrele selectate')
          : printRooms.map(function(room){
              var rr = byRoom[room]||[];
              if(rr.length===0) return null;
              return h('div',{key:room},
                h('div',{className:'prv-room-hdr'},'\uD83D\uDEAA '+room+' \u2014 '+rr.length+' rez.'),
                h('div',{style:{overflowX:'auto'}},
                  h('table',{className:'prv-tbl'},
                    h('thead',null,h('tr',null,
                      ['Sursa','Nume','Telefon','Check-in','Check-out','Nopti','Total','Rest'].map(function(th){
                        return h('th',{key:th},th);
                      })
                    )),
                    h('tbody',null,rr.map(function(r){
                      var co=addDays(r.checkIn,r.nights);
                      var total=(r.pricePerNight||0)*(r.nights||0);
                      var rest=total-(r.advance||0);
                      var c=getCol(sources,r.source);
                      return h('tr',{key:r.id},
                        h('td',null,h('span',{className:'prv-src',style:{background:c.light,color:c.text}},r.source||'-')),
                        h('td',null,h('b',null,fullName(r))),
                        h('td',null,r.phone||'-'),
                        h('td',null,fmt(r.checkIn)),
                        h('td',null,fmt(co)),
                        h('td',{style:{textAlign:'center'}},r.nights),
                        h('td',{style:{textAlign:'right',fontWeight:700}},total+' lei'),
                        h('td',{className:rest>0?'prv-pos':'prv-neg'},rest+' lei')
                      );
                    }))
                  )
                )
              );
            })
      ),
      h('div', { className: 'mfoot' },
        h('button',{className:'mcanc',onClick:onClose},'Inchide'),
        h('button',{className:'msave',style:{display:'flex',alignItems:'center',gap:6,justifyContent:'center'},onClick:doPrint},
          '\uD83D\uDDA8 Tipareste / PDF')
      )
    )
  );
}

// ── PRICES & BOOKING LINK MANAGER ────────────────────────────────────────────
function PricesMgr(props) {
  var rooms = props.rooms, roomPrices = props.roomPrices, onSave = props.onSave, onClose = props.onClose;
  var pendingRes = props.pendingRes || [];
  var ps = useState(Object.assign({}, roomPrices));
  var prices = ps[0], setPrices = ps[1];
  var cp = useState(''); var copied = cp[0], setCopied = cp[1];
  var ts = useState('prices'); var tab = ts[0], setTab = ts[1];

  var bookingUrl = window.location.origin + '/booking.html?p=' + PENSION_ID;
  var presentationUrl = window.location.origin + '/prezentare.html?p=' + PENSION_ID;

  function copyLink() {
    navigator.clipboard.writeText(bookingUrl).catch(function() {
      var el = document.createElement('textarea');
      el.value = bookingUrl; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2500);
  }

  var cp2 = useState(''); var copiedPres = cp2[0], setCopiedPres = cp2[1];
  function copyPresentationLink() {
    navigator.clipboard.writeText(presentationUrl).catch(function() {
      var el = document.createElement('textarea');
      el.value = presentationUrl; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopiedPres(true);
    setTimeout(function() { setCopiedPres(false); }, 2500);
  }

  var tabSt = function(active) { return {
    flex:1,padding:'9px 4px',borderRadius:8,fontSize:14,fontWeight:700,
    background:active?'#fff':'none',color:active?'#2563eb':'#64748b',
    boxShadow:active?'0 1px 4px rgba(0,0,0,.1)':'none',border:'none',cursor:'pointer'
  }; };

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e){e.stopPropagation();} },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDD17 Rezervare Online Clienti'),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        // Tabs
        h('div', { style:{display:'flex',background:'#f1f5f9',borderRadius:10,padding:3,gap:2,marginBottom:16} },
          h('button', {style:tabSt(tab==='prices'),onClick:function(){setTab('prices');}}, '\uD83D\uDCB0 Preturi'),
          h('button', {style:tabSt(tab==='link'),onClick:function(){setTab('link');}}, '\uD83D\uDD17 Link'),
          pendingRes.length > 0 && h('button', {style:{...tabSt(tab==='pending'),color:tab==='pending'?'#dc2626':'#dc2626'},onClick:function(){setTab('pending');}},
            '\uD83D\uDD14 Cereri (' + pendingRes.length + ')')
        ),

        // ── PRICES TAB ──
        tab === 'prices' && h('div', null,
          h('div', { className: 'ibox', style:{marginBottom:14} },
            'Seteaza tariful pe noapte pentru fiecare camera. Clientii vor vedea pretul in pagina de rezervare.'
          ),
          rooms.map(function(room) {
            return h('div', { key: room, style:{marginBottom:12} },
              h('label', { className: 'flbl', style:{marginBottom:5,display:'block'} }, '\uD83D\uDEAA ' + room),
              h('div', { style:{display:'flex',gap:8,alignItems:'center'} },
                h('input', {
                  className: 'finp', type:'number', min:0, style:{fontSize:16},
                  value: prices[room] || '',
                  placeholder: 'Pret / noapte (lei)',
                  onChange: function(e) {
                    var np = Object.assign({}, prices);
                    np[room] = parseFloat(e.target.value) || 0;
                    setPrices(np);
                  }
                }),
                h('span', { style:{fontWeight:700,color:'#64748b',flexShrink:0} }, 'lei/noapte')
              )
            );
          }),
          h('button', {
            className: 'msave', style:{width:'100%',marginTop:8,padding:13,borderRadius:11,fontSize:15,fontWeight:800,border:'none',cursor:'pointer',color:'#fff',background:'#2563eb'},
            onClick: function() { onSave(prices); onClose(); }
          }, '\u2713 Salveaza preturile')
        ),

        // ── LINK TAB ──
        tab === 'link' && h('div', null,
          h('div', { className: 'ibox', style:{marginBottom:14} },
            'Trimite acest link clientilor. Ei vor putea vedea disponibilitatea si trimite o cerere de rezervare.'
          ),
          h('div', { style:{background:'#f8fafc',borderRadius:12,padding:16,border:'1.5px solid #e2e8f0',marginBottom:16} },
            h('div', { style:{fontSize:14,fontWeight:700,color:'#1e3a5f',marginBottom:10} }, '\uD83D\uDD17 Link pagina rezervare:'),
            h('div', { style:{display:'flex',gap:8,alignItems:'center'} },
              h('input', { className:'finp', style:{fontSize:14,color:'#64748b'}, readOnly:true, value:bookingUrl, onFocus:function(e){e.target.select();} }),
              h('button', {
                style:{padding:'11px 14px',borderRadius:9,fontWeight:700,fontSize:14,border:'none',cursor:'pointer',flexShrink:0,
                  background:copied?'#16a34a':'#2563eb',color:'#fff',whiteSpace:'nowrap'},
                onClick: copyLink
              }, copied ? '\u2713 Copiat!' : '\uD83D\uDCCB Copiaza')
            )
          ),
          h('div', { style:{background:'#f8fafc',borderRadius:12,padding:16,border:'1.5px solid #e2e8f0',marginBottom:16} },
            h('div', { style:{fontSize:14,fontWeight:700,color:'#1e3a5f',marginBottom:10} }, '\uD83C\uDF10 Link pagina de prezentare:'),
            h('div', { style:{display:'flex',gap:8,alignItems:'center'} },
              h('input', { className:'finp', style:{fontSize:14,color:'#64748b'}, readOnly:true, value:presentationUrl, onFocus:function(e){e.target.select();} }),
              h('button', {
                style:{padding:'11px 14px',borderRadius:9,fontWeight:700,fontSize:14,border:'none',cursor:'pointer',flexShrink:0,
                  background:copiedPres?'#16a34a':'#2563eb',color:'#fff',whiteSpace:'nowrap'},
                onClick: copyPresentationLink
              }, copiedPres ? '\u2713 Copiat!' : '\uD83D\uDCCB Copiaza')
            ),
            h('div', { style:{fontSize:11.5,color:'#94a3b8',marginTop:8} }, 'Completeaza pagina de prezentare din Configurare pentru a personaliza continutul (poze, descriere, facilitati).')
          ),
          // WhatsApp share
          h('a', {
            href: 'https://wa.me/?text=' + encodeURIComponent('Buna ziua! Va invitam sa faceti rezervarea online la ' + (props.pensionName||'pensiunea noastra') + ':\n' + bookingUrl),
            target: '_blank',
            style:{display:'flex',alignItems:'center',gap:10,padding:'13px 16px',background:'#dcfce7',border:'1.5px solid #bbf7d0',borderRadius:12,textDecoration:'none',marginBottom:10}
          },
            h('span', {style:{fontSize:24}}, '\uD83D\uDCAC'),
            h('div', null,
              h('div', {style:{fontWeight:700,color:'#15803d',fontSize:14}}, 'Trimite pe WhatsApp'),
              h('div', {style:{fontSize:14,color:'#16a34a'}}, 'Deschide WhatsApp cu mesaj pre-completat')
            )
          ),
          h('div', { style:{background:'#fffbeb',border:'1.5px solid #fbbf24',borderRadius:10,padding:'10px 14px',fontSize:14,color:'#92400e',lineHeight:1.6} },
            h('b', null, '\u2139\uFE0F Cum functioneaza:'), h('br'),
            '1. Clientul deschide linkul', h('br'),
            '2. Alege camera disponibila si data', h('br'),
            '3. Introduce datele si trimite cererea', h('br'),
            '4. Tu primesti cererea in aplicatie (sectiunea \u201ERezerv\u0103ri\u201D) cu statusul \u201EPending\u201D', h('br'),
            '5. Confirmi sau stergi cererea'
          )
        ),

        // ── PENDING TAB ──
        tab === 'pending' && h('div', null,
          pendingRes.length === 0
            ? h('div', {style:{textAlign:'center',padding:'30px 0',color:'#94a3b8'}}, 'Nicio cerere in asteptare')
            : h('div', null,
                h('div', {className:'ibox',style:{marginBottom:14}}, 'Cereri de rezervare trimise de clienti online. Confirma sau sterge fiecare cerere.'),
                pendingRes.map(function(r) {
                  var co = addDays(r.checkIn, r.nights||0);
                  var total = (r.pricePerNight||0)*(r.nights||0);
                  return h('div', {key:r.id, style:{background:'#fff',border:'2px solid #fbbf24',borderRadius:12,padding:'14px',marginBottom:12}},
                    h('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}},
                      h('div', null,
                        h('div', {style:{fontSize:16,fontWeight:800,color:'#1a202c'}}, (r.firstName||'') + ' ' + (r.lastName||'')),
                        h('div', {style:{fontSize:14,color:'#64748b'}}, r.phone||'')
                      ),
                      h('span', {style:{background:'#fef3c7',color:'#92400e',padding:'3px 8px',borderRadius:7,fontSize:13,fontWeight:800,flexShrink:0}}, '\u23F3 PENDING')
                    ),
                    h('div', {style:{fontSize:14,color:'#374151',lineHeight:1.8}},
                      '\uD83D\uDEAA ' + r.room + h('br'),
                      '\uD83D\uDCC5 ' + fmt(r.checkIn) + ' \u2192 ' + fmt(co) + ' \u00B7 ' + (r.nights||0) + ' nopti',
                      total > 0 ? h('span', null, h('br'), '\uD83D\uDCB0 Total: ' + total + ' lei') : null,
                      r.comments ? h('div', {style:{marginTop:6,padding:'6px 10px',background:'#fffbeb',borderRadius:7,fontSize:14,color:'#78350f'}}, '\uD83D\uDCAC ' + r.comments) : null
                    ),
                    h('div', {style:{display:'flex',gap:8,marginTop:12}},
                      h('button', {
                        style:{flex:1,padding:'10px',background:'#16a34a',color:'#fff',borderRadius:9,fontWeight:700,fontSize:14,border:'none',cursor:'pointer'},
                        onClick: function() { props.onConfirmPending(r); }
                      }, '\u2713 Confirma'),
                      h('button', {
                        style:{flex:1,padding:'10px',background:'#fef2f2',color:'#dc2626',borderRadius:9,fontWeight:700,fontSize:14,border:'1.5px solid #fecaca',cursor:'pointer'},
                        onClick: function() { props.onDeletePending(r.id); }
                      }, '\u2715 Refuza')
                    )
                  );
                })
              )
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', {className:'mcanc',style:{flex:1},onClick:onClose}, 'Inchide')
      )
    )
  );
}

// ── DRAWER ───────────────────────────────────────────────────────────────────
function Drawer(props) {
  var tab = props.tab, setTab = props.setTab;
  var sources = props.sources, rooms = props.rooms;
  var conflicts = props.conflicts;
  var syncColor = props.syncColor, syncLabel = props.syncLabel;
  var cs = useState(false);
  var calOpen = cs[0], setCalOpen = cs[1];
  // accordion interior (Camere/Surse/Sincronizari), independent de categoria mare
  var acs = useState(null);
  var accordionOpen = acs[0], setAccordionOpen = acs[1];
  // categoria mare deschisa: null | 'daily' | 'comm' | 'config' | 'account' — DOAR UNA la un moment dat,
  // toate incep inchise (utilizatorul alege ce deschide)
  var ocs = useState(null);
  var openCategory = ocs[0], setOpenCategory = ocs[1];
  var obCount = conflicts.length;

  function navTo(t) { setTab(t); props.onClose(); }
  function toggleAccordion(key) { setAccordionOpen(accordionOpen === key ? null : key); }
  function toggleCategory(key) { setOpenCategory(openCategory === key ? null : key); }

  // cate platforme de sincronizare au cel putin un link configurat
  var icalLinksV2 = lc.get('ical_links_v2', null);
  var connectedPlatforms = SYNC_PLATFORMS.filter(function(p) {
    if (!icalLinksV2 || !icalLinksV2[p.id]) return false;
    return Object.keys(icalLinksV2[p.id]).some(function(r) { return icalLinksV2[p.id][r]; });
  });

  // Header pentru o categorie mare (nivelul 1 din cascada)
  function catHeader(key, icon, label, badge) {
    var isOpen = openCategory === key;
    return h('div', { className: 'ditem' + (isOpen ? ' on' : ''), style: { fontWeight: 800 }, onClick: function() { toggleCategory(key); } },
      h('span', { className: 'dico' }, icon),
      h('div', { className: 'dtxt' }, h('div', { className: 'dnm' }, label)),
      badge > 0 && h('span', { className: 'dbdg' }, badge),
      h('span', { className: 'darr' }, isOpen ? '\u2303' : '\u2304')
    );
  }

  return h(Fragment, null,
    h('div', { className: 'dbg', onClick: props.onClose }),
    h('div', { className: 'drw' },
      h('div', { className: 'drw-hdr' },
        h('div', { className: 'drw-logo' }, '\uD83C\uDFE1'),
        h('div', { className: 'drw-tit' }, 'Rezervio'),
        h('div', { className: 'drw-syn' },
          h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: syncColor, display: 'inline-block' } }),
          syncLabel
        )
      ),
      h('div', { className: 'drw-body' },

        // ══════════ CATEGORIA 1: GESTIUNE ZILNICA ══════════
        catHeader('daily', '\uD83D\uDCCB', 'Gestiune zilnica', obCount),
        openCategory === 'daily' && h('div', { className: 'dexp' },
          h('div', { className: 'dsub-item' + (tab.startsWith('cal') ? ' on' : ''), onClick: function() { setCalOpen(!calOpen); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDCC5'),
            h('span', { className: 'dsub-lbl' }, 'Calendar'),
            h('span', { className: 'darr', style: { marginLeft: 'auto' } }, calOpen ? '\u2303' : '\u2304')
          ),
          calOpen && [['cal-month', '\uD83D\uDCC5', 'Lunar'], ['cal-week', '\uD83D\uDDD3', 'Saptamanal'], ['cal-custom', '\uD83D\uDCC6', 'Interval personalizat']].map(function(vl) {
            return h('div', { key: vl[0], className: 'dsub-item', style: { paddingLeft: 30 }, onClick: function() { navTo(vl[0]); } },
              h('span', { style: { fontSize: 14 } }, vl[1]),
              h('span', { className: 'dsub-lbl' }, vl[2])
            );
          }),
          h('div', { className: 'dsub-item' + (tab === 'stats' ? ' on' : ''), onClick: function() { navTo('stats'); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDCCA'),
            h('span', { className: 'dsub-lbl' }, 'Statistici')
          ),
          h('div', { className: 'dsub-item' + (tab === 'archive' ? ' on' : ''), onClick: function() { navTo('archive'); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDDC2'),
            h('span', { className: 'dsub-lbl' }, 'Istoric rezervari')
          ),
          h('div', { className: 'dsub-item', onClick: function() { props.onOpenAvailability(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDD0D'),
            h('span', { className: 'dsub-lbl' }, 'Verifica disponibilitate')
          )
        ),

        // ══════════ CATEGORIA 2: COMUNICARE CU OASPETII ══════════
        catHeader('comm', '\uD83D\uDCAC', 'Comunicare cu oaspetii'),
        openCategory === 'comm' && h('div', { className: 'dexp' },
          h('div', { className: 'dsub-item', onClick: function() { props.onOpenMessages(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDCAC'),
            h('span', { className: 'dsub-lbl' }, 'Mesaje WhatsApp')
          )
        ),

        // ══════════ CATEGORIA 3: CONFIGURARE PENSIUNE ══════════
        catHeader('config', '\u2699\uFE0F', 'Configurare pensiune'),
        openCategory === 'config' && h('div', { className: 'dexp' },

          // ── Camere ──
          h('div', { className: 'dsub-item' + (accordionOpen === 'rooms' ? ' on' : ''), onClick: function() { toggleAccordion('rooms'); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDEAA'),
            h('span', { className: 'dsub-lbl' }, 'Camere (' + rooms.length + ')'),
            h('span', { className: 'darr', style: { marginLeft: 'auto' } }, accordionOpen === 'rooms' ? '\u2303' : '\u2304')
          ),
          accordionOpen === 'rooms' && h('div', { style: { paddingLeft: 20 } },
            rooms.map(function(r) {
              return h('div', { key: r, className: 'dsub-item', style: { paddingLeft: 24 } },
                h('span', { style: { fontSize: 14 } }, '\uD83D\uDEAA'),
                h('span', { className: 'dsub-lbl' }, r)
              );
            }),
            h('div', { className: 'dsub-item', style: { color: '#2563eb', fontWeight: 700, paddingLeft: 24 }, onClick: function() { props.onOpenRooms(); props.onClose(); } },
              h('span', { style: { fontSize: 14 } }, '\u270F\uFE0F'),
              h('span', { className: 'dsub-lbl' }, 'Adauga / editeaza / sterge')
            )
          ),

          // ── Surse ──
          h('div', { className: 'dsub-item' + (accordionOpen === 'sources' ? ' on' : ''), onClick: function() { toggleAccordion('sources'); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDC64'),
            h('span', { className: 'dsub-lbl' }, 'Surse (' + sources.length + ')'),
            h('span', { className: 'darr', style: { marginLeft: 'auto' } }, accordionOpen === 'sources' ? '\u2303' : '\u2304')
          ),
          accordionOpen === 'sources' && h('div', { style: { paddingLeft: 20 } },
            sources.map(function(s, i) {
              var c = PAL[i % PAL.length];
              return h('div', { key: s, className: 'dsub-item', style: { paddingLeft: 24 } },
                h('span', { className: 'dchip', style: { background: c.light, color: c.text, fontSize: 12 } }, s)
              );
            }),
            h('div', { className: 'dsub-item', style: { color: '#2563eb', fontWeight: 700, paddingLeft: 24 }, onClick: function() { props.onOpenSrc(); props.onClose(); } },
              h('span', { style: { fontSize: 14 } }, '\u270F\uFE0F'),
              h('span', { className: 'dsub-lbl' }, 'Adauga / editeaza / sterge')
            )
          ),

          // ── Toata locatia (toggle simplu, fara sub-meniu — doar Owner poate schimba) ──
          h('div', { className: 'dsub-item', onClick: props.userRole === 'owner' ? props.onToggleWholeEnabled : undefined, style: { cursor: props.userRole === 'owner' ? 'pointer' : 'default' } },
            h('span', { style: { fontSize: 15 } }, '\uD83C\uDFE0'),
            h('span', { className: 'dsub-lbl' }, 'Toata locatia'),
            h('span', {
              style: {
                marginLeft: 'auto', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                background: props.wholeEnabled ? '#dcfce7' : '#f1f5f9',
                color: props.wholeEnabled ? '#15803d' : '#94a3b8'
              }
            }, props.wholeEnabled ? 'ACTIV' : 'INACTIV')
          ),
          h('div', { style: { fontSize: 11.5, color: '#94a3b8', padding: '0 18px 8px 44px' } }, 'Permite rezervarea intregii proprietati ca unitate unica'),

          // ── Reguli de cazare (regula de business — doar Owner) ──
          props.userRole === 'owner' && h('div', { className: 'dsub-item', onClick: function() { props.onOpenBookingRules(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDECF\uFE0F'),
            h('span', { className: 'dsub-lbl' }, 'Reguli de cazare')
          ),

          // ── Preturi / link rezervare ──
          h('div', { className: 'dsub-item', style: { justifyContent: 'space-between' }, onClick: function() { props.onOpenPrices(); props.onClose(); } },
            h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              h('span', { style: { fontSize: 15 } }, '\uD83D\uDD17'),
              h('span', { className: 'dsub-lbl' }, 'Preturi / Link rezervare')
            ),
            props.pendingCount > 0 && h('span', { className: 'dbdg' }, props.pendingCount)
          ),

          // ── Sincronizari ──
          h('div', { className: 'dsub-item' + (accordionOpen === 'sync' ? ' on' : ''), onClick: function() { toggleAccordion('sync'); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDD04'),
            h('span', { className: 'dsub-lbl' }, 'Sincronizari (' + connectedPlatforms.length + ')'),
            h('span', { className: 'darr', style: { marginLeft: 'auto' } }, accordionOpen === 'sync' ? '\u2303' : '\u2304')
          ),
          accordionOpen === 'sync' && h('div', { style: { paddingLeft: 20 } },
            SYNC_PLATFORMS.map(function(p) {
              var connected = connectedPlatforms.some(function(cp) { return cp.id === p.id; });
              return h('div', { key: p.id, className: 'dsub-item', style: { justifyContent: 'space-between', paddingLeft: 24 }, onClick: function() { props.onOpenIcal(); props.onClose(); } },
                h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                  h('span', { style: { fontSize: 14 } }, p.icon),
                  h('span', { className: 'dsub-lbl' }, p.name)
                ),
                h('span', { style: { fontSize: 10, fontWeight: 700, color: connected ? '#16a34a' : '#94a3b8' } }, connected ? 'Conectat' : 'Neconectat')
              );
            }),
            h('div', { className: 'dsub-item', style: { color: '#2563eb', fontWeight: 700, paddingLeft: 24 }, onClick: function() { props.onOpenIcal(); props.onClose(); } },
              h('span', { style: { fontSize: 14 } }, '\u2699\uFE0F'),
              h('span', { className: 'dsub-lbl' }, 'Gestioneaza sincronizarile')
            )
          )
        ),

        // ══════════ CATEGORIA 4: CONT SI FACTURARE ══════════
        catHeader('account', '\uD83D\uDC64', 'Cont si facturare'),
        openCategory === 'account' && h('div', { className: 'dexp' },
          props.userRole === 'owner' && h('div', { style: { padding: '8px 18px 4px' } },
            h('span', { style: { fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: '#eff6ff', color: '#1e40af' } }, 'Plan ' + (PLAN_LABELS[props.plan] || props.plan))
          ),
          props.userRole === 'owner' && h('div', { className: 'dsub-item', onClick: function() { props.onOpenPensionSettings(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83C\uDFE1'),
            h('span', { className: 'dsub-lbl' }, props.pensionName || 'Numeste pensiunea')
          ),
          props.userRole === 'owner' && h('div', { className: 'dsub-item', onClick: function() { props.onOpenPresentation(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83C\uDF10'),
            h('span', { className: 'dsub-lbl' }, 'Pagina de prezentare')
          ),
          h('div', { className: 'dsub-item', onClick: function() { props.onOpenAccountSettings(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDC64'),
            h('span', { className: 'dsub-lbl' }, props.userEmail || 'Cont')
          ),
          props.userRole === 'owner' && h('div', { className: 'dsub-item', style: { justifyContent: 'space-between' }, onClick: function() { props.onOpenTeam(); props.onClose(); } },
            h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              h('span', { style: { fontSize: 15 } }, '\uD83D\uDC65'),
              h('span', { className: 'dsub-lbl' }, 'Echipa')
            ),
            h('span', { style: { fontSize: 11, fontWeight: 700, color: '#64748b' } }, props.accountCount + '/' + (PLAN_LIMITS[props.plan] || 1))
          ),
          props.userRole === 'owner' && h('div', { className: 'dsub-item', onClick: function() { props.onOpenBillingInfo(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83E\uDDFE'),
            h('span', { className: 'dsub-lbl' }, props.billingInfo
              ? (props.billingInfo.type === 'pj' ? (props.billingInfo.companyName || 'Date facturare') : (props.billingInfo.fullName || 'Date facturare'))
              : 'Date facturare')
          ),
          h('div', { className: 'dsub-item', onClick: function() { props.onOpenPdf(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDDA8'),
            h('span', { className: 'dsub-lbl' }, 'Descarca / Tipareste PDF')
          )
        ),

        // ══════════ CATEGORIA 5: AJUTOR ══════════
        catHeader('help', '\u2753', 'Ajutor'),
        openCategory === 'help' && h('div', { className: 'dexp' },
          h('div', { className: 'dsub-item', onClick: function() { props.onOpenGuide(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\uD83D\uDCD6'),
            h('span', { className: 'dsub-lbl' }, 'Ghid de pornire')
          ),
          h('div', { className: 'dsub-item', style: { justifyContent: 'space-between' }, onClick: function() { props.onOpenSupportChat(); props.onClose(); } },
            h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              h('span', { style: { fontSize: 15 } }, '\uD83D\uDCAC'),
              h('span', { className: 'dsub-lbl' }, 'Chat suport')
            ),
            props.hasUnreadSupport && h('span', { style: { width: 9, height: 9, borderRadius: '50%', background: '#dc2626', flexShrink: 0 } })
          )
        )
      )
    )
  );
}



// ── ICAL CONSTANTS ───────────────────────────────────────────────────────────
// Linkurile iCal per camera, per platforma (editabile din drawer)
var ICAL_PROXY = '/.netlify/functions/ical-proxy?url=';
var DEF_ICAL_LINKS = {
  'Camera 1': 'https://ical.booking.com/v1/export?t=b68efa81-896c-4473-a559-aeeabfabfead',
  'Camera 2': 'https://ical.booking.com/v1/export?t=abf92e7c-f1e0-4578-811f-52024428fadd',
  'Camera 3': 'https://ical.booking.com/v1/export?t=a439eb0c-32b4-411f-82d5-3bf62aaaba24',
  'Camera 4': 'https://ical.booking.com/v1/export?t=dfa8919e-6d67-4a0a-9b73-facc06f25323'
};

// Platforme suportate pentru sincronizare iCal
var SYNC_PLATFORMS = [
  { id: 'booking', name: 'Booking.com', icon: '🔵', color: '#003580', importLabel: 'Calendar → Sync calendar → Import calendar', host: 'admin.booking.com' },
  { id: 'airbnb', name: 'Airbnb', icon: '🔴', color: '#FF385C', importLabel: 'Calendar → Availability → Import calendar', host: 'airbnb.com/hosting' },
  { id: 'other', name: 'Alta platforma (iCal generic)', icon: '🟣', color: '#7c3aed', importLabel: 'Cauta sectiunea "Sync calendar" sau "iCal"', host: '' }
];

// ── ICAL PARSER ──────────────────────────────────────────────────────────────
function parseIcal(text) {
  var events = [];
  // Normalize line endings
  var lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // RFC 5545 line unfolding: continuation lines start with space or tab
  lines = lines.replace(/\n[ \t]/g, '');
  var parts = lines.split('\n');
  var inEvent = false;
  var ev = {};
  for (var i = 0; i < parts.length; i++) {
    var line = parts[i].trim();
    if (line === 'BEGIN:VEVENT') { inEvent = true; ev = {}; continue; }
    if (line === 'END:VEVENT') {
      if (inEvent && ev.dtstart && ev.dtend) events.push(ev);
      inEvent = false; ev = {}; continue;
    }
    if (!inEvent) continue;
    var colon = line.indexOf(':');
    if (colon < 0) continue;
    // Key can have parameters: DTSTART;VALUE=DATE → key=DTSTART
    var keyFull = line.slice(0, colon);
    var key = keyFull.split(';')[0].toUpperCase();
    var val = line.slice(colon + 1).trim();
    // Unescape iCal text
    var uval = val.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
    if (key === 'DTSTART')      ev.dtstart     = val.replace(/T.*/,'').replace(/-/g,'').slice(0,8);
    if (key === 'DTEND')        ev.dtend       = val.replace(/T.*/,'').replace(/-/g,'').slice(0,8);
    if (key === 'SUMMARY')      ev.summary     = uval;
    if (key === 'UID')          ev.uid         = val;
    if (key === 'STATUS')       ev.status      = val.toUpperCase();      // CONFIRMED, TENTATIVE, CANCELLED
    if (key === 'DESCRIPTION')  ev.description = uval;
    if (key === 'CATEGORIES')   ev.categories  = uval.toUpperCase();     // RESERVATION, UNAVAILABLE etc
    if (key === 'TRANSP')       ev.transp      = val.toUpperCase();      // OPAQUE, TRANSPARENT
    if (key === 'COMMENT')      ev.comment     = uval;
    if (key === 'URL')          ev.url         = val;
  }
  return events;
}

// Convert YYYYMMDD → YYYY-MM-DD
function icalDate(s) {
  if (!s || s.length < 8) return '';
  return s.slice(0,4) + '-' + s.slice(4,6) + '-' + s.slice(6,8);
}

// Detect reservation type from Booking.com iCal event
// Returns: { status, firstName, lastName, comments, bookingRef }
function classifyBookingEvent(ev) {
  var summary = (ev.summary || '').trim();
  var summaryLow = summary.toLowerCase();
  var categories = (ev.categories || '').toUpperCase();
  var icalStatus = (ev.status || 'CONFIRMED').toUpperCase();

  // Extract Booking.com reservation ID from description or URL
  var bookingRef = '';
  if (ev.description) {
    var refMatch = ev.description.match(/(\d{7,12})/);
    if (refMatch) bookingRef = refMatch[1];
  }
  if (!bookingRef && ev.url) {
    var urlMatch = ev.url.match(/(\d{7,12})/);
    if (urlMatch) bookingRef = urlMatch[1];
  }

  // 1. CANCELLED event → skip (will be removed from Firebase)
  if (icalStatus === 'CANCELLED') {
    return { type: 'cancelled' };
  }

  // 2. Blocked / Closed / Unavailable patterns
  var blockedPatterns = [
    /^closed/i,
    /^blocked/i,
    /^blocat/i,
    /^not available/i,
    /^unavailable/i,
    /^owner block/i,
    /^maintenance/i,
    /^renovare/i,
    /^inchis/i,
    /^airbnb \(not available\)/i
  ];
  var isBlocked = blockedPatterns.some(function(p) { return p.test(summary); });
  isBlocked = isBlocked || categories.indexOf('UNAVAILABLE') >= 0;

  if (isBlocked) {
    // Extract reason after "CLOSED -" or "BLOCKED -"
    var reason = summary.replace(/^(closed|blocked|blocat|not available|unavailable|owner block|maintenance|renovare|inchis)\s*[-–]?\s*/i, '').trim();
    return {
      type: 'blocked',
      status: 'blocked',
      firstName: 'BLOCAT',
      lastName: reason || '',
      comments: 'Blocat in Booking.com' + (reason ? ': ' + reason : ''),
      bookingRef: bookingRef
    };
  }

  // 3. Actual reservation
  // Summary is usually "Firstname Lastname" or just "Firstname"
  // Sometimes: "Booking.com - Firstname Lastname"
  var cleanName = summary
    .replace(/^booking\.com\s*[-–]\s*/i, '')
    .replace(/^rezervare\s*[-–]\s*/i, '')
    .trim();
  var nameParts = cleanName.split(/\s+/);
  var firstName = nameParts[0] || 'Oaspete';
  var lastName = nameParts.slice(1).join(' ') || '';

  // Build comments: include booking ref and description
  var commentParts = [];
  if (bookingRef) commentParts.push('Booking ID: ' + bookingRef);
  if (ev.description) {
    var descClean = ev.description.replace(/\n/g,' ').trim().slice(0,200);
    // Don't add description if it's just the booking number we already have
    if (descClean && descClean !== bookingRef && descClean !== 'Booking ID: ' + bookingRef) {
      // Remove the booking ref from description to avoid duplication
      descClean = descClean.replace(bookingRef, '').trim().replace(/^[-:\s]+/, '').trim();
      if (descClean) commentParts.push(descClean);
    }
  }

  return {
    type: 'reservation',
    status: 'occupied',
    firstName: firstName,
    lastName: lastName,
    comments: commentParts.join(' | ') || 'Importat din Booking.com',
    bookingRef: bookingRef
  };
}

// Fetch one iCal link and return parsed events
function fetchIcal(url) {
  var proxyUrl = ICAL_PROXY + encodeURIComponent(url);
  return fetch(proxyUrl)
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function(text) { return parseIcal(text); })
    .catch(function(e) { console.error('iCal fetch error', e); return []; });
}

// Sync Booking iCal into Firebase reservations for a given room
function syncIcalRoom(room, icalUrl, existingRes, fbPush, fbSet, fbRemove) {
  return fetchIcal(icalUrl).then(function(events) {
    var promises = [];

    // Find existing iCal-imported reservations for this room
    var existingBooking = existingRes.filter(function(r) {
      return r.room === room && r.source === 'Booking' && r.icalUid;
    });
    var existingByUid = {};
    existingBooking.forEach(function(r) { existingByUid[r.icalUid] = r; });

    // Process incoming events
    var incomingUids = [];
    events.forEach(function(ev) {
      if (!ev.uid) return;

      var checkIn  = icalDate(ev.dtstart);
      var checkOut = icalDate(ev.dtend);
      if (!checkIn || !checkOut) return;

      var ci = new Date(checkIn), co = new Date(checkOut);
      var nights = Math.round((co - ci) / 86400000);
      if (nights <= 0) return;

      var classified = classifyBookingEvent(ev);

      // Skip cancelled events (they'll be removed below)
      if (classified.type === 'cancelled') return;

      incomingUids.push(ev.uid);

      var resData = {
        room: room,
        firstName: classified.firstName,
        lastName: classified.lastName || '',
        checkIn: checkIn,
        nights: nights,
        source: 'Booking',
        status: classified.status,
        icalUid: ev.uid,
        pricePerNight: 0,
        advance: 0,
        phone: '',
        comments: classified.comments,
        bookingRef: classified.bookingRef || '',
        updatedAt: Date.now()
      };

      var existing = existingByUid[ev.uid];
      if (existing) {
        // Update if dates or status changed
        var changed = existing.checkIn !== checkIn ||
                      existing.nights !== nights ||
                      existing.status !== classified.status ||
                      existing.firstName !== classified.firstName;
        if (changed) {
          resData.createdAt = existing.createdAt || Date.now();
          promises.push(fbSet('reservations/' + existing.id, resData));
        }
      } else {
        // New event — insert
        resData.createdAt = Date.now();
        promises.push(fbPush('reservations', resData));
      }
    });

    // Remove events that no longer exist in Booking (cancelled or deleted)
    existingBooking.forEach(function(r) {
      if (incomingUids.indexOf(r.icalUid) < 0) {
        promises.push(fbRemove('reservations/' + r.id));
      }
    });

    return Promise.all(promises).then(function() {
      return {
        added: incomingUids.filter(function(uid) { return !existingByUid[uid]; }).length,
        removed: existingBooking.filter(function(r) { return incomingUids.indexOf(r.icalUid) < 0; }).length,
        total: incomingUids.length
      };
    });
  });
}

// Generate iCal export string from all reservations
function generateIcal(reservations) {
  var lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rezervari Pensiune//RO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  reservations.forEach(function(r) {
    if (!r.checkIn || !r.nights) return;
    var dtstart = r.checkIn.replace(/-/g, '');
    var dtend = addDays(r.checkIn, r.nights).replace(/-/g, '');
    var uid = (r.id || r.checkIn) + '@pensiune';
    var summary = fullName(r) + ' - ' + r.room + ' (' + (r.source || '') + ')';
    lines = lines.concat([
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTART;VALUE=DATE:' + dtstart,
      'DTEND;VALUE=DATE:' + dtend,
      'SUMMARY:' + summary,
      'END:VEVENT'
    ]);
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ── ICAL MANAGER COMPONENT ───────────────────────────────────────────────────
function ICalMgr(props) {
  var rooms = props.rooms, reservations = props.reservations, onClose = props.onClose;

  var BASE_URL = window.location.origin;
  var EXPORT_BASE = BASE_URL + '/.netlify/functions/ical-export';

  // Linkuri de import, separate per platforma: { booking: {Camera1:..}, airbnb: {...}, other: {...} }
  var initLinks = function() {
    var saved = lc.get('ical_links_v2', null);
    if (saved) return saved;
    // Migrare din formatul vechi (doar booking)
    var oldLinks = lc.get('ical_links', {});
    var links = { booking: {}, airbnb: {}, other: {} };
    rooms.forEach(function(r) {
      links.booking[r] = oldLinks[r] || DEF_ICAL_LINKS[r] || '';
      links.airbnb[r] = '';
      links.other[r] = '';
    });
    return links;
  };
  var lks = useState(initLinks);
  var links = lks[0], setLinks = lks[1];
  var ss = useState('idle'); var syncState = ss[0], setSyncState = ss[1];
  var sm = useState(''); var syncMsg = sm[0], setSyncMsg = sm[1];
  var ts = useState('import'); var activeTab = ts[0], setActiveTab = ts[1];
  var pf = useState('booking'); var platform = pf[0], setPlatform = pf[1];
  var cp = useState(''); var copied = cp[0], setCopied = cp[1];

  var curPlatform = SYNC_PLATFORMS.filter(function(p) { return p.id === platform; })[0];

  function saveLinks() { lc.set('ical_links_v2', links); }

  function setLink(plat, room, val) {
    var nl = Object.assign({}, links);
    nl[plat] = Object.assign({}, nl[plat]);
    nl[plat][room] = val;
    setLinks(nl);
  }

  function isConnected(plat) {
    return rooms.some(function(r) { return links[plat] && links[plat][r]; });
  }

  function handleSync() {
    saveLinks();
    setSyncState('syncing');
    setSyncMsg('Se importa rezervarile din ' + curPlatform.name + '...');
    var totalAdded = 0, totalRemoved = 0, totalEvents = 0;
    var plLinks = links[platform] || {};
    var promises = rooms.map(function(room) {
      var url = plLinks[room];
      if (!url) return Promise.resolve();
      return syncIcalRoom(room, url, reservations, fb.push, fb.set, fb.remove)
        .then(function(result) {
          if (result) {
            totalAdded += result.added;
            totalRemoved += result.removed;
            totalEvents += result.total;
          }
        });
    });
    Promise.all(promises).then(function() {
      setSyncState('done');
      setSyncMsg(
        '\u2713 Sincronizare finalizata!\n' +
        totalEvents + ' evenimente ' + curPlatform.name + ' | ' +
        totalAdded + ' adaugate | ' +
        totalRemoved + ' sterse (anulate)'
      );
    }).catch(function(e) {
      setSyncState('error');
      setSyncMsg('Eroare: ' + e.message);
    });
  }

  function copyLink(txt) {
    navigator.clipboard.writeText(txt).then(function() {
      setCopied(txt);
      setTimeout(function() { setCopied(''); }, 2000);
    }).catch(function() {
      var el = document.createElement('textarea');
      el.value = txt; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(txt);
      setTimeout(function() { setCopied(''); }, 2000);
    });
  }

  var tabStyle = function(active) { return {
    flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    background: active ? '#fff' : 'none',
    color: active ? '#2563eb' : '#64748b',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
    border: 'none', cursor: 'pointer'
  }; };

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDD04 Sincronizari platforme'),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },

        // ── SELECTOR PLATFORMA ──
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 } }, 'Alege platforma:'),
        h('div', { style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' } },
          SYNC_PLATFORMS.map(function(p) {
            var active = platform === p.id;
            var connected = isConnected(p.id);
            return h('button', {
              key: p.id,
              onClick: function() { setPlatform(p.id); setSyncState('idle'); },
              style: {
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderRadius: 10,
                border: active ? ('2px solid ' + p.color) : '2px solid #e2e8f0',
                background: active ? (p.color + '0d') : '#fff',
                color: active ? p.color : '#475569',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', position: 'relative'
              }
            },
              h('span', null, p.icon),
              h('span', null, p.name),
              connected && h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: '#16a34a', marginLeft: 2 } })
            );
          })
        ),

        // Status conectare platforma curenta
        h('div', { style: {
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, marginBottom: 14,
          background: isConnected(platform) ? '#f0fdf4' : '#f8fafc',
          border: '1.5px solid ' + (isConnected(platform) ? '#bbf7d0' : '#e2e8f0'),
          fontSize: 12, fontWeight: 700,
          color: isConnected(platform) ? '#16a34a' : '#94a3b8'
        } },
          h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: isConnected(platform) ? '#16a34a' : '#cbd5e1' } }),
          isConnected(platform) ? (curPlatform.name + ' conectat - cel putin o camera are link configurat') : (curPlatform.name + ' neconectat - adauga linkuri mai jos')
        ),

        // Tab switcher Import / Export
        h('div', { style: { display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2, marginBottom: 16 } },
          h('button', { style: tabStyle(activeTab === 'import'), onClick: function() { setActiveTab('import'); } }, '\uD83D\uDD04 Import din ' + curPlatform.name),
          h('button', { style: tabStyle(activeTab === 'export'), onClick: function() { setActiveTab('export'); } }, '\uD83D\uDCE4 Export spre ' + curPlatform.name)
        ),

        // ── IMPORT TAB ──
        activeTab === 'import' && h('div', null,
          h('div', { className: 'ibox', style: { marginBottom: 14 } },
            '\uD83D\uDD04 ' + curPlatform.name + ' trimite rezervarile spre aplicatie prin link iCal.',
            h('br'), 'Apasa "Importa acum" pentru a sincroniza manual.',
            platform === 'other' && h(Fragment, null, h('br'), h('i', null, 'Functioneaza cu orice platforma care ofera export iCal standard (.ics).'))
          ),
          h('div', { style: { marginBottom: 14 } },
            h('div', { style: { fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 } }, 'Linkuri iCal ' + curPlatform.name + ' per camera:'),
            rooms.map(function(room) {
              return h('div', { key: room, style: { marginBottom: 10 } },
                h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, room),
                h('input', {
                  className: 'finp', style: { fontSize: 13 },
                  value: (links[platform] && links[platform][room]) || '',
                  placeholder: platform === 'booking' ? 'https://ical.booking.com/v1/export?t=...' : platform === 'airbnb' ? 'https://www.airbnb.com/calendar/ical/...' : 'https://...ics',
                  onChange: function(e) { setLink(platform, room, e.target.value); }
                })
              );
            })
          ),
          syncState !== 'idle' && h('div', {
            style: {
              padding: '10px 14px', borderRadius: 9, fontSize: 14, marginBottom: 14, whiteSpace: 'pre-line',
              background: syncState === 'done' ? '#f0fdf4' : syncState === 'error' ? '#fef2f2' : '#fffbeb',
              color: syncState === 'done' ? '#16a34a' : syncState === 'error' ? '#dc2626' : '#92400e',
              border: '1.5px solid ' + (syncState === 'done' ? '#bbf7d0' : syncState === 'error' ? '#fecaca' : '#fde68a')
            }
          }, syncMsg),
          h('button', {
            style: { width: '100%', padding: '13px', background: syncState === 'syncing' ? '#94a3b8' : curPlatform.color, color: '#fff', borderRadius: 11, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer' },
            disabled: syncState === 'syncing',
            onClick: handleSync
          }, syncState === 'syncing' ? '\u23F3 Se importa...' : '\uD83D\uDD04 Importa acum din ' + curPlatform.name)
        ),

        // ── EXPORT TAB ──
        activeTab === 'export' && h('div', null,
          h('div', { className: 'ibox', style: { marginBottom: 14 } },
            '\uD83D\uDCE4 ' + curPlatform.name + ' citeste aceste linkuri si blocheaza automat zilele ocupate.',
            h('br'), h('strong', null, 'Copiaza linkul fiecarei camere si adauga-l in ' + curPlatform.name + '.')
          ),

          h('div', { style: { background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#92400e', lineHeight: 1.6 } },
            h('b', null, '\uD83D\uDCCB Cum adaugi in ' + curPlatform.name + ':'), h('br'),
            curPlatform.host && h(Fragment, null, '1. Mergi la ', h('b', null, curPlatform.host), h('br')),
            (curPlatform.host ? '2. ' : '1. ') + curPlatform.importLabel, h('br'),
            (curPlatform.host ? '3' : '2') + '. Lipeste linkul camerei respective', h('br'),
            (curPlatform.host ? '4' : '3') + '. Sincronizarea se actualizeaza automat la fiecare \u223C2 ore'
          ),

          rooms.map(function(room) {
            var exportUrl = EXPORT_BASE + '?room=' + encodeURIComponent(room) + '&platform=' + platform;
            var isCopied = copied === exportUrl;
            return h('div', { key: room, style: { marginBottom: 14, background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1.5px solid #e2e8f0' } },
              h('div', { style: { fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 } }, '\uD83D\uDEAA ' + room),
              h('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
                h('input', {
                  className: 'finp',
                  style: { fontSize: 12, color: '#64748b', background: '#fff', flex: 1 },
                  readOnly: true,
                  value: exportUrl,
                  onFocus: function(e) { e.target.select(); }
                }),
                h('button', {
                  style: {
                    padding: '10px 14px', borderRadius: 9, fontWeight: 700, fontSize: 13,
                    background: isCopied ? '#16a34a' : curPlatform.color, color: '#fff',
                    border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
                  },
                  onClick: function() { copyLink(exportUrl); }
                }, isCopied ? '\u2713 Copiat!' : '\uD83D\uDCCB Copiaza')
              )
            );
          }),

          h('div', { style: { marginBottom: 14, background: '#eff6ff', borderRadius: 10, padding: '12px 14px', border: '1.5px solid #bfdbfe' } },
            h('div', { style: { fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 } }, '\uD83C\uDFE0 Toate camerele (link general)'),
            h('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
              h('input', {
                className: 'finp',
                style: { fontSize: 12, color: '#64748b', background: '#fff', flex: 1 },
                readOnly: true,
                value: EXPORT_BASE + '?platform=' + platform,
                onFocus: function(e) { e.target.select(); }
              }),
              h('button', {
                style: {
                  padding: '10px 14px', borderRadius: 9, fontWeight: 700, fontSize: 13,
                  background: copied === (EXPORT_BASE + '?platform=' + platform) ? '#16a34a' : curPlatform.color, color: '#fff',
                  border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
                },
                onClick: function() { copyLink(EXPORT_BASE + '?platform=' + platform); }
              }, copied === (EXPORT_BASE + '?platform=' + platform) ? '\u2713 Copiat!' : '\uD83D\uDCCB Copiaza')
            )
          ),

          h('div', { style: { background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#991b1b', lineHeight: 1.6 } },
            h('b', null, '\u26A0\uFE0F Configurare necesara (o singura data):'), h('br'),
            'In Netlify \u2192 Site settings \u2192 ', h('b', null, 'Environment variables'), ' \u2192 Add variable:', h('br'),
            h('code', { style: { background: '#fee2e2', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 } },
              'FIREBASE_DB_URL = https://master-rezervari-default-rtdb.europe-west1.firebasedatabase.app'
            )
          )
        ),

        // ── NOTA API OFICIAL ──
        h('div', { style: { marginTop: 18, background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, color: '#5b21b6', lineHeight: 1.6 } },
          h('b', null, '\u2139\uFE0F Despre sincronizare iCal vs. API oficial:'), h('br'),
          'Aceasta metoda (iCal) sincronizeaza disponibilitatea la fiecare \u223C2 ore, gratuit, fara aprobare. ',
          'Pentru sincronizare instant + preturi + mesagerie cu oaspeti, ' + curPlatform.name + ' ofera un API oficial, dar necesita inrolare ca Channel Manager certificat (proces separat, de obicei pentru companii cu portofolii mari de proprietati).'
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', style: { flex: 1 }, onClick: onClose }, 'Inchide')
      )
    )
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
// ── PENSION SETTINGS (nume + fotografie generala) ───────────────────────────
// Fotografia principala (pensionPhoto) e redimensionata client-side si salvata ca Base64
// in Firebase Realtime DB (istoric, dinainte de Storage) — o limitam la o latura maxima
// rezonabila ca sa nu depasim limitele de marime ale unei valori din DB.
var PENSION_PHOTO_MAX_DIM = 1280; // px, latura cea mai mare dupa resize
var PENSION_PHOTO_QUALITY = 0.78; // calitate JPEG la export
var PENSION_PHOTO_MAX_BYTES = 700 * 1024; // ~700KB prag de avertizare (Base64 e ~33% mai mare ca originalul)

// Galeria de prezentare (pana la 10 poze) foloseste Firebase STORAGE (fisiere reale, nu
// Base64 in DB) — 2 marimi per poza, generate client-side inainte de upload:
// - thumb: grila de previzualizare, incarcare rapida pe mobil
// - full: vizualizare marita la click
// Tinta: ~3-4MB total pentru toate cele 10 poze (ambele marimi), mult sub nivelul gratuit
// Firebase Storage (5GB).
var GALLERY_MAX_PHOTOS = 10;
var GALLERY_THUMB_DIM = 400; var GALLERY_THUMB_QUALITY = 0.7;
var GALLERY_FULL_DIM = 1600; var GALLERY_FULL_QUALITY = 0.8;

// Redimensioneaza o imagine la o latura maxima data, intoarce un Blob JPEG (pentru upload
// in Storage) — spre deosebire de resizeImageToBase64 (care intoarce text, pentru DB).
function resizeImageToBlob(file, maxDim, quality) {
  return new Promise(function(resolve, reject) {
    if (!file) { reject(new Error('Niciun fisier selectat')); return; }
    if (!/^image\//.test(file.type)) { reject(new Error('Fisierul trebuie sa fie o imagine (jpg, png, webp)')); return; }
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('Nu am putut citi fisierul')); };
    reader.onload = function(e) {
      var img = new Image();
      img.onerror = function() { reject(new Error('Fisierul nu e o imagine valida')); };
      img.onload = function() {
        var w = img.width, h = img.height;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var tw = Math.round(w * scale), th = Math.round(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = tw; canvas.height = th;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, tw, th);
        canvas.toBlob(function(blob) {
          if (!blob) { reject(new Error('Nu am putut procesa imaginea')); return; }
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Incarca o poza noua in galerie: genereaza thumb+full, le urca in Firebase Storage sub
// pensions/{id}/gallery/{photoId}_thumb.jpg si _full.jpg, intoarce URL-urile publice.
function uploadGalleryPhoto(file, pensionId) {
  var photoId = 'g' + Date.now() + Math.random().toString(36).slice(2, 8);
  var storage = firebase.storage();
  return Promise.all([
    resizeImageToBlob(file, GALLERY_THUMB_DIM, GALLERY_THUMB_QUALITY),
    resizeImageToBlob(file, GALLERY_FULL_DIM, GALLERY_FULL_QUALITY)
  ]).then(function(blobs) {
    var thumbRef = storage.ref('pensions/' + pensionId + '/gallery/' + photoId + '_thumb.jpg');
    var fullRef = storage.ref('pensions/' + pensionId + '/gallery/' + photoId + '_full.jpg');
    return Promise.all([
      thumbRef.put(blobs[0]).then(function() { return thumbRef.getDownloadURL(); }),
      fullRef.put(blobs[1]).then(function() { return fullRef.getDownloadURL(); })
    ]);
  }).then(function(urls) {
    return { id: photoId, thumbUrl: urls[0], fullUrl: urls[1] };
  });
}

function deleteGalleryPhoto(photo, pensionId) {
  var storage = firebase.storage();
  return Promise.all([
    storage.ref('pensions/' + pensionId + '/gallery/' + photo.id + '_thumb.jpg').delete().catch(function(){}),
    storage.ref('pensions/' + pensionId + '/gallery/' + photo.id + '_full.jpg').delete().catch(function(){})
  ]);
}

function resizeImageToBase64(file) {
  return new Promise(function(resolve, reject) {
    if (!file) { reject(new Error('Niciun fisier selectat')); return; }
    if (!/^image\//.test(file.type)) { reject(new Error('Fisierul trebuie sa fie o imagine (jpg, png, webp)')); return; }
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('Nu am putut citi fisierul')); };
    reader.onload = function(e) {
      var img = new Image();
      img.onerror = function() { reject(new Error('Fisierul nu e o imagine valida')); };
      img.onload = function() {
        var w = img.width, h = img.height;
        var scale = Math.min(1, PENSION_PHOTO_MAX_DIM / Math.max(w, h));
        var tw = Math.round(w * scale), th = Math.round(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = tw; canvas.height = th;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, tw, th);
        var dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/jpeg', PENSION_PHOTO_QUALITY);
        } catch (err) {
          reject(new Error('Nu am putut procesa imaginea: ' + err.message));
          return;
        }
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function PensionSettings(props) {
  var onSave = props.onSave, onClose = props.onClose;
  var ns = useState(props.pensionName || ''); var name = ns[0], setName = ns[1];
  var phs = useState(props.pensionPhoto || ''); var photo = phs[0], setPhoto = phs[1];
  var prevs = useState(props.pensionPhoto || ''); var preview = prevs[0], setPreview = prevs[1];
  var bs = useState(false); var busy = bs[0], setBusy = bs[1];
  var es = useState(''); var err = es[0], setErr = es[1];
  var ss = useState(false); var saving = ss[0], setSaving = ss[1];

  function handleFile(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    setErr(''); setBusy(true);
    resizeImageToBase64(file)
      .then(function(dataUrl) {
        setPhoto(dataUrl);
        setPreview(dataUrl);
        setBusy(false);
      })
      .catch(function(e) {
        setErr(e.message);
        setBusy(false);
      });
    // permite re-selectarea aceluiasi fisier ulterior
    e.target.value = '';
  }

  function handleRemovePhoto() {
    setPhoto('');
    setPreview('');
  }

  function handleSave() {
    if (!name.trim()) { setErr('Introdu numele pensiunii'); return; }
    setErr(''); setSaving(true);
    onSave(name.trim(), photo)
      .then(function() { setSaving(false); onClose(); })
      .catch(function(e) { setSaving(false); setErr('Eroare la salvare: ' + e.message); });
  }

  var approxKb = photo ? Math.round((photo.length * 0.75) / 1024) : 0;

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83C\uDFE1 Setari Pensiune'),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },

        h('div', { className: 'ibox', style: { marginBottom: 14 } },
          'Numele si fotografia sunt vizibile in panoul de administrare. Fotografia se redimensioneaza automat pentru a ramane usor de incarcat.'
        ),

        err && h('div', { style: { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600 } }, err),

        h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Nume pensiune'),
        h('input', {
          className: 'finp', style: { marginBottom: 18 },
          value: name,
          placeholder: 'ex: Casuta cu Izvor',
          onChange: function(e) { setName(e.target.value); setErr(''); }
        }),

        h('label', { className: 'flbl', style: { marginBottom: 8, display: 'block' } }, 'Fotografie generala'),

        preview
          ? h('div', { style: { marginBottom: 12 } },
              h('img', { src: preview, style: { width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, border: '1.5px solid #e2e8f0', display: 'block' } }),
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 } },
                h('span', { style: { fontSize: 12, color: '#94a3b8' } }, approxKb > 0 ? ('\u2248 ' + approxKb + ' KB') : ''),
                h('button', { className: 'cbtn', style: { color: '#dc2626', fontSize: 13, fontWeight: 700 }, onClick: handleRemovePhoto }, '\uD83D\uDDD1\uFE0F Sterge fotografia')
              )
            )
          : h('div', { style: { border: '2px dashed #e2e8f0', borderRadius: 12, padding: '28px 14px', textAlign: 'center', color: '#94a3b8', marginBottom: 12 } },
              h('div', { style: { fontSize: 28, marginBottom: 6 } }, '\uD83D\uDDBC\uFE0F'),
              h('div', { style: { fontSize: 13 } }, 'Nicio fotografie incarcata')
            ),

        h('label', { style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px', borderRadius: 10, border: '1.5px solid #2563eb', color: '#2563eb',
          fontWeight: 700, fontSize: 14, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1
        } },
          busy ? '\u23F3 Se proceseaza...' : '\uD83D\uDCF7 ' + (preview ? 'Schimba fotografia' : 'Incarca fotografie'),
          h('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, disabled: busy, onChange: handleFile })
        ),

        photo && approxKb > Math.round(PENSION_PHOTO_MAX_BYTES / 1024) && h('div', { style: { marginTop: 10, fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 8, padding: '8px 12px' } },
          '\u26A0\uFE0F Fotografia e destul de mare (\u2248 ' + approxKb + ' KB). Poate incarca mai greu pe conexiuni slabe — recomandam o poza mai simpla daca observi probleme.'
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: onClose, disabled: saving }, 'Anuleaza'),
        h('button', { className: 'msave', onClick: handleSave, disabled: saving || busy }, saving ? 'Se salveaza...' : '\u2713 Salveaza')
      )
    )
  );
}

// ── EDITOR PAGINA DE PREZENTARE PUBLICA (galerie, descriere, facilitati, date legale) ──
function PresentationEditor(props) {
  var p = props.presentation || {};
  var ds = useState(p.description || ''); var description = ds[0], setDescription = ds[1];
  var cps = useState(p.contactPhone || ''); var contactPhone = cps[0], setContactPhone = cps[1];
  var ces = useState(p.contactEmail || ''); var contactEmail = ces[0], setContactEmail = ces[1];
  var sts = useState(p.structureType || 'Pensiune'); var structureType = sts[0], setStructureType = sts[1];
  var mls = useState(p.mapLink || ''); var mapLink = mls[0], setMapLink = mls[1];
  var cis = useState(p.checkInTime || '14:00'); var checkInTime = cis[0], setCheckInTime = cis[1];
  var cos = useState(p.checkOutTime || '11:00'); var checkOutTime = cos[0], setCheckOutTime = cos[1];
  var ccs = useState(p.classificationCert || ''); var classificationCert = ccs[0], setClassificationCert = ccs[1];
  var sis = useState(p.siturId || ''); var siturId = sis[0], setSiturId = sis[1];
  var ams = useState(p.amenities || {}); var amenities = ams[0], setAmenities = ams[1];
  var gls = useState(p.gallery || []); var gallery = gls[0], setGallery = gls[1];
  var ups = useState(false); var uploading = ups[0], setUploading = ups[1];
  var ues = useState(''); var uploadErr = ues[0], setUploadErr = ues[1];
  var svs = useState(false); var saving = svs[0], setSaving = svs[1];
  var ers = useState(''); var err = ers[0], setErr = ers[1];

  function toggleAmenity(id) {
    setAmenities(Object.assign({}, amenities, { [id]: !amenities[id] }));
  }

  function handleFiles(e) {
    var files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    var room = GALLERY_MAX_PHOTOS - gallery.length;
    if (room <= 0) { setUploadErr('Ai atins limita de ' + GALLERY_MAX_PHOTOS + ' poze. Sterge una ca sa adaugi alta.'); return; }
    var toUpload = files.slice(0, room);
    setUploadErr(''); setUploading(true);

    var chain = Promise.resolve();
    var uploaded = [];
    toUpload.forEach(function(file) {
      chain = chain.then(function() { return uploadGalleryPhoto(file, PENSION_ID); }).then(function(photo) { uploaded.push(photo); });
    });
    chain.then(function() {
      setGallery(gallery.concat(uploaded));
      setUploading(false);
      if (files.length > toUpload.length) setUploadErr('Doar primele ' + toUpload.length + ' poze au fost incarcate (limita de ' + GALLERY_MAX_PHOTOS + ').');
    }).catch(function(e) {
      setUploading(false);
      setUploadErr('Eroare la incarcare: ' + e.message);
    });
  }

  function removePhoto(photo) {
    setGallery(gallery.filter(function(g) { return g.id !== photo.id; }));
    deleteGalleryPhoto(photo, PENSION_ID).catch(function() {});
  }

  function handleSave() {
    setErr(''); setSaving(true);
    var data = {
      description: description.trim(), contactPhone: contactPhone.trim(), contactEmail: contactEmail.trim(),
      structureType: structureType, mapLink: mapLink.trim(), checkInTime: checkInTime, checkOutTime: checkOutTime,
      classificationCert: classificationCert.trim(), siturId: siturId.trim(),
      amenities: amenities, gallery: gallery
    };
    props.onSave(data).then(function() { setSaving(false); props.onClose(); })
      .catch(function(e) { setSaving(false); setErr('Eroare la salvare: ' + e.message); });
  }

  return h('div', { className: 'ov', onClick: props.onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83C\uDF10 Pagina de prezentare'),
        h('button', { className: 'mclose', onClick: props.onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },
        err && h('div', { style: { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600 } }, err),

        h('div', { className: 'ibox', style: { marginBottom: 16 } },
          'Aceste informatii apar pe pagina publica de prezentare a pensiunii, accesibila oricui are link-ul (Configurare \u2192 Preturi \u2192 tab Link).'
        ),

        // ── GALERIE FOTO ──
        h('div', { style: { fontSize: 15, fontWeight: 800, color: '#1e3a5f', marginBottom: 10 } }, '\uD83D\uDCF7 Galerie foto (' + gallery.length + '/' + GALLERY_MAX_PHOTOS + ')'),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8, marginBottom: 10 } },
          gallery.map(function(photo) {
            return h('div', { key: photo.id, style: { position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0' } },
              h('img', { src: photo.thumbUrl, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }),
              h('button', {
                style: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 7, background: 'rgba(220,38,38,.9)', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' },
                onClick: function() { removePhoto(photo); }
              }, '\u2715')
            );
          }),
          gallery.length < GALLERY_MAX_PHOTOS && h('label', {
            style: { aspectRatio: '1', borderRadius: 10, border: '2px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: 24 }
          }, uploading ? '\u23F3' : '+', h('input', { type: 'file', accept: 'image/*', multiple: true, style: { display: 'none' }, onChange: handleFiles, disabled: uploading }))
        ),
        uploadErr && h('div', { style: { fontSize: 12.5, color: '#dc2626', marginBottom: 14 } }, uploadErr),
        h('div', { style: { fontSize: 11.5, color: '#94a3b8', marginBottom: 20 } }, 'Pozele se redimensioneaza automat la incarcare — nu ocupa spatiu inutil.'),

        // ── DESCRIERE ──
        h(Field, { lbl: 'Descriere pensiune' },
          h('textarea', { className: 'finp', rows: 4, style: { resize: 'vertical' }, placeholder: 'Povesteste pe scurt ce ofera pensiunea ta...', value: description, onChange: function(e) { setDescription(e.target.value); } })
        ),

        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Tip structura' },
            h('select', { className: 'finp', value: structureType, onChange: function(e) { setStructureType(e.target.value); } },
              STRUCTURE_TYPES.map(function(t) { return h('option', { key: t, value: t }, t); })
            )
          ),
          h(Field, { lbl: 'Link Google Maps' }, h('input', { className: 'finp', placeholder: 'https://maps.google.com/...', value: mapLink, onChange: function(e) { setMapLink(e.target.value); } }))
        ),

        // ── CONTACT ──
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Telefon contact' }, h('input', { className: 'finp', placeholder: '07xx xxx xxx', value: contactPhone, onChange: function(e) { setContactPhone(e.target.value); } })),
          h(Field, { lbl: 'Email contact' }, h('input', { className: 'finp', type: 'email', placeholder: 'contact@pensiune.ro', value: contactEmail, onChange: function(e) { setContactEmail(e.target.value); } }))
        ),

        // ── ORE CHECK-IN/OUT ──
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Ora check-in' }, h('input', { className: 'finp', type: 'time', value: checkInTime, onChange: function(e) { setCheckInTime(e.target.value); } })),
          h(Field, { lbl: 'Ora check-out' }, h('input', { className: 'finp', type: 'time', value: checkOutTime, onChange: function(e) { setCheckOutTime(e.target.value); } }))
        ),

        // ── FACILITATI ──
        h('div', { style: { fontSize: 15, fontWeight: 800, color: '#1e3a5f', margin: '18px 0 10px' } }, '\u2728 Facilitati'),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 } },
          AMENITIES_LIST.map(function(a) {
            var active = !!amenities[a.id];
            return h('div', {
              key: a.id, onClick: function() { toggleAmenity(a.id); },
              style: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 10px', borderRadius: 9, cursor: 'pointer', background: active ? '#eff6ff' : '#f8fafc', border: '1.5px solid ' + (active ? '#93c5fd' : '#e2e8f0') }
            },
              h('span', { style: { fontSize: 15 } }, a.icon),
              h('span', { style: { fontSize: 12.5, fontWeight: 600, color: active ? '#1e40af' : '#64748b' } }, a.label)
            );
          })
        ),

        // ── DATE LEGALE (recomandate, nu obligatorii) ──
        h('div', { style: { fontSize: 15, fontWeight: 800, color: '#1e3a5f', marginBottom: 6 } }, '\uD83D\uDCC4 Date de conformitate (recomandate)'),
        h('div', { style: { fontSize: 12.5, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 } },
          'Din 2026, structurile de cazare trebuie sa aiba o pagina web cu date de identificare si numarul certificatului de clasificare. Aceste campuri nu blocheaza salvarea daca inca nu le ai.'
        ),
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Nr. certificat clasificare' }, h('input', { className: 'finp', placeholder: 'ex: 1234/2024', value: classificationCert, onChange: function(e) { setClassificationCert(e.target.value); } })),
          h(Field, { lbl: 'Cod SITUR / ROeID' }, h('input', { className: 'finp', placeholder: 'optional', value: siturId, onChange: function(e) { setSiturId(e.target.value); } }))
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: props.onClose, disabled: saving }, 'Anuleaza'),
        h('button', { className: 'msave', onClick: handleSave, disabled: saving || uploading }, saving ? 'Se salveaza...' : '\u2713 Salveaza')
      )
    )
  );
}


// Firebase cere reautentificare recenta pentru operatii sensibile (schimbare parola/email).
// Daca sesiunea e mai veche, updatePassword arunca auth/requires-recent-login — de aceea
// cerem parola curenta si reautentificam explicit inainte de orice schimbare.
function AccountSettings(props) {
  var onClose = props.onClose;
  var user = firebase.auth().currentUser;
  var email = (user && user.email) || '';

  var cps = useState(''); var curPass = cps[0], setCurPass = cps[1];
  var nps = useState(''); var newPass = nps[0], setNewPass = nps[1];
  var nps2 = useState(''); var newPass2 = nps2[0], setNewPass2 = nps2[1];
  var es = useState(''); var err = es[0], setErr = es[1];
  var sus = useState(''); var successMsg = sus[0], setSuccessMsg = sus[1];
  var ss = useState(false); var saving = ss[0], setSaving = ss[1];

  function errMsgLocal(code) {
    var m = {
      'auth/wrong-password': 'Parola curenta e gresita',
      'auth/invalid-credential': 'Parola curenta e gresita',
      'auth/weak-password': 'Parola noua trebuie sa aiba minim 6 caractere',
      'auth/requires-recent-login': 'Din motive de securitate, reintrodu parola curenta',
      'auth/too-many-requests': 'Prea multe incercari. Asteapta cateva minute.'
    };
    return m[code] || code;
  }

  function reauth(password) {
    var cred = firebase.auth.EmailAuthProvider.credential(email, password);
    return user.reauthenticateWithCredential(cred);
  }

  function handleChangePassword() {
    setErr(''); setSuccessMsg('');
    if (!curPass) { setErr('Introdu parola curenta'); return; }
    if (newPass.length < 6) { setErr('Parola noua trebuie sa aiba minim 6 caractere'); return; }
    if (newPass !== newPass2) { setErr('Parolele noi nu coincid'); return; }
    setSaving(true);
    reauth(curPass)
      .then(function() { return user.updatePassword(newPass); })
      .then(function() {
        setSaving(false);
        setSuccessMsg('Parola a fost schimbata cu succes.');
        setCurPass(''); setNewPass(''); setNewPass2('');
      })
      .catch(function(e) {
        setSaving(false);
        setErr(errMsgLocal(e.code) || ('Eroare: ' + e.message));
      });
  }

  function handleLogout() {
    if (confirm('Iesi din cont?')) {
      onClose();
      firebase.auth().signOut();
    }
  }

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83D\uDC64 Contul meu'),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },

        h('div', { className: 'ibox', style: { marginBottom: 18 } },
          'Autentificat ca ', h('b', null, email)
        ),

        h('div', { style: { fontSize: 14, fontWeight: 800, color: '#1e3a5f', marginBottom: 10 } }, 'Schimba parola'),

        err && h('div', { style: { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600 } }, err),
        successMsg && h('div', { style: { background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a', borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600 } }, successMsg),

        h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Parola curenta'),
        h('input', {
          className: 'finp', type: 'password', style: { marginBottom: 14 },
          value: curPass, autoComplete: 'current-password',
          onChange: function(e) { setCurPass(e.target.value); setErr(''); }
        }),

        h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Parola noua'),
        h('input', {
          className: 'finp', type: 'password', style: { marginBottom: 14 },
          value: newPass, autoComplete: 'new-password', placeholder: 'min 6 caractere',
          onChange: function(e) { setNewPass(e.target.value); setErr(''); }
        }),

        h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Confirma parola noua'),
        h('input', {
          className: 'finp', type: 'password', style: { marginBottom: 18 },
          value: newPass2, autoComplete: 'new-password',
          onChange: function(e) { setNewPass2(e.target.value); setErr(''); },
          onKeyDown: function(e) { if (e.key === 'Enter') handleChangePassword(); }
        }),

        h('button', {
          style: { width: '100%', padding: '13px', background: saving ? '#94a3b8' : '#2563eb', color: '#fff', borderRadius: 11, fontWeight: 800, fontSize: 15, border: 'none', cursor: saving ? 'default' : 'pointer', marginBottom: 22 },
          disabled: saving,
          onClick: handleChangePassword
        }, saving ? 'Se salveaza...' : '\u2713 Schimba parola'),

        h('div', { className: 'ddiv', style: { margin: '0 0 18px' } }),

        h('button', {
          style: { width: '100%', padding: '12px', background: 'transparent', color: '#dc2626', borderRadius: 10, fontWeight: 700, fontSize: 14, border: '1.5px solid #fecaca', cursor: 'pointer' },
          onClick: handleLogout
        }, '\uD83D\uDEAA Iesi din cont')
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', style: { flex: 1 }, onClick: onClose }, 'Inchide')
      )
    )
  );
}

// ── BILLING INFO (date firma/persoana, pregatire pentru facturare viitoare) ──
// IMPORTANT: aceasta sectiune NU emite facturi si NU proceseaza plati — doar colecteaza
// si stocheaza datele necesare pentru facturare, ca atunci cand se activeaza un provider
// de plati (Stripe/Smartbill etc, vezi roadmap SaaS) sa nu fie nevoie sa migram retroactiv
// utilizatorii existenti si sa le cerem din nou aceste date.

// Validare CNP: 13 cifre, cu cifra de control conform algoritmului oficial.
// Nu blocheaza salvarea daca esueaza — doar avertizeaza, ca sa nu frustram userul
// pe un caz marginal (CNP strain, format vechi etc).
// NOTA: isValidCNP si isValidCUI sunt definite in helpers.js (partajate cu checkin.html)

function BillingInfo(props) {
  var onSave = props.onSave, onClose = props.onClose;
  var initial = props.billingInfo || {};

  var tys = useState(initial.type || 'pf'); var entType = tys[0], setEntType = tys[1]; // 'pf' | 'pj'

  // Campuri comune
  var addrs = useState(initial.address || ''); var address = addrs[0], setAddress = addrs[1];
  var citys = useState(initial.city || ''); var city = citys[0], setCity = citys[1];
  var countys = useState(initial.county || ''); var county = countys[0], setCounty = countys[1];

  // Campuri PF
  var pfns = useState(initial.fullName || ''); var pfName = pfns[0], setPfName = pfns[1];
  var cnps = useState(initial.cnp || ''); var cnp = cnps[0], setCnp = cnps[1];

  // Campuri PJ
  var cnames = useState(initial.companyName || ''); var companyName = cnames[0], setCompanyName = cnames[1];
  var cuis = useState(initial.cui || ''); var cui = cuis[0], setCui = cuis[1];
  var regComs = useState(initial.regCom || ''); var regCom = regComs[0], setRegCom = regComs[1];
  var reprs = useState(initial.legalRep || ''); var legalRep = reprs[0], setLegalRep = reprs[1];

  var es = useState(''); var err = es[0], setErr = es[1];
  var ss = useState(false); var saving = ss[0], setSaving = ss[1];

  function handleSave() {
    setErr('');
    if (!address.trim() || !city.trim()) { setErr('Completeaza adresa si orasul'); return; }

    var data = { type: entType, address: address.trim(), city: city.trim(), county: county.trim() };

    if (entType === 'pf') {
      if (!pfName.trim()) { setErr('Introdu numele complet'); return; }
      if (cnp && !isValidCNP(cnp.trim())) { setErr('CNP-ul introdus nu pare valid. Verifica cifrele sau lasa campul gol.'); return; }
      data.fullName = pfName.trim();
      data.cnp = cnp.trim();
    } else {
      if (!companyName.trim()) { setErr('Introdu denumirea firmei'); return; }
      if (!cui.trim()) { setErr('Introdu CUI-ul firmei'); return; }
      if (!isValidCUI(cui.trim())) { setErr('CUI-ul introdus nu pare valid. Verifica cifrele (cu sau fara prefix RO).'); return; }
      data.companyName = companyName.trim();
      data.cui = cui.trim().toUpperCase();
      data.regCom = regCom.trim();
      data.legalRep = legalRep.trim();
    }

    setSaving(true);
    onSave(data)
      .then(function() { setSaving(false); onClose(); })
      .catch(function(e) { setSaving(false); setErr('Eroare la salvare: ' + e.message); });
  }

  var toggleBtnStyle = function(active) { return {
    flex: 1, padding: '11px 4px', borderRadius: 9, fontSize: 14, fontWeight: 700,
    background: active ? '#2563eb' : '#f1f5f9',
    color: active ? '#fff' : '#64748b',
    border: 'none', cursor: 'pointer'
  }; };

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      h('div', { className: 'mhdr' },
        h('span', { className: 'mtit' }, '\uD83E\uDDFE Date Facturare'),
        h('button', { className: 'mclose', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'mbody' },

        h('div', { className: 'ibox', style: { marginBottom: 18 } },
          'Aceste date vor fi folosite pentru emiterea facturilor de abonament, atunci cand functia de facturare va fi activata. Momentan nu se proceseaza nicio plata.'
        ),

        err && h('div', { style: { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 9, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 600 } }, err),

        // Toggle PF / PJ
        h('div', { style: { display: 'flex', gap: 8, marginBottom: 20 } },
          h('button', { style: toggleBtnStyle(entType === 'pf'), onClick: function() { setEntType('pf'); setErr(''); } }, '\uD83D\uDC64 Persoana fizica'),
          h('button', { style: toggleBtnStyle(entType === 'pj'), onClick: function() { setEntType('pj'); setErr(''); } }, '\uD83C\uDFE2 Persoana juridica (firma)')
        ),

        entType === 'pf'
          ? h('div', null,
              h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Nume si prenume'),
              h('input', { className: 'finp', style: { marginBottom: 14 }, value: pfName, placeholder: 'ex: Ion Popescu', onChange: function(e) { setPfName(e.target.value); setErr(''); } }),

              h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'CNP (optional)'),
              h('input', { className: 'finp', style: { marginBottom: 14 }, value: cnp, placeholder: '13 cifre', maxLength: 13, inputMode: 'numeric', onChange: function(e) { setCnp(e.target.value.replace(/\D/g, '')); setErr(''); } })
            )
          : h('div', null,
              h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Denumire firma'),
              h('input', { className: 'finp', style: { marginBottom: 14 }, value: companyName, placeholder: 'ex: Casa cu Dor SRL', onChange: function(e) { setCompanyName(e.target.value); setErr(''); } }),

              h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'CUI / CIF'),
              h('input', { className: 'finp', style: { marginBottom: 14 }, value: cui, placeholder: 'ex: RO12345678 sau 12345678', onChange: function(e) { setCui(e.target.value); setErr(''); } }),

              h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Nr. Registrul Comertului (optional)'),
              h('input', { className: 'finp', style: { marginBottom: 14 }, value: regCom, placeholder: 'ex: J40/1234/2020', onChange: function(e) { setRegCom(e.target.value); setErr(''); } }),

              h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Reprezentant legal (optional)'),
              h('input', { className: 'finp', style: { marginBottom: 14 }, value: legalRep, placeholder: 'ex: Ion Popescu, Administrator', onChange: function(e) { setLegalRep(e.target.value); setErr(''); } })
            ),

        h('div', { className: 'ddiv', style: { margin: '4px 0 18px' } }),

        h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Adresa (strada, numar)'),
        h('input', { className: 'finp', style: { marginBottom: 14 }, value: address, placeholder: 'ex: Str. Principala nr. 10', onChange: function(e) { setAddress(e.target.value); setErr(''); } }),

        h('div', { style: { display: 'flex', gap: 10, marginBottom: 4 } },
          h('div', { style: { flex: 1 } },
            h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Oras'),
            h('input', { className: 'finp', value: city, placeholder: 'ex: Brasov', onChange: function(e) { setCity(e.target.value); setErr(''); } })
          ),
          h('div', { style: { flex: 1 } },
            h('label', { className: 'flbl', style: { marginBottom: 4, display: 'block' } }, 'Judet'),
            h('input', { className: 'finp', value: county, placeholder: 'ex: Brasov', onChange: function(e) { setCounty(e.target.value); } })
          )
        )
      ),
      h('div', { className: 'mfoot' },
        h('button', { className: 'mcanc', onClick: onClose, disabled: saving }, 'Anuleaza'),
        h('button', { className: 'msave', onClick: handleSave, disabled: saving }, saving ? 'Se salveaza...' : '\u2713 Salveaza')
      )
    )
  );
}

function ArchiveTab(props) {
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;
  var ds = useState(null); var detailRes = ds[0], setDetailRes = ds[1];

  var sq = useState(''); var search = sq[0], setSearch = sq[1];
  var fr = useState('all'); var filterRoom = fr[0], setFilterRoom = fr[1];
  var fs = useState('all'); var filterSrc = fs[0], setFilterSrc = fs[1];
  var fy = useState('all'); var filterYear = fy[0], setFilterYear = fy[1];

  var today = todayStr();

  // Doar rezervarile trecute (checkout < azi)
  var past = useMemo(function() {
    return reservations.filter(function(r) {
      return r.checkIn && addDays(r.checkIn, r.nights || 0) < today;
    });
  }, [reservations, today]);

  // Lista anilor disponibili in istoric
  var years = useMemo(function() {
    var set = new Set();
    past.forEach(function(r) { if (r.checkIn) set.add(r.checkIn.slice(0, 4)); });
    return Array.from(set).sort().reverse();
  }, [past]);

  // Filtrare
  var filtered = useMemo(function() {
    var s = search.trim().toLowerCase();
    return past.filter(function(r) {
      if (filterRoom !== 'all' && r.room !== filterRoom) return false;
      if (filterSrc !== 'all' && r.source !== filterSrc) return false;
      if (filterYear !== 'all' && (!r.checkIn || r.checkIn.slice(0,4) !== filterYear)) return false;
      if (s) {
        var name = fullName(r).toLowerCase();
        var phone = (r.phone || '').toLowerCase();
        var comm = (r.comments || '').toLowerCase();
        if (name.indexOf(s) < 0 && phone.indexOf(s) < 0 && comm.indexOf(s) < 0) return false;
      }
      return true;
    }).sort(function(a, b) {
      // cele mai recente primele
      return (a.checkIn || '') > (b.checkIn || '') ? -1 : 1;
    });
  }, [past, search, filterRoom, filterSrc, filterYear]);

  // Statistici sumar pe rezultatele filtrate
  var totals = useMemo(function() {
    var rev = 0, adv = 0, nts = 0;
    filtered.forEach(function(r) {
      var t = (r.pricePerNight || 0) * (r.nights || 0);
      rev += t; adv += (r.advance || 0); nts += (r.nights || 0);
    });
    return { rev: rev, adv: adv, nts: nts, rest: rev - adv };
  }, [filtered]);

  return h('div', { className: 'page' },
    // Header info
    h('div', { className: 'ibox', style: { marginBottom: 14 } },
      '\uD83D\uDDC2 Istoric complet al rezervarilor incheiate (' + past.length + ' total). Foloseste filtrele pentru a gasi rapid o rezervare veche, util pentru contabilitate sau dispute cu clienti.'
    ),

    // Search bar
    h('div', { className: 'fld', style: { marginBottom: 10 } },
      h('input', {
        className: 'finp',
        placeholder: '\uD83D\uDD0D Cauta dupa nume, telefon sau comentarii...',
        value: search,
        onChange: function(e) { setSearch(e.target.value); }
      })
    ),

    // Filters row
    h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 } },
      h('select', { className: 'finp', style: { flex: 1, minWidth: 110 }, value: filterYear, onChange: function(e) { setFilterYear(e.target.value); } },
        h('option', { value: 'all' }, 'Toti anii'),
        years.map(function(y) { return h('option', { key: y, value: y }, y); })
      ),
      h('select', { className: 'finp', style: { flex: 1, minWidth: 110 }, value: filterRoom, onChange: function(e) { setFilterRoom(e.target.value); } },
        h('option', { value: 'all' }, 'Toate camerele'),
        rooms.map(function(r) { return h('option', { key: r, value: r }, r); })
      ),
      h('select', { className: 'finp', style: { flex: 1, minWidth: 110 }, value: filterSrc, onChange: function(e) { setFilterSrc(e.target.value); } },
        h('option', { value: 'all' }, 'Toate sursele'),
        sources.map(function(s) { return h('option', { key: s, value: s }, s); })
      )
    ),

    // Summary stats
    h('div', { className: 'stcards' },
      [
        { icon: '\uD83D\uDCCB', lbl: 'Rezervari gasite', val: filtered.length },
        { icon: '\uD83C\uDF19', lbl: 'Nopti', val: totals.nts },
        { icon: '\uD83D\uDCB0', lbl: 'Venituri', val: totals.rev + ' lei' },
        { icon: '\uD83D\uDD14', lbl: 'Rest neincasat', val: totals.rest + ' lei', hi: totals.rest > 0 }
      ].map(function(item) {
        return h('div', { key: item.lbl, className: 'stcard' + (item.hi ? ' hi' : '') },
          h('div', { className: 'stico' }, item.icon),
          h('div', { className: 'stlbl' }, item.lbl),
          h('div', { className: 'stval' + (item.hi ? ' hi' : '') }, item.val)
        );
      })
    ),

    // Results list
    filtered.length === 0
      ? h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' } },
          h('div', { style: { fontSize: 48, marginBottom: 12 } }, '\uD83D\uDDC2'),
          h('div', { style: { fontSize: 16, fontWeight: 600 } },
            past.length === 0 ? 'Nicio rezervare in istoric inca' : 'Nicio rezervare gasita pentru filtrele alese'
          )
        )
      : h('div', null,
          filtered.map(function(res) {
            return h(ArchiveRow, {
              key: res.id, res: res, sources: sources,
              onDetail: function() { setDetailRes(res); },
              onEdit: props.onEdit,
              onCopy: props.onCopy,
              onDelete: props.onDelete,
              onSendMsg: props.onSendMsg
            });
          })
        ),

    detailRes && h(ResDetail, {
      res: detailRes, sources: sources,
      onClose: function() { setDetailRes(null); },
      onEdit: props.onEdit,
      onCopy: props.onCopy,
      onMove: props.onMove,
      onSendMsg: function(r) { props.onSendMsg(r); },
      onDelete: function(id, name) { props.onDelete(id, name); setDetailRes(null); },
      onSaveGuestDetails: props.onSaveGuestDetails,
      pensionName: props.pensionName
    })
  );
}

// ── ARCHIVE ROW — compact, fara linia de actiuni rapide ──────────────────────
function ArchiveRow(props) {
  var res = props.res, sources = props.sources;
  var c = getCol(sources, res.source);
  var name = fullName(res);
  var checkOut = addDays(res.checkIn, res.nights);
  var total = (res.pricePerNight || 0) * (res.nights || 0);
  var rest = total - (res.advance || 0);

  return h('div', { className: 'card', style: { borderLeft: '5px solid ' + c.dot, opacity: .85 } },
    h('div', { className: 'cl1' },
      h('span', { className: 'cl1-src', style: { background: c.light, color: c.text } }, res.source || 'N/A'),
      h('span', { className: 'cl1-name' }, name),
      res.phone
        ? h('span', { style: { fontSize: 13, color: '#64748b', flexShrink: 0 } }, res.phone)
        : null
    ),
    h('div', { className: 'cl3', onClick: props.onDetail, style: { borderTop: 'none', paddingTop: 0 } },
      h('span', { className: 'cl3-room' }, res.room || '-'),
      h('span', { className: 'cl3-dates' },
        fmt(res.checkIn) + ' → ' + fmt(checkOut) + ' · ' + res.nights + ' n.'
      ),
      h('span', { style: { fontSize: 13, fontWeight: 700, color: rest > 0 ? '#dc2626' : '#16a34a' } },
        total + ' lei' + (rest > 0 ? ' (rest ' + rest + ')' : '')
      ),
      h('span', { className: 'cl3-hint' }, '\u2139 detalii')
    )
  );
}

var DEFAULT_TEMPLATES = [
  { id: 't1', name: 'Confirmare rezervare', icon: '\u2705', text: 'Buna ziua {Nume}!\n\nVa confirmam rezervarea la {PensiuneNume}:\n\uD83C\uDFE0 Camera: {Camera}\n\uD83D\uDCC5 Check-in: {CheckIn}\n\uD83D\uDCC5 Check-out: {CheckOut}\n\uD83C\uDF19 Nopti: {Nopti}\n\uD83D\uDCB0 Total: {Total} lei\n\nVa asteptam cu drag!' },
  { id: 't2', name: 'Informatii sosire', icon: '\uD83D\uDCCD', text: 'Buna ziua {Nume}!\n\nInformatii pentru sosire ({CheckIn}):\n\n\uD83D\uDD11 Check-in: dupa ora 14:00\n\uD83D\uDEAA Camera: {Camera}\n\uD83D\uDE97 Parcare: loc rezervat in curte, intrare din {Parcare}\n\uD83D\uDCDE Telefon gazda: {TelGazda}\n\nO calatorie placuta!' },
  { id: 't3', name: 'Parola WiFi', icon: '\uD83D\uDCF6', text: 'Buna ziua!\n\n\uD83D\uDCF6 WiFi pensiune:\nRetea: {WiFiNume}\nParola: {WiFiParola}\n\nBuna navigare! \uD83D\uDE0A' },
  { id: 't4', name: 'Informatii parcare', icon: '\uD83D\uDE97', text: 'Buna ziua {Nume}!\n\n\uD83D\uDE97 Parcare:\n{Parcare}\n\nDaca aveti intrebari, sunati la {TelGazda}.' },
  { id: 't5', name: 'Check-out maine', icon: '\uD83D\uDD14', text: 'Buna ziua {Nume}!\n\nVa reamintim ca maine ({CheckOut}) este ziua check-out.\n\n\uD83D\uDD70 Ora limita: 11:00\n\uD83D\uDD11 Cheia se lasa in usa sau se preda gazdei\n\uD83E\uDDE3 Bagajele pot fi lasate pana la ora 14:00 la cerere\n\nA fost o placere sa va avem oaspeti!' },
  { id: 't6', name: 'Prezentare locatie', icon: '\uD83C\uDFAC', text: 'Buna ziua!\n\nVa invitam sa descoperiti {PensiuneNume}:\n\n\uD83C\uDFAC Video prezentare: {LinkYoutube}\n\uD83D\uDD17 Toate detaliile: {LinkLinktree}\n\n\uD83D\uDCDE Rezervari: {TelGazda}' },
  { id: 't7', name: 'Recenzie Google', icon: '\u2B50', text: 'Buna ziua {Nume}!\n\nSperam ca sejurul la {PensiuneNume} a fost pe placul dumneavoastra.\n\nDaca doriti sa lasati o recenzie, ne ajutati enorm:\n\u2B50 {LinkRecenzie}\n\nVa multumim si va asteptam din nou!' },
  { id: 't8', name: 'Oferta speciala', icon: '\uD83C\uDF89', text: 'Buna ziua {Nume}!\n\nAm pregatit o oferta speciala pentru dumneavoastra:\n\uD83D\uDCB0 -{DiscountProcent}% la urmatoarea rezervare\n\uD83D\uDCC5 Valabila pana la: {DataExpirare}\n\nRezervati acum: {LinkRezervare}' },
  { id: 't9', name: 'Regulament cazare', icon: '\uD83D\uDCCB', text: 'Buna ziua {Nume}!\n\nCateva informatii utile pentru sejurul dumneavoastra:\n\n\uD83D\uDD70 Check-in: 14:00 - 22:00\n\uD83D\uDD70 Check-out: pana la 11:00\n\uD83D\uDEAD Fumatul: interzis in incaperi\n\uD83D\uDC36 Animale: {Animale}\n\uD83D\uDD0A Liniste: dupa ora 22:00\n\uD83D\uDD25 Gratar: disponibil in curte\n\nO sedere placuta!' },
  { id: 't10', name: 'Multumire si la revedere', icon: '\uD83D\uDC4B', text: 'Buna ziua {Nume}!\n\nVa multumim ca ati ales {PensiuneNume}!\n\nA fost o placere sa va avem oaspeti si speram ca v-ati simtit ca acasa.\n\nVa asteptam cu drag data viitoare! \uD83C\uDFE1\n\nEchipa {PensiuneNume}' },
];

// Variabile disponibile in template-uri
var TEMPLATE_VARS = [
  { key: '{Nume}', lbl: 'Nume complet client' },
  { key: '{Camera}', lbl: 'Camera rezervata' },
  { key: '{CheckIn}', lbl: 'Data check-in' },
  { key: '{CheckOut}', lbl: 'Data check-out' },
  { key: '{Nopti}', lbl: 'Numar nopti' },
  { key: '{Total}', lbl: 'Total de plata (lei)' },
  { key: '{PensiuneNume}', lbl: 'Numele pensiunii' },
  { key: '{WiFiNume}', lbl: 'Numele retelei WiFi' },
  { key: '{WiFiParola}', lbl: 'Parola WiFi' },
  { key: '{Parcare}', lbl: 'Detalii parcare' },
  { key: '{TelGazda}', lbl: 'Telefon gazda' },
  { key: '{LinkYoutube}', lbl: 'Link YouTube prezentare' },
  { key: '{LinkLinktree}', lbl: 'Link Linktree' },
  { key: '{LinkRezervare}', lbl: 'Link rezervare online' },
  { key: '{LinkRecenzie}', lbl: 'Link recenzie Google' },
  { key: '{DiscountProcent}', lbl: 'Procent discount (ex: 10)' },
  { key: '{DataExpirare}', lbl: 'Data expirare oferta' },
  { key: '{Animale}', lbl: 'Politica animale' },
];

function applyTemplate(text, vars) {
  var result = text;
  Object.keys(vars).forEach(function(key) {
    result = result.split(key).join(vars[key] || key);
  });
  return result;
}

function buildVarsFromRes(res, pensionName, settings) {
  var checkOut = res ? addDays(res.checkIn, res.nights || 0) : '';
  var total = res ? (res.pricePerNight || 0) * (res.nights || 0) : 0;
  var vars = {
    '{Nume}': res ? fullName(res) : '',
    '{Camera}': res ? (res.room || '') : '',
    '{CheckIn}': res ? fmt(res.checkIn) : '',
    '{CheckOut}': res ? fmt(checkOut) : '',
    '{Nopti}': res ? String(res.nights || '') : '',
    '{Total}': res ? String(total) : '',
    '{PensiuneNume}': pensionName || '',
    '{WiFiNume}': (settings && settings.wifiName) || '',
    '{WiFiParola}': (settings && settings.wifiPass) || '',
    '{Parcare}': (settings && settings.parking) || '',
    '{TelGazda}': (settings && settings.hostPhone) || '',
    '{LinkYoutube}': (settings && settings.youtubeLink) || '',
    '{LinkLinktree}': (settings && settings.linktreeLink) || '',
    '{LinkRezervare}': (settings && settings.bookingLink) || '',
    '{LinkRecenzie}': (settings && settings.reviewLink) || '',
    '{DiscountProcent}': '10',
    '{DataExpirare}': '',
    '{Animale}': (settings && settings.petPolicy) || 'nu sunt permise',
  };
  return vars;
}

// ── MESSAGES MANAGER ─────────────────────────────────────────────────────────
function MessagesMgr(props) {
  var onClose = props.onClose;
  var pensionName = props.pensionName || '';
  var res = props.res || null; // rezervare selectata (optional)

  // Incarca template-uri si setari din Firebase/localStorage
  var initTemplates = function() {
    try { var t = JSON.parse(localStorage.getItem('msg_templates')); return t && t.length ? t : DEFAULT_TEMPLATES.slice(); } catch(e) { return DEFAULT_TEMPLATES.slice(); }
  };
  var initSettings = function() {
    try { return JSON.parse(localStorage.getItem('msg_settings')) || {}; } catch(e) { return {}; }
  };

  var ts = useState(initTemplates); var templates = ts[0], setTemplates = ts[1];
  var ss = useState(initSettings); var settings = ss[0], setSettings = ss[1];
  var tv = useState(res ? 'send-list' : 'list'); var view = tv[0], setView = tv[1]; // list | send-list | edit | settings | send
  var et = useState(null); var editingTpl = et[0], setEditingTpl = et[1];
  var st = useState(null); var sendingTpl = st[0], setSendingTpl = st[1];
  var cp = useState(''); var copied = cp[0], setCopied = cp[1];
  var ph = useState(res && res.phone ? res.phone : ''); var phoneNum = ph[0], setPhoneNum = ph[1];
  var pv = useState(''); var preview = pv[0], setPreview = pv[1];

  var vars = useMemo(function() {
    return buildVarsFromRes(res, pensionName, settings);
  }, [res, pensionName, settings]);

  function saveTemplates(tpls) {
    setTemplates(tpls);
    localStorage.setItem('msg_templates', JSON.stringify(tpls));
    if (props.onSaveTemplates) props.onSaveTemplates(tpls);
  }

  function saveSettings(s) {
    setSettings(s);
    localStorage.setItem('msg_settings', JSON.stringify(s));
    if (props.onSaveSettings) props.onSaveSettings(s);
  }

  function openSend(tpl) {
    setSendingTpl(tpl);
    setPreview(applyTemplate(tpl.text, vars));
    setPhoneNum(res && res.phone ? res.phone : '');
    setView('send');
  }

  function openEdit(tpl) {
    setEditingTpl(Object.assign({}, tpl));
    setView('edit');
  }

  function doSend() {
    var msg = applyTemplate(sendingTpl.text, vars);
    var clean = phoneNum.replace(/[\s\-().]/g, '');
    if (!clean.startsWith('+')) clean = '+40' + clean.replace(/^0/, '');
    window.open('https://wa.me/' + clean.replace('+', '') + '?text=' + encodeURIComponent(msg), '_blank');
  }

  function doCopy(text) {
    var msg = applyTemplate(text, vars);
    navigator.clipboard.writeText(msg).catch(function() {
      var el = document.createElement('textarea');
      el.value = msg; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
    });
    setCopied(text);
    setTimeout(function() { setCopied(''); }, 2000);
  }

  function saveEdit() {
    var tpls = templates.map(function(t) { return t.id === editingTpl.id ? editingTpl : t; });
    saveTemplates(tpls);
    setView('list');
  }

  function deleteTemplate(id) {
    if (!window.confirm('Stergi acest template?')) return;
    saveTemplates(templates.filter(function(t) { return t.id !== id; }));
  }

  function addTemplate() {
    var newTpl = { id: 'tc' + Date.now(), name: 'Mesaj nou', icon: '\uD83D\uDCAC', text: 'Scrie mesajul tau aici...' };
    var tpls = templates.concat([newTpl]);
    saveTemplates(tpls);
    setEditingTpl(newTpl);
    setView('edit');
  }

  // ── RENDER ──
  var titleMap = { list: '\uD83D\uDCAC Mesaje Rapide', 'send-list': '\uD83D\uDCAC Alege mesaj', edit: '\u270F\uFE0F Editeaza mesaj', settings: '\u2699\uFE0F Setari & Variabile', send: '\uD83D\uDCE4 Trimite mesaj' };

  return h('div', { className: 'ov', onClick: onClose },
    h('div', { className: 'mdl', onClick: function(e) { e.stopPropagation(); } },
      // Header
      h('div', { className: 'mhdr' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          view !== 'list' && h('button', {
            style: { background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
            onClick: function() { setView('list'); }
          }, '\u2190'),
          h('span', { className: 'mtit' }, titleMap[view] || titleMap.list)
        ),
        h('div', { style: { display: 'flex', gap: 6 } },
          view === 'list' && h('button', {
            style: { background: '#f1f5f9', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#374151' },
            onClick: function() { setView('settings'); }
          }, '\u2699\uFE0F Setari'),
          h('button', { className: 'mclose', onClick: onClose }, '\u2715')
        )
      ),

      h('div', { className: 'mbody' },

        // ── LISTA RAPIDA (din rezervare) ──
        view === 'send-list' && h('div', null,
          res && h('div', { style: { background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: '11px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { style: { fontSize: 22 } }, '\uD83D\uDC64'),
            h('div', null,
              h('div', { style: { fontWeight: 800, fontSize: 15, color: '#1e40af' } }, fullName(res)),
              h('div', { style: { fontSize: 13, color: '#3b82f6', marginTop: 1 } }, res.room + ' \u00B7 ' + fmt(res.checkIn) + ' \u2192 ' + fmt(addDays(res.checkIn, res.nights || 0)))
            )
          ),
          templates.map(function(tpl) {
            var msg = applyTemplate(tpl.text, vars);
            var clean = phoneNum.replace(/[\s\-().]/g, '');
            if (!clean.startsWith('+')) clean = '+40' + clean.replace(/^0/, '');
            var waLink = 'https://wa.me/' + clean.replace('+', '') + '?text=' + encodeURIComponent(msg);
            var isCopied = copied === tpl.text;
            return h('div', { key: tpl.id,
              style: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 13px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }
            },
              h('span', { style: { fontSize: 22, flexShrink: 0 } }, tpl.icon || '\uD83D\uDCAC'),
              h('div', { style: { flex: 1, minWidth: 0 } },
                h('div', { style: { fontWeight: 700, fontSize: 14, color: '#1a202c' } }, tpl.name),
                h('div', { style: { fontSize: 12, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                  msg.split('\n')[0]
                )
              ),
              h('div', { style: { display: 'flex', gap: 6, flexShrink: 0 } },
                h('a', {
                  href: waLink,
                  target: '_blank',
                  rel: 'noopener',
                  style: { width: 40, height: 40, borderRadius: 10, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 },
                  onClick: function(e) { e.stopPropagation(); }
                }, h(IWa)),
                h('button', {
                  style: { width: 40, height: 40, borderRadius: 10, background: isCopied ? '#f0fdf4' : '#f1f5f9', color: isCopied ? '#16a34a' : '#374151', border: isCopied ? '1.5px solid #86efac' : 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
                  onClick: function() { doCopy(tpl.text); }
                }, isCopied ? '\u2713' : '\uD83D\uDCCB')
              )
            );
          })
        ),

        // ── LISTA TEMPLATE-URI ──
        view === 'list' && h('div', null,
          res && h('div', { style: { background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 14, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { style: { fontSize: 18 } }, '\uD83D\uDC64'),
            h('div', null,
              h('div', { style: { fontWeight: 700 } }, fullName(res)),
              h('div', { style: { fontSize: 12, opacity: .8 } }, res.room + ' \u00B7 ' + fmt(res.checkIn) + ' \u2192 ' + fmt(addDays(res.checkIn, res.nights || 0)))
            )
          ),
          templates.map(function(tpl) {
            var isCopied = copied === tpl.text;
            var hasPhone = !!(res && res.phone);
            return h('div', { key: tpl.id, style: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 10 } },
              // Header template
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                h('span', { style: { fontSize: 20 } }, tpl.icon || '\uD83D\uDCAC'),
                h('span', { style: { fontWeight: 700, fontSize: 15, color: '#1a202c', flex: 1 } }, tpl.name),
                h('button', { style: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }, onClick: function() { openEdit(tpl); } }, '\u270F\uFE0F'),
                h('button', { style: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }, onClick: function() { deleteTemplate(tpl.id); } }, '\uD83D\uDDD1')
              ),
              // Preview primele 2 randuri
              h('div', { style: { fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 10, maxHeight: 40, overflow: 'hidden' } },
                applyTemplate(tpl.text, vars).split('\n').slice(0, 2).join(' ') + '...'
              ),
              // Butoane actiune
              h('div', { style: { display: 'flex', gap: 8 } },
                hasPhone && h('button', {
                  style: { flex: 1, padding: '10px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
                  onClick: function() { openSend(tpl); }
                }, h(IWa), 'WhatsApp'),
                h('button', {
                  style: { flex: 1, padding: '10px', background: isCopied ? '#f0fdf4' : '#f1f5f9', color: isCopied ? '#16a34a' : '#374151', border: isCopied ? '1.5px solid #86efac' : '1.5px solid #e2e8f0', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
                  onClick: function() { doCopy(tpl.text); }
                }, isCopied ? '\u2713 Copiat' : '\uD83D\uDCCB Copiaza')
              )
            );
          }),
          h('button', {
            style: { width: '100%', padding: '12px', background: '#f8fafc', color: '#2563eb', border: '2px dashed #bfdbfe', borderRadius: 11, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 },
            onClick: addTemplate
          }, '+ Adauga template nou')
        ),

        // ── SEND MODAL ──
        view === 'send' && sendingTpl && h('div', null,
          h('div', { style: { marginBottom: 12 } },
            h('label', { className: 'flbl', style: { marginBottom: 6, display: 'block' } }, 'Numar WhatsApp destinatar'),
            h('input', {
              className: 'finp', type: 'tel', value: phoneNum,
              placeholder: '07xx xxx xxx',
              onChange: function(e) {
                setPhoneNum(e.target.value);
              }
            })
          ),
          h('div', { style: { marginBottom: 12 } },
            h('label', { className: 'flbl', style: { marginBottom: 6, display: 'block' } }, 'Previzualizare mesaj'),
            h('textarea', {
              className: 'finp', value: applyTemplate(sendingTpl.text, vars),
              readOnly: true,
              style: { height: 280, resize: 'vertical', fontSize: 14, lineHeight: 1.6, background: '#f8fafc' }
            })
          ),
          h('div', { style: { background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: '#92400e', marginBottom: 12 } },
            '\u2139\uFE0F Variabilele necompletate ({...}) inseamna ca lipsesc datele din setari. Completeaza din \u2699\uFE0F Setari.'
          )
        ),

        // ── EDIT TEMPLATE ──
        view === 'edit' && editingTpl && h('div', null,
          h('div', { className: 'fgrid', style: { marginBottom: 12 } },
            h('div', { className: 'fld' },
              h('label', { className: 'flbl' }, 'Icon (emoji)'),
              h('input', { className: 'finp', value: editingTpl.icon || '', onChange: function(e) { setEditingTpl(Object.assign({}, editingTpl, { icon: e.target.value })); } })
            ),
            h('div', { className: 'fld' },
              h('label', { className: 'flbl' }, 'Nume template'),
              h('input', { className: 'finp', value: editingTpl.name || '', onChange: function(e) { setEditingTpl(Object.assign({}, editingTpl, { name: e.target.value })); } })
            )
          ),
          h('div', { className: 'fld', style: { marginBottom: 10 } },
            h('label', { className: 'flbl' }, 'Textul mesajului (max 1000 cuvinte)'),
            h('textarea', {
              className: 'finp',
              value: editingTpl.text || '',
              style: { height: 220, resize: 'vertical', fontSize: 14, lineHeight: 1.6 },
              onChange: function(e) { setEditingTpl(Object.assign({}, editingTpl, { text: e.target.value })); }
            })
          ),
          h('div', { style: { background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 12 } },
            h('div', { style: { fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 } }, 'Variabile disponibile — click sa copiezi:'),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
              TEMPLATE_VARS.map(function(v) {
                return h('button', {
                  key: v.key,
                  title: v.lbl,
                  style: { padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
                  onClick: function() {
                    var el = document.querySelector('textarea.finp');
                    if (el) {
                      var start = el.selectionStart, end = el.selectionEnd;
                      var newText = editingTpl.text.slice(0, start) + v.key + editingTpl.text.slice(end);
                      setEditingTpl(Object.assign({}, editingTpl, { text: newText }));
                    } else {
                      setEditingTpl(Object.assign({}, editingTpl, { text: editingTpl.text + v.key }));
                    }
                  }
                }, v.key);
              })
            )
          )
        ),

        // ── SETTINGS ──
        view === 'settings' && h('div', null,
          h('div', { className: 'ibox', style: { marginBottom: 14 } },
            'Completeaza variabilele globale. Vor fi inserate automat in toate mesajele.'
          ),
          [
            { key: 'wifiName', lbl: '\uD83D\uDCF6 Numele retelei WiFi', ph: 'ex: Casuta_cu_Izvor' },
            { key: 'wifiPass', lbl: '\uD83D\uDD11 Parola WiFi', ph: 'ex: casuta2024' },
            { key: 'parking', lbl: '\uD83D\uDE97 Detalii parcare', ph: 'ex: strada Florilor nr.5, poarta albastra' },
            { key: 'hostPhone', lbl: '\uD83D\uDCDE Telefon gazda', ph: 'ex: 0722 000 000' },
            { key: 'youtubeLink', lbl: '\uD83C\uDFAC Link YouTube', ph: 'https://youtube.com/...' },
            { key: 'linktreeLink', lbl: '\uD83D\uDD17 Link Linktree', ph: 'https://linktr.ee/...' },
            { key: 'bookingLink', lbl: '\uD83D\uDCF2 Link rezervare online', ph: 'https://casutacuizvor-2017.netlify.app/booking' },
            { key: 'reviewLink', lbl: '\u2B50 Link recenzie Google', ph: 'https://g.page/r/...' },
            { key: 'petPolicy', lbl: '\uD83D\uDC3E Politica animale', ph: 'ex: nu sunt permise / acceptate cu acordul gazdei' },
          ].map(function(field) {
            return h('div', { key: field.key, style: { marginBottom: 12 } },
              h('label', { className: 'flbl', style: { marginBottom: 5, display: 'block' } }, field.lbl),
              h('input', {
                className: 'finp', value: settings[field.key] || '', placeholder: field.ph,
                onChange: function(e) {
                  var ns = Object.assign({}, settings);
                  ns[field.key] = e.target.value;
                  saveSettings(ns);
                }
              })
            );
          }),
          h('div', { style: { fontSize: 12, color: '#94a3b8', marginTop: 8, lineHeight: 1.6 } },
            'Setarile se salveaza automat pe acest dispozitiv. Pentru a le sincroniza intre dispozitive, apasa "Salveaza in cloud".'
          ),
          h('button', {
            style: { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', borderRadius: 11, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 10 },
            onClick: function() {
              if (props.onSaveSettings) props.onSaveSettings(settings);
              setView('list');
            }
          }, '\u2713 Salveaza in cloud')
        )
      ),

      // Footer
      h('div', { className: 'mfoot' },
        view === 'list' && h('button', { className: 'mcanc', style: { flex: 1 }, onClick: onClose }, 'Inchide'),
        view === 'send-list' && h(Fragment, null,
          h('button', { className: 'mcanc', onClick: onClose }, 'Inchide'),
          h('button', { style: { flex: 1, padding: '15px', background: '#f1f5f9', color: '#374151', borderRadius: 12, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }, onClick: function() { setView('list'); } }, '\uD83D\uDCCB Toate templatele')
        ),
        view === 'edit' && h(Fragment, null,
          h('button', { className: 'mcanc', onClick: function() { setView('list'); } }, 'Anuleaza'),
          h('button', { className: 'msave', onClick: saveEdit }, '\u2713 Salveaza')
        ),
        view === 'settings' && h('button', { className: 'mcanc', style: { flex: 1 }, onClick: function() { setView('list'); } }, '\u2190 Inapoi'),
        view === 'send' && h(Fragment, null,
          h('button', { className: 'mcanc', onClick: function() { setView('list'); } }, '\u2190 Inapoi'),
          h('button', {
            className: 'msave', style: { background: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' },
            disabled: !phoneNum.trim(),
            onClick: doSend
          }, h(IWa), 'Deschide WhatsApp')
        )
      )
    )
  );
}

// ── TODAY BAR — acum e un SELECTOR DE FILTRU, nu un panou de statistici ────────
// Fiecare cadran, la click, schimba filtrul activ din App (props.activeFilter /
// props.onFilterChange), care determina ce sectiune se afiseaza in ResTab mai jos.
// Un singur cadran e "activ" la un moment dat, evidentiat vizual.
function TodayBar(props) {
  var reservations = props.reservations, rooms = props.rooms;
  var tod = todayStr();
  var activeFilter = props.activeFilter;

  var categorized = useMemo(function() {
    return categorizeReservations(reservations, tod);
  }, [reservations, tod]);

  var libere = useMemo(function() {
    return getFreeRooms(rooms, reservations, tod);
  }, [rooms, reservations, tod]);

  var cells = [
    { num: categorized.future.length, lbl: 'Rezervari', color: categorized.future.length > 0 ? 'blue' : '', type: 'future' },
    { num: categorized.staying.length, lbl: 'Ocupate', color: categorized.staying.length > 0 ? 'amber' : '', type: 'staying' },
    { num: libere.length, lbl: 'Libere', color: libere.length > 0 ? 'green' : '', type: 'free' },
    { num: categorized.checkoutToday.length, lbl: 'Plecari azi', color: categorized.checkoutToday.length > 0 ? 'amber' : '', type: 'checkout' },
    { num: categorized.checkinToday.length, lbl: 'Sosiri azi', color: categorized.checkinToday.length > 0 ? 'blue' : '', type: 'checkin' }
  ];

  return h('div', { className: 'tod-bar' },
    h('div', { className: 'tod-bar-inner' },
      cells.map(function(cell) {
        return h('div', {
          key: cell.type,
          className: 'tod-cell ' + (cell.color || '') + (activeFilter === cell.type ? ' active' : ''),
          onClick: function() { props.onFilterChange(cell.type); }
        },
          h('div', { className: 'tod-num' }, cell.num),
          h('div', { className: 'tod-lbl' }, cell.lbl)
        );
      })
    )
  );
}
