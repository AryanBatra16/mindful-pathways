import React, { createContext, useContext, useState, useEffect } from "react";
import { tasks as initialTasks, challenges as initialChallenges, communityPosts as initialCommunityPosts, moodHistory as initialMoodHistory, DEMO_USER, DEMO_MOOD_HISTORY, DEMO_TASKS, DEMO_COMMUNITY_POSTS, DEMO_SAVED_QUOTES, DEMO_CHALLENGES } from "./mock-data";
import {
  signupServerFn,
  loginServerFn,
  logoutServerFn,
  getCurrentUserServerFn,
  updateUserProfileServerFn,
  getMoodHistoryServerFn,
  addMoodLogServerFn,
  deleteMoodLogServerFn,
  getTasksServerFn,
  addTaskServerFn,
  updateTaskStatusServerFn,
  deleteTaskServerFn,
  getCommunityPostsServerFn,
  createCommunityPostServerFn,
  togglePostLikeServerFn,
  getSavedQuotesServerFn,
  toggleSaveQuoteServerFn,
  getUserChallengesServerFn,
  saveUserChallengeServerFn,
} from "./server-functions";
import { toast } from "sonner";

export interface Task {
  id: number | string;
  title: string;
  priority: "high" | "medium" | "low";
  status: "today" | "week" | "later" | "completed";
  due: string;
  challenge: string | null;
  starred?: boolean;
}

export interface Mood {
  emoji: string;
  label: string;
  value: number;
  color: string;
}

