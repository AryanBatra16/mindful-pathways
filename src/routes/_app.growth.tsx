import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Trophy, TrendingUp, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useApp, toISODate, computeStreak } from "@/lib/state";

export const Route = createFileRoute("/_app/growth")({
  head: () => ({ meta: [{ title: "Growth Map — Mind2Care" }] }),
  component: Growth,
});

/** Format an ISO date string "YYYY-MM-DD" to a full precise date like "Jan 13, 2026" */
function niceDate(isoStr: string | undefined): string {
  if (!isoStr || isoStr === "Soon" || isoStr === "Not yet") return isoStr || "Soon";
  try {
    // Parse as local date (avoid UTC timezone shift by appending noon time)
    const d = new Date(isoStr.includes("T") ? isoStr : isoStr + "T12:00:00");
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return isoStr;
  }
}

function Growth() {
  const { userProfile, moodHistory, challenges, communityPosts } = useApp();

  // The ONE source of truth for streak — same function the dashboard uses
  const streak = computeStreak(moodHistory);

  // Dynamically calculate badge status
  const badgesList = [
    { id: 1, name: "First Step", desc: "Logged your first mood", icon: "🌱", earned: moodHistory.length > 0, color: "green" },
    { id: 2, name: "Week Warrior", desc: "7-day streak", icon: "🔥", earned: streak >= 7 || !!userProfile.firstWeekDate, color: "coral" },
    { id: 3, name: "Mindful Master", desc: "Complete 1 challenge", icon: "🧘", earned: challenges.filter(c => c.status === 'completed').length >= 1, color: "purple" },
    { id: 4, name: "Community Heart", desc: "React to a post", icon: "💖", earned: communityPosts.some(p => p.liked), color: "pink" },
    { id: 5, name: "Calm Keeper", desc: "30-day mood streak", icon: "🌊", earned: streak >= 30, color: "blue" },
    { id: 6, name: "Growth Guru", desc: "Reach 1200 points", icon: "🌳", earned: userProfile.points >= 1200, color: "turquoise" },
  ];

  const earnedBadgesCount = badgesList.filter(b => b.earned).length;
  const nextLevelThreshold = 1500;
  const levelProgressPercent = Math.min(100, Math.floor((userProfile.points / nextLevelThreshold) * 100));

  // Find the earliest mood log date from history
  const sortedMoodDates = [...moodHistory].map(h => h.date).sort();
  const firstMoodIsoDate = sortedMoodDates.length > 0 ? sortedMoodDates[0] : undefined;

  // Compute first challenge completion from state
  const firstCompletedChallenge = challenges.find(c => c.status === "completed");


  // ── Safe joinDate: you MUST have joined before logging your first mood.
  // If stored joinDate is missing or is somehow after firstMoodDate, cap it.
  const rawJoinDate = userProfile.joinDate;
  const safeJoinDate: string = (() => {
    if (!rawJoinDate && !firstMoodIsoDate) return toISODate(new Date());
    if (!rawJoinDate) return firstMoodIsoDate!;          // no joinDate → use first mood
    if (!firstMoodIsoDate) return rawJoinDate;            // no moods yet → use joinDate
    return rawJoinDate < firstMoodIsoDate ? rawJoinDate : firstMoodIsoDate; // min of both
  })();

  const today = toISODate(new Date());

  // ── "Joined Mind2Care" is ALWAYS milestone #1 (pinned, never sorted away)
  const joinedMilestone = {
    id: 1,
    title: "Joined Mind2Care",
    date: niceDate(safeJoinDate),
    isoDate: safeJoinDate,
    done: true,
  };

  // ── Remaining milestones: build with isoDate for sorting
  const otherRaw = [
    {
      id: 2,
      title: "First mood logged",
      isoDate: moodHistory.length > 0 ? (userProfile.firstMoodDate || firstMoodIsoDate || today) : null,
      done: moodHistory.length > 0,
      pending: "Log your first mood",
    },
    {
      id: 3,
      title: "First 7-day streak",
      // Done if currently on a 7+ day streak OR if we previously recorded achieving it
      isoDate: (streak >= 7 || !!userProfile.firstWeekDate) ? (userProfile.firstWeekDate || today) : null,
      done: streak >= 7 || !!userProfile.firstWeekDate,
      pending: `${streak}/7 day streak`,
    },
    {
      id: 4,
      title: "Completed first challenge",
      isoDate: firstCompletedChallenge ? (userProfile.firstChallengeDate || today) : null,
      done: !!firstCompletedChallenge,
      pending: "No challenge completed yet",
    },
    {
      id: 5,
      title: "30-day mood streak",
      isoDate: streak >= 30 ? today : null,
      done: streak >= 30,
      pending: `${streak}/30 day streak`,
    },
    {
      id: 6,
      title: "Reach Sage level",
      isoDate: userProfile.points >= 1000 ? today : null,
      done: userProfile.points >= 1000,
      pending: `${userProfile.points}/1000 pts`,
    },
  ];

  // Completed ones sorted by real date ascending; pending ones in logical id order
  const completedOthers = otherRaw
    .filter(m => m.done && m.isoDate)
    .sort((a, b) => a.isoDate! < b.isoDate! ? -1 : a.isoDate! > b.isoDate! ? 1 : a.id - b.id);

  const pendingOthers = otherRaw
    .filter(m => !m.done)
    .sort((a, b) => a.id - b.id);

  const milestones = [
    joinedMilestone,
    ...completedOthers.map(m => ({ ...m, date: niceDate(m.isoDate!) })),
    ...pendingOthers.map(m => ({ ...m, date: m.pending })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Your Growth Journey" subtitle="Every gentle step counts. Look how far you've come." accent="turquoise" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Points", value: userProfile.points.toLocaleString(), color: "purple", icon: Sparkles },
          { label: "Badges Earned", value: `${earnedBadgesCount} / 6`, color: "coral", icon: Trophy },
          { label: "You're in the top", value: "12%", color: "turquoise", icon: TrendingUp },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-3xl p-6 shadow-card flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-glow" style={{ background: `var(--${s.color})` }}>
                <Icon className="h-6 w-6" style={{ color: `var(--${s.color}-foreground)` }} />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Badges */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badgesList.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, rotate: b.earned ? -3 : 0 }}
                className={`glass rounded-3xl p-5 text-center transition-all ${b.earned ? "shadow-glow" : "opacity-60"}`}
                style={b.earned ? { background: `var(--${b.color})` } : {}}
              >
                <div className="text-5xl mb-2 relative inline-block">
                  {b.earned ? b.icon : "🔒"}
                  {!b.earned && <Lock className="h-4 w-4 absolute bottom-0 right-0 text-muted-foreground" />}
                </div>
                <div className="font-semibold text-sm" style={b.earned ? { color: `var(--${b.color}-foreground)` } : {}}>{b.name}</div>
                <div className="text-xs mt-1" style={b.earned ? { color: `var(--${b.color}-foreground)`, opacity: 0.8 } : { color: "var(--muted-foreground)" }}>{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Milestones</h3>
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative pb-5 last:pb-0"
              >
                <div className={`absolute -left-[26px] top-1 h-5 w-5 rounded-full flex items-center justify-center ${m.done ? "gradient-turquoise-green" : "bg-muted"}`}>
                  {m.done && <span className="text-white text-xs">✓</span>}
                </div>
                <div className={`text-sm font-medium ${m.done ? "" : "text-muted-foreground"}`}>{m.title}</div>
                <div className={`text-xs mt-0.5 font-medium ${m.done ? "text-primary/70" : "text-muted-foreground/60"}`}>
                  {m.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="glass rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{userProfile.level} Level</h3>
            <p className="text-xs text-muted-foreground">{nextLevelThreshold - userProfile.points > 0 ? `${nextLevelThreshold - userProfile.points} points to next level: Luminary` : "Max level achieved! You are a master."}</p>
          </div>
          <span className="text-sm font-semibold">{userProfile.points} / {nextLevelThreshold}</span>
        </div>
        <div className="h-4 rounded-full bg-muted overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${levelProgressPercent}%` }} transition={{ duration: 1.2 }} className="h-full gradient-primary" />
        </div>
      </div>
    </div>
  );
}
