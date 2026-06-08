import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Flame, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { moods } from "@/lib/mock-data";
import { useApp } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tracker")({
  head: () => ({ meta: [{ title: "Daily Tracker — Mind2Care" }] }),
  component: Tracker,
});

function Tracker() {
  const { moodHistory, logMood } = useApp();
  const [selected, setSelected] = useState(1);
  const [intensity, setIntensity] = useState(60);
  const [tags, setTags] = useState<string[]>(["Work", "Calm"]);
  const [note, setNote] = useState("");

  const allTags = ["Work", "Family", "Calm", "Anxious", "Grateful", "Tired", "Sleep", "Energy", "Social"];

  // 35-day heatmap mapped from actual mood history
  const heatmap = Array.from({ length: 35 }).map((_, i) => {
    const historyIndex = moodHistory.length - 1 - i;
    const log = historyIndex >= 0 ? moodHistory[historyIndex] : null;
    return {
      i,
      color: log ? log.mood.color : "muted",
      opacity: log ? 0.5 + (log.mood.value / 10) : 0.15,
    };
  });

  const handleSaveMood = () => {
    logMood(moods[selected], intensity, tags, note);
    toast.success("Mood logged successfully! Keep up the good work.");
    setNote("");
    setTags([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Mood Tracker" subtitle="Tiny check-ins. Big shifts." accent="purple" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mood logger */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">How are you feeling?</h3>
          <div className="grid grid-cols-5 gap-3">
            {moods.map((m, i) => (
              <motion.button
                key={m.label}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(i)}
                className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${selected === i ? "shadow-glow scale-105" : "glass shadow-soft"}`}
                style={selected === i ? { background: `var(--${m.color})` } : {}}
              >
                <span className="text-3xl md:text-4xl">{m.emoji}</span>
                <span className="text-xs font-medium" style={selected === i ? { color: `var(--${m.color}-foreground)` } : {}}>{m.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Intensity</span>
              <span className="text-muted-foreground">{intensity}%</span>
            </div>
            <input
              type="range"
              min="0" max="100"
              value={intensity}
              onChange={(e) => setIntensity(+e.target.value)}
              className="w-full accent-primary"
            />
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => setTags((p) => active ? p.filter((x) => x !== t) : [...p, t])}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${active ? "gradient-primary text-white shadow-soft" : "glass hover:shadow-soft"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Notes</div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 rounded-2xl bg-muted/50 border border-border focus:border-primary outline-none resize-none"
            />
          </div>

          <button onClick={handleSaveMood} className="mt-4 w-full py-3 rounded-2xl gradient-primary text-white font-semibold shadow-glow hover:scale-[1.01] transition-transform cursor-pointer">
            Save Today's Mood
          </button>
        </div>

        {/* Streak */}
        <div className="space-y-4">
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl p-6 shadow-card text-center">
            <div className="inline-flex h-16 w-16 rounded-3xl gradient-coral-pink items-center justify-center shadow-glow">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div className="text-4xl font-bold mt-3">{moodHistory.length > 0 ? Math.min(30, moodHistory.length + 1) : 0}</div>
            <div className="text-sm text-muted-foreground">day streak</div>
            <div className="mt-3 text-xs text-muted-foreground">Best: 28 days</div>
          </motion.div>

          <div className="glass rounded-3xl p-6 shadow-card">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Calendar className="h-4 w-4" /> Mood Heatmap</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {heatmap.map((c) => (
                <motion.div
                  key={c.i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: c.i * 0.01 }}
                  className="aspect-square rounded-md"
                  style={{ background: c.color === "muted" ? "var(--muted)" : `var(--${c.color})`, opacity: c.opacity }}
                />
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex justify-between"><span>5 weeks ago</span><span>today</span></div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-3xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Mood History</h3>
        <div className="space-y-2">
          {moodHistory.slice(0, 8).map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: `var(--${h.mood.color})` }}>
                {h.mood.emoji}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{h.mood.label}</div>
                <div className="text-xs text-muted-foreground">{h.note}</div>
              </div>
              <div className="text-xs text-muted-foreground">{h.date}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
