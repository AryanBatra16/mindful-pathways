import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { quotes } from "@/lib/mock-data";
import { useApp, getQuoteOfTheDay } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/quotes")({
  head: () => ({ meta: [{ title: "Quotes — Mind2Care" }] }),
  component: Quotes,
});

const categories = ["all", "mindfulness", "self-care", "healing", "growth", "rest"];
const colors = ["coral", "pink", "purple", "blue", "turquoise", "green"];

function Quotes() {
  const { savedQuotes, toggleSaveQuote } = useApp();
  const [cat, setCat] = useState("all");
  const [savedExpanded, setSavedExpanded] = useState(true);

  const filtered = cat === "all" ? quotes : quotes.filter((q) => q.category === cat);
  const todayQuote = getQuoteOfTheDay(quotes);
  const isTodayQuoteSaved = savedQuotes.includes(todayQuote.id);

  // Liked quotes
  const likedQuotes = quotes.filter((q) => savedQuotes.includes(q.id));

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
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                toggleSaveQuote(todayQuote.id);
                toast.success(isTodayQuoteSaved ? "Quote removed from favorites" : "Quote saved to favorites 💖");
              }}
              className="px-5 py-2.5 rounded-full glass shadow-soft hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <Heart className={`h-4 w-4 transition-all ${isTodayQuoteSaved ? "fill-current text-pink-500" : ""}`} />
              {isTodayQuoteSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Saved Quotes Section */}
      <AnimatePresence>
        {likedQuotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-3xl shadow-card overflow-hidden"
          >
            <button
              onClick={() => setSavedExpanded((p) => !p)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl gradient-coral-pink flex items-center justify-center shadow-soft">
                  <Bookmark className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Saved Quotes</div>
                  <div className="text-xs text-muted-foreground">{likedQuotes.length} quote{likedQuotes.length !== 1 ? "s" : ""} saved</div>
                </div>
              </div>
              {savedExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {savedExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {likedQuotes.map((q, i) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative glass rounded-2xl p-5 overflow-hidden"
                        style={{ borderLeft: `3px solid var(--${colors[i % colors.length]})` }}
                      >
                        <p className="text-sm leading-relaxed">"{q.text}"</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">— {q.author}</span>
                          <button
                            onClick={() => {
                              toggleSaveQuote(q.id);
                              toast.success("Quote removed from favorites");
                            }}
                            className="p-1 cursor-pointer text-pink-500 hover:scale-110 transition-transform"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

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
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    toggleSaveQuote(q.id);
                    toast.success(isSaved ? "Quote removed from favorites" : "Quote saved to favorites 💖");
                  }}
                >
                  <Heart className={`h-5 w-5 transition-all ${isSaved ? "fill-current text-pink-500" : "text-muted-foreground"}`} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
