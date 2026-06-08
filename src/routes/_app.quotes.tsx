import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Share2, Heart, Bell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { quotes } from "@/lib/mock-data";
import { useApp } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/quotes")({
  head: () => ({ meta: [{ title: "Quotes — Mind2Care" }] }),
  component: Quotes,
});

const categories = ["all", "mindfulness", "self-care", "healing", "growth", "rest"];
const colors = ["coral", "pink", "purple", "blue", "turquoise", "green"];

function Quotes() {
  const { savedQuotes, toggleSaveQuote, settings, updateSettings } = useApp();
  const [cat, setCat] = useState("all");
  const [reminderTime, setReminderTime] = useState(settings.dailyReminder || "08:00");
  
  const filtered = cat === "all" ? quotes : quotes.filter((q) => q.category === cat);
  const todayQuote = quotes[0];
  const isTodayQuoteSaved = savedQuotes.includes(todayQuote.id);

  const handleSaveReminder = () => {
    updateSettings({ dailyReminder: reminderTime });
    toast.success(`Reminder set for ${reminderTime} daily! 🔔`);
  };

  const handleShare = (quoteText: string, author: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${quoteText}" — ${author}`);
      toast.success("Quote copied to clipboard! Share the light ✨");
    } else {
      toast.success("Ready to share!");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Words to hold close" subtitle="Soft reminders that land just when you need them." accent="blue" />

      {/* Featured */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-[2rem] p-10 shadow-glow text-center relative overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full opacity-30" style={{ background: "var(--gradient-coral-pink)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-30" style={{ background: "var(--gradient-purple-blue)", filter: "blur(60px)" }} />
        <div className="relative">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Today's Quote</span>
          <p className="mt-4 text-2xl md:text-4xl font-bold leading-tight max-w-3xl mx-auto">"{todayQuote.text}"</p>
          <p className="mt-4 text-muted-foreground">— {todayQuote.author}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => handleShare(todayQuote.text, todayQuote.author)} className="px-5 py-2.5 rounded-full glass shadow-soft hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"><Share2 className="h-4 w-4" /> Share</button>
            <button onClick={() => { toggleSaveQuote(todayQuote.id); toast.success(isTodayQuoteSaved ? "Quote removed from favorites" : "Quote saved to favorites 💖"); }} className="px-5 py-2.5 rounded-full glass shadow-soft hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer">
              <Heart className={`h-4 w-4 ${isTodayQuoteSaved ? "fill-pink-foreground text-pink-foreground" : ""}`} /> {isTodayQuoteSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all cursor-pointer ${cat === c ? "gradient-primary text-white shadow-soft" : "glass hover:shadow-soft"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((q, i) => {
          const isSaved = savedQuotes.includes(q.id);
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="glass rounded-3xl p-6 shadow-card hover:shadow-glow transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full opacity-30 -translate-y-8 translate-x-8" style={{ background: `var(--${colors[i % colors.length]})`, filter: "blur(40px)" }} />
              <p className="relative text-lg leading-relaxed">"{q.text}"</p>
              <div className="relative mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">— {q.author}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleShare(q.text, q.author)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="cursor-pointer" onClick={() => { toggleSaveQuote(q.id); toast.success(isSaved ? "Quote removed from favorites" : "Quote saved to favorites 💖"); }}>
                    <Heart className={`h-5 w-5 transition-all ${isSaved ? "fill-pink-foreground text-pink-foreground" : "text-muted-foreground"}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reminders */}
      <div className="glass rounded-3xl p-6 shadow-card flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl gradient-turquoise-green flex items-center justify-center"><Bell className="h-5 w-5 text-white" /></div>
          <div>
            <div className="font-semibold">Daily Quote Reminder</div>
            <div className="text-sm text-muted-foreground">A gentle nudge each morning</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground outline-none" />
          <button onClick={handleSaveReminder} className="px-4 py-2 rounded-xl gradient-primary text-white font-medium shadow-soft cursor-pointer">Save</button>
        </div>
      </div>
    </div>
  );
}
