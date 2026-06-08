import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Sparkles, Smile, MessageCircleHeart, Trophy, ArrowRight, Quote as QuoteIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { quotes, moods } from "@/lib/mock-data";
import { useApp } from "@/lib/state";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Mind2Care" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { userProfile, moodHistory, challenges } = useApp();
  
  const todayQuote = quotes[0];
  const activeChallenge = challenges.find((c) => c.status === "active") || challenges[0];

  // Compute stats dynamically
  const streak = moodHistory.length > 0 ? Math.min(30, moodHistory.length + 1) : 0;
  
  const averageMoodValue = moodHistory.length > 0 
    ? (moodHistory.reduce((sum, h) => sum + h.mood.value, 0) / moodHistory.length).toFixed(1)
    : "4.2";

  const todayMoodLog = moodHistory[0];
  const todayMoodEmoji = todayMoodLog ? todayMoodLog.mood.emoji : "🙂";
  const todayMoodLabel = todayMoodLog ? todayMoodLog.mood.label : "Good";

  const stats = [
    { label: "Streak", value: String(streak), unit: "days", icon: Flame, color: "coral" },
    { label: "Average Mood", value: averageMoodValue, unit: "/ 5", icon: TrendingUp, color: "purple" },
    { label: "Total Points", value: userProfile.points.toLocaleString(), unit: "pts", icon: Sparkles, color: "turquoise" },
    { label: "Today's Mood", value: todayMoodEmoji, unit: todayMoodLabel, icon: Smile, color: "green" },
  ];

  // Map last 7 days of mood history to weekly trend chart
  // If we have history, map it. Otherwise map mock weekly trend
  const defaultWeeklyMood = [
    { day: "Mon", mood: 4 }, { day: "Tue", mood: 3 }, { day: "Wed", mood: 5 },
    { day: "Thu", mood: 4 }, { day: "Fri", mood: 4 }, { day: "Sat", mood: 5 }, { day: "Sun", mood: 4 },
  ];

  const chartData = moodHistory.length >= 3
    ? [...moodHistory].slice(0, 7).reverse().map((log) => ({
        day: log.date.replace("Day ", "D"),
        mood: log.mood.value,
      }))
    : defaultWeeklyMood;

  return (
    <div className="space-y-6">
      <PageHeader title={`Good morning, ${userProfile.name.split(" ")[0]} 🌸`} subtitle="Here's a gentle look at your wellness today." accent="coral" />

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
              <p className="text-xs text-muted-foreground">Your last check-ins</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full glass">+8% vs last week</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="mood" stroke="var(--purple)" strokeWidth={3} dot={{ fill: "var(--coral)", r: 5 }} activeDot={{ r: 7 }} />
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
            <span className="text-sm font-semibold">{activeChallenge.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${activeChallenge.progress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full gradient-coral-pink" />
          </div>
        </motion.div>
      )}

      {/* Recent moods */}
      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Recent Moods</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {moods.map((m) => (
            <div key={m.label} className="shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl glass min-w-[88px]" style={{ background: `var(--${m.color})`, opacity: 0.6 }}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-medium" style={{ color: `var(--${m.color}-foreground)` }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
