
const STORE_KEY = 'bedtimeQuestData_v2';
const LIGHTS_OUT_HOUR = 23, LIGHTS_OUT_MIN = 0;
const WAKE_HOUR = 7, WAKE_MIN = 15;
const SLEEP_TARGET_HOURS = 7.5;
const SHIELD_INTERVAL = 7;
const MAX_SHIELDS = 3;
const MILESTONES = [3, 7, 14, 30, 60, 100];
const MILESTONE_TITLES = { 3: '3 nights', 7: '1 week', 14: '2 weeks', 30: '1 month', 60: '2 months', 100: '100 nights' };
const TIERS = ['Sleepy novice','Dream apprentice','Night wanderer','Moonlit adept','Dream guardian','Slumber master'];

const TEETH_FACTS = [
"Enamel is the hardest substance in the human body, harder than bone.",
"Saliva is about 99% water, but the other 1% is enzymes that start digesting food before it reaches your stomach.",
"Dentists generally recommend a new toothbrush every 3 to 4 months, sooner if bristles fray.",
"Fluoride works by helping teeth reabsorb minerals faster than acid strips them away.",
"Plaque can start hardening into tartar in as little as 24 to 72 hours, which is why daily brushing beats occasional deep cleans.",
"Sharks regrow teeth continuously. Humans get exactly two sets in a lifetime.",
"Chewing sugar-free gum after a meal can boost saliva flow and help neutralize acid, though it's no substitute for brushing.",
"Your mouth produces roughly half a liter to a liter of saliva a day."
];
const AUDIOBOOK_FACTS = [
"Audiobook narration typically runs 150 to 160 words a minute, close to natural conversational speech.",
"The term 'talking books' was coined in the 1930s for spoken-word recordings made for blind and visually impaired readers, decades before 'audiobook' caught on.",
"The first talking books were distributed on vinyl in 1932 by the American Foundation for the Blind.",
"Reading fiction before bed is linked to lower reported stress in several sleep-hygiene studies, partly just from being an off-ramp from notifications.",
"Being read to activates similar auditory-processing brain regions in adults as it does in children, which may be part of why audiobooks feel soothing.",
"Some listeners deliberately use long, slow-paced audiobooks as a sleep aid rather than for the story itself.",
"Studies on pre-sleep reading versus screens generally find people fall asleep faster with reading, largely due to less blue light and no algorithmic feed.",
"Narrating audiobooks is its own acting discipline. Some narrators voice dozens of distinct characters per book."
];
const DIGITAL_FACTS = [
"The average smartphone user unlocks their phone over 100 times a day. Charging it outside the bedroom short-circuits a chunk of that.",
"Blue light suppresses melatonin more than warm light does, part of why screens before bed can delay sleep onset.",
"Notification badges are often red on purpose. Red reliably triggers more urgency than other colors in UI testing.",
"Product designers have openly discussed borrowing slot-machine style variable rewards for social feeds, part of why infinite scroll is sticky.",
"Grayscale mode (making your screen black and white) is a real studied intervention some people use to cut a phone's visual pull.",
"The first text message ever sent said 'Merry Christmas,' from a computer to a phone, in 1992.",
"Airplane mode exists for radio interference reasons, not focus, but it's become a popular manual way to force a break.",
"In many surveys, most people check their phone within 15 minutes of waking, which is part of why where you put it overnight matters."
];
const CHRONO_FACTS = [
"A tiny brain region called the suprachiasmatic nucleus resets your circadian clock daily using light through your eyes.",
"Waking at the same time every day, even weekends, is one of the most consistently recommended sleep habits since it anchors your rhythm more than a fixed bedtime does.",
"Cortisol naturally rises 30 to 45 minutes before waking in what's called the cortisol awakening response. A steady wake time trains this.",
"Sleep runs in roughly 90-minute cycles. Waking near the end of one tends to feel less groggy than waking mid-cycle.",
"Morning sunlight in the first hour after waking helps anchor your circadian rhythm and can improve sleep the following night.",
"'Social jet lag' describes the gap between weekday and weekend wake times. Bigger gaps are linked to worse mood and metabolic markers.",
"Being a night owl or early bird has a genetic component tied to variation in circadian clock genes, not just habit.",
"Naps longer than 20 to 30 minutes risk tipping into deep sleep, making grogginess on waking worse rather than better."
];

const HABITS = {
  phoneAway: { label: 'Phone away on time', facts: DIGITAL_FACTS, milestones: [3,7,14,30] },
  teeth: { label: 'Teeth brushed', facts: TEETH_FACTS, milestones: [3,7,14,30] },
  audiobook: { label: 'Audiobook over scrolling', facts: AUDIOBOOK_FACTS, milestones: [3,7,14,30] },
  wake: { label: 'Consistent wake time', facts: CHRONO_FACTS, milestones: [3,7,14,30] }
};

