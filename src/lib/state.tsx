import React, { createContext, useContext, useState, useEffect } from "react";
import { tasks as initialTasks, challenges as initialChallenges, communityPosts as initialCommunityPosts, moodHistory as initialMoodHistory } from "./mock-data";

export interface Task {
  id: number | string;
  title: string;
  priority: "high" | "medium" | "low";
  status: "today" | "week" | "later" | "completed";
  due: string;
  challenge: string | null;
}

export interface Mood {
  emoji: string;
  label: string;
  value: number;
  color: string;
}

export interface MoodLog {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Human-readable time e.g. "3:45 PM" */
  time: string;
  /** "quick" = quick log from dashboard; "daily" = full daily tracker */
  type: "quick" | "daily";
  mood: Mood;
  note: string;
  /** Tags selected at log time */
  tags: string[];
}

export interface Challenge {
  id: number;
  title: string;
  desc: string;
  points: number;
  progress: number;
  status: "active" | "available" | "completed";
  category: string;
  color: string;
  /** Type key used for verification */
  verifyType?: string;
  /** Human-readable requirement description */
  requirement?: string;
  /** How many actions are needed to complete */
  requirementCount?: number;
}

export interface CommunityPost {
  id: number | string;
  author: string;
  anon: boolean;
  time: string;
  category: string;
  content: string;
  reactions: number;
  color: string;
  liked?: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  bio: string;
  points: number;
  level: string;
  avatar?: string;
  joinDate?: string;
  firstMoodDate?: string;
  firstWeekDate?: string;
  firstChallengeDate?: string;
}

export interface AppSettings {
  theme: "Light" | "Dark";
  fontSize: number;
  compactMode: boolean;
  nightContrast: boolean;
  defaultAnonymous: boolean;
  emailInsights: boolean;
  dailyReminder: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AppContextType {
  userProfile: UserProfile;
  tasks: Task[];
  moodHistory: MoodLog[];
  challenges: Challenge[];
  communityPosts: CommunityPost[];
  savedQuotes: number[];
  settings: AppSettings;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addTask: (title: string, priority: "high" | "medium" | "low", due: string, challenge: string | null) => void;
  deleteTask: (id: number | string) => void;
  completeTask: (id: number | string) => void;
  logMood: (mood: Mood, intensity: number, tags: string[], note: string, type?: "quick" | "daily") => void;
  toggleChallenge: (id: number) => void;
  addPost: (content: string, anon: boolean) => void;
  toggleLikePost: (id: number | string) => void;
  toggleSaveQuote: (id: number) => void;
  resetAllData: () => void;
  computeChallengeProgress: (challenge: Challenge) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Format a Date to "Mon, Jul 14" style */
export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Format a Date to "3:45 PM" style */
export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Get ISO date string YYYY-MM-DD from a Date */
export function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Compute how many distinct calendar days have at least one mood log */
export function computeStreak(history: MoodLog[]): number {
  if (history.length === 0) return 0;
  const uniqueDays = new Set(history.map((h) => h.date));
  const sortedDays = Array.from(uniqueDays).sort().reverse(); // newest first
  const today = toISODate(new Date());
  let streak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = toISODate(checkDate);
    if (uniqueDays.has(dateStr)) {
      streak++;
    } else if (dateStr !== today || streak > 0) {
      // Allow today to be missing (haven't logged yet today)
      if (streak > 0) break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_profile");
      if (saved) return JSON.parse(saved);
    }
    return {
      name: "Aria Wells",
      email: "aria@mind2care.app",
      bio: "On a gentle journey toward calmer days.",
      points: 1240,
      level: "Sage",
      joinDate: "2026-01-12",
      firstMoodDate: "2026-01-13",
      firstWeekDate: "2026-01-19",
      firstChallengeDate: "2026-02-02",
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_tasks");
      if (saved) return JSON.parse(saved);
    }
    return initialTasks as Task[];
  });

