
const STORE_KEY = 'bedtimeQuestData';
const QUESTS = [
  'Phone away and charging',
  'Lights dimmed',
  'Teeth brushed',
  'Wind-down activity (read, stretch, journal)',
  'Water glass by the bed'
];
const TIERS = ['Sleepy novice','Dream apprentice','Night wanderer','Moonlit adept','Dream guardian','Slumber master'];
const SHIELD_INTERVAL = 7;
const MAX_SHIELDS = 3;
const MILESTONES = [3, 7, 14, 30, 60, 100];
const MILESTONE_TITLES = { 3: '3 nights', 7: '1 week', 14: '2 weeks', 30: '1 month', 60: '2 months', 100: '100 nights' };

function todayStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function load() {
  let raw = localStorage.getItem(STORE_KEY);
  let data = raw ? JSON.parse(raw) : null;
  const today = todayStr(new Date());
  if (!data) {
    data = { date: today, checks: QUESTS.map(()=>false), xp: 0, streak: 0, bestStreak: 0,
              wakeStreak: 0, doneToday: false, wakeDoneToday: false, wakeDate: '',
              shields: 0, shieldsAwardedAt: 0, badges: [] };
  }
  if (data.shields === undefined) data.shields = 0;
  if (data.shieldsAwardedAt === undefined) data.shieldsAwardedAt = 0;
  if (data.badges === undefined) data.badges = [];
  if (data.date !== today) {
    data.date = today;
    data.checks = QUESTS.map(()=>false);
    data.doneToday = false;
  }
  if (data.wakeDate !== today) {
    data.wakeDoneToday = false;
  }
  return data;
}
function save(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }

let state = load();

function render() {
  const list = document.getElementById('questList');
  list.innerHTML = '';
  QUESTS.forEach((q, i) => {
    const li = document.createElement('li');
    if (state.checks[i]) li.classList.add('done');
    li.innerHTML = '<label><input type="checkbox" data-i="' + i + '" ' + (state.checks[i] ? 'checked' : '') + '> ' + q + '</label>';
    list.appendChild(li);
  });
  list.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', e => {
      const i = +e.target.dataset.i;
      const wasChecked = state.checks[i];
      state.checks[i] = e.target.checked;
      state.xp += wasChecked ? -20 : 20;
      if (state.xp < 0) state.xp = 0;
      save(state);
      render();
    });
  });

  const level = Math.floor(state.xp / 100) + 1;
  const xpIntoLevel = state.xp % 100;
  document.getElementById('levelBadge').textContent = 'Lvl ' + level;
  document.getElementById('xpFill').style.width = xpIntoLevel + '%';
  document.getElementById('tierLabel').textContent = TIERS[Math.min(level-1, TIERS.length-1)];
  document.getElementById('streakDisplay').textContent = '\u{1F525} ' + state.streak;
  document.getElementById('bestStreak').textContent = state.bestStreak;
  document.getElementById('wakeStreak').textContent = state.wakeStreak;

  const intoShield = state.streak % SHIELD_INTERVAL;
  let starsHtml = '';
  for (let i = 0; i < SHIELD_INTERVAL; i++) {
    starsHtml += '<span class="' + (i < intoShield ? 'star-lit' : 'star-dim') + '">★</span>';
  }
  document.getElementById('shieldProgress').innerHTML = starsHtml + ' (' + intoShield + '/' + SHIELD_INTERVAL + ')';

  let shieldHtml = '';
  for (let i = 0; i < MAX_SHIELDS; i++) {
    shieldHtml += '<span class="' + (i < state.shields ? 'shield-active' : 'shield-empty') + '">⛨</span>';
  }
  document.getElementById('shieldIcons').innerHTML = shieldHtml;

  const shelf = document.getElementById('badgeShelf');
  shelf.innerHTML = '';
  MILESTONES.forEach(m => {
    const span = document.createElement('span');
    span.className = 'badge' + (state.badges.includes(m) ? ' earned' : '');
    span.textContent = MILESTONE_TITLES[m];
    shelf.appendChild(span);
  });

  const btn = document.getElementById('lightsOutBtn');
  btn.disabled = state.doneToday;
  btn.textContent = state.doneToday ? 'Logged for tonight' : 'Log lights out';

  const riseBtn = document.getElementById('riseBtn');
  riseBtn.disabled = state.wakeDoneToday;
  riseBtn.textContent = state.wakeDoneToday ? 'Checked in for today' : "I'm up (7:00am check-in)";
}

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = hh + ':' + mm;

  const cutoff = new Date(now);
  cutoff.setHours(23,0,0,0);
  const cd = document.getElementById('countdown');
  if (state.doneToday) {
    cd.textContent = 'Tonight is logged. Sleep well.';
  } else if (now < cutoff) {
    let diff = cutoff - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    cd.textContent = h + 'h ' + m + 'm until lights-out deadline';
  } else {
    cd.textContent = 'Past 11:00pm — log it anyway, no judgment';
  }
}

document.getElementById('lightsOutBtn').addEventListener('click', () => {
  if (state.doneToday) return;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(23,0,0,0);
  const onTime = now <= cutoff;
  state.doneToday = true;
  const toast = document.getElementById('toast');
  toast.textContent = '';
  if (onTime) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.xp += 30;
    document.getElementById('feedback').textContent = 'On time — streak now ' + state.streak + ' night(s). +30 xp.';

    if (state.streak > 0 && state.streak % SHIELD_INTERVAL === 0 && state.streak > state.shieldsAwardedAt && state.shields < MAX_SHIELDS) {
      state.shields += 1;
      state.shieldsAwardedAt = state.streak;
      toast.textContent = 'Shield earned! It will protect one late night.';
    }
    MILESTONES.forEach(m => {
      if (state.streak >= m && !state.badges.includes(m)) {
        state.badges.push(m);
        toast.textContent = 'Milestone unlocked: ' + MILESTONE_TITLES[m] + ' — added to your trophy shelf for good.';
      }
    });
  } else if (state.shields > 0) {
    state.shields -= 1;
    document.getElementById('feedback').textContent = 'Logged after 11:00pm, but a shield absorbed it — streak stays at ' + state.streak + '.';
    toast.textContent = 'Shield used.';
  } else {
    state.streak = 0;
    document.getElementById('feedback').textContent = 'Logged after 11:00pm. Streak reset — tomorrow is a fresh shot.';
  }
  save(state);
  render();
});

document.getElementById('riseBtn').addEventListener('click', () => {
  if (state.wakeDoneToday) return;
  const now = new Date();
  const target = new Date(now);
  target.setHours(7,15,0,0);
  const onTime = now <= target;
  state.wakeDoneToday = true;
  state.wakeDate = todayStr(now);
  if (onTime) {
    state.wakeStreak += 1;
    document.getElementById('wakeFeedback').textContent = 'Up on time — wake streak ' + state.wakeStreak + '.';
  } else {
    state.wakeStreak = 0;
    document.getElementById('wakeFeedback').textContent = 'Logged after 7:15am. Wake streak reset.';
  }
  save(state);
  render();
});

render();
updateClock();
setInterval(updateClock, 1000 * 15);