const QUESTS = [
  { key: 'phoneAway', label: 'Phone away and charging', type: 'check' },
  { key: null, label: 'Lights dimmed', type: 'check' },
  { key: 'teeth', label: 'Teeth brushed', type: 'check' },
  { key: 'audiobook', label: 'Wind-down activity', type: 'choice' },
  { key: null, label: 'Water glass by the bed', type: 'check' }
];

const TIER1_TRIVIA = [
"Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
"Octopuses have three hearts, and two of them stop beating when they swim.",
"Bananas are botanically berries. Strawberries, technically, are not.",
"A day on Venus is longer than a year on Venus. It rotates that slowly.",
"The Eiffel Tower grows about 6 inches taller in summer from thermal expansion of the metal.",
"Wombat droppings are cube-shaped, thought to stop them rolling away so they mark territory better.",
"Sea otters hold hands while sleeping so they don't drift apart from each other.",
"There are more possible chess games than atoms in the observable universe."
];
const TIER2_SCIENCE = [
"Your brain uses about 20% of your body's total energy despite being roughly 2% of your body weight.",
"Deep sleep runs your brain's glymphatic system, essentially a nightly wash cycle clearing waste proteins linked to Alzheimer's.",
"Muscle memory for skills like typing or biking gets consolidated during sleep, not only during practice.",
"Tardigrades, microscopic 'water bears,' can survive the vacuum of space, extreme radiation, and decades frozen.",
"Your gut has over 100 million neurons of its own and talks directly to your brain through the vagus nerve.",
"Trees share resources through underground fungal networks sometimes called the wood wide web.",
"Yawning is contagious across species. Dogs often yawn after watching their owners yawn.",
"Placebos can trigger measurable brain chemistry changes, including real dopamine release, not just belief."
];
const TIER3_INTERNET = [
"The first webcam was built at Cambridge University in 1991, pointed at a coffee pot so people could check it was full.",
"The @ symbol was picked for email addresses in 1971 by engineer Ray Tomlinson mainly because it was an unused, unambiguous character on his keyboard.",
"Gmail invites were traded like currency online during its years-long invite-only beta in the mid-2000s.",
"The word 'meme' was coined by Richard Dawkins in 1976, decades before the internet version of the concept stuck.",
"The first tweet, from Jack Dorsey in 2006, read: 'just setting up my twttr.'",
".com domain registrations were free until 1995, when Network Solutions started charging $50 a year.",
"The Konami Code (up up down down left right left right B A) started as a 1986 game cheat and is still hidden as an easter egg on websites today.",
"CERN released the World Wide Web royalty-free to the public in 1993, a decision widely credited with letting it grow the way it did."
];
const TIER4_HOBBIES = [
"Try a windowsill herb garden. Basil and mint are nearly impossible to kill and pay off within weeks.",
"Try one new cuisine a week, one pot, no pressure for it to look good.",
"Try sketching one object a day for five minutes in the same notebook. Consistency over quality.",
"Try field recording: 30 seconds of ambient sound on a walk each day, building a small sound diary.",
"Try logging one line on every book or show you finish. It turns consumption into a small archive.",
"Try learning 5 chords on guitar or ukulele. Most pop songs use a handful of shapes.",
"Try thrift flipping: one cheap item a week, refinished, repainted, or reupholstered.",
"Try an urban foraging walk with a plant-ID app. It turns an ordinary walk into a scavenger hunt."
];
const BIG_TIERS = [TIER1_TRIVIA, TIER2_SCIENCE, TIER3_INTERNET, TIER4_HOBBIES];
const BIG_TIER_NAMES = ['light trivia', 'sleep science', 'internet history', 'hobby starters'];
const PERFECT_TIER_THRESH = [0, 7, 14, 30];

function todayStr(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function yesterdayStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}
function freshHabitState() { return { streak: 0, best: 0, lastDate: '', unlockedCount: 0, revealed: [] }; }

function load() {
  let raw = localStorage.getItem(STORE_KEY);
  let data = raw ? JSON.parse(raw) : null;
  const today = todayStr(new Date());
  if (!data) {
    data = {
      date: today, wakeDate: '',
      checks: QUESTS.map(q => q.type === 'choice' ? null : false),
      xp: 0, streak: 0, bestStreak: 0, shields: 0, shieldsAwardedAt: 0, badges: [],
      doneToday: false, wakeDoneToday: false,
      lastLightsOutAt: null, lastLightsOutOnTime: false,
      perfectStreak: 0, bestPerfectStreak: 0, perfectBadges: [], perfectRevealCount: 0, perfectLastDate: '',
      habits: { phoneAway: freshHabitState(), teeth: freshHabitState(), audiobook: freshHabitState(), wake: freshHabitState() },
      factLog: []
    };
  }
  if (!data.habits) data.habits = { phoneAway: freshHabitState(), teeth: freshHabitState(), audiobook: freshHabitState(), wake: freshHabitState() };
  if (!data.factLog) data.factLog = [];
  if (data.perfectStreak === undefined) data.perfectStreak = 0;
  if (data.bestPerfectStreak === undefined) data.bestPerfectStreak = 0;
  if (!data.perfectBadges) data.perfectBadges = [];
  if (data.perfectRevealCount === undefined) data.perfectRevealCount = 0;
  if (data.perfectLastDate === undefined) data.perfectLastDate = '';
  if (data.date !== today) {
    data.date = today;
    data.checks = QUESTS.map(q => q.type === 'choice' ? null : false);
    data.doneToday = false;
  }
  if (data.wakeDate !== today) data.wakeDoneToday = false;
  return data;
}
function save(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }

