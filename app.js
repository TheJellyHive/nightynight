function todayStr(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function yesterdayStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}
function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}
function freshHabitState() { return { streak: 0, best: 0, lastDate: '', unlockedCount: 0, revealed: [] }; }
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seededPick(dateStr, pool, n) {
  const rng = mulberry32(hashStr(dateStr));
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
function deadlineDate(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = ((h + 11) % 12) + 1;
  return h12 + (m ? ':' + String(m).padStart(2,'0') : '') + period;
}
function freshQuestState() { return { done: false, fallback: false, failed: false }; }

function effectiveQuestDate(now) {
  // A "quest night" runs from evening through the following morning.
  // Anything before noon still belongs to the previous calendar day's cycle,
  // so checking in at 12:30am doesn't wipe an unfinished checklist or reroll
  // the bonus quests out from under you. Only past noon do we treat it as
  // genuinely the next quest day, whether or not last night got logged.
  return now.getHours() < 12 ? yesterdayStr(todayStr(now)) : todayStr(now);
}

function load() {
  let raw = localStorage.getItem(STORE_KEY);
  let data = raw ? JSON.parse(raw) : null;
  const today = effectiveQuestDate(new Date());

  if (!data) {
    data = {
      date: today, wakeDate: '', bonusDate: '',
      quests: {
        teeth: freshQuestState(), phoneAway: freshQuestState(),
        audiobook: { choice: null },
        bonus: []
      },
      xp: 0, streak: 0, bestStreak: 0, shields: 0, shieldsAwardedAt: 0, badges: [],
      doneToday: false, wakeDoneToday: false,
      lastLightsOutAt: null, lastLightsOutOnTime: false,
      perfectStreak: 0, bestPerfectStreak: 0, perfectBadges: [], perfectRevealCount: 0, perfectLastDate: '',
      habits: { phoneAway: freshHabitState(), teeth: freshHabitState(), audiobook: freshHabitState(), wake: freshHabitState() },
      factLog: [], history: [],
      status: { type: 'none' }, nextStatus: null
    };
  }
  if (!data.status) data.status = { type: 'none' };
  if (data.nextStatus === undefined) data.nextStatus = null;
  if (!data.history) data.history = [];
  if (!data.quests) {
    data.quests = { teeth: freshQuestState(), phoneAway: freshQuestState(), audiobook: { choice: null }, bonus: [] };
    data.bonusDate = '';
  }

  if (data.date !== today) {
    const gap = daysBetween(data.date, today);
    if (gap > 1) {
      data.status = { type: 'zonked' };
      data.history.unshift({ date: data.date, outcome: 'missed', points: 0 });
    } else {
      data.status = data.nextStatus || { type: 'none' };
    }
    data.nextStatus = null;
    data.date = today;
    data.quests.teeth = freshQuestState();
    data.quests.phoneAway = freshQuestState();
    data.quests.audiobook = { choice: null };
    data.doneToday = false;
  }
  if (data.bonusDate !== today) {
    data.quests.bonus = seededPick(today, BONUS_POOL, 2).map(q => ({ id: q.id, done: false, fallback: false, failed: false }));
    data.bonusDate = today;
  }
  if (data.wakeDate !== today) data.wakeDoneToday = false;
  return data;
}
function save(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }

let state = load();

function statusMult() { return STATUS[state.status.type].mult; }
function awardXp(basePoints) {
  const amt = Math.round(basePoints * statusMult());
  state.xp += amt;
  if (state.xp < 0) state.xp = 0;
  return amt;
}

function checkDeadlines() {
  const now = new Date();
  ['teeth', 'phoneAway'].forEach(key => {
    const q = state.quests[key];
    const def = CORE_TIMED[key];
    if (!q.done && !q.failed && def.deadline && now > deadlineDate(def.deadline)) q.failed = true;
  });
  state.quests.bonus.forEach(bq => {
    const def = BONUS_POOL.find(b => b.id === bq.id);
    if (def && !bq.done && !bq.failed && def.deadline && now > deadlineDate(def.deadline)) bq.failed = true;
  });
}

function bumpHabit(key, success, dateStr) {
  const h = state.habits[key];
  const meta = HABITS[key];
  if (h.lastDate === dateStr) return null;
  if (success) {
    h.streak = (h.lastDate === yesterdayStr(dateStr)) ? h.streak + 1 : 1;
    h.best = Math.max(h.best, h.streak);
  } else {
    h.streak = 0;
  }
  h.lastDate = dateStr;
  let unlocked = null;
  if (success) {
    meta.milestones.forEach((m, idx) => {
      if (h.streak >= m && h.unlockedCount <= idx) {
        const factIdx = h.revealed.length % meta.facts.length;
        h.revealed.push(factIdx);
        h.unlockedCount = idx + 1;
        unlocked = { habit: meta.label, milestone: m, fact: meta.facts[factIdx] };
        state.factLog.unshift({ tag: meta.label, text: meta.facts[factIdx], date: dateStr });
      }
    });
  }
  return unlocked;
}

function timedQuestLi(label, def, qs, toggleAttr) {
  const li = document.createElement('li');
  if (qs.done) li.classList.add('done');
  if (qs.failed && !qs.done) li.classList.add('failed');

  const usingFallback = qs.failed && def.fallback;
  const displayLabel = usingFallback && !qs.done ? def.fallback.label : (qs.done && qs.fallback ? def.fallback.label : label);
  const pts = (qs.done ? (qs.fallback ? def.fallback.points : def.points) : (usingFallback ? def.fallback.points : def.points));
  const shownPts = Math.round(pts * statusMult());
  const disabled = (qs.failed && !def.fallback && !qs.done);

  let meta;
  if (qs.done) meta = qs.fallback ? 'done (recovered)' : 'done';
  else if (qs.failed && def.fallback) meta = 'missed the window, try this instead';
  else if (qs.failed) meta = 'missed';
  else if (def.deadline) meta = 'by ' + fmtTime(def.deadline);
  else meta = '';

  li.innerHTML = '<div class="quest-top"><label><input type="checkbox" ' + toggleAttr + ' ' + (qs.done ? 'checked' : '') + ' ' + (disabled ? 'disabled' : '') + '> ' + displayLabel + '</label><span class="pt-tag">+' + shownPts + '</span></div>' +
    (meta ? '<div class="quest-meta">' + meta + '</div>' : '');
  return li;
}

function toggleCoreQuest(key) {
  checkDeadlines();
  const q = state.quests[key];
  const def = CORE_TIMED[key];
  if (q.done) {
    state.xp -= Math.round((q.fallback ? def.fallback.points : def.points) * statusMult());
    if (state.xp < 0) state.xp = 0;
    q.done = false;
  } else {
    q.fallback = q.failed && !!def.fallback;
    awardXp(q.fallback ? def.fallback.points : def.points);
    q.done = true;
  }
  save(state); render();
}

function toggleBonusQuest(id) {
  checkDeadlines();
  const bq = state.quests.bonus.find(b => b.id === id);
  const def = BONUS_POOL.find(b => b.id === id);
  if (bq.done) {
    state.xp -= Math.round((bq.fallback ? def.fallback.points : def.points) * statusMult());
    if (state.xp < 0) state.xp = 0;
    bq.done = false;
  } else {
    bq.fallback = bq.failed && !!def.fallback;
    awardXp(bq.fallback ? def.fallback.points : def.points);
    bq.done = true;
  }
  save(state); render();
}

function render() {
  checkDeadlines();

  const sType = state.status.type;
  const sMeta = STATUS[sType];
  const banner = document.getElementById('statusBanner');
  banner.className = 'status-banner ' + sType;
  document.getElementById('statusName').textContent = sMeta.label;
  document.getElementById('statusNote').textContent = sMeta.note;
  document.getElementById('statusMult').textContent = 'x' + sMeta.mult;

  const list = document.getElementById('questList');
  list.innerHTML = '';

  list.appendChild(timedQuestLi(CORE_TIMED.teeth.label, CORE_TIMED.teeth, state.quests.teeth, 'data-core="teeth"'));
  list.appendChild(timedQuestLi(CORE_TIMED.phoneAway.label, CORE_TIMED.phoneAway, state.quests.phoneAway, 'data-core="phoneAway"'));

  const abLi = document.createElement('li');
  const abVal = state.quests.audiobook.choice;
  if (abVal === 'audiobook') abLi.classList.add('done');
  abLi.innerHTML = '<div style="font-size:14px;margin-bottom:4px">Wind-down activity <span class="pt-tag">+' + Math.round(30 * statusMult()) + '</span></div>' +
    '<div class="choice-row">' +
    '<button type="button" class="choice-btn' + (abVal === 'audiobook' ? ' picked-good' : '') + '" data-choice="audiobook">Audiobook / reading</button>' +
    '<button type="button" class="choice-btn' + (abVal === 'scrolling' ? ' picked-bad' : '') + '" data-choice="scrolling">Scrolling</button>' +
    '</div>';
  list.appendChild(abLi);

  state.quests.bonus.forEach(bq => {
    const def = BONUS_POOL.find(b => b.id === bq.id);
    if (def) list.appendChild(timedQuestLi(def.label, def, bq, 'data-bonus="' + bq.id + '"'));
  });

  list.querySelectorAll('[data-core]').forEach(cb => cb.addEventListener('change', e => toggleCoreQuest(e.target.dataset.core)));
  list.querySelectorAll('[data-bonus]').forEach(cb => cb.addEventListener('change', e => toggleBonusQuest(e.target.dataset.bonus)));
  list.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', e => {
    const v = e.target.dataset.choice;
    const was = state.quests.audiobook.choice;
    if (was === 'audiobook') state.xp -= Math.round(30 * statusMult());
    if (state.xp < 0) state.xp = 0;
    state.quests.audiobook.choice = v;
    if (v === 'audiobook') awardXp(30);
    save(state); render();
  }));

  const level = Math.floor(state.xp / 100) + 1;
  const xpIntoLevel = state.xp % 100;
  document.getElementById('levelBadge').textContent = 'Lvl ' + level;
  document.getElementById('xpFill').style.width = xpIntoLevel + '%';
  document.getElementById('streakDisplay').textContent = '\u{1F525} ' + state.streak;
  document.getElementById('bestStreak').textContent = state.bestStreak;

  const intoShield = state.streak % SHIELD_INTERVAL;
  let starsHtml = '';
  for (let i = 0; i < SHIELD_INTERVAL; i++) starsHtml += '<span class="' + (i < intoShield ? 'star-lit' : 'star-dim') + '">★</span>';
  document.getElementById('shieldProgress').innerHTML = starsHtml + ' (' + intoShield + '/' + SHIELD_INTERVAL + ')';

  let shieldHtml = '';
  for (let i = 0; i < MAX_SHIELDS; i++) shieldHtml += '<span class="' + (i < state.shields ? 'shield-active' : 'shield-empty') + '">⛨</span>';
  document.getElementById('shieldIcons').innerHTML = shieldHtml;

  const shelf = document.getElementById('badgeShelf');
  shelf.innerHTML = '';
  MILESTONES.forEach(m => {
    const span = document.createElement('span');
    span.className = 'badge' + (state.badges.includes(m) ? ' earned' : '');
    span.textContent = MILESTONE_TITLES[m];
    shelf.appendChild(span);
  });

  const histRow = document.getElementById('historyRow');
  histRow.innerHTML = '';
  const histColors = { onTime: '#4fd6a0', shielded: '#7fd6ff', wired: '#ffb37a', groggy: '#7f9fd6', zonked: '#ff6b6b', missed: '#55597a' };
  state.history.slice(0, 14).reverse().forEach(h => {
    const dot = document.createElement('span');
    dot.className = 'history-dot';
    dot.style.background = histColors[h.outcome] || '#ffffff1a';
    dot.title = h.date + ': ' + h.outcome;
    histRow.appendChild(dot);
  });

  document.getElementById('perfectStreakDisplay').textContent = '\u{1F31F} ' + state.perfectStreak;
  let tierIdx = 0;
  for (let i = PERFECT_TIER_THRESH.length - 1; i >= 0; i--) {
    if (state.perfectStreak >= PERFECT_TIER_THRESH[i]) { tierIdx = i; break; }
  }
  document.getElementById('perfectTier').textContent = BIG_TIER_NAMES[tierIdx];
  const pShelf = document.getElementById('perfectBadgeShelf');
  pShelf.innerHTML = '';
  MILESTONES.forEach(m => {
    const span = document.createElement('span');
    span.className = 'badge' + (state.perfectBadges.includes(m) ? ' earned' : '');
    span.textContent = MILESTONE_TITLES[m];
    pShelf.appendChild(span);
  });

  const hp = document.getElementById('habitPanel');
  hp.innerHTML = '';
  Object.keys(HABITS).forEach(key => {
    const h = state.habits[key];
    const meta = HABITS[key];
    const row = document.createElement('div');
    row.className = 'habit-row';
    row.innerHTML = '<span class="habit-name">' + meta.label + '</span><span class="habit-streak">' + h.streak + ' day' + (h.streak === 1 ? '' : 's') + '</span>';
    hp.appendChild(row);
  });

  const btn = document.getElementById('lightsOutBtn');
  btn.disabled = state.doneToday;
  btn.textContent = state.doneToday ? 'Logged for tonight' : 'Log lights out';

  const riseBtn = document.getElementById('riseBtn');
  riseBtn.disabled = state.wakeDoneToday;
  riseBtn.textContent = state.wakeDoneToday ? 'Checked in for today' : "I'm up (7:00am check-in)";

  const summary = document.getElementById('factLogSummary');
  summary.textContent = 'Unlocked facts (' + state.factLog.length + ')';
  const log = document.getElementById('factLog');
  log.innerHTML = '';
  state.factLog.slice(0, 40).forEach(f => {
    const div = document.createElement('div');
    div.className = 'fact-entry';
    div.innerHTML = '<span class="tag">' + f.tag + '</span>' + f.text;
    log.appendChild(div);
  });
}

