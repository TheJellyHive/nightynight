const MORNING_STORE_KEY = 'bedtimeMorningData_v1';
const MORNING_MILESTONES = [3, 7, 14, 30, 60, 100];
const MORNING_MILESTONE_TITLES = { 3: '3 mornings', 7: '1 week', 14: '2 weeks', 30: '1 month', 60: '2 months', 100: '100 mornings' };
const MORNING_ITEMS = [
  { id: 'teeth', label: 'Teeth brushed' },
  { id: 'floss', label: 'Flossed' },
  { id: 'mouthwash', label: 'Mouthwash' },
  { id: 'rogaine', label: 'Rogaine applied' }
];
const CLOTHES_ITEM = { id: 'clothes', label: "Tomorrow's clothes set out" };

function mDateStr(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function mYesterday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return mDateStr(d);
}
function freshMorningChecks() {
  const c = {};
  MORNING_ITEMS.forEach(i => c[i.id] = false);
  c[CLOTHES_ITEM.id] = false;
  return c;
}

function loadMorning() {
  let raw = localStorage.getItem(MORNING_STORE_KEY);
  let data = raw ? JSON.parse(raw) : null;
  const today = mDateStr(new Date());
  if (!data) {
    data = { date: today, checks: freshMorningChecks(), officeTomorrow: false, streakCountedToday: false, streak: 0, best: 0, badges: [], lastFullDate: '' };
  }
  if (!data.badges) data.badges = [];
  if (data.lastFullDate === undefined) data.lastFullDate = '';
  if (data.date !== today) {
    data.date = today;
    data.checks = freshMorningChecks();
    data.officeTomorrow = false;
    data.streakCountedToday = false;
  }
  return data;
}
function saveMorning(d) { localStorage.setItem(MORNING_STORE_KEY, JSON.stringify(d)); }

let mState = loadMorning();

function applicableItems() {
  return mState.officeTomorrow ? MORNING_ITEMS.concat([CLOTHES_ITEM]) : MORNING_ITEMS;
}

function evaluateStreak() {
  const items = applicableItems();
  const allDone = items.every(i => mState.checks[i.id]);
  if (allDone && !mState.streakCountedToday) {
    mState.streak = (mState.lastFullDate === mYesterday(mState.date)) ? mState.streak + 1 : 1;
    mState.best = Math.max(mState.best, mState.streak);
    mState.lastFullDate = mState.date;
    mState.streakCountedToday = true;
    MORNING_MILESTONES.forEach(m => {
      if (mState.streak >= m && !mState.badges.includes(m)) mState.badges.push(m);
    });
  }
}

function renderMorning() {
  document.getElementById('officeToggle').checked = mState.officeTomorrow;

  const items = applicableItems();
  const list = document.getElementById('morningList');
  list.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    if (mState.checks[item.id]) li.classList.add('done');
    li.innerHTML = '<label><input type="checkbox" data-item="' + item.id + '" ' + (mState.checks[item.id] ? 'checked' : '') + '> ' + item.label + '</label>';
    list.appendChild(li);
  });
  list.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', e => {
      mState.checks[e.target.dataset.item] = e.target.checked;
      evaluateStreak();
      saveMorning(mState);
      renderMorning();
    });
  });

  const doneCount = items.filter(i => mState.checks[i.id]).length;
  document.getElementById('progressLabel').textContent = doneCount + ' of ' + items.length + ' done';

  document.getElementById('morningStreak').textContent = mState.streak;
  document.getElementById('morningBest').textContent = mState.best;

  const shelf = document.getElementById('morningBadges');
  shelf.innerHTML = '';
  MORNING_MILESTONES.forEach(m => {
    const span = document.createElement('span');
    span.className = 'badge' + (mState.badges.includes(m) ? ' earned' : '');
    span.textContent = MORNING_MILESTONE_TITLES[m];
    shelf.appendChild(span);
  });
}

document.getElementById('officeToggle').addEventListener('change', e => {
  mState.officeTomorrow = e.target.checked;
  saveMorning(mState);
  renderMorning();
});

renderMorning();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
