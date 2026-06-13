/* Mock data for Clarity prototype */

const CATEGORIES = [
  { id: 'all', name: 'All', color: '#8a8e95' },
  { id: 'productivity', name: 'Productivity', color: 'var(--cat-tech)' },
  { id: 'mindset', name: 'Mindset', color: 'var(--cat-ai)' },
  { id: 'fitness', name: 'Fitness', color: 'var(--cat-lifestyle)' },
  { id: 'career', name: 'Career', color: 'var(--cat-career)' },
  { id: 'finance', name: 'Finance', color: 'var(--cat-other)' },
];

const MOTTOS = [
  "Turn what you consume into what you become.",
  "Less scrolling. More shipping.",
  "The library remembers so you don't have to.",
  "Read it. Act on it. Done.",
  "Small reps. Real progress.",
];

const LIBRARY = [
  {
    id: 'c1',
    type: 'youtube',
    typeLabel: 'video',
    category: 'productivity',
    title: "Ali Abdaal — How to actually finish what you start",
    summary: "A walkthrough of the 'Define / Decide / Do' framework Ali uses for projects he's been putting off. The bulk of the video is about why the planning phase is where most goals quietly die.",
    duration: "23:14",
    source: "youtube.com/@aliabdaal",
    added: "3h ago",
    addedAt: 3 * 60 * 60,
    goal: "Productivity",
    bestPick: true,
  },
  {
    id: 'c2',
    type: 'article',
    typeLabel: 'essay',
    category: 'mindset',
    title: "The 5 types of wealth (it's not just money)",
    summary: "Sahil Bloom argues that financial wealth is the most measured but least leveraged kind. The essay maps the five — time, social, mental, physical, financial — and how the first four compound into the fifth.",
    source: "sahilbloom.com",
    added: "yesterday",
    addedAt: 22 * 60 * 60,
    goal: "Mindset",
  },
  {
    id: 'c3',
    type: 'tweet',
    typeLabel: 'thread',
    category: 'finance',
    title: "The 7 income streams that actually compound in your 20s (12 tweets)",
    summary: "Codie breaks down which side incomes are worth the time at 25 vs 35, why most 'passive income' isn't, and the boring one she'd start with if she had to do it over.",
    source: "x.com/Codie_Sanchez",
    added: "2d ago",
    addedAt: 2 * 24 * 60 * 60,
    goal: "Finance",
  },
  {
    id: 'c4',
    type: 'pdf',
    typeLabel: 'book notes',
    category: 'productivity',
    title: "Atomic Habits — chapter-by-chapter notes",
    summary: "James Clear's book distilled to the bits that survive a re-read. The notes focus on identity-based habits, the two-minute rule, and the environment design tactics that actually moved the needle.",
    source: "jamesclear.com/atomic-habits",
    added: "3d ago",
    addedAt: 3 * 24 * 60 * 60,
    goal: "Productivity",
  },
  {
    id: 'c5',
    type: 'youtube',
    typeLabel: 'video',
    category: 'mindset',
    title: "Mel Robbins — the 5-second rule for breaking any procrastination loop",
    summary: "A short, practical reframe: when you feel the urge to put something off, count down from five and move. Mel explains the neuroscience and gives three places to try it tomorrow.",
    duration: "14:22",
    source: "youtube.com/@melrobbins",
    added: "4d ago",
    addedAt: 4 * 24 * 60 * 60,
    goal: "Mindset",
  },
  {
    id: 'c6',
    type: 'article',
    typeLabel: 'article',
    category: 'fitness',
    title: "Why your strength stalled at month 4 — and the simple fix",
    summary: "Most beginner gains stop because progressive overload silently stops. A breakdown of how to add one set, one rep, or one kilo per week without burning out — and when to actually deload.",
    source: "jeffnippard.com",
    added: "5d ago",
    addedAt: 5 * 24 * 60 * 60,
    goal: "Fitness",
  },
  {
    id: 'c7',
    type: 'youtube',
    typeLabel: 'video',
    category: 'career',
    title: "Steph Smith — how to write online when you feel like you have nothing to say",
    summary: "The premise: you don't need novel ideas, you need a public record of how you think. Steph walks through the 'small bets' essay framework and the cadence she used to build her first 1,000 followers.",
    duration: "32:11",
    source: "youtube.com/@stephsmithio",
    added: "1w ago",
    addedAt: 7 * 24 * 60 * 60,
    goal: "Career",
  },
  {
    id: 'c8',
    type: 'tweet',
    typeLabel: 'thread',
    category: 'mindset',
    title: "Naval — the one decision that makes most other decisions easier",
    summary: "A short thread on choosing a long-term game (career, partner, city) so your daily decisions stop feeling like trade-offs. Useful if you're stuck optimising the wrong layer.",
    source: "x.com/naval",
    added: "1w ago",
    addedAt: 8 * 24 * 60 * 60,
    goal: "Mindset",
  },
];

