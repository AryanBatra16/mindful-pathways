import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Sparkles, Smile, MessageCircleHeart, Trophy, ArrowRight, Quote as QuoteIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { quotes, moods } from "@/lib/mock-data";
import { useApp, computeStreak, toISODate, getQuoteOfTheDay } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Mind2Care" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { userProfile, moodHistory, challenges, logMood, computeChallengeProgress } = useApp();

  const todayQuote = getQuoteOfTheDay(quotes);
  const activeChallenge = challenges.find((c) => c.status === "active") || challenges[0];
  const activeChallengeProgress = activeChallenge
    ? (activeChallenge.status === "completed" ? 100 : computeChallengeProgress(activeChallenge))
    : 0;

  // Streak — count of consecutive distinct calendar days
  const streak = computeStreak(moodHistory);

  const averageMoodValue = moodHistory.length > 0
    ? (moodHistory.reduce((sum, h) => sum + h.mood.value, 0) / moodHistory.length).toFixed(1)
    : "—";

  const todayMoodLog = moodHistory.find((h) => h.date === toISODate(new Date()));
  const todayMoodEmoji = todayMoodLog ? todayMoodLog.mood.emoji : "🙂";
  const todayMoodLabel = todayMoodLog ? todayMoodLog.mood.label : "Not logged";

  const stats = [
    { label: "Streak", value: String(streak), unit: "days", icon: Flame, color: "coral" },
    { label: "Average Mood", value: averageMoodValue, unit: "/ 5", icon: TrendingUp, color: "purple" },
    { label: "Total Points", value: userProfile.points.toLocaleString(), unit: "pts", icon: Sparkles, color: "turquoise" },
    { label: "Today's Mood", value: todayMoodEmoji, unit: todayMoodLabel, icon: Smile, color: "green" },
  ];

  // Build last 7 calendar days chart
  // For each of the last 7 days, compute the average mood value
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // i=0 is 6 days ago, i=6 is today
    const dateStr = toISODate(d);
    const dayLogs = moodHistory.filter((h) => h.date === dateStr);
    const avgMood = dayLogs.length > 0
      ? parseFloat((dayLogs.reduce((sum, h) => sum + h.mood.value, 0) / dayLogs.length).toFixed(1))
      : null;
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    return { day: dayName, mood: avgMood };
  });

  return (
    <div className="space-y-6">
      <PageHeader title={`Hello, ${userProfile.name.split(" ")[0]} 🌸`} subtitle="Here's a gentle look at your wellness today." accent="coral" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass rounded-3xl p-5 shadow-card hover:shadow-glow transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `var(--${s.color})` }}>
                  <Icon className="h-5 w-5" style={{ color: `var(--${s.color}-foreground)` }} />
                </div>
              </div>
              <div className="text-3xl font-bold">{s.value} <span className="text-sm font-normal text-muted-foreground">{s.unit}</span></div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: "/tracker", label: "Log Mood", desc: "How are you feeling?", icon: Smile, color: "coral" },
          { to: "/chatbot", label: "Chat with AI", desc: "Talk with your companion", icon: MessageCircleHeart, color: "pink" },
          { to: "/challenges", label: "Browse Challenges", desc: "Build calmer habits", icon: Trophy, color: "turquoise" },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.to} to={q.to}>
              <motion.div whileHover={{ y: -4, scale: 1.01 }} className="glass rounded-3xl p-5 shadow-card hover:shadow-glow transition-all cursor-pointer flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `var(--${q.color})` }}>
                  <Icon className="h-6 w-6" style={{ color: `var(--${q.color}-foreground)` }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{q.label}</div>
                  <div className="text-xs text-muted-foreground">{q.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 glass rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Weekly Mood Trend</h3>
              <p className="text-xs text-muted-foreground">Average mood per day — last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                formatter={(val: unknown) => {
                  if (val === null || val === undefined) return ["No entry", "Mood"];
                  return [Number(val).toFixed(1), "Mood"];
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="var(--purple)"
                strokeWidth={3}
                connectNulls={false}
                dot={{ fill: "var(--coral)", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-6 shadow-card flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <QuoteIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Quote of the Day</h3>
          </div>
          <p className="text-lg leading-relaxed flex-1">"{todayQuote.text}"</p>
          <p className="text-sm text-muted-foreground mt-4">— {todayQuote.author}</p>
        </motion.div>
      </div>

      {/* Active challenge */}
      {activeChallenge && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: `var(--${activeChallenge.color})` }}>
                <Trophy className="h-6 w-6" style={{ color: `var(--${activeChallenge.color}-foreground)` }} />
              </div>
              <div>
                <h3 className="font-semibold">{activeChallenge.title}</h3>
                <p className="text-xs text-muted-foreground">{activeChallenge.desc}</p>
              </div>
            </div>
            <span className="text-sm font-semibold">{activeChallengeProgress}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${activeChallengeProgress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full gradient-coral-pink" />
          </div>
        </motion.div>
      )}

      {/* Quick Mood Check-in / Mood Palette */}
      <div className="glass rounded-3xl p-6 shadow-card">
        <div className="mb-4">
          <h3 className="font-semibold text-lg animate-pulse inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> Quick Mood Check-in</h3>
          <p className="text-xs text-muted-foreground">Tap any mood to instantly log how you are feeling right now.</p>
        </div>
        <div className="grid grid-cols-5 gap-3 w-full">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => {
                logMood(m, 50, [], "Quick check-in from dashboard", "quick");
                toast.success(`Logged ${m.label} check-in! Keep breathing 🌸`);
              }}
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl transition-all cursor-pointer hover:scale-105 hover:shadow-glow shadow-soft border border-transparent hover:border-white/10"
              style={{ background: `var(--${m.color})` }}
            >
              <span className="text-3xl md:text-4xl">{m.emoji}</span>
              <span className="text-xs font-semibold" style={{ color: `var(--${m.color}-foreground)` }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
