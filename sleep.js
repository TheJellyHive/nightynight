function defaultManualDate() {
  const now = new Date();
  const d = now.getHours() < 12 ? sqAddDays(sqDateStr(now), -1) : sqDateStr(now);
  return d;
}

function renderSleepPage() {
  const log = loadSleepLog();
  const today = sqDateStr(new Date());

  const goodnightBtn = document.getElementById('goodnightBtn');
  const goodmorningBtn = document.getElementById('goodmorningBtn');
  if (log.pendingGoodnightAt) {
    goodnightBtn.disabled = true;
    goodnightBtn.textContent = 'Goodnight logged';
    goodmorningBtn.disabled = false;
  } else {
    goodnightBtn.disabled = false;
    goodnightBtn.textContent = 'Goodnight';
    goodmorningBtn.disabled = false;
  }

  const chart = document.getElementById('sleepChart');
  chart.innerHTML = '';
  const days = [];
  for (let i = 29; i >= 0; i--) days.push(sqAddDays(today, -i));

  let sum7 = 0, count7 = 0, sum30 = 0, count30 = 0;
  days.forEach((d, idx) => {
    const entry = log.entries[d];
    const bar = document.createElement('div');
    bar.title = d + (entry ? ': ' + entry.hours + 'h' : ': no data');
    if (entry) {
      const h = entry.hours;
      const heightPx = Math.max(3, Math.min(h, 14) / 14 * 110);
      bar.className = 'sleep-bar';
      bar.style.height = heightPx + 'px';
      bar.style.background = hoursToColor(h);
      sum30 += h; count30 += 1;
      if (idx >= 23) { sum7 += h; count7 += 1; }
    } else {
      bar.className = 'sleep-bar empty';
      bar.style.height = '3px';
    }
    chart.appendChild(bar);
  });

  document.getElementById('avg7').textContent = count7 ? (sum7 / count7).toFixed(1) + 'h' : '-';
  document.getElementById('avg30').textContent = count30 ? (sum30 / count30).toFixed(1) + 'h' : '-';
  document.getElementById('nightsLogged').textContent = count30;

  const manualDateInput = document.getElementById('manualDate');
  if (!manualDateInput.value) manualDateInput.value = defaultManualDate();
}

document.getElementById('goodnightBtn').addEventListener('click', () => {
  const log = loadSleepLog();
  const now = new Date();
  log.pendingGoodnightAt = now.getTime();
  log.pendingGoodnightDate = sqDateStr(now);
  saveSleepLog(log);
  document.getElementById('sleepFeedback').textContent = 'Goodnight logged. Tap Good morning when you wake up.';
  renderSleepPage();
});

document.getElementById('goodmorningBtn').addEventListener('click', () => {
  const log = loadSleepLog();
  if (!log.pendingGoodnightAt) {
    document.getElementById('sleepFeedback').textContent = "No goodnight logged yet. Tap Goodnight first, or use manual entry below.";
    return;
  }
  const now = new Date();
  const gap = now.getTime() - log.pendingGoodnightAt;
  const hours = gap / 3600000;
  writeSleepEntry(log.pendingGoodnightDate, hours, 'goodnight');
  const fresh = loadSleepLog();
  fresh.pendingGoodnightAt = null;
  fresh.pendingGoodnightDate = null;
  saveSleepLog(fresh);
  document.getElementById('sleepFeedback').textContent = 'Logged ' + hours.toFixed(1) + 'h for ' + log.pendingGoodnightDate + '.';
  renderSleepPage();
});

document.getElementById('manualLogBtn').addEventListener('click', () => {
  const dateVal = document.getElementById('manualDate').value;
  const hoursVal = parseFloat(document.getElementById('manualHours').value);
  if (!dateVal || isNaN(hoursVal) || hoursVal < 0) {
    document.getElementById('sleepFeedback').textContent = 'Enter a date and a valid number of hours.';
    return;
  }
  writeSleepEntry(dateVal, hoursVal, 'manual');
  document.getElementById('sleepFeedback').textContent = 'Logged ' + hoursVal + 'h for ' + dateVal + '.';
  document.getElementById('manualHours').value = '';
  renderSleepPage();
});

renderSleepPage();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
