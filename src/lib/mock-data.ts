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
];

export const challenges = [
  { id: 1, title: "7-Day Gratitude Journal", desc: "Log your daily mood with a note for 7 different days", points: 70, progress: 0, status: "active", category: "gratitude", color: "coral", verifyType: "gratitude_journal", requirement: "Log daily mood with a note on 7 different days", requirementCount: 7 },
  { id: 2, title: "Mindful Mornings", desc: "Log your mood before 9 AM on 5 different days", points: 50, progress: 0, status: "active", category: "mindfulness", color: "purple", verifyType: "mindful_mornings", requirement: "Log mood before 9 AM on 5 different days", requirementCount: 5 },
  { id: 3, title: "Digital Detox Sunday", desc: "Spend a Sunday off all screens", points: 30, progress: 0, status: "available", category: "rest", color: "blue", verifyType: "digital_detox", requirement: "Manually mark complete after your detox day", requirementCount: 1 },
  { id: 4, title: "Hydration Hero", desc: "Drink 8 glasses of water for 7 days", points: 40, progress: 0, status: "available", category: "wellness", color: "turquoise", verifyType: "hydration_hero", requirement: "Manually track your water intake for 7 days", requirementCount: 7 },
  { id: 5, title: "Move Every Day", desc: "20 minutes of movement, any kind", points: 60, progress: 0, status: "available", category: "wellness", color: "green", verifyType: "move_every_day", requirement: "Log movement sessions via tasks for 7 days", requirementCount: 7 },
  { id: 6, title: "Kindness Streak", desc: "Do one act of kindness per day", points: 50, progress: 100, status: "completed", category: "social", color: "pink", verifyType: "kindness_streak", requirement: "Completed!", requirementCount: 7 },
  { id: 7, title: "5-Day Mood Streak", desc: "Log your mood on 5 consecutive days", points: 60, progress: 0, status: "available", category: "mindfulness", color: "turquoise", verifyType: "mood_streak_5", requirement: "Log mood on at least 5 different calendar days", requirementCount: 5 },
  { id: 8, title: "Reflection Writer", desc: "Add a thoughtful note to 3 of your mood entries", points: 40, progress: 0, status: "available", category: "growth", color: "blue", verifyType: "reflection_writer", requirement: "Add meaningful notes to 3 mood entries", requirementCount: 3 },
  { id: 9, title: "Early Bird", desc: "Log your mood before 9 AM on 3 different days", points: 35, progress: 0, status: "available", category: "wellness", color: "green", verifyType: "mindful_mornings", requirement: "Log mood before 9 AM on 3 days", requirementCount: 3 },
  { id: 10, title: "Social Spark", desc: "Share 3 posts in the community", points: 45, progress: 0, status: "available", category: "social", color: "coral", verifyType: "social_spark", requirement: "Post in the community 3 times", requirementCount: 3 },
];

export const tasks = [
  { id: 1, title: "Morning meditation", priority: "high", status: "today", due: "Today", challenge: "Mindful Mornings" },
  { id: 2, title: "Journal entry", priority: "medium", status: "today", due: "Today", challenge: "7-Day Gratitude" },
  { id: 3, title: "Call a friend", priority: "low", status: "week", due: "This week", challenge: null },
  { id: 4, title: "Read 20 pages", priority: "medium", status: "week", due: "Wed", challenge: null },
  { id: 5, title: "Plan weekend hike", priority: "low", status: "later", due: "Next week", challenge: null },
  { id: 6, title: "Yoga session", priority: "high", status: "completed", due: "Yesterday", challenge: "Move Every Day" },
];

export const communityPosts = [
  { id: 1, author: "Aria", anon: false, time: "2h", category: "Gratitude", content: "Today I noticed how the morning light came through my window. Small wins. 💛", reactions: 24, color: "coral" },
  { id: 2, author: "Anonymous", anon: true, time: "4h", category: "Anxiety", content: "Anyone else feeling overwhelmed this week? Sharing helps.", reactions: 41, color: "purple" },
  { id: 3, author: "Leo", anon: false, time: "1d", category: "Wins", content: "30 days of meditation streak! Tiny daily practice changes everything.", reactions: 87, color: "green" },
  { id: 4, author: "Maya", anon: false, time: "2d", category: "Self-care", content: "Bought myself flowers today. Reminder: you deserve softness.", reactions: 56, color: "pink" },
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
