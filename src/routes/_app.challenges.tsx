import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Trophy, Sparkles, Check, Play, Info, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/challenges")({
  head: () => ({ meta: [{ title: "Challenges — Mind2Care" }] }),
  component: Challenges,
});

function Challenges() {
  const { challenges, userProfile, toggleChallenge, computeChallengeProgress } = useApp();
  const [tab, setTab] = useState<"active" | "available" | "completed">("active");
  const [hoveredInfo, setHoveredInfo] = useState<number | null>(null);

  const filtered = challenges.filter((c) => c.status === tab);

  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed").length;

  const handleAction = (id: number, status: string, title: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (status === "available") {
      toggleChallenge(id);
      toast.success(`Started challenge: ${title}! Let's do this 🚀`);
    } else if (status === "active") {
      if (!challenge) return;
      const progress = computeChallengeProgress(challenge);
      if (progress >= 100) {
        toggleChallenge(id);
        toast.success(`Completed challenge: ${title}! Well done 🌟 +${challenge.points} pts`);
      } else {
        toast.error(`Not quite there yet! ${progress}% complete. ${challenge.requirement || "Keep working on it."}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Wellness Challenges" subtitle="Build calmer habits, one tiny win at a time." accent="turquoise" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active", value: activeCount, color: "coral", icon: Play },
          { label: "Completed", value: completedCount, color: "green", icon: Check },
          { label: "Total Points", value: userProfile.points, color: "purple", icon: Sparkles },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-3xl p-5 shadow-card flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: `var(--${s.color})` }}>
                <Icon className="h-5 w-5" style={{ color: `var(--${s.color}-foreground)` }} />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2 glass rounded-2xl p-1.5 w-fit shadow-soft">
        {(["active", "available", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer ${tab === t ? "gradient-primary text-white shadow-soft" : "hover:bg-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, i) => {
          // Compute real-time progress
          const liveProgress = c.status === "completed" ? 100 : computeChallengeProgress(c);
          const isReady = liveProgress >= 100;
          const remaining = c.requirementCount
            ? Math.max(0, c.requirementCount - Math.round((liveProgress / 100) * c.requirementCount))
            : 0;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="glass rounded-3xl p-6 shadow-card hover:shadow-glow transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-40 -translate-y-10 translate-x-10" style={{ background: `var(--${c.color})`, filter: "blur(50px)" }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-soft" style={{ background: `var(--${c.color})` }}>
                    <Trophy className="h-6 w-6" style={{ color: `var(--${c.color}-foreground)` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full glass font-medium">{c.points} pts</span>
                    {/* Info tooltip trigger */}
                    {c.requirement && c.status !== "completed" && (
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredInfo(c.id)}
                        onMouseLeave={() => setHoveredInfo(null)}
                      >
                        <button className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                          <Info className="h-4 w-4" />
                        </button>
                        {hoveredInfo === c.id && (
                          <div className="absolute right-0 top-7 w-56 glass rounded-xl p-3 shadow-glow text-xs z-10 border border-border">
                            <p className="font-medium mb-1">How to complete:</p>
                            <p className="text-muted-foreground">{c.requirement}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium capitalize">{c.category}</span>
                    <span className={`font-semibold ${isReady && c.status !== "completed" ? "text-green-500" : ""}`}>
                      {liveProgress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${liveProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                      className="h-full"
                      style={{ background: isReady ? "var(--green)" : `var(--${c.color})` }}
                    />
                  </div>
                  {/* Show what's missing for active challenges */}
                  {c.status === "active" && !isReady && remaining > 0 && c.requirementCount && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      {remaining} more {remaining === 1 ? "action" : "actions"} needed
                    </p>
                  )}
                  {c.status === "active" && isReady && (
                    <p className="text-xs text-green-500 mt-1.5 font-medium">✓ Ready to complete!</p>
                  )}
                </div>
                <button
                  onClick={() => handleAction(c.id, c.status, c.title)}
                  disabled={c.status === "completed"}
                  className={`mt-5 w-full py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    c.status === "completed"
                      ? "glass opacity-70 cursor-default"
                      : c.status === "active" && !isReady
                      ? "glass border border-border text-muted-foreground hover:border-primary"
                      : "gradient-primary text-white shadow-soft hover:scale-[1.02]"
                  }`}
                >
                  {c.status === "active"
                    ? isReady
                      ? "✓ Mark Complete"
                      : "In Progress..."
                    : c.status === "available"
                    ? "Start Challenge"
                    : "✓ Completed"}
                </button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center p-8 text-muted-foreground">No challenges in this section.</div>
        )}
      </div>
    </div>
  );
}