let state = load();

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

function render() {
  const list = document.getElementById('questList');
  list.innerHTML = '';
  QUESTS.forEach((q, i) => {
    const li = document.createElement('li');
    if (q.type === 'check') {
      if (state.checks[i]) li.classList.add('done');
      li.innerHTML = '<label><input type="checkbox" data-i="' + i + '" ' + (state.checks[i] ? 'checked' : '') + '> ' + q.label + '</label>';
    } else {
      const val = state.checks[i];
      if (val) li.classList.add('done');
      li.innerHTML = '<div style="font-size:14px;margin-bottom:4px">' + q.label + '</div>' +
        '<div class="choice-row">' +
        '<button type="button" class="choice-btn' + (val === 'audiobook' ? ' picked-good' : '') + '" data-i="' + i + '" data-v="audiobook">Audiobook / reading</button>' +
        '<button type="button" class="choice-btn' + (val === 'scrolling' ? ' picked-bad' : '') + '" data-i="' + i + '" data-v="scrolling">Scrolling</button>' +
        '</div>';
    }
    list.appendChild(li);
  });
  list.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', e => {
      const i = +e.target.dataset.i;
      const was = state.checks[i];
      state.checks[i] = e.target.checked;
      state.xp += was ? -20 : 20;
      if (state.xp < 0) state.xp = 0;
      save(state); render();
    });
  });
  list.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = +e.target.dataset.i;
      const v = e.target.dataset.v;
      const wasGood = state.checks[i] === 'audiobook';
      state.checks[i] = v;
      if (v === 'audiobook' && !wasGood) state.xp += 20;
      if (v !== 'audiobook' && wasGood) state.xp -= 20;
      if (state.xp < 0) state.xp = 0;
      save(state); render();
    });
  });

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
  hp.innerHTML = '<h2>Habit tracks</h2>';
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
}

document.getElementById('lightsOutBtn').addEventListener('click', () => {
  if (state.doneToday) return;
  const now = new Date();
  const cutoff = new Date(now); cutoff.setHours(LIGHTS_OUT_HOUR, LIGHTS_OUT_MIN, 0, 0);
  const onTime = now <= cutoff;
  state.doneToday = true;
  state.lastLightsOutAt = now.getTime();
  state.lastLightsOutOnTime = onTime;

  const toastMsgs = [];
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
    document.getElementById('feedback').textContent = 'Logged after 11:00pm, but a shield absorbed it, streak stays at ' + state.streak + '.';
    toastMsgs.push('Shield used.');
  } else {
    state.streak = 0;
    document.getElementById('feedback').textContent = 'Logged after 11:00pm. Streak reset, tomorrow is a fresh shot.';
  }

  QUESTS.forEach((q, i) => {
    if (!q.key) return;
    const success = q.type === 'choice' ? state.checks[i] === 'audiobook' : !!state.checks[i];
    const unlocked = bumpHabit(q.key, success, state.date);
    if (unlocked) toastMsgs.push(unlocked.habit + ' streak x' + unlocked.milestone + ': ' + unlocked.fact);
  });

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
  let wakeMsg = onTimeWake ? 'Up on time.' : 'Logged after 7:15am wake streak reset.';
  if (unlocked) wakeMsg += ' ' + unlocked.habit + ' streak x' + unlocked.milestone + ': ' + unlocked.fact;
  document.getElementById('wakeFeedback').textContent = wakeMsg;

  let hoursSlept = null;
  if (state.lastLightsOutAt) {
    const gap = now.getTime() - state.lastLightsOutAt;
    if (gap > 0 && gap < 16 * 3600000) hoursSlept = gap / 3600000;
  }
  const isPerfect = onTimeWake && state.lastLightsOutOnTime && hoursSlept !== null && hoursSlept >= SLEEP_TARGET_HOURS;
  const card = document.getElementById('unlockCard');

  if (isPerfect) {
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

    card.innerHTML = '<div class="unlock-card"><span class="tag">' + BIG_TIER_NAMES[tierIdx] + ' &middot; ' + hoursSlept.toFixed(1) + 'h sleep</span>' + fact + '</div>';
  } else {
    state.perfectStreak = 0;
    let reason = 'Not a perfect night';
    if (hoursSlept !== null) reason += ' (' + hoursSlept.toFixed(1) + 'h sleep)';
    card.innerHTML = '<div class="unlock-card"><span class="tag">' + reason + '</span>Lights out on time, wake on time, and ' + SLEEP_TARGET_HOURS + '+ hours all need to line up to unlock tonight\'s content.</div>';
  }

  save(state); render();
});

render();
updateClock();
setInterval(updateClock, 15000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
