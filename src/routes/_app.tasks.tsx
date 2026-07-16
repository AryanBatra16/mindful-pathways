import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Check, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Mind2Care" }] }),
  component: Tasks,
});

const columns = [
  { key: "today", label: "Today", color: "coral" },
  { key: "week", label: "This Week", color: "purple" },
  { key: "later", label: "Later", color: "blue" },
  { key: "completed", label: "Completed", color: "green" },
] as const;

const priorityColor: Record<string, string> = { high: "coral", medium: "purple", low: "turquoise" };

function Tasks() {
  const { tasks, addTask, deleteTask, completeTask } = useApp();
  const [open, setOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [due, setDue] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);

  const handleAddTask = () => {
    if (!title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }
    addTask(title, priority, due, challenge);
    toast.success("Task added! You are moving forward 🌟");
    setTitle("");
    setPriority("medium");
    setDue("");
    setChallenge(null);
    setOpen(false);
  };

  const handleCompleteTask = (id: number | string) => {
    completeTask(id);
    toast.success("Task completed! Points awarded 💛");
  };

  const handleDeleteTask = (id: number | string) => {
    deleteTask(id);
    toast.success("Task deleted.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mindful Tasks"
        subtitle="Small, intentional steps that gently move you forward."
        accent="green"
      />

      <div className="flex justify-start">
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 rounded-2xl gradient-primary text-white font-semibold shadow-glow hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="glass rounded-3xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: `var(--${col.color})` }} />
                  <h3 className="font-semibold">{col.label}</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {items.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="glass rounded-2xl p-3 shadow-soft hover:shadow-glow transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `var(--${priorityColor[t.priority]})`, color: `var(--${priorityColor[t.priority]}-foreground)` }}>{t.priority}</span>
                          <span className="text-xs text-muted-foreground">{t.due}</span>
                        </div>
                        {t.challenge && <div className="text-xs text-muted-foreground mt-1.5">🏆 {t.challenge}</div>}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.status !== "completed" && (
                          <button onClick={() => handleCompleteTask(t.id)} className="h-6 w-6 rounded-full bg-green/30 flex items-center justify-center hover:bg-green/60 cursor-pointer">
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteTask(t.id)} className="h-6 w-6 rounded-full bg-coral/30 flex items-center justify-center hover:bg-coral/60 cursor-pointer">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl p-6 w-full max-w-md shadow-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add a mindful task</h3>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none text-foreground"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="px-4 py-3 rounded-xl bg-muted/50 border border-border outline-none text-foreground"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-muted/50 border border-border outline-none text-foreground"
                />
              </div>
              <select
                value={challenge || ""}
                onChange={(e) => setChallenge(e.target.value || null)}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border outline-none text-foreground"
              >
                <option value="">No challenge linked</option>
                <option value="7-Day Gratitude Journal">7-Day Gratitude Journal</option>
                <option value="Mindful Mornings">Mindful Mornings</option>
                <option value="Move Every Day">Move Every Day</option>
              </select>
              <button onClick={handleAddTask} className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-glow cursor-pointer">Add Task</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
