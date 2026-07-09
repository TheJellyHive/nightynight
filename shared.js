const SLEEP_STORE_KEY = 'bedtimeSleepData_v1';

function sqDateStr(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

function sqAddDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return sqDateStr(d);
}

function loadSleepLog() {
  let raw = localStorage.getItem(SLEEP_STORE_KEY);
  let data = raw ? JSON.parse(raw) : null;
  if (!data) data = { entries: {}, pendingGoodnightAt: null, pendingGoodnightDate: null };
  if (!data.entries) data.entries = {};
  return data;
}
function saveSleepLog(d) { localStorage.setItem(SLEEP_STORE_KEY, JSON.stringify(d)); }

function writeSleepEntry(dateStr, hours, source) {
  const log = loadSleepLog();
  log.entries[dateStr] = { hours: Math.round(hours * 4) / 4, source: source };
  saveSleepLog(log);
  return log;
}

function rgbStr(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

function hoursToColor(h) {
  const stops = [
    [0, [226, 75, 74]],
    [4, [226, 75, 74]],
    [5, [255, 216, 138]],
    [7, [79, 214, 160]],
    [9, [79, 214, 160]],
    [10, [255, 216, 138]],
    [13, [255, 216, 138]]
  ];
  if (h <= stops[0][0]) return rgbStr(stops[0][1]);
  if (h >= stops[stops.length - 1][0]) return rgbStr(stops[stops.length - 1][1]);
  for (let i = 0; i < stops.length - 1; i++) {
    const h1 = stops[i][0], c1 = stops[i][1];
    const h2 = stops[i + 1][0], c2 = stops[i + 1][1];
    if (h >= h1 && h <= h2) {
      const t = h2 === h1 ? 0 : (h - h1) / (h2 - h1);
      const c = c1.map((v, idx) => Math.round(v + (c2[idx] - v) * t));
      return rgbStr(c);
    }
  }
  return rgbStr(stops[stops.length - 1][1]);
}

function qualityLabel(h) {
  if (h <= 4) return 'bad';
  if (h < 7) return 'okay';
  if (h <= 9) return 'good';
  return 'okay';
}
