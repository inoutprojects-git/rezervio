// ── APP ROOT COMPONENT ────────────────────────────────────────────────────────

var h = React.createElement;

function App() {
  // State management — toți hook-urile la început (React rule)
  var ls = useState(true); var loading = ls[0], setLoading = ls[1];
  var ss = useState('online'); var sync = ss[0], setSync = ss[1];
  var ts = useState('rez'); var tab = ts[0], setTab = ts[1];
  var rs = useState([]); var reservations = rs[0], setReservations = rs[1];
  var rms = useState(DEF_ROOMS); var rooms = rms[0], setRooms = rms[1];
  var srcs = useState(DEF_SRC); var sources = srcs[0], setSources = srcs[1];
  var rps = useState({}); var roomPrices = rps[0], setRoomPrices = rps[1];
  var pn = useState('Pensiunea'); var pensionName = pn[0], setPensionName = pn[1];
  var pp = useState(null); var pensionPhoto = pp[0], setPensionPhoto = pp[1];
  var ms = useState(null); var modal = ms[0], setModal = ms[1];
  var dsm = useState(null); var detailRes = dsm[0], setDetailRes = dsm[1];
  var os = useState(null); var confirm = os[0], setConfirm = os[1];
  var drw = useState(false); var drawerOpen = drw[0], setDrawerOpen = drw[1];
  var shw = useState(false); var showRooms = shw[0], setShowRooms = shw[1];
  var shs = useState(false); var showSrc = shs[0], setShowSrc = shs[1];
  var shi = useState(false); var showIcal = shi[0], setShowIcal = shi[1];
  var shp = useState(false); var showPdf = shp[0], setShowPdf = shp[1];
  var shpr = useState(false); var showPrices = shpr[0], setShowPrices = shpr[1];
  var pss = useState(false); var showPensionSettings = pss[0], setShowPensionSettings = pss[1];
  var acs = useState(false); var showAccountSettings = acs[0], setShowAccountSettings = acs[1];
  var sms = useState(false); var showMessages = sms[0], setShowMessages = sms[1];
  var mrs = useState(null); var msgRes = mrs[0], setMsgRes = mrs[1];
  var bis = useState(null); var billingInfo = bis[0], setBillingInfo = bis[1];
  var sbi = useState(false); var showBillingInfo = sbi[0], setShowBillingInfo = sbi[1];
  var cos = useState(false); var calOpen = cos[0], setCalOpen = cos[1];

  // useEffect: listen to Firebase data
  useEffect(function() {
    setLoading(true);
    var offConfig = fb.on('config', function(c) {
      if (c) {
        setRooms(c.rooms || DEF_ROOMS);
        setSources(c.sources || DEF_SRC);
        setRoomPrices(c.roomPrices || {});
        setPensionName(c.pensionName || 'Pensiunea');
        setPensionPhoto(c.pensionPhoto || null);
      }
      setLoading(false);
    });
    var offRes = fb.on('reservations', function(r) {
      if (r) {
        var arr = [];
        Object.keys(r).forEach(function(k) { arr.push(Object.assign({ id: k }, r[k])); });
        setReservations(arr);
      } else {
        setReservations([]);
      }
    });
    return function() { offConfig && offConfig(); offRes && offRes(); };
  }, []);

  // useEffect: fetch billingInfo for current user
  useEffect(function() {
    var user = firebase.auth().currentUser;
    if (user) {
      firebaseDB.ref('users/' + user.uid + '/billingInfo').once('value', function(snap) {
        if (snap.val()) setBillingInfo(snap.val());
      });
    }
  }, []);

  // Calculează conflicte de rezrvări
  var conflicts = useMemo(function() {
    var conf = [];
    rooms.forEach(function(room) {
      var forRoom = reservations.filter(function(r) { return blocksRoom(r, room); });
      for (var i = 0; i < forRoom.length; i++) {
        for (var j = i + 1; j < forRoom.length; j++) {
          var r1 = forRoom[i], r2 = forRoom[j];
          if (overlaps(r1.checkIn, r1.nights || 0, r2.checkIn, r2.nights || 0)) {
            conf.push({ room: room, from: r1.checkIn });
          }
        }
      }
    });
    return conf;
  }, [reservations, rooms]);

  // Callback-uri pentru acțiuni
  function openNew(room) { setModal({ mode: 'new', data: Object.assign({}, EMPTY_RES, { room: room || '', source: sources[0] || '' }) }); }
  function openEdit(res) { setModal({ mode: 'edit', data: res }); }
  function openCopy(res) { var copy = Object.assign({}, res); delete copy.id; setModal({ mode: 'new', data: copy }); }
  function openMove(res) { setModal({ mode: 'move', data: res }); }

  function saveRes(data, force) {
    if (!force && data.room && data.checkIn && data.nights) {
      var conflict = false;
      reservations.forEach(function(r) {
        if (r.id !== data.id && blocksRoom(r, data.room) && overlaps(r.checkIn, r.nights, data.checkIn, data.nights)) {
          conflict = true;
        }
      });
      if (conflict) {
        setConfirm({
          msg: 'Overlap detectat. Continui oricum?',
          ok: function() { saveRes(data, true); setConfirm(null); }
        });
        return;
      }
    }

    setSync('syncing');
    var promise = data.id
      ? fb.set('reservations/' + data.id, data)
      : fb.push('reservations', data);

    promise
      .then(function() {
        setSync('online');
        setModal(null);
        setDetailRes(null);
        setMsgRes(null);
      })
      .catch(function(err) {
        console.error('Save error:', err);
        setSync('error');
        alert('Eroare la salvare: ' + err.message);
      });
  }

  function delRes(id, name) {
    setConfirm({
      msg: 'Șterge rezervarea ' + name + '?',
      ok: function() {
        setSync('syncing');
        fb.remove('reservations/' + id)
          .then(function() { setSync('online'); setConfirm(null); })
          .catch(function(err) { console.error('Delete error:', err); setSync('error'); });
      }
    });
  }

  function saveRooms(newRooms) {
    setSync('syncing');
    return saveConfig({ rooms: newRooms })
      .then(function() { setShowRooms(false); setSync('online'); })
      .catch(function(err) { console.error('Save rooms error:', err); setSync('error'); alert('Eroare: ' + err.message); });
  }

  function saveSrc(newSrcs) {
    setSync('syncing');
    return saveConfig({ sources: newSrcs })
      .then(function() { setShowSrc(false); setSync('online'); })
      .catch(function(err) { console.error('Save sources error:', err); setSync('error'); alert('Eroare: ' + err.message); });
  }

  function savePrices(newPrices) {
    setSync('syncing');
    return saveConfig({ roomPrices: newPrices })
      .then(function() { setShowPrices(false); setSync('online'); })
      .catch(function(err) { console.error('Save prices error:', err); setSync('error'); alert('Eroare: ' + err.message); });
  }

  function savePensionSettings(name, photo) {
    setSync('syncing');
    return saveConfig({ pensionName: name, pensionPhoto: photo })
      .then(function() { setShowPensionSettings(false); setSync('online'); })
      .catch(function(err) { console.error('Save pension error:', err); setSync('error'); alert('Eroare: ' + err.message); });
  }

  function saveBillingInfo(data) {
    var user = firebase.auth().currentUser;
    if (!user) return Promise.reject(new Error('No user logged in'));
    setSync('syncing');
    return firebaseDB.ref('users/' + user.uid + '/billingInfo').set(data)
      .then(function() { setBillingInfo(data); setShowBillingInfo(false); setSync('online'); })
      .catch(function(err) { console.error('Save billing error:', err); setSync('error'); alert('Eroare: ' + err.message); });
  }

  function saveConfig(partial) {
    setSync('syncing');
    var merged = Object.assign({}, { rooms: rooms, sources: sources, roomPrices: roomPrices, pensionName: pensionName, pensionPhoto: pensionPhoto }, partial);
    return fb.set('config', merged)
      .then(function() {
        setSync('online');
      })
      .catch(function(err) {
        console.error('Config save error:', err);
        setSync('error');
        alert('Eroare la salvare: ' + err.message);
        throw err;
      });
  }

  function navTo(t) { setTab(t); setDrawerOpen(false); }
  var pageLabels = { rez: 'Rezervari', 'cal-month': 'Calendar lunar', 'cal-week': 'Calendar saptamanal', 'cal-custom': 'Calendar interval', stats: 'Statistici', archive: 'Istoric rezervari' };
  var calViewMap = { 'cal-month': 'month', 'cal-week': 'week', 'cal-custom': 'custom' };

  // RENDER
  return h('div', { className: 'app' },
    // HEADER
    h('div', { className: 'hdr' },
      h('div', { className: 'hdr-row' },
        h('button', { className: 'mbtn', onClick: function() { setDrawerOpen(!drawerOpen); } },
          h('span'), h('span'), h('span')
        ),
        h('div', { className: 'hdr-mid' },
          h('div', { className: 'hdr-tit' }, pensionPhoto ? h('img', { src: pensionPhoto, style: { width: 30, height: 30, borderRadius: 6, marginRight: 8 } }) : '🏡', ' ' + pensionName),
          h('div', { className: 'hdr-pg' }, pageLabels[tab] || 'Aplicatie')
        ),
        h('div', { className: 'spill' },
          h('span', { className: 'sdot', style: { background: sync === 'online' ? '#10b981' : sync === 'syncing' ? '#f59e0b' : '#ef4444' } }),
          h('span', { className: 'slbl' }, sync === 'online' ? 'Sincronizat' : sync === 'syncing' ? 'Se salveaza...' : 'Offline')
        )
      )
    ),

    // DRAWER
    drawerOpen && h(Drawer, {
      tab: tab, navTo: navTo,
      onOpenRooms: function() { setShowRooms(true); setDrawerOpen(false); },
      onOpenSrc: function() { setShowSrc(true); setDrawerOpen(false); },
      onOpenIcal: function() { setShowIcal(true); setDrawerOpen(false); },
      onOpenPdf: function() { setShowPdf(true); setDrawerOpen(false); },
      onOpenPrices: function() { setShowPrices(true); setDrawerOpen(false); },
      onOpenPensionSettings: function() { setShowPensionSettings(true); setDrawerOpen(false); },
      onOpenAccountSettings: function() { setShowAccountSettings(true); setDrawerOpen(false); },
      onOpenBillingInfo: function() { setShowBillingInfo(true); setDrawerOpen(false); },
      onOpenMessages: function() { setMsgRes(null); setShowMessages(true); setDrawerOpen(false); },
      onClose: function() { setDrawerOpen(false); }
    }),

    // TODAY BAR
    h(TodayBar, { reservations: reservations, rooms: rooms, sources: sources }),

    // CONTENT
    tab === 'rez' && h(ResTab, { rooms: rooms, sources: sources, reservations: reservations, conflicts: conflicts, onNew: openNew, onEdit: openEdit, onCopy: openCopy, onMove: openMove, onDelete: delRes, onSendMsg: function(r) { setMsgRes(r); setShowMessages(true); } }),
    tab.startsWith('cal') && h(CalTab, { rooms: rooms, sources: sources, reservations: reservations, initView: calViewMap[tab] || 'month', onNew: openNew, onEdit: openEdit }),
    tab === 'stats' && h(StatsTab, { rooms: rooms, sources: sources, reservations: reservations }),
    tab === 'archive' && h(ArchiveTab, { rooms: rooms, sources: sources, reservations: reservations, onEdit: openEdit, onCopy: openCopy, onMove: openMove, onDelete: delRes, onSendMsg: function(r) { setMsgRes(r); setShowMessages(true); } }),

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
    showPrices && h(PricesMgr, { rooms: rooms, roomPrices: roomPrices, onSave: savePrices, onClose: function() { setShowPrices(false); } }),
    confirm && h(Confirm, { msg: confirm.msg, okLbl: confirm.okLbl, ok: confirm.ok, onCancel: function() { setConfirm(null); } })
  );
}

// App e gata, dar NU e montată
// Componentele React (Drawer, ResTab, etc.) trebuie definite DUPĂ App, înainte de startApp()

// ── START APP ──────────────────────────────────────────────────────────────────
function startApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
}

// Expus global pentru a-l apela din Firebase init (index.html script block 1)
window.startApp = startApp;

// NOTE: Componentele React (Drawer, ResTab, ResRow, etc.) sunt momentan
// în index-backup.html. Vor fi extrase în fișiere separate după.
// Pentru moment, app.js conține doar App root și state management.
