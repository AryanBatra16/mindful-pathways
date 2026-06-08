import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Phone, Heart, Smile } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/state";
import { moods } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chatbot")({
  head: () => ({ meta: [{ title: "AI Companion — Mind2Care" }] }),
  component: Chatbot,
});

type Msg = { role: "user" | "assistant"; text: string; time: string };

const initial = (name: string): Msg[] => [
  { role: "assistant", text: `Hi ${name}, I'm so glad you stopped by 🌸 How are you feeling today?`, time: "9:02" },
];

const quickReplies = ["I feel great", "A bit anxious", "Tired", "Need to vent", "Just checking in"];
const moodChips = [
  { emoji: "😄", label: "Joyful", value: 5, color: "green" },
  { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
  { emoji: "😐", label: "Okay", value: 3, color: "blue" },
  { emoji: "😔", label: "Low", value: 2, color: "purple" },
  { emoji: "😢", label: "Sad", value: 1, color: "pink" },
];

function Chatbot() {
  const { userProfile, logMood } = useApp();
  const [messages, setMessages] = useState<Msg[]>(() => initial(userProfile.name.split(" ")[0]));
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const getAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    if (text.includes("anxious") || text.includes("anxiety") || text.includes("panic") || text.includes("scared")) {
      return "I hear you. When anxiety hits, it can feel really overwhelming. Let's try a slow box breath together: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. You are safe here 💛";
    }
    if (text.includes("sad") || text.includes("depressed") || text.includes("cry") || text.includes("low") || text.includes("hurt")) {
      return "It's completely okay to feel sad or low. You don't have to force yourself to be positive. I'm right here with you, and we can just sit with this feeling for a while 🌸";
    }
    if (text.includes("happy") || text.includes("great") || text.includes("good") || text.includes("win") || text.includes("excited")) {
      return "That is wonderful to hear! 🌟 Sharing moments of joy is so important. What made today feel a bit brighter?";
    }
    if (text.includes("tired") || text.includes("exhausted") || text.includes("sleep") || text.includes("fatigue")) {
      return "It sounds like your body and mind are asking for rest. Give yourself permission to pause and recharge. Rest is productive self-care 💤";
    }
    return "Thank you for sharing that with me. How does that make you feel inside, and what is one small thing that might bring you some comfort right now?";
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { role: "user", text, time }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        role: "assistant",
        text: getAIResponse(text),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1000);
  };

  const handleMoodChipClick = (chip: typeof moodChips[0]) => {
    // Log mood to history
    logMood({ emoji: chip.emoji, label: chip.label, value: chip.value, color: chip.color }, 50, [], `Checked in via AI Companion`);
    toast.success(`Logged mood: ${chip.label}!`);
    send(`I am feeling ${chip.label} ${chip.emoji}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Companion" subtitle="A calm space to talk. I'm here, no judgment." accent="pink" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat */}
        <div className="lg:col-span-3 glass rounded-3xl shadow-card flex flex-col h-[70vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-purple-blue flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">Mira · Wellness Companion</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green animate-pulse" /> Always here for you
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${m.role === "user" ? "gradient-coral-pink" : "gradient-purple-blue"}`}>
                    {m.role === "user" ? userProfile.name.charAt(0).toUpperCase() : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-3 rounded-2xl ${m.role === "user" ? "gradient-primary text-white rounded-tr-sm" : "glass rounded-tl-sm"}`}>
                      {m.text}
                    </div>
                    <span className="text-xs text-muted-foreground px-1">{m.time}</span>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full gradient-purple-blue flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
                  <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.span key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }} className="h-2 w-2 rounded-full bg-muted-foreground" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {quickReplies.map((q) => (
                <button key={q} onClick={() => send(q)} className="shrink-0 px-3 py-1.5 rounded-full glass text-sm hover:shadow-soft transition-all cursor-pointer">{q}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-3 rounded-2xl bg-muted/50 border border-border focus:border-primary outline-none transition-all text-foreground"
              />
              <button onClick={() => send(input)} className="px-5 py-3 rounded-2xl gradient-primary text-white shadow-glow hover:scale-105 transition-transform cursor-pointer">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Smile className="h-4 w-4" /> Quick Mood Check</h3>
            <div className="grid grid-cols-5 gap-2">
              {moodChips.map((m) => (
                <button key={m.label} onClick={() => handleMoodChipClick(m)} className="aspect-square rounded-xl glass hover:scale-110 transition-transform text-2xl cursor-pointer flex items-center justify-center">
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-5 shadow-card" style={{ background: "var(--coral)", opacity: 0.95 }}>
            <h3 className="font-semibold flex items-center gap-2 mb-2" style={{ color: "var(--coral-foreground)" }}><Phone className="h-4 w-4" /> Crisis Support</h3>
            <p className="text-sm mb-3" style={{ color: "var(--coral-foreground)" }}>If you need immediate help, you're not alone.</p>
            <div className="space-y-2">
              <a href="tel:988" className="block px-3 py-2 rounded-xl bg-white/60 text-sm font-medium text-center">📞 Call 988</a>
              <a href="sms:741741" className="block px-3 py-2 rounded-xl bg-white/60 text-sm font-medium text-center">💬 Text HOME to 741741</a>
            </div>
          </div>

          <div className="glass rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold flex items-center gap-2 mb-2"><Heart className="h-4 w-4 text-pink-foreground" /> Reminder</h3>
            <p className="text-sm text-muted-foreground">You're doing better than you think. Be gentle with yourself today.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
