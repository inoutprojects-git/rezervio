// ── DEFAULT MESSAGE TEMPLATES ──────────────────────────────────────────────────
var DEFAULT_TEMPLATES = [
  {
    id: 'confirm',
    name: '✓ Confirmare Rezervare',
    text: 'Buna {Nume},\n\nMultumim ca ati rezervat la {PensionName}!\n\nDetalii:\n📅 Check-in: {CheckIn}\n📅 Check-out: {CheckOut}\n🛏️ Camera: {Camera}\n🌙 Nopti: {Nights}\n💰 Total: {Total} lei\n\nPas urmaator: confirmati sosirea cu 24h inainte.\n\nOrice intrebare: {TelGazda}'
  },
  {
    id: 'info_sosire',
    name: '📍 Informatii Sosire',
    text: 'Buna {Nume},\n\nInformatii check-in pentr {CheckIn}:\n\n🔑 Cod Acces: [COMPLETEZ]\n📍 Adresa: {Adresa}\n🅿️ Parcare: {Parcare}\n📶 WiFi: {WiFiReteaua}\nParola: {WiFiParola}\n\nContactati-ne oricand!\n{TelGazda}'
  },
  {
    id: 'reminder_checkout',
    name: '👋 Reminder Check-Out',
    text: 'Buna {Nume},\n\nV amintim ca check-out este astazi pana la 11:00 AM.\n\nMultumim pentru sejur!\n\nReview: {LinkReview}\n\n{TelGazda}'
  },
  {
    id: 'cerere_review',
    name: '⭐ Cerere Review Google',
    text: 'Buna {Nume},\n\nAm apreciat prezenta voastra la {PensionName}!\n\nAcum mi-ar face mare placere sa cititi parerea voastra pe Google:\n\n{LinkReview}\n\nMultumim! 🙏'
  },
  {
    id: 'oferta_speciala',
    name: '🎁 Oferta Speciala',
    text: '{Nume},\n\nOferta pentru tine!\n\n{PensionName} are 20% reducere pentru urmatoarele 3 zile.\n\nRezervari: {LinkReserv}\n\nValabil pentru: {DataOferta}'
  },
  {
    id: 'intrebari',
    name: '❓ Raspuns Intrebari',
    text: 'Buna {Nume},\n\nMultumim pentru intrebare!\n\n[COMPLETEAZA RASPUNSUL]\n\nAsteptam cu placere!\n\n{TelGazda}'
  },
  {
    id: 'confirmare_plata',
    name: '💳 Confirmare Plata',
    text: 'Buna {Nume},\n\nPlata pentru {Camera} ({CheckIn}, {Nights}n) - {Total} lei a fost confirmata.\n\nFactura: [LINK]\n\nMultumim! ✓'
  },
  {
    id: 'regulator',
    name: '📋 Regulament',
    text: 'Buna {Nume},\n\nUmatorii sunt regulamentul cazarii la {PensionName}:\n\n✓ Check-in: 14:00\n✓ Check-out: 11:00\n✓ Animale: {Animale}\n✓ Parcare: {Parcare}\n\nOrice intrebare: {TelGazda}'
  },
  {
    id: 'disponibilitate',
    name: '🏨 Verificare Disponibilitate',
    text: 'Buna,\n\nAvem disponibilitate pentru {DataFrom} - {DataTo}?\n\nCamere dorite: {Camere}\nPersone: {Persoane}\n\nAstept raspuns.\n\n{TelGazda}'
  },
  {
    id: 'multumire',
    name: '💚 Mesaj Multumire',
    text: 'Buna {Nume},\n\nMultumim din inima ca ati ales {PensionName} pentru sejurul vostru!\n\nAm fost onorati sa va gazduim si sper sa revenii curand.\n\nVa trimitem un mail cu cateva poze frumoase din sejur.\n\nPan data viitoare! 👋'
  }
];

// ── TEMPLATE VARIABLES ─────────────────────────────────────────────────────────
function buildVarsFromRes(res, pensionName, settings) {
  settings = settings || {};
  var checkOut = addDays(res.checkIn, res.nights || 0);
  var total = (res.nights || 0) * (res.pricePerNight || 0);
  return {
    Nume: fullName(res),
    PensionName: pensionName || 'Pensiunea',
    Camera: res.room || '-',
    CheckIn: fmt(res.checkIn),
    CheckOut: fmt(checkOut),
    Nights: res.nights || 0,
    Total: total.toFixed(2),
    TelGazda: settings.hostPhone || '+40...',
    WiFiReteaua: settings.wifiName || 'SSID',
    WiFiParola: settings.wifiPass || '***',
    Adresa: settings.address || 'Adresa',
    Parcare: settings.parking || 'Parcare descriere',
    LinkReview: settings.reviewLink || 'https://...',
    LinkReserv: settings.bookingLink || 'https://...',
    Animale: settings.animals || 'Nu sunt admise',
    Persoane: '2',
    DataFrom: fmt(res.checkIn),
    DataTo: fmt(checkOut),
    Camere: res.room || '-',
    DataOferta: addDays(todayStr(), 3)
  };
}

function applyTemplate(text, vars) {
  var result = text;
  for (var key in vars) {
    result = result.replace(new RegExp('{' + key + '}', 'g'), vars[key] || '');
  }
  return result;
}
