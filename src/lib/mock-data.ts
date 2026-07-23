export const moods = [
  { emoji: "😄", label: "Joyful", value: 5, color: "green" },
  { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
  { emoji: "😐", label: "Okay", value: 3, color: "blue" },
  { emoji: "😔", label: "Low", value: 2, color: "purple" },
  { emoji: "😢", label: "Sad", value: 1, color: "pink" },
];

export const weeklyMood = [
  { day: "Mon", mood: 4 }, { day: "Tue", mood: 3 }, { day: "Wed", mood: 5 },
  { day: "Thu", mood: 4 }, { day: "Fri", mood: 4 }, { day: "Sat", mood: 5 }, { day: "Sun", mood: 4 },
];

export const moodDistribution = [
  { name: "Joyful", value: 12, fill: "var(--green)" },
  { name: "Good", value: 18, fill: "var(--turquoise)" },
  { name: "Okay", value: 8, fill: "var(--blue)" },
  { name: "Low", value: 4, fill: "var(--purple)" },
  { name: "Sad", value: 2, fill: "var(--pink)" },
];

export const quotes = [
  { id: 1, text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman", category: "mindfulness" },
  { id: 2, text: "Self-care is how you take your power back.", author: "Lalah Delia", category: "self-care" },
  { id: 3, text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay", category: "healing" },
  { id: 4, text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush", category: "growth" },
  { id: 5, text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott", category: "rest" },
  { id: 6, text: "What mental health needs is more sunlight, more candor, more unashamed conversation.", author: "Glenn Close", category: "mindfulness" },
  { id: 7, text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James", category: "mindfulness" },
  { id: 8, text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated.", author: "Lori Deschene", category: "healing" },
  { id: 9, text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann", category: "self-care" },
  { id: 10, text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "growth" },
];

export const challenges = [
  { id: 1, title: "7-Day Gratitude Journal", desc: "Log your daily mood with a note for 7 different days", points: 70, progress: 57, status: "active", category: "gratitude", color: "coral", verifyType: "gratitude_journal", requirement: "Log daily mood with a note on 7 different days", requirementCount: 7 },
  { id: 2, title: "Mindful Mornings", desc: "Log your mood before 9 AM on 5 different days", points: 50, progress: 40, status: "active", category: "mindfulness", color: "purple", verifyType: "mindful_mornings", requirement: "Log mood before 9 AM on 5 different days", requirementCount: 5 },
  { id: 3, title: "Digital Detox Sunday", desc: "Spend a Sunday off all screens", points: 30, progress: 0, status: "available", category: "rest", color: "blue", verifyType: "digital_detox", requirement: "Manually mark complete after your detox day", requirementCount: 1 },
  { id: 4, title: "Hydration Hero", desc: "Drink 8 glasses of water for 7 days", points: 40, progress: 0, status: "available", category: "wellness", color: "turquoise", verifyType: "hydration_hero", requirement: "Manually track your water intake for 7 days", requirementCount: 7 },
  { id: 5, title: "Move Every Day", desc: "20 minutes of movement, any kind", points: 60, progress: 0, status: "available", category: "wellness", color: "green", verifyType: "move_every_day", requirement: "Log movement sessions via tasks for 7 days", requirementCount: 7 },
  { id: 6, title: "Kindness Streak", desc: "Do one act of kindness per day", points: 50, progress: 100, status: "completed", category: "social", color: "pink", verifyType: "kindness_streak", requirement: "Completed!", requirementCount: 7 },
  { id: 7, title: "5-Day Mood Streak", desc: "Log your mood on 5 consecutive days", points: 60, progress: 100, status: "completed", category: "mindfulness", color: "turquoise", verifyType: "mood_streak_5", requirement: "Log mood on at least 5 different calendar days", requirementCount: 5 },
  { id: 8, title: "Reflection Writer", desc: "Add a thoughtful note to 3 of your mood entries", points: 40, progress: 75, status: "active", category: "growth", color: "blue", verifyType: "reflection_writer", requirement: "Add meaningful notes to 3 mood entries", requirementCount: 3 },
  { id: 9, title: "Early Bird", desc: "Log your mood before 9 AM on 3 different days", points: 35, progress: 33, status: "active", category: "wellness", color: "green", verifyType: "mindful_mornings", requirement: "Log mood before 9 AM on 3 days", requirementCount: 3 },
  { id: 10, title: "Social Spark", desc: "Share 3 posts in the community", points: 45, progress: 66, status: "active", category: "social", color: "coral", verifyType: "social_spark", requirement: "Post in the community 3 times", requirementCount: 3 },
];

export const tasks = [
  { id: 1, title: "Morning meditation", priority: "high", status: "today", due: "Today", challenge: "Mindful Mornings" },
  { id: 2, title: "Journal entry", priority: "medium", status: "today", due: "Today", challenge: "7-Day Gratitude Journal" },
  { id: 3, title: "Call a friend", priority: "low", status: "week", due: "This week", challenge: null },
  { id: 4, title: "Read 20 pages", priority: "medium", status: "week", due: "Wed", challenge: null },
  { id: 5, title: "Plan weekend hike", priority: "low", status: "later", due: "Next week", challenge: null },
  { id: 6, title: "Yoga session", priority: "high", status: "completed", due: "Yesterday", challenge: "Move Every Day" },
  { id: 7, title: "Drink 8 glasses of water", priority: "medium", status: "today", due: "Today", challenge: "Hydration Hero" },
  { id: 8, title: "Evening gratitude list", priority: "low", status: "today", due: "Today", challenge: "7-Day Gratitude Journal" },
];

export const communityPosts = [
  { id: 1, author: "Aria", anon: false, time: "2h", category: "Gratitude", content: "Today I noticed how the morning light came through my window. Small wins. 💛", reactions: 24, color: "coral", liked: true },
  { id: 2, author: "Anonymous", anon: true, time: "4h", category: "Anxiety", content: "Anyone else feeling overwhelmed this week? Sharing helps.", reactions: 41, color: "purple", liked: false },
  { id: 3, author: "Leo", anon: false, time: "1d", category: "Wins", content: "30 days of meditation streak! Tiny daily practice changes everything.", reactions: 87, color: "green", liked: true },
  { id: 4, author: "Maya", anon: false, time: "2d", category: "Self-care", content: "Bought myself flowers today. Reminder: you deserve softness.", reactions: 56, color: "pink", liked: false },
  { id: 5, author: "Alex K.", anon: false, time: "3d", category: "Growth", content: "Started therapy last month and it's been the best decision. No shame in asking for help 💙", reactions: 112, color: "blue", liked: true },
  { id: 6, author: "Anonymous", anon: true, time: "5d", category: "Healing", content: "Some days healing looks like getting out of bed and making tea. That's enough.", reactions: 98, color: "turquoise", liked: false },
];

export const supportGroups = [
  { id: 1, name: "Anxiety & Calm", members: 1240, color: "blue" },
  { id: 2, name: "Daily Gratitude", members: 2180, color: "coral" },
  { id: 3, name: "Mindful Living", members: 980, color: "purple" },
  { id: 4, name: "Healing Together", members: 1560, color: "turquoise" },
];

export const badges = [
  { id: 1, name: "First Step", desc: "Logged your first mood", icon: "🌱", earned: true, color: "green" },
  { id: 2, name: "Week Warrior", desc: "7-day streak", icon: "🔥", earned: true, color: "coral" },
  { id: 3, name: "Mindful Master", desc: "Complete 5 challenges", icon: "🧘", earned: true, color: "purple" },
  { id: 4, name: "Community Heart", desc: "10 supportive reactions", icon: "💖", earned: true, color: "pink" },
  { id: 5, name: "Calm Keeper", desc: "30-day mood streak", icon: "🌊", earned: false, color: "blue" },
  { id: 6, name: "Growth Guru", desc: "Reach 1000 points", icon: "🌳", earned: false, color: "turquoise" },
];

export const milestones = [
  { id: 1, title: "Joined Mind2Care", date: "Jan 12", done: true },
  { id: 2, title: "First mood logged", date: "Jan 13", done: true },
  { id: 3, title: "First week streak", date: "Jan 19", done: true },
  { id: 4, title: "Completed first challenge", date: "Feb 02", done: true },
  { id: 5, title: "30-day streak", date: "Soon", done: false },
  { id: 6, title: "Reach Sage level", date: "Soon", done: false },
];

export const moodHistory = Array.from({ length: 14 }).map((_, i) => ({
  date: `Day ${14 - i}`,
  mood: moods[Math.floor(Math.random() * moods.length)],
  note: ["Felt grounded", "Tough day", "Energizing walk", "Chill evening", "Gratitude moment"][i % 5],
}));

// ─── DEMO MODE DATA ──────────────────────────────────────────────────────────

export const DEMO_USER = {
  id: "demo_user_001",
  name: "Aria Wells",
  email: "demo@mind2care.app",
  bio: "On a gentle journey toward calmer days. 🌿 Wellness explorer, gratitude journaler, and daily meditator.",
  points: 485,
  level: "Explorer",
  avatar: "🌸",
  joinDate: "2026-01-12",
  firstMoodDate: "2026-01-13",
  firstWeekDate: "2026-01-19",
  firstChallengeDate: "2026-02-02",
};

// Generate 30 days of rich mood history
function generateDemoMoodHistory() {
  const now = new Date();
  const moodPatterns = [
    { emoji: "😄", label: "Joyful", value: 5, color: "green" },
    { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
    { emoji: "😐", label: "Okay", value: 3, color: "blue" },
    { emoji: "😔", label: "Low", value: 2, color: "purple" },
    { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
    { emoji: "😄", label: "Joyful", value: 5, color: "green" },
    { emoji: "😄", label: "Joyful", value: 5, color: "green" },
    { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
    { emoji: "😐", label: "Okay", value: 3, color: "blue" },
    { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
  ];
  const notes = [
    "Started the day with meditation 🧘",
    "Felt a bit anxious about work, but breathed through it",
    "Had a great walk outside — nature really helps",
    "Called mom today, felt so much better after",
    "Tough morning, but journaling helped me reset",
    "Gratitude practice before bed felt grounding",
    "Energy was low today — need more sleep",
    "Yoga session lifted my spirits completely",
    "Read for 30 mins before bed, feeling calm",
    "Had a meaningful conversation with a friend",
    "Morning light through the window — small joy",
    "Mindful eating today, noticed so much more",
    "Feeling proud of my consistency this week",
    "Rest day — gentle and intentional",
    "Cooked a healthy meal, felt accomplished",
  ];
  const tagSets = [
    ["Meditation", "Morning"],
    ["Work", "Stress"],
    ["Exercise", "Energy"],
    ["Social", "Connection"],
    ["Sleep", "Rest"],
    ["Gratitude", "Joy"],
    ["Nature", "Energy"],
    ["Creativity", "Focus"],
    ["Nutrition", "Wellness"],
    ["Mindfulness", "Calm"],
  ];

  const history = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const moodIdx = (i + 3) % moodPatterns.length;
    const mood = moodPatterns[moodIdx];
    const hour = 7 + (i % 4);
    const minute = (i * 7) % 60;
    const timeStr = `${hour}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
    history.push({
      id: `demo_mood_${i}`,
      date: dateStr,
      time: timeStr,
      type: "daily" as const,
      mood,
      note: notes[i % notes.length],
      tags: tagSets[i % tagSets.length],
    });
  }
  return history;
}

export const DEMO_MOOD_HISTORY = generateDemoMoodHistory();

export const DEMO_TASKS = [
  { id: "dt1", title: "Morning meditation (10 mins)", priority: "high" as const, status: "today" as const, due: "Today", challenge: "Mindful Mornings" },
  { id: "dt2", title: "Write gratitude journal entry", priority: "medium" as const, status: "today" as const, due: "Today", challenge: "7-Day Gratitude Journal" },
  { id: "dt3", title: "Drink 8 glasses of water", priority: "medium" as const, status: "today" as const, due: "Today", challenge: "Hydration Hero" },
  { id: "dt4", title: "Call a friend or family member", priority: "low" as const, status: "week" as const, due: "This week", challenge: null },
  { id: "dt5", title: "Read 20 pages of a good book", priority: "medium" as const, status: "week" as const, due: "Wed", challenge: null },
  { id: "dt6", title: "Plan weekend nature walk", priority: "low" as const, status: "later" as const, due: "Next week", challenge: null },
  { id: "dt7", title: "Yoga session (30 mins)", priority: "high" as const, status: "completed" as const, due: "Yesterday", challenge: "Move Every Day" },
  { id: "dt8", title: "Evening wind-down routine", priority: "medium" as const, status: "completed" as const, due: "Yesterday", challenge: null },
];

export const DEMO_COMMUNITY_POSTS = [
  { id: "dp1", author: "Aria Wells", anon: false, time: "2h ago", category: "Gratitude", content: "Today I noticed how the morning light came through my window. Small moments, big joy. 💛", reactions: 24, color: "coral", liked: false },
  { id: "dp2", author: "Anonymous", anon: true, time: "4h ago", category: "Anxiety", content: "Anyone else feeling overwhelmed this week? Sharing helps. You're not alone 💙", reactions: 41, color: "purple", liked: true },
  { id: "dp3", author: "Leo", anon: false, time: "1d ago", category: "Wins", content: "30 days of meditation streak! Tiny daily practice changes everything. 🔥", reactions: 87, color: "green", liked: true },
  { id: "dp4", author: "Maya", anon: false, time: "2d ago", category: "Self-care", content: "Bought myself flowers today. Reminder: you deserve softness. 🌸", reactions: 56, color: "pink", liked: false },
  { id: "dp5", author: "Alex K.", anon: false, time: "3d ago", category: "Growth", content: "Started therapy last month and it's been the best decision. No shame in asking for help 💙", reactions: 112, color: "blue", liked: true },
  { id: "dp6", author: "Anonymous", anon: true, time: "5d ago", category: "Healing", content: "Some days healing looks like getting out of bed and making tea. That's enough. 🍵", reactions: 98, color: "turquoise", liked: false },
];

export const DEMO_SAVED_QUOTES = [1, 3, 5, 9];

export const DEMO_CHALLENGES = [
  { id: 1, title: "7-Day Gratitude Journal", desc: "Log your daily mood with a note for 7 different days", points: 70, progress: 57, status: "active" as const, category: "gratitude", color: "coral", verifyType: "gratitude_journal", requirement: "Log daily mood with a note on 7 different days", requirementCount: 7 },
  { id: 2, title: "Mindful Mornings", desc: "Log your mood before 9 AM on 5 different days", points: 50, progress: 40, status: "active" as const, category: "mindfulness", color: "purple", verifyType: "mindful_mornings", requirement: "Log mood before 9 AM on 5 different days", requirementCount: 5 },
  { id: 3, title: "Digital Detox Sunday", desc: "Spend a Sunday off all screens", points: 30, progress: 0, status: "available" as const, category: "rest", color: "blue", verifyType: "digital_detox", requirement: "Manually mark complete after your detox day", requirementCount: 1 },
  { id: 4, title: "Hydration Hero", desc: "Drink 8 glasses of water for 7 days", points: 40, progress: 0, status: "available" as const, category: "wellness", color: "turquoise", verifyType: "hydration_hero", requirement: "Manually track your water intake for 7 days", requirementCount: 7 },
  { id: 5, title: "Move Every Day", desc: "20 minutes of movement, any kind", points: 60, progress: 0, status: "available" as const, category: "wellness", color: "green", verifyType: "move_every_day", requirement: "Log movement sessions via tasks for 7 days", requirementCount: 7 },
  { id: 6, title: "Kindness Streak", desc: "Do one act of kindness per day", points: 50, progress: 100, status: "completed" as const, category: "social", color: "pink", verifyType: "kindness_streak", requirement: "Completed!", requirementCount: 7 },
  { id: 7, title: "5-Day Mood Streak", desc: "Log your mood on 5 consecutive days", points: 60, progress: 100, status: "completed" as const, category: "mindfulness", color: "turquoise", verifyType: "mood_streak_5", requirement: "Log mood on at least 5 different calendar days", requirementCount: 5 },
  { id: 8, title: "Reflection Writer", desc: "Add a thoughtful note to 3 of your mood entries", points: 40, progress: 75, status: "active" as const, category: "growth", color: "blue", verifyType: "reflection_writer", requirement: "Add meaningful notes to 3 mood entries", requirementCount: 3 },
  { id: 9, title: "Early Bird", desc: "Log your mood before 9 AM on 3 different days", points: 35, progress: 33, status: "active" as const, category: "wellness", color: "green", verifyType: "mindful_mornings", requirement: "Log mood before 9 AM on 3 days", requirementCount: 3 },
  { id: 10, title: "Social Spark", desc: "Share 3 posts in the community", points: 45, progress: 66, status: "active" as const, category: "social", color: "coral", verifyType: "social_spark", requirement: "Post in the community 3 times", requirementCount: 3 },
];

// Demo chatbot sessions (pre-populated conversations)
export const DEMO_CHAT_SESSIONS = [
  {
    id: "demo_session_1",
    title: "Feeling anxious about work",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    messages: [
      { role: "assistant" as const, text: "Hi Aria, I'm so glad you stopped by 🌸 How are you feeling today?", time: "9:02 AM" },
      { role: "user" as const, text: "I'm feeling really anxious about a big presentation at work tomorrow", time: "9:03 AM" },
      { role: "assistant" as const, text: "That's completely understandable — presentations can feel so nerve-wracking! 💙 What part worries you most?", time: "9:03 AM" },
      { role: "user" as const, text: "I'm afraid I'll forget what to say and people will judge me", time: "9:04 AM" },
      { role: "assistant" as const, text: "That fear of blanking out is so common. Try this: before you go on, take 3 slow deep breaths and remind yourself you know this material well. You prepared for a reason. 🌿", time: "9:04 AM" },
      { role: "user" as const, text: "That's helpful, thank you", time: "9:05 AM" },
      { role: "assistant" as const, text: "You've got this, Aria. And whatever happens — one presentation doesn't define you. Be gentle with yourself 💛", time: "9:05 AM" },
    ],
  },
  {
    id: "demo_session_2",
    title: "Just checking in",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    messages: [
      { role: "assistant" as const, text: "Hi Aria, I'm so glad you stopped by 🌸 How are you feeling today?", time: "8:15 AM" },
      { role: "user" as const, text: "Just checking in, feeling pretty good today!", time: "8:16 AM" },
      { role: "assistant" as const, text: "That's wonderful to hear! 🌟 What's making today feel good?", time: "8:16 AM" },
      { role: "user" as const, text: "I went for a morning walk and the weather was beautiful", time: "8:17 AM" },
      { role: "assistant" as const, text: "Morning walks are such a beautiful gift to yourself. Nature has this quiet way of grounding us. Keep nurturing that habit! 🌿☀️", time: "8:17 AM" },
    ],
  },
  {
    id: "demo_session_3",
    title: "Struggling with motivation",
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    messages: [
      { role: "assistant" as const, text: "Hi Aria, I'm so glad you stopped by 🌸 How are you feeling today?", time: "7:45 PM" },
      { role: "user" as const, text: "I've been struggling with motivation lately, can't seem to get anything done", time: "7:46 PM" },
      { role: "assistant" as const, text: "I hear you — motivation can be such a slippery thing sometimes. 💙 Is there something specific that's been weighing on you?", time: "7:46 PM" },
      { role: "user" as const, text: "Not really, just general fatigue I think", time: "7:47 PM" },
      { role: "assistant" as const, text: "Sometimes our body and mind just need rest more than productivity. What if you gave yourself permission to do just one tiny thing today — and let that be enough? 🌸", time: "7:47 PM" },
      { role: "user" as const, text: "That's a nice way to think about it", time: "7:48 PM" },
      { role: "assistant" as const, text: "Rest is productive too. Be patient with yourself — you're doing better than you think 💛", time: "7:48 AM" },
    ],
  },
];