function updateClock() {
  checkDeadlines();
  const now = new Date();
  document.getElementById('clock').textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  const cutoff = new Date(now); cutoff.setHours(LIGHTS_OUT_HOUR, LIGHTS_OUT_MIN, 0, 0);
  const cd = document.getElementById('countdown');
  if (state.doneToday) {
    cd.textContent = 'Tonight is logged. Sleep well.';
  } else if (now < cutoff) {
    const diff = cutoff - now;
    cd.textContent = Math.floor(diff/3600000) + 'h ' + Math.floor((diff%3600000)/60000) + 'm until lights-out deadline';
  } else {
    cd.textContent = 'Past 11:00pm, log it anyway, no judgment';
  }
  render();
}

function outcomeForTime(now) {
  const hour = now.getHours();
  let cutoff;
  if (hour < 12) {
    cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(LIGHTS_OUT_HOUR, LIGHTS_OUT_MIN, 0, 0);
  } else {
    cutoff = new Date(now);
    cutoff.setHours(LIGHTS_OUT_HOUR, LIGHTS_OUT_MIN, 0, 0);
  }
  if (now <= cutoff) return 'onTime';
  const lateHours = (now - cutoff) / 3600000;
  if (lateHours <= 1) return 'wired';
  if (lateHours <= 4) return 'groggy';
  return 'zonked';
}