const DETAIL_C1 = {
  ...LIBRARY[0],
  fullSummary: [
    "Ali walks through the framework he uses for the projects he's been putting off for months — the side business, the book, the half-finished course. The video is paced for someone who already knows what they want to do and just can't seem to start.",
    "The clearest insight is structural: **most of what looks like 'motivation' is actually decision fatigue.** Ali argues that the moment of 'I don't feel like it' is almost always a moment where the next step wasn't defined clearly enough the night before.",
    "He spends an unexpected amount of time on **the planning phase**. The argument is that planning is the part most people skip, and it's also the part where the goal quietly dies — because a vague plan is indistinguishable from no plan at all.",
  ],
  takeaways: [
    "**Define the next action, not the goal.** 'Get fit' isn't a step. 'Pack gym bag tonight, alarm at 6:30' is.",
    "Decision fatigue is the real enemy of consistency. **Decide the night before** and your morning self has nothing to negotiate with.",
    "Make the smallest version of the habit **embarrassingly small.** If you can't do two minutes, the system is wrong — not you.",
    "Track input, not output. **Five gym sessions a week** is a thing you control; 'lose 10 lbs' isn't.",
  ],
  analogy: "Starting a goal is like booking a flight. The hard part isn't the trip itself — it's the half-hour of admin (passport, calendar, packing) that nobody puts on the itinerary. If you don't pre-book the admin, you don't get on the plane.",
  steps: [
    {
      id: 's1',
      difficulty: 'easy',
      deadline: '2 days',
      title: "Pick one goal and write its 'next physical action' on paper",
      desc: "Not the goal. The single thing you'd do in the next 15 minutes if you started now. Pen and paper — don't open Notion.",
    },
    {
      id: 's2',
      difficulty: 'medium',
      deadline: '1 week',
      title: "Time-block the next 7 sessions in your calendar",
      desc: "Same time of day, same duration, same place. Put them on the calendar with location, not just a title.",
    },
    {
      id: 's3',
      difficulty: 'hard',
      deadline: '3 weeks',
      title: "Ship a 'done is better than perfect' v1 of the project",
      desc: "Send the email, publish the post, take the photo, finish the workout block. Imperfect and out is the only proof the system works.",
    },
  ],
};

const TASKS = [
  {
    id: 't1',
    title: "Time-block tomorrow's first 90-min deep-work session",
    desc: "Calendar event, location, and the one sentence outcome. Phone in another room before it starts.",
    deadline: "2d",
    progress: 0.65,
    source: "Ali Abdaal — How to actually finish what you start",
    sourceId: 'c1',
    urgent: false,
  },
  {
    id: 't2',
    title: "Write your '5 types of wealth' check-in",
    desc: "One sentence per wealth — where you are, where you want to be. Aim for 200 words total.",
    deadline: "5h",
    progress: 0.90,
    source: "The 5 types of wealth",
    sourceId: 'c2',
    urgent: true,
  },
  {
    id: 't3',
    title: "Set up the automated $200/mo brokerage transfer",
    desc: "Pick the day after payday. Use a broad index fund. Don't overthink the allocation — just start.",
    deadline: "1w",
    progress: 0.20,
    source: "The 7 income streams that actually compound",
    sourceId: 'c3',
    urgent: false,
  },
  {
    id: 't4',
    title: "Run 5K three times this week (Mon / Wed / Fri)",
    desc: "Same route, same time. Add one set or one minute per session — progressive overload, not heroics.",
    deadline: "3d",
    progress: 0.0,
    source: "Why your strength stalled at month 4…",
    sourceId: 'c6',
    urgent: false,
    done: false,
  },
  {
    id: 't5',
    title: "Publish your first 'building in public' post",
    desc: "One thing you learned this week, in under 200 words. Hit publish before reading it back a fourth time.",
    deadline: "2d",
    progress: 1.0,
    source: "Steph Smith — how to write online when you feel like you have nothing to say",
    sourceId: 'c7',
    urgent: false,
    done: true,
  },
];

const GOALS = [
  { id: 'g1', name: 'Save $20k by Dec', items: 4,  color: 'var(--cat-lifestyle)', category: 'finance' },
  { id: 'g2', name: 'Read 24 books',     items: 12, color: 'var(--cat-tech)',      category: 'productivity' },
  { id: 'g3', name: 'Run a sub-25 5K',   items: 9,  color: 'var(--cat-ai)',        category: 'fitness' },
  { id: 'g4', name: 'Launch side project', items: 6, color: 'var(--cat-career)',    category: 'career' },
  { id: 'g5', name: 'Daily journaling',  items: 3,  color: 'var(--cat-lifestyle)', category: 'mindset' },
];

