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
  var res = useState([]); var reservations = res[0], setRes = res[1];
  var ms = useState(null); var modal = ms[0], setModal = ms[1];
  var cs = useState(null); var confirm = cs[0], setConfirm = cs[1];
  var srs = useState(false); var showRooms = srs[0], setShowRooms = srs[1];
  var sss = useState(false); var showSrc = sss[0], setShowSrc = sss[1];
  var ics = useState(false); var showIcal = ics[0], setShowIcal = ics[1];
  var pds = useState(false); var showPdf = pds[0], setShowPdf = pds[1];
  var prs2 = useState(false); var showPrices = prs2[0], setShowPrices = prs2[1];
  var pss = useState(false); var showPensionSettings = pss[0], setShowPensionSettings = pss[1];
  var acs = useState(false); var showAccountSettings = acs[0], setShowAccountSettings = acs[1];
  var sms = useState(false); var showMessages = sms[0], setShowMessages = sms[1];
  var mrs = useState(null); var msgRes = mrs[0], setMsgRes = mrs[1];
  var bis = useState(null); var billingInfo = bis[0], setBillingInfo = bis[1];
  var sbi = useState(false); var showBillingInfo = sbi[0], setShowBillingInfo = sbi[1];

  // Titlul paginii reflecta numele pensiunii (setat din Firebase)
  useEffect(function() {
    if (pensionName) {
      document.title = pensionName + ' — Rezervario';
      var titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = pensionName + ' — Rezervario';
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
      }
    });
    var u2 = fb.on('reservations', function(data) {
      var arr = data ? Object.keys(data).map(function(id) { return Object.assign({}, data[id], { id: id }); }) : [];
      setRes(arr); lc.set('p_res', arr); setSync('online'); setLoading(false);
    });
    firebaseDB.ref('.info/connected').on('value', function(snap) {
      if (snap.val() === false) { setSync('offline'); setRes(lc.get('p_res', [])); setLoading(false); }
      else setSync('online');
    });
    return function() { u1(); u2(); };
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
    var merged = Object.assign({}, { rooms: rooms, sources: sources, roomPrices: roomPrices, pensionName: pensionName, pensionPhoto: pensionPhoto }, partial);
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
      var cl = reservations.find(function(r) { return r.room === data.room && r.id !== data.id && overlaps(data.checkIn, data.nights, r.checkIn, r.nights); });
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
      p = fb.set('reservations/' + id, rest);
    } else {
      var rest2 = Object.assign({}, data); delete rest2.id;
      p = fb.push('reservations', Object.assign(rest2, { createdAt: Date.now() }));
    }
    p.then(function() { setSync('online'); setModal(null); }).catch(function(err) {
      console.error('saveRes error:', err);
      setSync('error');
      setTimeout(function() { setSync('online'); }, 4000);
      alert('Eroare la salvare: ' + err.message);
    });
  }

  function delRes(id, name) {
    setConfirm({
      msg: 'Stergi rezervarea pentru "' + name + '"?',
      okLbl: 'Sterge',
      ok: function() {
        setSync('syncing');
        fb.remove('reservations/' + id).then(function() { setSync('online'); setConfirm(null); }).catch(function(err) {
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

  function openNew(room) { setModal({ mode: 'new', data: Object.assign({}, EMPTY_RES, { room: room || '', source: sources[0] || '' }) }); }
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
        h('button', { title: 'Logout', style: { width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }, onClick: function() { if (confirm('Iesi din cont?')) firebase.auth().signOut(); } }, '🚪')
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
      onOpenAccountSettings: function() { setShowAccountSettings(true); },
      onOpenBillingInfo: function() { setShowBillingInfo(true); },
      onOpenMessages: function() { setMsgRes(null); setShowMessages(true); },
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
    h(TodayBar, { reservations: reservations, rooms: rooms, sources: sources }),
    // CONTENT
    tab === 'rez' && h(ResTab, { rooms: rooms, sources: sources, reservations: reservations, conflicts: conflicts, onNew: openNew, onEdit: openEdit, onCopy: openCopy, onMove: openMove, onDelete: delRes, onSendMsg: function(r) { setMsgRes(r); setShowMessages(true); }, onToggleCheckedIn: toggleCheckedIn, onToggleRoomCleaned: toggleRoomCleaned, onSaveGuestDetails: saveGuestDetails, pensionName: pensionName }),
    tab.startsWith('cal') && h(CalTab, { rooms: rooms, sources: sources, reservations: reservations, initView: calViewMap[tab] || 'month', onNew: openNew, onEdit: openEdit }),
    tab === 'stats' && h(StatsTab, { rooms: rooms, sources: sources, reservations: reservations }),
    tab === 'archive' && h(ArchiveTab, { rooms: rooms, sources: sources, reservations: reservations, onEdit: openEdit, onCopy: openCopy, onMove: openMove, onDelete: delRes, onSendMsg: function(r) { setMsgRes(r); setShowMessages(true); }, onSaveGuestDetails: saveGuestDetails, pensionName: pensionName }),
    // MODALS
    modal && h(ResMdl, { modal: modal, onSave: saveRes, onClose: function() { setModal(null); }, rooms: rooms, sources: sources, reservations: reservations }),
    showRooms && h(RoomMgr, { rooms: rooms, reservations: reservations, onSave: saveRooms, onClose: function() { setShowRooms(false); } }),
    showSrc && h(SrcMgr, { sources: sources, onSave: saveSrc, onClose: function() { setShowSrc(false); } }),
    showPensionSettings && h(PensionSettings, { pensionName: pensionName, pensionPhoto: pensionPhoto, onSave: savePensionSettings, onClose: function() { setShowPensionSettings(false); } }),
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
    confirm && h(Confirm, { msg: confirm.msg, okLbl: confirm.okLbl, ok: confirm.ok, onCancel: function() { setConfirm(null); } })
  );
}

function startApp() {
  createRoot(document.getElementById('root')).render(h(App));
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

// ── RESERVATION MODAL ────────────────────────────────────────────────────────
function ResMdl(props) {
  var modal = props.modal, onSave = props.onSave, onClose = props.onClose;
  var rooms = props.rooms, sources = props.sources, reservations = props.reservations;

  var initForm = Object.assign({}, EMPTY_RES, { source: sources[0] || '' }, modal.data);
  var fs = useState(initForm);
  var form = fs[0], setForm = fs[1];

  var isEdit = modal.mode === 'edit';
  var checkOut = addDays(form.checkIn, form.nights || 0);
  var total = (form.pricePerNight || 0) * (form.nights || 0);
  var diff = total - (form.advance || 0);

  function set(k, v) { setForm(Object.assign({}, form, { [k]: v })); }

  var warn = useMemo(function() {
    if (!form.room || !form.checkIn || !form.nights) return null;
    var cl = reservations.find(function(r) { return r.room === form.room && r.id !== form.id && overlaps(form.checkIn, form.nights, r.checkIn, r.nights); });
    return cl ? fullName(cl) : null;
  }, [form.room, form.checkIn, form.nights, form.id, reservations]);

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
        warn && h('div', { className: 'obwarn' }, '\u26A0\uFE0F Camera deja rezervata de ', h('strong', null, warn), '!'),
        h('div', { className: 'fgrid' },
          h(Field, { lbl: 'Camera', req: true },
            h('select', { className: 'finp', value: form.room, onChange: function(e) { set('room', e.target.value); } },
              h('option', { value: '' }, '-- Selecteaza --'),
              h('option', { value: WHOLE, style: { fontWeight: 700, color: '#92400e' } }, '\uD83C\uDFE0 Toata locatia (toate camerele)'),
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
          h(Field, { lbl: 'Nopti' }, h('input', { className: 'finp', type: 'number', min: 1, value: form.nights, onFocus: function(e) { e.target.select(); }, onChange: function(e) { set('nights', parseInt(e.target.value) || 1); } })),
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
        h('button', { className: 'msave' + (warn ? ' warn' : ''), onClick: submit }, warn ? 'Salveaza (risc OB)' : (btnL[modal.mode] || btnL.new))
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
        // Fisa client button (separat, deasupra actiunilor principale)
        h('button', {
          style: { width: '100%', padding: '12px', marginBottom: 12, background: '#f0f4f8', color: '#1e3a5f', border: '1.5px dashed #94a3b8', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
          onClick: function() { setShowGuestForm(true); }
        }, '\uD83D\uDCCB ', res.guestDetails ? 'Fisa client (completata)' : 'Completeaza fisa client'),
        // Action buttons
        h('div', { className: 'dmod-acts' },
          h('button',{className:'dmod-act-btn',style:{background:'#eff6ff',color:'#2563eb'},onClick:function(){props.onEdit(res);props.onClose();}},h(IEdit),' Editeaza'),
          h('button',{className:'dmod-act-btn',style:{background:'#f5f3ff',color:'#7c3aed'},onClick:function(){props.onCopy(res);props.onClose();}},h(ICopy),' Copiaza'),
          h('button',{className:'dmod-act-btn',style:{background:'#ecfeff',color:'#0891b2'},onClick:function(){props.onMove(res);props.onClose();}},h(IMove),' Muta'),
          h('button',{className:'dmod-act-btn',style:{background:'#fef2f2',color:'#dc2626'},onClick:function(){props.onDelete(res.id,fullName(res));props.onClose();}},h(ITrash),' Sterge')
        )
      )
    ),
    showGuestForm && h(GuestDetailsForm, {
      res: res,
      pensionName: props.pensionName,
      onSave: props.onSaveGuestDetails,
      onClose: function() { setShowGuestForm(false); }
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
      '<div class="foot">Generat automat din Rezervario la ' + now + ' \u2014 pastrare 5 ani conform legii</div>' +
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

  var confIds = useMemo(function() {
    var ids = new Set();
    conflicts.forEach(function(c) { ids.add(c.room); });
    return ids;
  }, [conflicts]);

  var today = todayStr();

  // ── CELE 4 CATEGORII ─────────────────────────────────────────────────────
  // O rezervare poate fi simultan "intrare azi" SI "iesire azi" (sejur de 0 nopti /
  // aceeasi zi) — categoriile nu sunt neaparat mutual exclusive intre ele, dar fiecare
  // rezervare apare o singura data in categoria ei "principala" pentru lista de mai jos,
  // ca sa nu se dubleze vizual. Ordinea de prioritate: check-in azi > check-out azi >
  // cazat in curs > viitor.
  var categorized = useMemo(function() {
    var checkinToday = [], checkoutToday = [], staying = [], future = [];
    reservations.forEach(function(r) {
      if (!r.checkIn) return;
      var checkOut = addDays(r.checkIn, r.nights || 0);
      if (checkOut < today) return; // sejur incheiat — nu se mai arata in lista activa

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
  }, [reservations, today]);

  var totalActive = categorized.checkinToday.length + categorized.checkoutToday.length + categorized.staying.length + categorized.future.length;

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

  // Randeaza o sectiune (Intrari azi / Iesiri azi / etc), optional impartita pe camere
  // daca viewMode === 'room'. checkType: 'checkin' | 'checkout' | null — determina ce bifa
  // se afiseaza pe cardurile din aceasta sectiune.
  function renderSection(title, icon, list, bgColor, checkType) {
    if (list.length === 0) return null;
    var body;
    if (viewMode === 'room') {
      var byRoom = {};
      list.forEach(function(r) {
        var rm = r.room || '(fara camera)';
        if (!byRoom[rm]) byRoom[rm] = [];
        byRoom[rm].push(r);
      });
      // Pastreaza ordinea camerelor asa cum sunt definite in config, plus orice camera extra gasita in date
      var roomOrder = rooms.concat(Object.keys(byRoom).filter(function(r) { return rooms.indexOf(r) === -1; }));
      body = roomOrder.filter(function(rm) { return byRoom[rm] && byRoom[rm].length; }).map(function(rm) {
        return h('div', { key: rm, style: { marginBottom: 10 } },
          h('div', { style: { fontSize: 12.5, fontWeight: 700, color: '#64748b', padding: '4px 4px', display: 'flex', alignItems: 'center', gap: 6 } },
            '\uD83D\uDEAA ' + rm, h('span', { style: { opacity: .6, fontWeight: 600 } }, '(' + byRoom[rm].length + ')')
          ),
          byRoom[rm].map(function(res) { return h(ResRow, rowProps(res, checkType)); })
        );
      });
    } else {
      body = list.map(function(res) { return h(ResRow, rowProps(res, checkType)); });
    }
    return h('div', { style: { marginBottom: 20 } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: bgColor || '#1e3a5f', borderRadius: 10, color: '#fff', marginBottom: 8 } },
        h('span', { style: { fontWeight: 800, fontSize: 15 } }, icon + ' ' + title),
        h('span', { style: { fontSize: 13, opacity: .8 } }, list.length + ' rez.')
      ),
      body
    );
  }

  return h('div', { className: 'page' },
    // Buton adauga nou
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' } },
      // Toggle General / Pe camere
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

    totalActive === 0
      ? h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8' } },
          h('div', { style: { fontSize: 48, marginBottom: 12 } }, '\uD83C\uDFE1'),
          h('div', { style: { fontSize: 16, fontWeight: 600 } }, 'Nicio rezervare activa'),
          h('div', { style: { fontSize: 13, marginTop: 6 } }, 'Apasa "+ Rezervare noua" pentru a adauga')
        )
      : h('div', null,
          renderSection('Intrari azi', '\uD83D\uDFE2', categorized.checkinToday, '#16a34a', 'checkin'),
          renderSection('Iesiri azi', '\uD83D\uDD34', categorized.checkoutToday, '#dc2626', 'checkout'),
          renderSection('Cazati in curs', '\uD83C\uDFE8', categorized.staying, '#2563eb'),
          renderSection('Intrari viitoare', '\uD83D\uDCC5', categorized.future, '#1e3a5f')
        ),

    // Buton adauga per camera
    h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 } },
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

  var bookingUrl = window.location.origin + '/booking';

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
  // accordion: 'rooms' | 'sources' | 'sync' | null — un singur panou deschis
  var acs = useState(null);
  var accordionOpen = acs[0], setAccordionOpen = acs[1];
  var obCount = conflicts.length;

  function navTo(t) { setTab(t); props.onClose(); }
  function toggleAccordion(key) { setAccordionOpen(accordionOpen === key ? null : key); }

  // cate platforme de sincronizare au cel putin un link configurat
  var icalLinksV2 = lc.get('ical_links_v2', null);
  var connectedPlatforms = SYNC_PLATFORMS.filter(function(p) {
    if (!icalLinksV2 || !icalLinksV2[p.id]) return false;
    return Object.keys(icalLinksV2[p.id]).some(function(r) { return icalLinksV2[p.id][r]; });
  });

  return h(Fragment, null,
    h('div', { className: 'dbg', onClick: props.onClose }),
    h('div', { className: 'drw' },
      h('div', { className: 'drw-hdr' },
        h('div', { className: 'drw-logo' }, '\uD83C\uDFE1'),
        h('div', { className: 'drw-tit' }, 'Rezervari'),
        h('div', { className: 'drw-syn' },
          h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: syncColor, display: 'inline-block' } }),
          syncLabel
        )
      ),
      h('div', { className: 'drw-body' },

        // ── NAV PRINCIPAL ──
        h('div', { className: 'dlbl' }, 'Navigare'),
        h('div', { className: 'ditem' + (tab === 'rez' ? ' on' : ''), onClick: function() { navTo('rez'); } },
          h('span', { className: 'dico' }, '\uD83D\uDCCB'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Rezervari'),
            h('div', { className: 'dsub' }, 'Prezente si viitoare')
          ),
          obCount > 0 && h('span', { className: 'dbdg' }, obCount + ' OB')
        ),
        h('div', { className: 'ditem' + (tab.startsWith('cal') ? ' on' : ''), onClick: function() { setCalOpen(!calOpen); } },
          h('span', { className: 'dico' }, '\uD83D\uDCC5'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Calendar'),
            h('div', { className: 'dsub' }, 'Lunar, saptamanal, interval')
          ),
          h('span', { className: 'darr' }, calOpen ? '\u2303' : '\u2304')
        ),
        calOpen && h('div', { className: 'dexp' },
          [['cal-month', '\uD83D\uDCC5', 'Lunar'], ['cal-week', '\uD83D\uDDD3', 'Saptamanal'], ['cal-custom', '\uD83D\uDCC6', 'Interval personalizat']].map(function(vl) {
            return h('div', { key: vl[0], className: 'dsub-item' + (tab === vl[0] ? ' on' : ''), onClick: function() { navTo(vl[0]); } },
              h('span', { style: { fontSize: 15 } }, vl[1]),
              h('span', { className: 'dsub-lbl' }, vl[2])
            );
          })
        ),
        h('div', { className: 'ditem' + (tab === 'stats' ? ' on' : ''), onClick: function() { navTo('stats'); } },
          h('span', { className: 'dico' }, '\uD83D\uDCCA'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Statistici'),
            h('div', { className: 'dsub' }, 'Venituri, nopti, surse')
          )
        ),
        h('div', { className: 'ditem' + (tab === 'archive' ? ' on' : ''), onClick: function() { navTo('archive'); } },
          h('span', { className: 'dico' }, '\uD83D\uDDC2'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Istoric rezervari'),
            h('div', { className: 'dsub' }, 'Cautare rezervari incheiate')
          )
        ),
        h('div', { className: 'ditem', onClick: function() { props.onOpenMessages(); props.onClose(); } },
          h('span', { className: 'dico' }, '\uD83D\uDCAC'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Mesaje WhatsApp'),
            h('div', { className: 'dsub' }, '10 template-uri gata de folosit')
          ),
          h('span', { className: 'darr' }, '\u203A')
        ),

        h('div', { className: 'ddiv' }),

        // ── ACCORDION: CAMERE ──
        h('div', { className: 'dlbl' }, 'Configurare'),
        h('div', { className: 'ditem' + (accordionOpen === 'rooms' ? ' on' : ''), onClick: function() { toggleAccordion('rooms'); } },
          h('span', { className: 'dico' }, '\uD83D\uDEAA'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Camere'),
            h('div', { className: 'dsub' }, rooms.length + ' camere configurate')
          ),
          h('span', { className: 'darr' }, accordionOpen === 'rooms' ? '\u2303' : '\u2304')
        ),
        accordionOpen === 'rooms' && h('div', { className: 'dexp' },
          rooms.map(function(r) {
            return h('div', { key: r, className: 'dsub-item', style: { justifyContent: 'space-between' } },
              h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h('span', { style: { fontSize: 15 } }, '\uD83D\uDEAA'),
                h('span', { className: 'dsub-lbl' }, r)
              )
            );
          }),
          h('div', { className: 'dsub-item', style: { color: '#2563eb', fontWeight: 700 }, onClick: function() { props.onOpenRooms(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\u270F\uFE0F'),
            h('span', { className: 'dsub-lbl' }, 'Adauga / editeaza / sterge camere')
          )
        ),

        // ── ACCORDION: SURSE ──
        h('div', { className: 'ditem' + (accordionOpen === 'sources' ? ' on' : ''), onClick: function() { toggleAccordion('sources'); } },
          h('span', { className: 'dico' }, '\uD83D\uDC64'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Surse'),
            h('div', { className: 'dsub' }, sources.length + ' surse active')
          ),
          h('span', { className: 'darr' }, accordionOpen === 'sources' ? '\u2303' : '\u2304')
        ),
        accordionOpen === 'sources' && h('div', { className: 'dexp' },
          sources.map(function(s, i) {
            var c = PAL[i % PAL.length];
            return h('div', { key: s, className: 'dsub-item' },
              h('span', { className: 'dchip', style: { background: c.light, color: c.text, fontSize: 12 } }, s)
            );
          }),
          h('div', { className: 'dsub-item', style: { color: '#2563eb', fontWeight: 700 }, onClick: function() { props.onOpenSrc(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\u270F\uFE0F'),
            h('span', { className: 'dsub-lbl' }, 'Adauga / editeaza / sterge surse')
          )
        ),

        // ── ACCORDION: SINCRONIZARI ──
        h('div', { className: 'ditem' + (accordionOpen === 'sync' ? ' on' : ''), onClick: function() { toggleAccordion('sync'); } },
          h('span', { className: 'dico' }, '\uD83D\uDD04'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Sincronizari'),
            h('div', { className: 'dsub' }, connectedPlatforms.length > 0 ? (connectedPlatforms.length + ' platforme conectate') : 'Niciuna conectata')
          ),
          h('span', { className: 'darr' }, accordionOpen === 'sync' ? '\u2303' : '\u2304')
        ),
        accordionOpen === 'sync' && h('div', { className: 'dexp' },
          SYNC_PLATFORMS.map(function(p) {
            var connected = connectedPlatforms.some(function(cp) { return cp.id === p.id; });
            return h('div', { key: p.id, className: 'dsub-item', style: { justifyContent: 'space-between' }, onClick: function() { props.onOpenIcal(); props.onClose(); } },
              h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h('span', { style: { fontSize: 15 } }, p.icon),
                h('span', { className: 'dsub-lbl' }, p.name)
              ),
              h('span', { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: connected ? '#16a34a' : '#94a3b8' } },
                h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: connected ? '#16a34a' : '#cbd5e1' } }),
                connected ? 'Conectat' : 'Neconectat'
              )
            );
          }),
          h('div', { className: 'dsub-item', style: { color: '#2563eb', fontWeight: 700 }, onClick: function() { props.onOpenIcal(); props.onClose(); } },
            h('span', { style: { fontSize: 15 } }, '\u2699\uFE0F'),
            h('span', { className: 'dsub-lbl' }, 'Gestioneaza sincronizarile')
          )
        ),

        h('div', { className: 'ddiv' }),

        // ── SETARI PENSIUNE (nume + fotografie) ──
        h('div', { className: 'dlbl' }, 'Setari Pensiune'),
        h('div', { className: 'ditem', onClick: function() { props.onOpenPensionSettings(); props.onClose(); } },
          props.pensionPhoto
            ? h('img', { src: props.pensionPhoto, className: 'dico', style: { width: 30, height: 30, borderRadius: 8, objectFit: 'cover', flexShrink: 0 } })
            : h('span', { className: 'dico' }, '\uD83C\uDFE1'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, props.pensionName || 'Numeste pensiunea'),
            h('div', { className: 'dsub' }, 'Nume si fotografie generala')
          ),
          h('span', { className: 'darr' }, '›')
        ),

        h('div', { className: 'ddiv' }),

        // ── CONTUL MEU (email + schimbare parola) ──
        h('div', { className: 'dlbl' }, 'Contul meu'),
        h('div', { className: 'ditem', onClick: function() { props.onOpenAccountSettings(); props.onClose(); } },
          h('span', { className: 'dico' }, '\uD83D\uDC64'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, props.userEmail || 'Cont'),
            h('div', { className: 'dsub' }, 'Schimba parola, deconectare')
          ),
          h('span', { className: 'darr' }, '›')
        ),
        h('div', { className: 'ditem', onClick: function() { props.onOpenBillingInfo(); props.onClose(); } },
          h('span', { className: 'dico' }, '\uD83E\uDDFE'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, props.billingInfo
              ? (props.billingInfo.type === 'pj' ? (props.billingInfo.companyName || 'Date facturare') : (props.billingInfo.fullName || 'Date facturare'))
              : 'Date Facturare'),
            h('div', { className: 'dsub' }, props.billingInfo ? 'Date complete' : 'Persoana fizica sau firma')
          ),
          h('span', { className: 'darr' }, '›')
        ),

        h('div', { className: 'ddiv' }),

        // ── ALTE OPTIUNI ──
        h('div', { className: 'dlbl' }, 'Altele'),
        h('div', { className: 'ditem', onClick: function() { props.onOpenPdf(); props.onClose(); } },
          h('span', { className: 'dico' }, '\uD83D\uDDA8'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Descarca / Tipareste'),
            h('div', { className: 'dsub' }, 'Export rezervari PDF')
          ),
          h('span', { className: 'darr' }, '›')
        ),
        h('div', { className: 'ditem', onClick: function() { props.onOpenPrices(); props.onClose(); } },
          h('span', { className: 'dico' }, '\uD83D\uDD17'),
          h('div', { className: 'dtxt' },
            h('div', { className: 'dnm' }, 'Link rezervare clienti'),
            h('div', { className: 'dsub' }, 'Preturi camere + link public')
          ),
          props.pendingCount > 0 && h('span', { className: 'dbdg' }, props.pendingCount + ' nou'),
          props.pendingCount === 0 && h('span', { className: 'darr' }, '›')
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
// Fotografia e redimensionata client-side si salvata ca Base64 in Firebase Realtime DB
// (nu avem Firebase Storage activ) — de aceea o limitam la o latura maxima rezonabila
// ca sa nu depasim limitele de marime ale unei valori din DB.
var PENSION_PHOTO_MAX_DIM = 1280; // px, latura cea mai mare dupa resize
var PENSION_PHOTO_QUALITY = 0.78; // calitate JPEG la export
var PENSION_PHOTO_MAX_BYTES = 700 * 1024; // ~700KB prag de avertizare (Base64 e ~33% mai mare ca originalul)

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

// ── ACCOUNT SETTINGS (email, schimbare parola, logout) ──────────────────────
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

function TodayBar(props) {
  var reservations = props.reservations, rooms = props.rooms, sources = props.sources;
  var tod = todayStr();
  var tmr = addDays(tod, 1);

  // State pentru popup
  var ps = useState(null); var popup = ps[0], setPopup = ps[1];

  // Rezervarile in curs (cazati acum, checkIn <= azi < checkout, nu blocate)
  var inCursRez = useMemo(function() {
    return reservations.filter(function(r) {
      return r.checkIn <= tod &&
             addDays(r.checkIn, r.nights || 0) > tod &&
             r.status !== 'blocked';
    });
  }, [reservations, tod]);

  // Camere ocupate acum
  var ocupate = useMemo(function() {
    var set = new Set(inCursRez.map(function(r) { return r.room; }));
    return rooms.filter(function(room) { return set.has(room); });
  }, [inCursRez, rooms]);

  // Camere blocate azi
  var blocateRooms = useMemo(function() {
    return rooms.filter(function(room) {
      return reservations.some(function(r) {
        return r.room === room && r.status === 'blocked' &&
               r.checkIn <= tod && addDays(r.checkIn, r.nights || 0) > tod;
      });
    });
  }, [reservations, rooms, tod]);

  // Plecari azi — cazati acum SI checkout = azi
  var plecariAzi = useMemo(function() {
    return reservations.filter(function(r) {
      return addDays(r.checkIn, r.nights || 0) === tod && r.status !== 'blocked';
    });
  }, [reservations, tod]);

  // Sosiri azi
  var sosiriAzi = useMemo(function() {
    return reservations.filter(function(r) {
      return r.checkIn === tod && r.status !== 'blocked';
    });
  }, [reservations, tod]);

  // Sosiri maine
  var sosiriMaine = useMemo(function() {
    return reservations.filter(function(r) {
      return r.checkIn === tmr && r.status !== 'blocked';
    });
  }, [reservations, tmr]);

  // Camere libere (nu ocupate, nu blocate)
  var ocupateSet = new Set(ocupate.concat(blocateRooms));
  var libere = rooms.filter(function(r) { return !ocupateSet.has(r); });

  function openPopup(type) {
    var title, list, color, renderItem;
    if (type === 'ocupate') {
      title = '\uD83D\uDFE0 Cazati acum';
      color = '#d97706';
      list = inCursRez;
      renderItem = function(r) {
        var co = addDays(r.checkIn, r.nights || 0);
        var rest = (r.pricePerNight||0)*(r.nights||0) - (r.advance||0);
        return {
          main: fullName(r),
          sub: r.room + ' \u00B7 plecare ' + fmt(co) + (rest > 0 ? ' \u00B7 rest ' + rest + ' lei' : ''),
          phone: r.phone
        };
      };
    } else if (type === 'libere') {
      title = '\uD83D\uDFE2 Camere libere azi';
      color = '#16a34a';
      list = libere.map(function(room) { return { _room: room }; });
      renderItem = function(r) { return { main: r._room, sub: 'Libera' }; };
    } else if (type === 'plecari') {
      title = '\uD83D\uDEAA Plecari azi';
      color = '#92400e';
      list = plecariAzi;
      renderItem = function(r) {
        return {
          main: fullName(r),
          sub: r.room + ' \u00B7 check-in ' + fmt(r.checkIn),
          phone: r.phone
        };
      };
    } else if (type === 'sosiriAzi') {
      title = '\uD83D\uDFE2 Sosiri azi';
      color = '#1d4ed8';
      list = sosiriAzi;
      renderItem = function(r) {
        var co = addDays(r.checkIn, r.nights || 0);
        return {
          main: fullName(r),
          sub: r.room + ' \u00B7 ' + r.nights + ' nopti \u00B7 checkout ' + fmt(co),
          phone: r.phone
        };
      };
    } else if (type === 'sosiriMaine') {
      title = '\uD83D\uDCC5 Sosiri maine';
      color = '#2563eb';
      list = sosiriMaine;
      renderItem = function(r) {
        var co = addDays(r.checkIn, r.nights || 0);
        return {
          main: fullName(r),
          sub: r.room + ' \u00B7 ' + r.nights + ' nopti \u00B7 checkout ' + fmt(co),
          phone: r.phone
        };
      };
    }
    setPopup({ title: title, color: color, list: list, renderItem: renderItem });
  }

  var cells = [
    { num: ocupate.length, lbl: 'Ocupate', color: ocupate.length > 0 ? 'amber' : '', type: 'ocupate' },
    { num: libere.length, lbl: 'Libere', color: libere.length > 0 ? 'green' : '', type: 'libere' },
    { num: plecariAzi.length, lbl: 'Plecari azi', color: plecariAzi.length > 0 ? 'amber' : '', type: 'plecari' },
    { num: sosiriAzi.length, lbl: 'Sosiri azi', color: sosiriAzi.length > 0 ? 'blue' : '', type: 'sosiriAzi' },
    { num: sosiriMaine.length, lbl: 'Sosiri maine', color: sosiriMaine.length > 0 ? 'blue' : '', type: 'sosiriMaine' },
  ];

  return h(Fragment, null,
    h('div', { className: 'tod-bar' },
      h('div', { className: 'tod-bar-inner' },
        cells.map(function(cell) {
          return h('div', {
            key: cell.type,
            className: 'tod-cell ' + (cell.color || ''),
            onClick: function() { openPopup(cell.type); }
          },
            h('div', { className: 'tod-num' }, cell.num),
            h('div', { className: 'tod-lbl' }, cell.lbl)
          );
        })
      )
    ),

    // POPUP modal
    popup && h('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
      onClick: function() { setPopup(null); }
    },
      h('div', {
        style: { background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom)' },
        onClick: function(e) { e.stopPropagation(); }
      },
        // Header popup
        h('div', { style: { background: popup.color, color: '#fff', padding: '16px 18px', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          h('span', { style: { fontSize: 18, fontWeight: 800 } }, popup.title),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { style: { background: 'rgba(255,255,255,.25)', padding: '3px 10px', borderRadius: 10, fontSize: 14, fontWeight: 700 } }, popup.list.length + ' total'),
            h('button', { onClick: function() { setPopup(null); }, style: { background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '\u2715')
          )
        ),
        // Lista
        h('div', { style: { overflowY: 'auto', flex: 1, padding: '8px 0' } },
          popup.list.length === 0
            ? h('div', { style: { textAlign: 'center', padding: '30px 20px', color: '#94a3b8', fontSize: 15 } }, 'Nicio inregistrare')
            : popup.list.map(function(r, i) {
                var item = popup.renderItem(r);
                return h('div', { key: i, style: { padding: '12px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 } },
                  h('div', { style: { flex: 1, minWidth: 0 } },
                    h('div', { style: { fontSize: 16, fontWeight: 700, color: '#1a202c' } }, item.main),
                    h('div', { style: { fontSize: 13, color: '#64748b', marginTop: 2 } }, item.sub)
                  ),
                  item.phone && h('div', { style: { display: 'flex', gap: 6, flexShrink: 0 } },
                    h('a', { href: 'tel:' + item.phone, style: { width: 36, height: 36, borderRadius: 9, background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' } }, h(IPhone)),
                    h('a', { href: waUrl(item.phone), target: '_blank', rel: 'noopener', style: { width: 36, height: 36, borderRadius: 9, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' } }, h(IWa))
                  )
                );
              })
        )
      )
    )
  );
}
