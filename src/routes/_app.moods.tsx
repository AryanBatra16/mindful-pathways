import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/state";

export const Route = createFileRoute("/_app/moods")({
  head: () => ({ meta: [{ title: "Mood Analytics — Mind2Care" }] }),
  component: Moods,
});

const defaultTrend = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  mood: 2.5 + Math.sin(i / 4) + Math.random() * 0.8,
}));

const triggers = [
  { name: "Work", positive: 4, negative: 12 },
  { name: "Sleep", positive: 18, negative: 6 },
  { name: "Exercise", positive: 22, negative: 1 },
  { name: "Social", positive: 16, negative: 4 },
  { name: "Nutrition", positive: 14, negative: 3 },
];

const insights = [
  { icon: TrendingUp, color: "green", title: "Your mood is trending up", desc: "Average mood improved by 12% this month — keep it up!" },
  { icon: Brain, color: "purple", title: "Sleep is your superpower", desc: "Your best mood days correlate with 7+ hours of sleep." },
  { icon: Sparkles, color: "coral", title: "Movement boosts you", desc: "Days with exercise show 35% higher mood scores." },
];

function Moods() {
  const { moodHistory } = useApp();

  // Compute dynamic distribution based on real logged moods
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

  // Map actual mood history to trend data points
  const dynamicTrend = [...moodHistory].slice(0, 30).reverse().map((log, index) => ({
    day: log.date || `Day ${index + 1}`,
    mood: log.mood.value,
  }));

  const trendData = dynamicTrend.length > 0 ? dynamicTrend : defaultTrend;

  return (
    <div className="space-y-6">
      <PageHeader title="Mood Analytics" subtitle="Patterns in your inner weather." accent="purple" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Mood trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--coral)" />
                  <stop offset="50%" stopColor="var(--purple)" />
                  <stop offset="100%" stopColor="var(--turquoise)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="mood" stroke="url(#moodGrad)" strokeWidth={3} dot={false} />
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
              <div key={d.name} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: d.fill }} />{d.name}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Triggers & correlations</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={triggers}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
            <Bar dataKey="positive" fill="var(--green)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="negative" fill="var(--coral)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
