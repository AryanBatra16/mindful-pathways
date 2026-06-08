import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Trophy, TrendingUp, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { milestones } from "@/lib/mock-data";
import { useApp } from "@/lib/state";

export const Route = createFileRoute("/_app/growth")({
  head: () => ({ meta: [{ title: "Growth Map — Mind2Care" }] }),
  component: Growth,
});

function Growth() {
  const { userProfile, moodHistory, challenges, communityPosts } = useApp();

  // Dynamically calculate badge status
  const badgesList = [
    { id: 1, name: "First Step", desc: "Logged your first mood", icon: "🌱", earned: moodHistory.length > 0, color: "green" },
    { id: 2, name: "Week Warrior", desc: "7-day streak", icon: "🔥", earned: moodHistory.length >= 7, color: "coral" },
    { id: 3, name: "Mindful Master", desc: "Complete 1 challenge", icon: "🧘", earned: challenges.filter(c => c.status === 'completed').length >= 1, color: "purple" },
    { id: 4, name: "Community Heart", desc: "React to a post", icon: "💖", earned: communityPosts.some(p => p.liked), color: "pink" },
    { id: 5, name: "Calm Keeper", desc: "30-day mood streak", icon: "🌊", earned: moodHistory.length >= 30, color: "blue" },
    { id: 6, name: "Growth Guru", desc: "Reach 1200 points", icon: "🌳", earned: userProfile.points >= 1200, color: "turquoise" },
  ];

  const earnedBadgesCount = badgesList.filter(b => b.earned).length;
  const nextLevelThreshold = 1500;
  const levelProgressPercent = Math.min(100, Math.floor((userProfile.points / nextLevelThreshold) * 100));

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

        {/* Progress tree timeline */}
        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Milestones</h3>
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
            {milestones.map((m, i) => {
              // Dynamically complete some milestones based on state
              let isDone = m.done;
              if (m.id === 2 && moodHistory.length > 0) isDone = true;
              if (m.id === 3 && moodHistory.length >= 7) isDone = true;
              if (m.id === 4 && challenges.some(c => c.status === "completed")) isDone = true;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pb-5 last:pb-0"
                >
                  <div className={`absolute -left-[26px] top-1 h-5 w-5 rounded-full flex items-center justify-center ${isDone ? "gradient-turquoise-green" : "bg-muted"}`}>
                    {isDone && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className={`text-sm font-medium ${isDone ? "" : "text-muted-foreground"}`}>{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.date}</div>
                </motion.div>
              );
            })}
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