  const [moodHistory, setMoodHistory] = useState<MoodLog[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_moodHistory");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old entries that have "Day X" date format
        return parsed.map((log: MoodLog, idx: number) => {
          if (!log.date || log.date.startsWith("Day ")) {
            const d = new Date();
            d.setDate(d.getDate() - (parsed.length - 1 - idx));
            return {
              ...log,
              date: toISODate(d),
              time: log.time || "12:00 PM",
              type: log.type || "daily",
              tags: log.tags || [],
            };
          }
          return { ...log, time: log.time || "12:00 PM", type: log.type || "daily", tags: log.tags || [] };
        });
      }
    }
    // Migrate initial mock data to real dates
    const today = new Date();
    return initialMoodHistory.map((log, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (initialMoodHistory.length - 1 - idx));
      return {
        ...log,
        date: toISODate(d),
        time: "09:00 AM",
        type: "daily" as const,
        tags: [],
      };
    });
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_challenges");
      if (saved) return JSON.parse(saved);
    }
    return initialChallenges as Challenge[];
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_communityPosts");
      if (saved) return JSON.parse(saved);
    }
    return initialCommunityPosts as CommunityPost[];
  });

  const [savedQuotes, setSavedQuotes] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_savedQuotes");
      if (saved) return JSON.parse(saved);
    }
    return [2];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old settings: rename highContrast -> nightContrast, remove reduceAnimations/auto theme
        return {
          theme: parsed.theme === "Auto" ? "Light" : (parsed.theme || "Light"),
          fontSize: parsed.fontSize || 16,
          compactMode: parsed.compactMode || false,
          nightContrast: parsed.nightContrast ?? parsed.highContrast ?? false,
          defaultAnonymous: parsed.defaultAnonymous ?? true,
          emailInsights: parsed.emailInsights ?? true,
          dailyReminder: parsed.dailyReminder || "08:00",
        };
      }
    }
    return {
      theme: "Light",
      fontSize: 16,
      compactMode: false,
      nightContrast: false,
      defaultAnonymous: true,
      emailInsights: true,
      dailyReminder: "08:00",
    };
  });

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem("m2c_profile", JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem("m2c_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("m2c_moodHistory", JSON.stringify(moodHistory)); }, [moodHistory]);
  useEffect(() => { localStorage.setItem("m2c_challenges", JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { localStorage.setItem("m2c_communityPosts", JSON.stringify(communityPosts)); }, [communityPosts]);
  useEffect(() => { localStorage.setItem("m2c_savedQuotes", JSON.stringify(savedQuotes)); }, [savedQuotes]);

  useEffect(() => {
    localStorage.setItem("m2c_settings", JSON.stringify(settings));
    const root = document.documentElement;
    // Theme
    if (settings.theme === "Dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Font size
    root.style.fontSize = `${settings.fontSize}px`;
    // Compact mode
    if (settings.compactMode) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
    // Night contrast
    if (settings.nightContrast) {
      root.classList.add("night-contrast");
    } else {
      root.classList.remove("night-contrast");
    }
  }, [settings]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) return { success: false, error: "Please enter your email and password." };
    const name = email.split("@")[0];
    const joinDate = toISODate(new Date());
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      bio: "Mindful path explorer.",
      points: 150,
      level: "Explorer",
      joinDate,
    };
    setUserProfile(newUser);
    document.cookie = `session=sess_${Date.now()}; Path=/; max-age=2592000; SameSite=Lax`;
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    if (!name || !email || !password) return { success: false, error: "Please fill in all fields." };
    if (password.length < 6) return { success: false, error: "Password must be at least 6 characters." };
    const joinDate = toISODate(new Date());
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      bio: "Mindful path explorer.",
      points: 50,
      level: "Novice",
      joinDate,
    };
    setUserProfile(newUser);
    document.cookie = `session=sess_${Date.now()}; Path=/; max-age=2592000; SameSite=Lax`;
    return { success: true };
  };

  const logout = () => {
    document.cookie = "session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profile };
      let newLevel = "Novice";
      if (updated.points >= 1500) newLevel = "Luminary";
      else if (updated.points >= 1000) newLevel = "Sage";
      else if (updated.points >= 500) newLevel = "Guide";
      else if (updated.points >= 200) newLevel = "Seeker";
      updated.level = newLevel;
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addTask = (title: string, priority: "high" | "medium" | "low", due: string, challenge: string | null) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      priority,
      status: "today",
      due: due || "Today",
      challenge,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (id: number | string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completeTask = (id: number | string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const pointsGained = t.priority === "high" ? 25 : t.priority === "medium" ? 15 : 10;
          updateProfile({ points: userProfile.points + pointsGained });

          if (t.challenge) {
            setChallenges((prevChallenges) =>
              prevChallenges.map((c) => {
                if (c.title.toLowerCase().includes(t.challenge!.toLowerCase()) || t.challenge!.toLowerCase().includes(c.title.toLowerCase())) {
                  const newProgress = Math.min(100, c.progress + 20);
                  const newStatus = newProgress === 100 ? "completed" : c.status;
                  return { ...c, progress: newProgress, status: newStatus };
                }
                return c;
              })
            );
          }

          return { ...t, status: "completed" };
        }
        return t;
      })
    );
  };

  const logMood = (mood: Mood, intensity: number, tags: string[], note: string, type: "quick" | "daily" = "daily") => {
    const now = new Date();
    const isoDate = toISODate(now);
    const timeStr = formatTime(now);

    const newLog: MoodLog = {
      date: isoDate,
      time: timeStr,
      type,
      mood,
      note: note || (tags.length ? `Felt ${mood.label} (${tags.join(", ")})` : `Felt ${mood.label}`),
      tags,
    };
    setMoodHistory((prev) => [newLog, ...prev]);
    updateProfile({ points: userProfile.points + 10 });

    // Record firstMoodDate if not set
    if (!userProfile.firstMoodDate) {
      updateProfile({ firstMoodDate: isoDate });
    }

    // Check for 7-day streak to record firstWeekDate
    const uniqueDays = new Set(moodHistory.map((h) => h.date));
    uniqueDays.add(isoDate);
    if (uniqueDays.size >= 7 && !userProfile.firstWeekDate) {
      updateProfile({ firstWeekDate: isoDate });
    }
  };

  /** Compute verified progress for a challenge based on real activity data */
  const computeChallengeProgress = (challenge: Challenge): number => {
    const req = challenge.requirementCount || 1;
    switch (challenge.verifyType) {
      case "gratitude_journal": {
        // Count distinct days with a daily mood log that has a note
        const daysWithNote = new Set(
          moodHistory
            .filter((h) => h.type === "daily" && h.note && h.note.trim().length > 0)
            .map((h) => h.date)
        );
        return Math.min(100, Math.round((daysWithNote.size / req) * 100));
      }
      case "mindful_mornings": {
        // Count distinct days with a mood log before 9 AM
        const earlyDays = new Set(
          moodHistory.filter((h) => {
            const hour = new Date(`${h.date}T${to24h(h.time)}`).getHours();
            return hour < 9;
          }).map((h) => h.date)
        );
        return Math.min(100, Math.round((earlyDays.size / req) * 100));
      }
      case "mood_streak_5": {
        // Count distinct days with any mood log
        const uniqueDays = new Set(moodHistory.map((h) => h.date));
        return Math.min(100, Math.round((uniqueDays.size / req) * 100));
      }
      case "reflection_writer": {
        // Count entries with non-empty notes (more than 3 chars)
        const withNotes = moodHistory.filter((h) => h.note && h.note.trim().length > 3).length;
        return Math.min(100, Math.round((withNotes / req) * 100));
      }
      case "social_spark": {
        // Count posts by current user (non-anon matching name)
        const myPosts = communityPosts.filter(
          (p) => !p.anon && p.author === userProfile.name
        ).length;
        return Math.min(100, Math.round((myPosts / req) * 100));
      }
      default:
        return challenge.progress;
    }
  };

  const toggleChallenge = (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.status === "available") {
            return { ...c, status: "active", progress: 0 };
          } else if (c.status === "active") {
            // Verify progress before completing
            const progress = computeChallengeProgress(c);
            if (progress >= 100) {
              // Record firstChallengeDate if not set
              if (!userProfile.firstChallengeDate) {
                updateProfile({ firstChallengeDate: toISODate(new Date()) });
              }
              updateProfile({ points: userProfile.points + c.points });
              return { ...c, status: "completed", progress: 100 };
            }
            // Not complete yet — just update the computed progress
            return { ...c, progress };
          }
        }
        return c;
      })
    );
  };

  const addPost = (content: string, anon: boolean) => {
    const newPost: CommunityPost = {
      id: Date.now(),
      author: anon ? "Anonymous" : userProfile.name,
      anon,
      time: "Just now",
      category: "Self-care",
      content,
      reactions: 0,
      color: anon ? "purple" : "coral",
      liked: false,
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    updateProfile({ points: userProfile.points + 5 });
  };

  const toggleLikePost = (id: number | string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const liked = !p.liked;
          return { ...p, liked, reactions: liked ? p.reactions + 1 : p.reactions - 1 };
        }
        return p;
      })
    );
  };

  const toggleSaveQuote = (id: number) => {
    setSavedQuotes((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const resetAllData = () => {
    localStorage.clear();
    setUserProfile({
      name: "Aria Wells",
      email: "aria@mind2care.app",
      bio: "On a gentle journey toward calmer days.",
      points: 1240,
      level: "Sage",
      joinDate: "2026-01-12",
      firstMoodDate: "2026-01-13",
      firstWeekDate: "2026-01-19",
      firstChallengeDate: "2026-02-02",
    });
    setTasks(initialTasks as Task[]);
    const today = new Date();
    setMoodHistory(initialMoodHistory.map((log, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (initialMoodHistory.length - 1 - idx));
      return { ...log, date: toISODate(d), time: "09:00 AM", type: "daily" as const, tags: [] };
    }));
    setChallenges(initialChallenges as Challenge[]);
    setCommunityPosts(initialCommunityPosts as CommunityPost[]);
    setSavedQuotes([2]);
    setSettings({
      theme: "Light",
      fontSize: 16,
      compactMode: false,
      nightContrast: false,
      defaultAnonymous: true,
      emailInsights: true,
      dailyReminder: "08:00",
    });
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        tasks,
        moodHistory,
        challenges,
        communityPosts,
        savedQuotes,
        settings,
        login,
        signup,
        logout,
        updateProfile,
        updateSettings,
        addTask,
        deleteTask,
        completeTask,
        logMood,
        toggleChallenge,
        addPost,
        toggleLikePost,
        toggleSaveQuote,
        resetAllData,
        computeChallengeProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}

/** Convert "3:45 PM" to "15:45:00" for Date parsing */
function to24h(timeStr: string): string {
  if (!timeStr) return "00:00:00";
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "AM" && hours === 12) hours = 0;
  if (modifier === "PM" && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}