export interface MoodLog {
  id?: string;
  date: string;
  time: string;
  type: "quick" | "daily";
  mood: Mood;
  note: string;
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
  verifyType?: string;
  requirement?: string;
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
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  loginAsDemo: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addTask: (title: string, priority: "high" | "medium" | "low", due: string, challenge: string | null, starred?: boolean) => void;
  deleteTask: (id: number | string) => void;
  completeTask: (id: number | string) => void;
  toggleStarTask: (id: number | string) => void;
  logMood: (mood: Mood, intensity: number, tags: string[], note: string, type?: "quick" | "daily") => void;
  toggleChallenge: (id: number) => void;
  addPost: (content: string, anon: boolean) => void;
  toggleLikePost: (id: number | string) => void;
  toggleSaveQuote: (id: number) => void;
  resetAllData: () => void;
  computeChallengeProgress: (challenge: Challenge) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getQuoteOfTheDay<T>(quotesList: T[]): T {
  if (!quotesList || quotesList.length === 0) return null as any;
  const d = new Date();
  const index = (d.getFullYear() * 37 + (d.getMonth() + 1) * 31 + d.getDate()) % quotesList.length;
  return quotesList[index];
}

export function computeStreak(history: MoodLog[]): number {
  if (history.length === 0) return 0;
  const uniqueDays = new Set(history.map((h) => h.date));
  const sortedDays = Array.from(uniqueDays).sort().reverse();
  const today = toISODate(new Date());
  let streak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = toISODate(checkDate);
    if (uniqueDays.has(dateStr)) {
      streak++;
    } else if (dateStr !== today || streak > 0) {
      if (streak > 0) break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

export function getLevelForPoints(points: number): string {
  if (points >= 1500) return "Luminary";
  if (points >= 800) return "Sage";
  if (points >= 300) return "Explorer";
  if (points >= 100) return "Adept";
  return "Beginner";
}

function isDemoActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("demo_mode") === "true";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Guest",
    email: "",
    bio: "On a gentle journey toward calmer days.",
    points: 0,
    level: "Novice",
    avatar: "",
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges as Challenge[]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<number[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: "Light",
    fontSize: 16,
    compactMode: false,
    nightContrast: false,
    defaultAnonymous: true,
    emailInsights: true,
    dailyReminder: "08:00",
  });

  const [isLoading, setIsLoading] = useState(true);

  // ─── Load demo mode data ───────────────────────────────────────────────────
  const loadDemoData = () => {
    setIsDemoMode(true);
    setUserProfile({
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      bio: DEMO_USER.bio,
      points: DEMO_USER.points,
      level: DEMO_USER.level,
      avatar: DEMO_USER.avatar,
      joinDate: DEMO_USER.joinDate,
      firstMoodDate: DEMO_USER.firstMoodDate,
      firstWeekDate: DEMO_USER.firstWeekDate,
      firstChallengeDate: DEMO_USER.firstChallengeDate,
    });
    setTasks(DEMO_TASKS);
    setMoodHistory(DEMO_MOOD_HISTORY);
    setChallenges(DEMO_CHALLENGES);
    setCommunityPosts(DEMO_COMMUNITY_POSTS);
    setSavedQuotes(DEMO_SAVED_QUOTES);
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

  // ─── Login as demo ─────────────────────────────────────────────────────────
  const loginAsDemo = () => {
    sessionStorage.setItem("demo_mode", "true");
    // Set a cookie so route guards pass
    document.cookie = `session_active=true; Path=/; max-age=2592000; SameSite=Lax`;
    loadDemoData();
    setIsLoading(false);
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  // ─── Sync user data from D1 database on mount ──────────────────────────────
  const syncDatabase = async () => {
    // Check demo mode first
    if (isDemoActive()) {
      loadDemoData();
      setIsLoading(false);
      return;
    }

    try {
      const user = await getCurrentUserServerFn();
      if (user) {
        setUserProfile({
          id: user.id,
          name: user.name || "Aria Wells",
          email: user.email,
          bio: user.bio || "On a gentle journey toward calmer days.",
          points: user.points || 0,
          level: user.level || "Novice",
          avatar: user.avatar || "",
        });

        // Set Settings
        setSettings({
          theme: (user.theme === "Dark" ? "Dark" : "Light") as "Light" | "Dark",
          fontSize: user.font_size || 16,
          compactMode: !!user.compact_mode,
          nightContrast: !!user.high_contrast,
          defaultAnonymous: !!user.default_anonymous,
          emailInsights: !!user.email_insights,
          dailyReminder: user.daily_reminder || "08:00",
        });

        // Fetch Tasks
        const dbTasks = await getTasksServerFn();
        
        // start of today in unix timestamp seconds
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
        
        // Filter daily tasks that were created before today and are not completed
        const expiredDailyTasks = dbTasks.filter((t: any) => {
          const isDaily = t.status === "today" || (t.due && t.due.toLowerCase() === "today");
          const isNotCompleted = t.status !== "completed";
          const isBeforeToday = t.created_at && t.created_at < startOfToday;
          return isDaily && isNotCompleted && isBeforeToday;
        });

        if (expiredDailyTasks.length > 0) {
          // Log missed tasks to localStorage
          const stored = localStorage.getItem("missed_daily_tasks");
          let missedList: any[] = [];
          if (stored) {
            try {
              missedList = JSON.parse(stored);
            } catch (e) {}
          }
          
          for (const t of expiredDailyTasks) {
            // Check if we already logged this task id
            if (!missedList.some((m: any) => m.id === t.id)) {
              missedList.push({
                id: t.id,
                title: t.title,
                date: new Date((t.created_at || Math.floor(Date.now() / 1000)) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              });
            }
            // Delete from database
            await deleteTaskServerFn({ data: { taskId: String(t.id) } });
          }
          localStorage.setItem("missed_daily_tasks", JSON.stringify(missedList));
          
          // Reset the session popup flag so it will pop up again on this new login!
          sessionStorage.removeItem("missed_tasks_acknowledged");
        }

        // Filter out expired tasks from frontend list
        const remainingTasks = dbTasks.filter((t: any) => {
          return !expiredDailyTasks.some((et: any) => et.id === t.id);
        });

        setTasks(
          remainingTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            priority: (t.priority || "medium") as "high" | "medium" | "low",
            status: (t.status || "today") as "today" | "week" | "later" | "completed",
            due: t.due || "Today",
            challenge: t.challenge_id || null,
          }))
        );

        // Fetch Mood History
        const dbMoods = await getMoodHistoryServerFn();
        setMoodHistory(
          dbMoods.map((m: any) => {
            const dateObj = m.created_at ? new Date(m.created_at * 1000) : new Date();
            const matchingMood =
              m.label === "Joyful"
                ? { emoji: "😄", label: "Joyful", value: 5, color: "green" }
                : m.label === "Good"
                ? { emoji: "🙂", label: "Good", value: 4, color: "turquoise" }
                : m.label === "Okay"
                ? { emoji: "😐", label: "Okay", value: 3, color: "blue" }
                : m.label === "Low"
                ? { emoji: "😔", label: "Low", value: 2, color: "purple" }
                : { emoji: "😢", label: "Sad", value: 1, color: "pink" };

            return {
              id: m.id,
              date: toISODate(dateObj),
              time: formatTime(dateObj),
              type: "daily" as const,
              mood: matchingMood,
              note: m.note || "",
              tags: m.tags ? m.tags.split(",") : [],
            };
          })
        );

        // Fetch Community Posts
        const dbPosts = await getCommunityPostsServerFn();
        setCommunityPosts(
          dbPosts.map((p: any) => ({
            id: p.id,
            author: p.anon ? "Anonymous" : p.author_name || "Anonymous",
            anon: !!p.anon,
            time: "Recently",
            category: p.category || "Self-care",
            content: p.content,
            reactions: p.likesCount || 0,
            color: p.color || "coral",
            liked: !!p.isLiked,
          }))
        );

        // Fetch Saved Quotes
        const dbSavedQuotes = await getSavedQuotesServerFn();
        setSavedQuotes(dbSavedQuotes);

        // Fetch Challenges
        const dbChallenges = await getUserChallengesServerFn();
        setChallenges((prev) =>
          prev.map((c) => {
            const matched = dbChallenges.find((dbC: any) => dbC.challenge_id === c.id);
            if (matched) {
              return {
                ...c,
                progress: matched.progress ?? 0,
                status: (matched.status || "available") as "active" | "available" | "completed",
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error("Failed to sync database state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncDatabase();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "Dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.fontSize = `${settings.fontSize}px`;
    if (settings.compactMode) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
    if (settings.nightContrast) {
      root.classList.add("night-contrast");
    } else {
      root.classList.remove("night-contrast");
    }
  }, [settings]);

  // ─── Auto-complete challenges when progress hits 100% ─────────────────────
  useEffect(() => {
    // Only run when data is loaded and there are active challenges
    const activeChallenges = challenges.filter((c) => c.status === "active");
    if (activeChallenges.length === 0) return;

    let anyCompleted = false;

    setChallenges((prev) =>
      prev.map((c) => {
        if (c.status !== "active") return c;

        // Compute live progress inline (mirrors computeChallengeProgress)
        const req = c.requirementCount || 1;
        let progress = c.progress;

        switch (c.verifyType) {
          case "gratitude_journal": {
            const days = new Set(
              moodHistory.filter((h) => h.type === "daily" && h.note && h.note.trim().length > 0).map((h) => h.date)
            );
            progress = Math.min(100, Math.round((days.size / req) * 100));
            break;
          }
          case "mindful_mornings":
          case "mindful_mornings_3": {
            const earlyDays = new Set(
              moodHistory
                .filter((h) => {
                  const hour = parseInt(h.time.split(":")[0]);
                  const isAM = h.time.toLowerCase().includes("am");
                  return isAM && hour < 9;
                })
                .map((h) => h.date)
            );
            progress = Math.min(100, Math.round((earlyDays.size / req) * 100));
            break;
          }
          case "mood_streak_5": {
            const currentStreak = computeStreak(moodHistory);
            progress = Math.min(100, Math.round((currentStreak / req) * 100));
            break;
          }
          case "reflection_writer": {
            const withNotes = moodHistory.filter((h) => h.note && h.note.trim().length > 3).length;
            progress = Math.min(100, Math.round((withNotes / req) * 100));
            break;
          }
          case "social_spark": {
            const myPosts = communityPosts.filter((p) => !p.anon && p.author === userProfile.name).length;
            progress = Math.min(100, Math.round((myPosts / req) * 100));
            break;
          }
          case "task_master": {
            const completed = tasks.filter((t) => t.status === "completed").length;
            progress = Math.min(100, Math.round((completed / req) * 100));
            break;
          }
          case "evening_log": {
            const nightDays = new Set(
              moodHistory
                .filter((h) => {
                  const hour = parseInt(h.time.split(":")[0]);
                  const isPM = h.time.toLowerCase().includes("pm");
                  return isPM && (hour >= 8 && hour !== 12);
                })
                .map((h) => h.date)
            );
            progress = Math.min(100, Math.round((nightDays.size / req) * 100));
            break;
          }
          case "community_supporter": {
            const liked = communityPosts.filter((p) => p.liked).length;
            progress = Math.min(100, Math.round((liked / req) * 100));
            break;
          }
          default:
            progress = c.progress;
        }

        if (progress >= 100) {
          anyCompleted = true;
          // Award points and persist
          setUserProfile((prev) => {
            const newPoints = prev.points + c.points;
            const isFirstChallenge = !prev.firstChallengeDate;
            return {
              ...prev,
              points: newPoints,
              level: getLevelForPoints(newPoints),
              // Record the date this first challenge was completed
              ...(isFirstChallenge ? { firstChallengeDate: toISODate(new Date()) } : {}),
            };
          });
          if (!isDemoActive()) {
            saveUserChallengeServerFn({ data: { challengeId: c.id, progress: 100, status: "completed" } });
            updateUserProfileServerFn({ data: { points: userProfile.points + c.points, level: getLevelForPoints(userProfile.points + c.points) } });
          }
          toast.success(`🎉 Challenge completed: "${c.title}"! +${c.points} pts`, { duration: 4000 });
          return { ...c, progress: 100, status: "completed" };
        }

        // Update stored progress even if not yet complete
        return { ...c, progress };
      })
    );
  }, [moodHistory, communityPosts, tasks]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const res = await loginServerFn({ data: { email, password } });
    if (res.success) {
      document.cookie = `session_active=true; Path=/; max-age=2592000; SameSite=Lax`;
      await syncDatabase();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const res = await signupServerFn({ data: { name, email, password } });
    if (res.success) {
      document.cookie = `session_active=true; Path=/; max-age=2592000; SameSite=Lax`;
      await syncDatabase();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    // Clear demo mode flag if active
    if (isDemoActive()) {
      sessionStorage.removeItem("demo_mode");
      setIsDemoMode(false);
      document.cookie = "session_active=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      return;
    }
    await logoutServerFn();
    document.cookie = "session_active=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updatedProfile = { ...profile };
    if (profile.points !== undefined) {
      updatedProfile.level = getLevelForPoints(profile.points);
    }
    setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
    // Skip server call in demo mode
    if (isDemoActive()) return;
    await updateUserProfileServerFn({
      data: {
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        avatar: updatedProfile.avatar,
        points: updatedProfile.points,
        level: updatedProfile.level,
      },
    });
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (isDemoActive()) return;
    await updateUserProfileServerFn({
      data: {
        theme: newSettings.theme,
        font_size: newSettings.fontSize,
        compact_mode: newSettings.compactMode,
        high_contrast: newSettings.nightContrast,
        default_anonymous: newSettings.defaultAnonymous,
        email_insights: newSettings.emailInsights,
        daily_reminder: newSettings.dailyReminder,
      },
    });
  };

  const addTask = async (title: string, priority: "high" | "medium" | "low", due: string, challenge: string | null, starred = false) => {
    const tempId = `temp_${Date.now()}`;
    const newTask: Task = { id: tempId, title, priority, status: "today", due: due || "Today", challenge, starred };
    setTasks((prev) => [newTask, ...prev]);
    if (isDemoActive()) return;

    const res = await addTaskServerFn({
      data: { title, priority, status: "today", due: due || "Today", challenge_id: challenge || undefined },
    });
    if (res) {
      setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: res.id } : t)));
    }
  };

  const toggleStarTask = (id: number | string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))
    );
  };

  const deleteTask = async (id: number | string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (isDemoActive()) return;
    await deleteTaskServerFn({ data: { taskId: String(id) } });
  };

  const completeTask = async (id: number | string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const pointsGained = t.priority === "high" ? 25 : t.priority === "medium" ? 15 : 10;
          updateProfile({ points: userProfile.points + pointsGained });

          if (t.challenge) {
            setChallenges((prevChallenges) =>
              prevChallenges.map((c) => {
                if (c.title.toLowerCase().includes(t.challenge!.toLowerCase())) {
                  const newProgress = Math.min(100, c.progress + 20);
                  const newStatus = newProgress === 100 ? "completed" : c.status;
                  if (!isDemoActive()) {
                    saveUserChallengeServerFn({ data: { challengeId: c.id, progress: newProgress, status: newStatus } });
                  }
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

    if (isDemoActive()) return;
    await updateTaskStatusServerFn({ data: { taskId: String(id), status: "completed" } });
  };

  const logMood = async (mood: Mood, intensity: number, tags: string[], note: string, type: "quick" | "daily" = "daily") => {
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

    if (isDemoActive()) return;
    await addMoodLogServerFn({
      data: {
        emoji: mood.emoji,
        label: mood.label,
        value: mood.value,
        intensity,
        tags: tags.join(","),
        note: newLog.note,
      },
    });
  };

  const computeChallengeProgress = (challenge: Challenge): number => {
    const req = challenge.requirementCount || 1;
    switch (challenge.verifyType) {
      case "gratitude_journal": {
        const daysWithNote = new Set(
          moodHistory.filter((h) => h.type === "daily" && h.note && h.note.trim().length > 0).map((h) => h.date)
        );
        return Math.min(100, Math.round((daysWithNote.size / req) * 100));
      }
      case "mindful_mornings":
      case "mindful_mornings_3": {
        const earlyDays = new Set(
          moodHistory
            .filter((h) => {
              const hour = parseInt(h.time.split(":")[0]);
              const isAM = h.time.toLowerCase().includes("am");
              return isAM && hour < 9;
            })
            .map((h) => h.date)
        );
        return Math.min(100, Math.round((earlyDays.size / req) * 100));
      }
      case "mood_streak_5": {
        return Math.min(100, Math.round((computeStreak(moodHistory) / req) * 100));
      }
      case "reflection_writer": {
        const withNotes = moodHistory.filter((h) => h.note && h.note.trim().length > 3).length;
        return Math.min(100, Math.round((withNotes / req) * 100));
      }
      case "social_spark": {
        const myPosts = communityPosts.filter((p) => !p.anon && p.author === userProfile.name).length;
        return Math.min(100, Math.round((myPosts / req) * 100));
      }
      case "task_master": {
        const completed = tasks.filter((t) => t.status === "completed").length;
        return Math.min(100, Math.round((completed / req) * 100));
      }
      case "evening_log": {
        const nightDays = new Set(
          moodHistory
            .filter((h) => {
              const hour = parseInt(h.time.split(":")[0]);
              const isPM = h.time.toLowerCase().includes("pm");
              return isPM && (hour >= 8 && hour !== 12);
            })
            .map((h) => h.date)
        );
        return Math.min(100, Math.round((nightDays.size / req) * 100));
      }
      case "community_supporter": {
        const liked = communityPosts.filter((p) => p.liked).length;
        return Math.min(100, Math.round((liked / req) * 100));
      }
      default:
        return challenge.progress;
    }
  };

  const toggleChallenge = async (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.status === "available") {
            if (!isDemoActive()) {
              saveUserChallengeServerFn({ data: { challengeId: c.id, progress: 0, status: "active" } });
            }
            return { ...c, status: "active", progress: 0 };
          } else if (c.status === "active") {
            const progress = computeChallengeProgress(c);
            if (progress >= 100) {
              updateProfile({ points: userProfile.points + c.points });
              if (!isDemoActive()) {
                saveUserChallengeServerFn({ data: { challengeId: c.id, progress: 100, status: "completed" } });
              }
              return { ...c, status: "completed", progress: 100 };
            }
            return { ...c, progress };
          }
        }
        return c;
      })
    );
  };

  const addPost = async (content: string, anon: boolean) => {
    const tempId = `temp_${Date.now()}`;
    const newPost: CommunityPost = {
      id: tempId,
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

    if (isDemoActive()) return;

    await createCommunityPostServerFn({
      data: { category: "Self-care", content, author_name: userProfile.name, anon, color: newPost.color },
    });
    // Re-sync posts
    const dbPosts = await getCommunityPostsServerFn();
    setCommunityPosts(
      dbPosts.map((p: any) => ({
        id: p.id,
        author: p.anon ? "Anonymous" : p.author_name || "Anonymous",
        anon: !!p.anon,
        time: "Recently",
        category: p.category || "Self-care",
        content: p.content,
        reactions: p.likesCount || 0,
        color: p.color || "coral",
        liked: !!p.isLiked,
      }))
    );
  };

  const toggleLikePost = async (id: number | string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const liked = !p.liked;
          return { ...p, liked, reactions: liked ? p.reactions + 1 : p.reactions - 1 };
        }
        return p;
      })
    );

    if (isDemoActive()) return;
    await togglePostLikeServerFn({ data: { postId: String(id) } });
  };

  const toggleSaveQuote = async (id: number) => {
    setSavedQuotes((prev) => (prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]));
    if (isDemoActive()) return;
    await toggleSaveQuoteServerFn({ data: { quoteId: id } });
  };

  const resetAllData = async () => {
    // For D1 we can reset profile & tables or clear localStorage
    localStorage.clear();
    toast.info("Local storage cleared. Re-syncing database...");
    await syncDatabase();
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
        isDemoMode,
        login,
        signup,
        logout,
        loginAsDemo,
        updateProfile,
        updateSettings,
        addTask,
        deleteTask,
        completeTask,
        toggleStarTask,
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
