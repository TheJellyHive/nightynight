global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }
};
const els = {};
function makeEl(id) {
  if (!els[id]) els[id] = {
    _text: '', _html: '', style: {}, classList: { add(){}, remove(){}, contains(){return false;} },
    disabled: false,
    set textContent(v){ this._text = v; }, get textContent(){ return this._text; },
    set innerHTML(v){ this._html = v; }, get innerHTML(){ return this._html; },
    appendChild(){}, addEventListener(){}, querySelectorAll(){ return []; }, title:''
  };
  return els[id];
}
global.document = {
  getElementById: (id) => makeEl(id),
  createElement: () => makeEl('tmp_' + Math.random()),
  addEventListener(){}
};
global.navigator = {};
global.window = { addEventListener(){} };

const fs = require('fs');
const combined = fs.readFileSync('facts.js', 'utf8') + '\n' + fs.readFileSync('app.js', 'utf8');
eval(combined);

console.log('=== TEST 1: initial state ===');
console.log('xp:', state.xp, 'status:', state.status.type);
console.log('bonus quests picked:', state.quests.bonus.map(b => b.id));
console.log('core quests:', Object.keys(state.quests));

console.log('=== TEST 2: seededPick determinism ===');
const p1 = seededPick('2026-07-09', BONUS_POOL, 2).map(x=>x.id);
const p2 = seededPick('2026-07-09', BONUS_POOL, 2).map(x=>x.id);
const p3 = seededPick('2026-07-10', BONUS_POOL, 2).map(x=>x.id);
console.log('same date twice equal:', JSON.stringify(p1) === JSON.stringify(p2), p1);
console.log('different date differs:', JSON.stringify(p1) !== JSON.stringify(p3), p3);

console.log('=== TEST 3: outcomeForTime buckets ===');
function t(h,m){ const d = new Date(); d.setHours(h,m,0,0); return outcomeForTime(d); }
console.log('22:30 ->', t(22,30), '(expect onTime)');
console.log('23:00 ->', t(23,0), '(expect onTime)');
console.log('23:30 ->', t(23,30), '(expect wired)');
console.log('01:00 ->', t(1,0), '(expect groggy)');
console.log('04:00 ->', t(4,0), '(expect zonked)');

console.log('=== TEST 4: deadline + fallback mechanic ===');
state.quests.teeth = freshQuestState();
const realDate = Date;
const fixedTime = new realDate(); fixedTime.setHours(23,30,0,0);
global.Date = class extends realDate {
  constructor(...args) { if (args.length === 0) { return new realDate(fixedTime.getTime()); } return new realDate(...args); }
};
Object.setPrototypeOf(global.Date, realDate);
checkDeadlines();
console.log('teeth failed after 23:30 (deadline 22:00):', state.quests.teeth.failed, '(expect true)');
toggleCoreQuest('teeth');
console.log('teeth done via fallback:', state.quests.teeth.done, 'usingFallback:', state.quests.teeth.fallback, '(expect true true)');
global.Date = realDate;

console.log('=== TEST 5: habit streak + milestone unlock ===');
state.habits.teeth = freshHabitState();
state.factLog = [];
bumpHabit('teeth', true, '2026-07-01');
bumpHabit('teeth', true, '2026-07-02');
const u = bumpHabit('teeth', true, '2026-07-03');
console.log('streak after 3 consecutive successes:', state.habits.teeth.streak, '(expect 3)');
console.log('milestone unlock at 3:', JSON.stringify(u));

console.log('=== TEST 6: status multiplier math ===');
state.status = { type: 'groggy' };
console.log('groggy mult:', statusMult(), '(expect 0.5)');
const before = state.xp;
awardXp(20);
console.log('awardXp(20) with groggy added:', state.xp - before, '(expect 10)');

console.log('=== TEST 7: zonked on skipped day ===');
save(state);
const raw = JSON.parse(localStorage.getItem(STORE_KEY));
raw.date = '2026-07-01';
raw.nextStatus = { type: 'none' };
localStorage.setItem(STORE_KEY, JSON.stringify(raw));
const reloaded = load();
console.log('gap-skip status:', reloaded.status.type, '(expect zonked, since real today is later)');

console.log('=== ALL TESTS COMPLETE ===');
