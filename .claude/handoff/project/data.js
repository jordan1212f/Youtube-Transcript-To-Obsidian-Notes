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

Object.assign(window, {
  CATEGORIES, MOTTOS, LIBRARY, DETAIL_C1, TASKS, GOALS, CATEGORY_BREAKDOWN, generateYearHeatmap,
});