document.getElementById('lightsOutBtn').addEventListener('click', () => {
  if (state.doneToday) return;
  checkDeadlines();
  const now = new Date();
  const outcome = outcomeForTime(now);
  const onTime = outcome === 'onTime';
  state.doneToday = true;
  state.lastLightsOutAt = now.getTime();
  state.lastLightsOutOnTime = onTime;

  const toastMsgs = [];
  let shielded = false;
  if (onTime) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.xp += 30;
    document.getElementById('feedback').textContent = 'On time, streak now ' + state.streak + ' night(s). +30 xp.';
    if (state.streak % SHIELD_INTERVAL === 0 && state.streak > state.shieldsAwardedAt && state.shields < MAX_SHIELDS) {
      state.shields += 1; state.shieldsAwardedAt = state.streak;
      toastMsgs.push('Shield earned. It will protect one late night.');
    }
    MILESTONES.forEach(m => {
      if (state.streak >= m && !state.badges.includes(m)) {
        state.badges.push(m);
        toastMsgs.push('Milestone unlocked: ' + MILESTONE_TITLES[m] + ', added to your trophy shelf for good.');
      }
    });
  } else if (state.shields > 0) {
    state.shields -= 1;
    shielded = true;
    document.getElementById('feedback').textContent = 'Logged late, but a shield absorbed it, streak stays at ' + state.streak + '. Tomorrow may still feel it though.';
    toastMsgs.push('Shield used.');
  } else {
    state.streak = 0;
    document.getElementById('feedback').textContent = 'Logged late. Streak reset, tomorrow is a fresh shot.';
  }

  const statusMap = { onTime: 'none', wired: 'wired', groggy: 'groggy', zonked: 'zonked' };
  state.nextStatus = { type: statusMap[outcome] };
  if (STATUS[statusMap[outcome]].mult < 1) toastMsgs.push('Status tomorrow: ' + STATUS[statusMap[outcome]].label + '.');

  const teethSuccess = state.quests.teeth.done;
  const phoneSuccess = state.quests.phoneAway.done;
  const audioSuccess = state.quests.audiobook.choice === 'audiobook';
  [['teeth', teethSuccess], ['phoneAway', phoneSuccess], ['audiobook', audioSuccess]].forEach(pair => {
    const key = pair[0], success = pair[1];
    const unlocked = bumpHabit(key, success, state.date);
    if (unlocked) toastMsgs.push(unlocked.habit + ' streak x' + unlocked.milestone + ': ' + unlocked.fact);
  });

  state.history.unshift({ date: state.date, outcome: shielded ? 'shielded' : outcome, points: state.xp });
  state.history = state.history.slice(0, 30);

  document.getElementById('toast').textContent = toastMsgs.join(' ');
  save(state); render();
});

