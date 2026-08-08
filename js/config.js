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
  { dot: '#3b82f6', light: '#dbeafe', text: '#1d4ed8' },
  { dot: '#ec4899', light: '#fce7f3', text: '#be185d' },
  { dot: '#f59e0b', light: '#fef3c7', text: '#92400e' },
  { dot: '#10b981', light: '#d1fae5', text: '#065f46' },
  { dot: '#8b5cf6', light: '#ede9fe', text: '#5b21b6' }
];

var SYNC_PLATFORMS = [
  { id: 'booking', name: 'Booking.com', icon: '🔵', color: '#003580' },
  { id: 'airbnb', name: 'Airbnb', icon: '🔴', color: '#FF385C' },
  { id: 'other', name: 'Alta platforma (iCal generic)', icon: '🟣', color: '#7c3aed' }
];

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
