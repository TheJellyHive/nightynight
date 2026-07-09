const STORE_KEY = 'bedtimeQuestData_v3';
const LIGHTS_OUT_HOUR = 23, LIGHTS_OUT_MIN = 0;
const WAKE_HOUR = 7, WAKE_MIN = 15;
const SLEEP_TARGET_HOURS = 7.5;
const SHIELD_INTERVAL = 7;
const MAX_SHIELDS = 3;
const MILESTONES = [3, 7, 14, 30, 60, 100];
const MILESTONE_TITLES = { 3: '3 nights', 7: '1 week', 14: '2 weeks', 30: '1 month', 60: '2 months', 100: '100 nights' };

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

const CORE_TIMED = {
  teeth: { label: 'Teeth brushed', deadline: '22:00', points: 25, fallback: { label: 'Rinse with water at least', points: 10 } },
  phoneAway: { label: 'Phone away and charging', deadline: '22:15', points: 25, fallback: { label: 'Phone across the room, whenever', points: 10 } }
};

const BONUS_POOL = [
  { id: 'stretch', label: '5-minute stretch or light yoga', deadline: '22:30', points: 20, fallback: { label: 'A few slow breaths in bed', points: 8 } },
  { id: 'journal', label: 'Write 3 lines in a journal', deadline: '22:30', points: 20, fallback: { label: 'Think of one good thing from today', points: 8 } },
  { id: 'tidy', label: 'One-minute room tidy', deadline: '22:30', points: 15, fallback: { label: 'Clear your nightstand', points: 5 } },
  { id: 'gratitude', label: "Name one thing you're grateful for", deadline: null, points: 10, fallback: null },
  { id: 'temp', label: 'Cool the room down (AC, window, or fan)', deadline: '22:30', points: 15, fallback: { label: 'Crack a window', points: 5 } },
  { id: 'tomorrow', label: "Lay out tomorrow's first task", deadline: '22:45', points: 15, fallback: { label: "Just picture tomorrow's first move", points: 5 } },
  { id: 'nocaffeine', label: 'No caffeine after 2pm today', deadline: null, points: 15, fallback: null },
  { id: 'dimlights', label: 'Lights dimmed', deadline: '22:45', points: 15, fallback: { label: 'Lights off eventually', points: 5 } },
  { id: 'waterglass', label: 'Water glass by the bed', deadline: null, points: 10, fallback: null }
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

const STATUS = {
  none: { label: 'Steady', mult: 1, note: 'A normal night. No buffs, no debuffs.' },
  wellRested: { label: 'Well rested', mult: 1.5, note: 'Last night was a perfect night. Quests pay 1.5x today.' },
  wired: { label: 'Wired', mult: 0.9, note: "A few minutes past 11 last night. Small dip today, that's all." },
  groggy: { label: 'Groggy', mult: 0.5, note: 'Checked in after midnight. Quests worth half today. One good night clears it.' },
  zonked: { label: 'Zonked', mult: 0.25, note: 'A night went untouched or ran very late. Quests worth a quarter today. Easy to shake off.' }
};
