
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
function tCheck(h,m){ const d = new Date(); d.setHours(h,m,0,0); return outcomeForTime(d); }
console.log('22:30 ->', tCheck(22,30), '(expect onTime)');
console.log('23:00 ->', tCheck(23,0), '(expect onTime)');
console.log('23:30 ->', tCheck(23,30), '(expect wired)');
console.log('01:00 ->', tCheck(1,0), '(expect groggy)');
console.log('04:00 ->', tCheck(4,0), '(expect zonked)');

console.log('=== TEST 4: deadline + fallback mechanic ===');
state.quests.teeth = freshQuestState();
const realDateCtor = Date;
const fixedTime = new realDateCtor(); fixedTime.setHours(23,30,0,0);
Date = class extends realDateCtor {
  constructor(...args) { if (args.length === 0) { return new realDateCtor(fixedTime.getTime()); } return new realDateCtor(...args); }
};
checkDeadlines();
console.log('teeth failed after 23:30 (deadline 22:00):', state.quests.teeth.failed, '(expect true)');
toggleCoreQuest('teeth');
console.log('teeth done via fallback:', state.quests.teeth.done, 'usingFallback:', state.quests.teeth.fallback, '(expect true true)');
Date = realDateCtor;

console.log('=== TEST 5: habit streak + milestone unlock ===');
state.habits.teeth = freshHabitState();
state.factLog = [];
bumpHabit('teeth', true, '2026-07-01');
bumpHabit('teeth', true, '2026-07-02');
const unlockResult = bumpHabit('teeth', true, '2026-07-03');
console.log('streak after 3 consecutive successes:', state.habits.teeth.streak, '(expect 3)');
console.log('milestone unlock at 3:', JSON.stringify(unlockResult));

console.log('=== TEST 6: status multiplier math ===');
state.status = { type: 'groggy' };
console.log('groggy mult:', statusMult(), '(expect 0.5)');
const beforeXp = state.xp;
awardXp(20);
console.log('awardXp(20) with groggy added:', state.xp - beforeXp, '(expect 10)');

console.log('=== TEST 7: zonked on skipped day ===');
save(state);
const rawStored = JSON.parse(localStorage.getItem(STORE_KEY));
rawStored.date = '2026-07-01';
rawStored.nextStatus = { type: 'none' };
localStorage.setItem(STORE_KEY, JSON.stringify(rawStored));
const reloaded = load();
console.log('gap-skip status:', reloaded.status.type, '(expect zonked)');

console.log('=== ALL TESTS COMPLETE ===');
process.exit(0);
