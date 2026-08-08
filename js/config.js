// ── FIREBASE CONFIG ────────────────────────────────────────────────────────────
var firebaseConfig = {
  apiKey: 'AIzaSyCzbX-fmQyA-cB1dZZPmU1rjJSfH70Hweg',
  authDomain: 'master-rezervari.firebaseapp.com',
  databaseURL: 'https://master-rezervari-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'master-rezervari',
  storageBucket: 'master-rezervari.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123'
};

// ── GLOBAL VARIABLES (populat de Firebase init) ────────────────────────────────
var PENSION_ID = null;
var firebaseDB = null;
var firebaseAuth = null;

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
var WHOLE = '__ALL__'; // rezervare toata locatia
var SIM_KEY = 'my_sim_phone';
var CACHE_NAME = 'rzv6';

var DEF_SRC = ['Ionut', 'Adi', 'Booking'];
var DEF_ROOMS = ['Camera 1', 'Camera 2', 'Camera 3', 'Camera 4'];

var EMPTY_RES = {
  id: null, room: '', firstName: '', lastName: '', phone: '',
  checkIn: '', nights: 1, pricePerNight: 0, advance: 0,
  source: '', comments: '', status: 'occupied'
};

var PAL = [
  { light: '#dbeafe', text: '#1e40af', dot: '#2563eb' },
  { light: '#dcfce7', text: '#15803d', dot: '#16a34a' },
  { light: '#fee2e2', text: '#b91c1c', dot: '#dc2626' },
  { light: '#fef3c7', text: '#92400e', dot: '#d97706' },
  { light: '#f3e8ff', text: '#6b21a8', dot: '#9333ea' },
  { light: '#ffedd5', text: '#9a3412', dot: '#ea580c' },
  { light: '#cffafe', text: '#155e75', dot: '#0891b2' },
  { light: '#fce7f3', text: '#9d174d', dot: '#db2777' }
];

// NOTA: SYNC_PLATFORMS este definit in app.js (langa ICalMgr component) —
// versiunea completa cu importLabel/host folosita de sincronizare.

// ── LOCAL CACHE HELPER ─────────────────────────────────────────────────────────
var lc = {
  get: function(k, d) {
    try {
      var v = localStorage.getItem(k);
      return v != null ? JSON.parse(v) : d;
    } catch(e) { return d; }
  },
  set: function(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
  },
  del: function(k) { try { localStorage.removeItem(k); } catch(e) {} }
};

// ── SIM PHONE HELPERS ──────────────────────────────────────────────────────────
function getSimPhone() { return localStorage.getItem(SIM_KEY) || ''; }
function setSimPhone(v) { localStorage.setItem(SIM_KEY, v); }

// ── BLOCK ROOM HELPER ──────────────────────────────────────────────────────────
function blocksRoom(res, room) { return res.room === room || res.room === WHOLE; }
