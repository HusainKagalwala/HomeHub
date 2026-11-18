// Prayer times, calculated in the browser (no outside service, works offline).
// Location and time zone: change these to move the timings.
const PRAYER_LOC = { lat: 43.589, lon: -79.644, tz: "America/Toronto" };   // Mississauga

// Calculation methods. Dawoodi Bohra jamaats publish their own timetables, so compare a day against yours
// and use the minute adjustments (gear icon) or edit these numbers until they match.
//   fajr / isha: sun angle below the horizon, in degrees
//   maghribMin: minutes after sunset  |  maghribAngle: sun angle below horizon (Shia redness rule)
//   asr: shadow factor (1 = shadow equals object)
const PRAYER_METHODS = {
  standard: { label: "Standard (Fajr 18°, Isha 17°, Maghrib +3 min)", fajr: 18, isha: 17, maghribMin: 3, asr: 1 },
  jafari:   { label: "Shia / Jafari (Fajr 16°, Isha 14°, Maghrib 4°)", fajr: 16, isha: 14, maghribAngle: 4, asr: 1 },
};

const _rad = (d) => d * Math.PI / 180, _deg = (r) => r * 180 / Math.PI;
function _sun(jd) {
  const D = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360, q = (280.459 + 0.98564736 * D) % 360;
  const L = q + 1.915 * Math.sin(_rad(g)) + 0.020 * Math.sin(_rad(2 * g));
  const e = 23.439 - 0.00000036 * D;
  let RA = _deg(Math.atan2(Math.cos(_rad(e)) * Math.sin(_rad(L)), Math.cos(_rad(L)))) / 15;
  RA = ((RA % 24) + 24) % 24;
  const decl = _deg(Math.asin(Math.sin(_rad(e)) * Math.sin(_rad(L))));
  let eqt = q / 15 - RA; eqt = ((eqt + 12) % 24 + 24) % 24 - 12;
  return { decl, eqt };
}

// date: any Date (only its local year/month/day are used). adj: { fajr, zawaal, asr, maghrib, isha } minutes.
function prayerTimes(date, m, adj = {}, loc = PRAYER_LOC) {
  const y = date.getFullYear(), mo = date.getMonth(), d = date.getDate();
  const base = Date.UTC(y, mo, d);                              // 00:00 UTC of that calendar date
  const jd = (base + 12 * 3600e3) / 864e5 + 2440587.5 - loc.lon / 360;
  const { decl, eqt } = _sun(jd);
  const noon = 12 - loc.lon / 15 - eqt;                          // solar noon, hours UTC
  const sl = Math.sin(_rad(loc.lat)), cl = Math.cos(_rad(loc.lat)), sd = Math.sin(_rad(decl)), cd = Math.cos(_rad(decl));
  const hours = (altDeg) => Math.acos((Math.sin(_rad(altDeg)) - sl * sd) / (cl * cd)) * 180 / Math.PI / 15;  // hour angle for sun altitude
  const at = (h, extraMin = 0) => new Date(base + h * 3600e3 + extraMin * 60e3 + 30e3);   // +30 s rounds to the nearest minute
  const asrAlt = _deg(Math.atan(1 / (m.asr + Math.tan(_rad(Math.abs(loc.lat - decl))))));
  const sunH = hours(-0.833);
  const maghribH = m.maghribAngle != null ? hours(-m.maghribAngle) : sunH;
  return {
    fajr: at(noon - hours(-m.fajr), adj.fajr || 0),
    sunrise: at(noon - sunH),
    zawaal: at(noon, adj.zawaal || 0),
    asr: at(noon + hours(asrAlt), adj.asr || 0),
    maghrib: at(noon + maghribH, (m.maghribAngle != null ? 0 : (m.maghribMin || 0)) + (adj.maghrib || 0)),
    isha: at(noon + hours(-m.isha), adj.isha || 0),
  };
}