document.getElementById('riseBtn').addEventListener('click', () => {
  if (state.wakeDoneToday) return;
  const now = new Date();
  const target = new Date(now); target.setHours(WAKE_HOUR, WAKE_MIN, 0, 0);
  const onTimeWake = now <= target;
  state.wakeDoneToday = true;
  state.wakeDate = state.date;

  const unlocked = bumpHabit('wake', onTimeWake, state.date);
  let wakeMsg = onTimeWake ? 'Up on time.' : 'Logged after 7:15am, wake streak reset.';
  if (unlocked) wakeMsg += ' ' + unlocked.habit + ' streak x' + unlocked.milestone + ': ' + unlocked.fact;
  document.getElementById('wakeFeedback').textContent = wakeMsg;

  let hoursSlept = null;
  if (state.lastLightsOutAt) {
    const gap = now.getTime() - state.lastLightsOutAt;
    if (gap > 0 && gap < 16 * 3600000) hoursSlept = gap / 3600000;
  }
  if (hoursSlept !== null && typeof writeSleepEntry === 'function') {
    writeSleepEntry(state.date, hoursSlept, 'quest');
  }
  const isPerfect = onTimeWake && state.lastLightsOutOnTime && hoursSlept !== null && hoursSlept >= SLEEP_TARGET_HOURS;
  const card = document.getElementById('unlockCard');

  if (isPerfect) {
    state.status = { type: 'wellRested' };
    const prevPerfectDate = state.perfectLastDate;
    state.perfectStreak = (prevPerfectDate === yesterdayStr(state.date)) ? state.perfectStreak + 1 : 1;
    state.bestPerfectStreak = Math.max(state.bestPerfectStreak, state.perfectStreak);
    state.perfectLastDate = state.date;

    let tierIdx = 0;
    for (let i = PERFECT_TIER_THRESH.length - 1; i >= 0; i--) {
      if (state.perfectStreak >= PERFECT_TIER_THRESH[i]) { tierIdx = i; break; }
    }
    const pool = BIG_TIERS[tierIdx];
    const factIdx = state.perfectRevealCount % pool.length;
    state.perfectRevealCount += 1;
    const fact = pool[factIdx];
    state.factLog.unshift({ tag: BIG_TIER_NAMES[tierIdx], text: fact, date: state.date });

    MILESTONES.forEach(m => {
      if (state.perfectStreak >= m && !state.perfectBadges.includes(m)) state.perfectBadges.push(m);
    });

    card.innerHTML = '<div class="unlock-card"><span class="tag">' + BIG_TIER_NAMES[tierIdx] + ' &middot; ' + hoursSlept.toFixed(1) + 'h sleep &middot; well rested today</span>' + fact + '</div>';
  } else {
    state.perfectStreak = 0;
    let reason = 'Not a perfect night';
    if (hoursSlept !== null) reason += ' (' + hoursSlept.toFixed(1) + 'h sleep)';
    card.innerHTML = '<div class="unlock-card"><span class="tag">' + reason + '</span>Lights out on time, wake on time, and ' + SLEEP_TARGET_HOURS + '+ hours all need to line up to unlock tonight&#39;s content.</div>';
  }

  save(state); render();
});

render();
updateClock();
setInterval(updateClock, 15000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
