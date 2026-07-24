import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Phone, Heart, Smile, Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, Copy, Check, PenLine } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/state";
import { toast } from "sonner";
import {
  getChatbotMessagesServerFn,
  getGeminiResponseServerFn,
  saveChatbotMessageServerFn,
} from "@/lib/server-functions";
import { DEMO_CHAT_SESSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/chatbot")({
  head: () => ({ meta: [{ title: "AI Companion — Mind2Care" }] }),
  component: Chatbot,
});

type Msg = { role: "user" | "assistant"; text: string; time: string };

interface ChatSession {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: number;
  updatedAt: number;
}

const SESSIONS_KEY = "mind2care_chat_sessions";
const ACTIVE_SESSION_KEY = "mind2care_active_session";

const quickReplies = ["I feel great", "A bit anxious", "Tired", "Need to vent", "Just checking in"];
const moodChips = [
  { emoji: "😄", label: "Joyful", value: 5, color: "green" },
  { emoji: "🙂", label: "Good", value: 4, color: "turquoise" },
  { emoji: "😐", label: "Okay", value: 3, color: "blue" },
  { emoji: "😔", label: "Low", value: 2, color: "purple" },
  { emoji: "😢", label: "Sad", value: 1, color: "pink" },
];

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSessionTitle(messages: Msg[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (!firstUserMsg) return "New conversation";
  const text = firstUserMsg.text.trim();
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

function formatSessionDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "Last 7 Days";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function groupSessionsByDate(sessions: ChatSession[]): { label: string; sessions: ChatSession[] }[] {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const label = formatSessionDate(s.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  const order = ["Today", "Yesterday", "Last 7 Days"];
  const sorted = Object.entries(groups).sort(([a], [b]) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return sorted.map(([label, sessions]) => ({ label, sessions }));
}

function Chatbot() {
  const { userProfile, logMood, isDemoMode } = useApp();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Load sessions from localStorage (or demo data)
  useEffect(() => {
    const loadSessions = async () => {
      if (isDemoMode) {
        // Use demo chat sessions
        const demoSessions: ChatSession[] = DEMO_CHAT_SESSIONS.map((s) => ({
          id: s.id,
          title: s.title,
          messages: s.messages,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        }));
        setSessions(demoSessions);
        setActiveSessionId(demoSessions[0]?.id || null);
        setDbLoaded(true);
        return;
      }

      // Try to load from localStorage first
      const stored = localStorage.getItem(SESSIONS_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (stored) {
        try {
          const parsed: ChatSession[] = JSON.parse(stored);
          if (parsed.length > 0) {
            setSessions(parsed);
            setActiveSessionId(storedActiveId || parsed[0].id);
            setDbLoaded(true);
            return;
          }
        } catch (e) {}
      }

      // Load from DB for logged-in users (first visit)
      try {
        const dbMsgs = await getChatbotMessagesServerFn();
        if (dbMsgs.length > 0) {
          const dbSession: ChatSession = {
            id: generateSessionId(),
            title: getSessionTitle(
              dbMsgs.map((m: any) => ({ role: m.role as "user" | "assistant", text: m.text, time: "" }))
            ),
            messages: dbMsgs.map((m: any) => ({
              role: m.role as "user" | "assistant",
              text: m.text,
              time: m.created_at
                ? new Date(m.created_at * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })),
            createdAt: Date.now() - 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          };
          const newSessions = [dbSession];
          setSessions(newSessions);
          setActiveSessionId(dbSession.id);
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
          localStorage.setItem(ACTIVE_SESSION_KEY, dbSession.id);
        } else {
          // Create fresh session
          createNewSession();
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        createNewSession();
      }
      setDbLoaded(true);
    };
    loadSessions();
  }, [isDemoMode, userProfile.name]);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    if (!dbLoaded || isDemoMode) return;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions, dbLoaded, isDemoMode]);

  useEffect(() => {
    if (!activeSessionId || isDemoMode) return;
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
  }, [activeSessionId, isDemoMode]);

  const createNewSession = useCallback(() => {
    const firstName = userProfile.name.split(" ")[0];
    const greetingTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newSession: ChatSession = {
      id: generateSessionId(),
      title: "New conversation",
      messages: [
        {
          role: "assistant",
          text: `Hi ${firstName}, I'm so glad you stopped by 🌸 How are you feeling today?`,
          time: greetingTime,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
    return newSession;
  }, [userProfile.name]);

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (id === activeSessionId) {
        setActiveSessionId(remaining[0]?.id || null);
        if (remaining.length === 0) {
          // Auto-create a new one
          setTimeout(() => createNewSession(), 50);
        }
      }
      return remaining;
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || !activeSessionId) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Msg = { role: "user", text, time };

    // Optimistically update messages
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const updated = {
          ...s,
          messages: [...s.messages, userMsg],
          title: s.title === "New conversation" ? getSessionTitle([...s.messages, userMsg]) : s.title,
          updatedAt: Date.now(),
        };
        return updated;
      })
    );
    setInput("");
    setTyping(true);


    try {
      const response = await getGeminiResponseServerFn({ data: { userMessage: text } });
      const assistantMsg: Msg = {
        role: "assistant",
        text: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id !== activeSessionId
            ? s
            : { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() }
        )
      );
    } catch (err) {
      console.error("Failed to get AI response:", err);
      toast.error("Companion is offline. Please try again.");
    } finally {
      setTyping(false);
    }
  };

  const handleMoodChipClick = (chip: (typeof moodChips)[0]) => {
    logMood({ emoji: chip.emoji, label: chip.label, value: chip.value, color: chip.color }, 50, [], `Checked in via AI Companion`);
    toast.success(`Logged mood: ${chip.label}!`);
    send(`I am feeling ${chip.label} ${chip.emoji}`);
  };

  const copyMessage = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgIdx(idx);
      setTimeout(() => setCopiedMsgIdx(null), 2000);
    } catch {}
  };

  const startEditTitle = (session: ChatSession) => {
    setEditingTitle(session.id);
    setEditTitleValue(session.title);
  };

  const saveTitle = () => {
    if (!editingTitle) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === editingTitle ? { ...s, title: editTitleValue || s.title } : s))
    );
    setEditingTitle(null);
  };

  const grouped = groupSessionsByDate([...sessions].sort((a, b) => b.updatedAt - a.updatedAt));

  return (
    <div className="space-y-6">
      <PageHeader title="AI Companion" subtitle="A calm space to talk. I'm here, no judgment." accent="pink" />

      <div className="flex gap-4 h-[75vh]">
        {/* ── Sessions Sidebar ───────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="glass rounded-3xl shadow-card flex flex-col overflow-hidden shrink-0"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <span className="font-semibold text-sm">Conversations</span>
                <button
                  onClick={() => createNewSession()}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Session list */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-3">
                {grouped.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    No conversations yet
                  </div>
                )}
                {grouped.map((group) => (
                  <div key={group.label}>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                      {group.label}
                    </div>
                    <div className="space-y-0.5">
                      {group.sessions.map((s) => (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            s.id === activeSessionId
                              ? "bg-primary/10 text-foreground"
                              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setActiveSessionId(s.id)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          {editingTitle === s.id ? (
                            <input
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              onBlur={saveTitle}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveTitle();
                                if (e.key === "Escape") setEditingTitle(null);
                              }}
                              className="flex-1 text-xs bg-transparent outline-none border-b border-primary text-foreground"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="flex-1 text-xs font-medium truncate">{s.title}</span>
                          )}
                          {/* Action buttons — shown on hover */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditTitle(s);
                              }}
                              className="p-1 rounded hover:bg-muted transition-colors"
                              title="Rename"
                            >
                              <PenLine className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(s.id);
                              }}
                              className="p-1 rounded hover:bg-red-500/20 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* New chat bottom button */}
              <div className="p-3 border-t border-border shrink-0">
                <button
                  onClick={() => createNewSession()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white text-xs font-semibold shadow-glow hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Chat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Chat + Right Panel ─────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 gap-4 lg:flex-row">
          {/* Chat */}
          <div className="glass rounded-3xl shadow-card flex flex-col flex-1 overflow-hidden min-w-0">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                {/* Toggle sidebar */}
                <button
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                  title={sidebarOpen ? "Hide conversations" : "Show conversations"}
                >
                  {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="h-9 w-9 rounded-full gradient-purple-blue flex items-center justify-center shadow-glow shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Mira · Wellness Companion</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" /> Always here for you
                  </div>
                </div>
              </div>
              {/* Session title */}
              {activeSession && (
                <div
                  className="text-xs text-muted-foreground truncate max-w-[180px] cursor-pointer hover:text-foreground transition-colors"
                  title="Click to rename"
                  onClick={() => activeSession && startEditTitle(activeSession)}
                >
                  {activeSession.title}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${
                        m.role === "user" ? "gradient-coral-pink" : "gradient-purple-blue"
                      }`}
                    >
                      {m.role === "user" ? userProfile.name.charAt(0).toUpperCase() : <Sparkles className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`max-w-[75%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          m.role === "user"
                            ? "gradient-primary text-white rounded-tr-sm"
                            : "glass rounded-tl-sm"
                        }`}
                      >
                        {m.text}
                        {/* Copy button */}
                        <button
                          onClick={() => copyMessage(m.text, i)}
                          className={`absolute -bottom-2 ${m.role === "user" ? "-left-2" : "-right-2"} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full glass shadow-soft`}
                          title="Copy"
                        >
                          {copiedMsgIdx === i ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground px-1">{m.time}</span>
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full gradient-purple-blue flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border p-4 space-y-3 shrink-0">
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="shrink-0 px-3 py-1.5 rounded-full glass text-xs hover:shadow-soft transition-all cursor-pointer whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
                  placeholder="Share what's on your mind…"
                  className="flex-1 px-4 py-3 rounded-2xl bg-muted/50 border border-border focus:border-primary outline-none transition-all text-foreground text-sm"
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || typing}
                  className="px-4 py-3 rounded-2xl gradient-primary text-white shadow-glow hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:scale-100 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
            <div className="glass rounded-3xl p-5 shadow-card">
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                <Smile className="h-4 w-4" /> Quick Mood Check
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {moodChips.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => handleMoodChipClick(m)}
                    title={m.label}
                    className="aspect-square rounded-xl glass hover:scale-110 transition-transform text-xl cursor-pointer flex items-center justify-center"
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="glass rounded-3xl p-5 shadow-card"
              style={{ background: "var(--coral)", opacity: 0.95 }}
            >
              <h3
                className="font-semibold flex items-center gap-2 mb-2 text-sm"
                style={{ color: "var(--coral-foreground)" }}
              >
                <Phone className="h-4 w-4" /> Crisis Support
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--coral-foreground)" }}>
                If you need immediate help, you're not alone.
              </p>
              <div className="space-y-2">
                <a href="tel:988" className="block px-3 py-2 rounded-xl bg-white/60 text-xs font-medium text-center">
                  📞 Call 988
                </a>
                <a href="sms:741741" className="block px-3 py-2 rounded-xl bg-white/60 text-xs font-medium text-center">
                  💬 Text HOME to 741741
                </a>
              </div>
            </div>

            <div className="glass rounded-3xl p-5 shadow-card">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                <Heart className="h-4 w-4 text-pink-foreground" /> Reminder
              </h3>
              <p className="text-xs text-muted-foreground">
                You're doing better than you think. Be gentle with yourself today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