const CATEGORY_BREAKDOWN = [
  { name: 'Productivity', pct: 22, dot: 'var(--cat-tech)' },
  { name: 'Mindset',      pct: 18, dot: 'var(--cat-ai)' },
  { name: 'Career',       pct: 14, dot: 'var(--cat-career)' },
  { name: 'Fitness',      pct: 12, dot: 'var(--cat-lifestyle)' },
  { name: 'Finance',      pct: 10, dot: 'var(--cat-other)' },
  { name: 'Habits',       pct:  8, dot: '#C97585' },
  { name: 'Health',       pct:  6, dot: '#A5C175' },
  { name: 'Reading',      pct:  5, dot: '#C99B85' },
  { name: 'Relationships',pct:  3, dot: '#75BFC9' },
  { name: 'Other',        pct:  2, dot: '#C9B575' },
];

// 53 weeks × 7 days = up to 371 cells, anchored to today
// Each cell: { date: Date|null, level: 0..4 }
// `null` date means the cell is outside the year window (placeholder).
function generateYearHeatmap() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(oneYearAgo.getDate() - 364);
  // Walk back to Sunday so the grid starts on a Sunday column
  const start = new Date(oneYearAgo);
  start.setDate(start.getDate() - start.getDay());
  // Walk forward to Saturday so the grid ends on a Saturday column
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const cells = [];
  const cur = new Date(start);
  while (cur <= end) {
    const inWindow = cur >= oneYearAgo && cur <= today;
    let level = 0;
    if (inWindow) {
      // Deterministic per date — uint32 hash to avoid float precision loss
      const base = cur.getFullYear() * 10000 + (cur.getMonth() + 1) * 100 + cur.getDate();
      const s = (Math.imul(base, 2654435761) >>> 0) % 100;
      // GitHub-ish distribution — most days empty, a few highly active
      if (s > 95) level = 4;
      else if (s > 88) level = 3;
      else if (s > 78) level = 2;
      else if (s > 60) level = 1;
    }
    cells.push({
      date: inWindow ? new Date(cur) : null,
      level,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return { cells, start: new Date(start), end: new Date(end), today: new Date(today) };
}

// ----- Goal journals (Bear-style, free-form, user-written only) -----
// Each entry: { id, daysAgo, text } — newest sorts to the bottom (running-document feel)
const _DAY = 86400000;
const GOAL_JOURNALS = {
  // Run a sub-25 5K — the populated showcase
  g3: [
    { id: 'j1', daysAgo: 16,
      text: "Signed up for the October 5K today. Twenty-five minutes feels a long way off right now, my first attempt was 31 and I had to walk twice. But there's a date on the calendar now, and that makes it real in a way that wanting to get fit never did." },
    { id: 'j2', daysAgo: 9,
      text: "Tried __16:8 fasting__ this week alongside the running. Skipping breakfast was rough for the first two days, then it just became normal.\n\nWhat I changed, in order:\n1. Pushed breakfast back to noon\n2. Black coffee only in the morning\n3. ~~Afternoon snacking~~ cut entirely\n\nRan fasted on Thursday and felt *lighter*, not weaker like I expected. Keeping it for now." },
    { id: 'j3', daysAgo: 5,
      text: "Gym session before the easy run. Did legs, which in hindsight was a mistake, the run afterward was a slog and my pace was all over the place. Lesson learned: lifting and running on the same day needs more thought, or more food." },
    { id: 'j4', daysAgo: 2,
      text: "## A week that finally clicked\n\nFirst week where running felt *easy* instead of like punishment. I kept the pace **deliberately slow**, slower than felt natural, and still finished all three runs without walking.\n\n==Did a timed K at the end and hit 4:35== — that would put me right around 23 minutes for the full 5K if I can hold it.\n\nThis week:\n- [x] Three easy runs, zone 2 only\n- [x] One timed K to check pace\n- [ ] Add a short mobility session\n- [ ] Book a sports massage\n\nRace-day plan from [the sub-25 guide](https://example.com): start slow, negative-split the back half." },
  ],
  // Save $20k by Dec — second curated example
  g1: [
    { id: 'j1', daysAgo: 21,
      text: "Opened the spreadsheet and actually added up what I spent last month. Not going to write the number here. The subscriptions were the part that stung, paying for things I haven't opened since January." },
    { id: 'j2', daysAgo: 8,
      text: "Automated the transfer so I stop relying on willpower at the end of the month. Future me can argue with the standing order instead of with myself. £200 the day after payday, gone before I can spend it." },
    { id: 'j3', daysAgo: 1,
      text: "Three weeks in and the automated saving is genuinely invisible now. Didn't miss it once. The boring systems really do beat the motivated bursts." },
  ],
};

function journalDateLabel(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function goalAgoLabel(sec) {
  if (sec <= 0) return 'just now';
  if (sec < 3600) return Math.max(1, Math.round(sec / 60)) + 'm ago';
  if (sec < 86400) return Math.round(sec / 3600) + 'h ago';
  const d = Math.round(sec / 86400);
  if (d === 1) return 'yesterday';
  if (d < 7) return d + 'd ago';
  if (d < 14) return 'last week';
  return Math.round(d / 7) + 'w ago';
}

// Build the seed journal for a goal: curated if present, else empty (inviting blank page).
function buildGoalJournal(goal) {
  const seed = GOAL_JOURNALS[goal.id];
  if (!seed) return [];
  return seed
    .map(e => ({ id: e.id, ts: Date.now() - e.daysAgo * _DAY, text: e.text }))
    .sort((a, b) => a.ts - b.ts); // oldest first, newest at bottom
}

// ----- Archive: completed actions grouped by goal (a wall of accomplishments) -----
// Each: { id, action, source, daysAgo }. Reverse-chron when shown (newest first).
const GOAL_ARCHIVE = {
  g1: [ // Save $20k by Dec — finance
    { id: 'a1', action: 'Set up the automated $200/mo brokerage transfer', source: 'The 7 income streams that compound in your 20s', daysAgo: 2 },
    { id: 'a2', action: 'Cancelled the two subscriptions I never opened', source: 'Codie Sanchez — small leaks sink budgets', daysAgo: 6 },
    { id: 'a3', action: 'Opened a high-yield savings account for the buffer', source: 'The 5 types of wealth', daysAgo: 11 },
    { id: 'a4', action: 'Wrote a one-page money plan for the quarter', source: 'Slow productivity', daysAgo: 18 },
    { id: 'a5', action: 'Moved the £500 work bonus straight to savings', source: 'Naval — play long-term games', daysAgo: 25 },
  ],
  g2: [ // Read 24 books — productivity
    { id: 'a1', action: "Finished 'Deep Work' and noted three takeaways", source: 'Cal Newport — the case for slow productivity', daysAgo: 1 },
    { id: 'a2', action: 'Set a 20-page nightly reading block before bed', source: 'Atomic Habits — make it obvious', daysAgo: 5 },
    { id: 'a3', action: 'Built a shortlist of the next six titles', source: 'Steph Smith — how to read with intent', daysAgo: 10 },
    { id: 'a4', action: 'Swapped evening scrolling for the Kindle', source: 'Mel Robbins — the 5-second rule', daysAgo: 17 },
  ],
  g3: [ // Run a sub-25 5K — fitness
    { id: 'a1', action: 'Ran 5K three times this week (Mon / Wed / Fri)', source: 'Why your strength stalled at month 4', daysAgo: 1 },
    { id: 'a2', action: 'Mapped a flat 5K route and saved it to my watch', source: 'Zone 2 base building for beginners', daysAgo: 7 },
    { id: 'a3', action: 'Bought proper running shoes, finally', source: 'Jeff Nippard — the fundamentals', daysAgo: 13 },
    { id: 'a4', action: 'Did one easy zone-2 base run, no pace pressure', source: 'Zone 2 base building for beginners', daysAgo: 19 },
  ],
  g4: [ // Launch side project — career
    { id: 'a1', action: "Published my first 'building in public' post", source: 'Steph Smith — writing online', daysAgo: 3 },
    { id: 'a2', action: 'Registered the domain and pointed the DNS', source: 'Ali Abdaal — finishing what you start', daysAgo: 9 },
    { id: 'a3', action: 'Wrote the landing-page headline and subhead', source: 'Steph Smith — writing online', daysAgo: 15 },
  ],
  g5: [ // Daily journaling — mindset
    { id: 'a1', action: 'Wrote for ten minutes before bed, five nights running', source: 'Atomic Habits — never miss twice', daysAgo: 2 },
    { id: 'a2', action: 'Set a nightly journal reminder for 9:30pm', source: 'Mel Robbins — the 5-second rule', daysAgo: 9 },
  ],
};

function archiveDateLabel(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Completed items for a goal, newest first, with absolute timestamps.
function buildGoalArchive(goalId) {
  const seed = GOAL_ARCHIVE[goalId] || [];
  return seed
    .map(e => ({ ...e, ts: Date.now() - e.daysAgo * _DAY }))
    .sort((a, b) => b.ts - a.ts);
}

Object.assign(window, {
  CATEGORIES, MOTTOS, LIBRARY, DETAIL_C1, TASKS, GOALS, CATEGORY_BREAKDOWN, generateYearHeatmap,
  GOAL_JOURNALS, buildGoalJournal, journalDateLabel, goalAgoLabel,
  GOAL_ARCHIVE, buildGoalArchive, archiveDateLabel,
});
