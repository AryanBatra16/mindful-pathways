import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Info } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { useApp, toISODate } from "@/lib/state";

export const Route = createFileRoute("/_app/moods")({
  head: () => ({ meta: [{ title: "Mood Analytics — Mind2Care" }] }),
  component: Moods,
});

function Moods() {
  const { moodHistory } = useApp();

  // ─── Mood Distribution ────────────────────────────────────────────────────
  const distributionMap = { Joyful: 0, Good: 0, Okay: 0, Low: 0, Sad: 0 };
  let totalLogs = 0;
  moodHistory.forEach((log) => {
    const label = log.mood.label;
    if (label in distributionMap) {
      distributionMap[label as keyof typeof distributionMap]++;
      totalLogs++;
    }
  });

  const dynamicDistribution = [
    { name: "Joyful", value: totalLogs > 0 ? distributionMap.Joyful : 12, fill: "var(--green)" },
    { name: "Good", value: totalLogs > 0 ? distributionMap.Good : 18, fill: "var(--turquoise)" },
    { name: "Okay", value: totalLogs > 0 ? distributionMap.Okay : 8, fill: "var(--blue)" },
    { name: "Low", value: totalLogs > 0 ? distributionMap.Low : 4, fill: "var(--purple)" },
    { name: "Sad", value: totalLogs > 0 ? distributionMap.Sad : 2, fill: "var(--pink)" },
  ];

  // ─── Mood Trend (last 30 daily averages) ─────────────────────────────────
  const dynamicTrend = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = toISODate(d);
    const dayLogs = moodHistory.filter((h) => h.date === dateStr);
    const avgMood = dayLogs.length > 0
      ? parseFloat((dayLogs.reduce((s, h) => s + h.mood.value, 0) / dayLogs.length).toFixed(1))
      : null;
    return { day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), mood: avgMood };
  });

  const hasMoodData = moodHistory.length > 0;

  // ─── Dynamic Triggers & Correlations ─────────────────────────────────────
  // For each tag in mood logs, count how many times it appeared with good mood (Joyful/Good)
  // vs bad mood (Low/Sad)
  const tagMap: Record<string, { positive: number; negative: number; neutral: number }> = {};
  moodHistory.forEach((log) => {
    (log.tags || []).forEach((tag) => {
      if (!tagMap[tag]) tagMap[tag] = { positive: 0, negative: 0, neutral: 0 };
      if (log.mood.value >= 4) tagMap[tag].positive++;
      else if (log.mood.value <= 2) tagMap[tag].negative++;
      else tagMap[tag].neutral++;
    });
  });

  const hasTriggerData = Object.keys(tagMap).length > 0;

  // Fallback triggers if no real data yet
  const fallbackTriggers = [
    { name: "Work", positive: 4, negative: 12 },
    { name: "Sleep", positive: 18, negative: 6 },
    { name: "Exercise", positive: 22, negative: 1 },
    { name: "Social", positive: 16, negative: 4 },
    { name: "Nutrition", positive: 14, negative: 3 },
  ];

  const triggerData = hasTriggerData
    ? Object.entries(tagMap)
        .map(([name, counts]) => ({ name, positive: counts.positive, negative: counts.negative }))
        .sort((a, b) => (b.positive + b.negative) - (a.positive + a.negative))
        .slice(0, 8)
    : fallbackTriggers;

  // ─── Insights ─────────────────────────────────────────────────────────────
  const insights = [
    { icon: TrendingUp, color: "green", title: "Your mood is tracking", desc: hasMoodData ? `You've logged ${moodHistory.length} mood entries. Keep it up!` : "Start logging your mood to see trends here." },
    { icon: Brain, color: "purple", title: "Sleep is your superpower", desc: hasTriggerData && tagMap["Sleep"] ? `Sleep appeared in ${tagMap["Sleep"].positive} positive mood entries.` : "Days with good sleep tend to show higher mood scores." },
    { icon: Sparkles, color: "coral", title: "Movement boosts you", desc: hasTriggerData && tagMap["Energy"] ? `Energy tag linked to ${tagMap["Energy"].positive} good days!` : "Try tagging 'Energy' when you exercise to track the boost." },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Mood Analytics" subtitle="Patterns in your inner weather." accent="purple" />

      {/* Trend + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-1">Mood trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Average daily mood over the last 30 days</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dynamicTrend}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--coral)" />
                  <stop offset="50%" stopColor="var(--purple)" />
                  <stop offset="100%" stopColor="var(--turquoise)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} interval={4} />
              <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                formatter={(val: unknown) => {
                  if (val === null || val === undefined) return ["No entry", "Mood"];
                  return [Number(val).toFixed(1), "Avg Mood"];
                }}
              />
              <Line type="monotone" dataKey="mood" stroke="url(#moodGrad)" strokeWidth={3} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Mood distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dynamicDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4}>
                {dynamicDistribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {dynamicDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full shrink-0" style={{ background: d.fill }} />{d.name}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Triggers & Correlations */}
      <div className="glass rounded-3xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold">Triggers & correlations</h3>
            <p className="text-xs text-muted-foreground mt-1">
              How often each tag appeared alongside a <span className="text-green-500 font-medium">positive</span> or <span className="text-red-400 font-medium">negative</span> mood entry
            </p>
          </div>
          {!hasTriggerData && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground glass px-3 py-1.5 rounded-full">
              <Info className="h-3.5 w-3.5" />
              <span>Sample data — log moods with tags to see your own</span>
            </div>
          )}
        </div>
        <div className="flex gap-4 text-xs mb-4">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-green-400 inline-block" /> Good/Joyful mood (value ≥ 4)</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-red-400 inline-block" /> Low/Sad mood (value ≤ 2)</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={triggerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
              formatter={(value: number, name: string) => [value, name === "positive" ? "😊 Good mood times" : "😔 Low mood times"]}
            />
            <Legend
              formatter={(value) => value === "positive" ? "Good/Joyful mood" : "Low/Sad mood"}
            />
            <Bar dataKey="positive" name="positive" fill="var(--green)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="negative" name="negative" fill="var(--coral)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-3">
          💡 <strong>How to read this:</strong> If "Sleep" has a tall green bar, it means you logged good moods on days you tagged sleep. A tall red bar means that tag often appeared with low moods. Use tags when logging to build your personal pattern over time.
        </p>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <motion.div
              key={ins.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass rounded-3xl p-5 shadow-card hover:shadow-glow transition-all"
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3 shadow-soft" style={{ background: `var(--${ins.color})` }}>
                <Icon className="h-5 w-5" style={{ color: `var(--${ins.color}-foreground)` }} />
              </div>
              <h4 className="font-semibold">{ins.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{ins.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
