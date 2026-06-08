import React, { createContext, useContext, useState, useEffect } from "react";
import { tasks as initialTasks, challenges as initialChallenges, communityPosts as initialCommunityPosts, moodHistory as initialMoodHistory } from "./mock-data";

export interface Task {
  id: number;
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
  date: string;
  mood: Mood;
  note: string;
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
}

export interface CommunityPost {
  id: number;
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
  name: string;
  email: string;
  bio: string;
  points: number;
  level: string;
}

export interface AppSettings {
  theme: "Light" | "Dark" | "Auto";
  fontSize: number;
  compactMode: boolean;
  reduceAnimations: boolean;
  highContrast: boolean;
  defaultAnonymous: boolean;
  emailInsights: boolean;
  dailyReminder: string;
}

interface AppContextType {
  userProfile: UserProfile;
  tasks: Task[];
  moodHistory: MoodLog[];
  challenges: Challenge[];
  communityPosts: CommunityPost[];
  savedQuotes: number[];
  settings: AppSettings;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addTask: (title: string, priority: "high" | "medium" | "low", due: string, challenge: string | null) => void;
  deleteTask: (id: number) => void;
  completeTask: (id: number) => void;
  logMood: (mood: Mood, intensity: number, tags: string[], note: string) => void;
  toggleChallenge: (id: number) => void;
  addPost: (content: string, anon: boolean) => void;
  toggleLikePost: (id: number) => void;
  toggleSaveQuote: (id: number) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_profile");
      if (saved) return JSON.parse(saved);
    }
    return { name: "Aria Wells", email: "aria@mind2care.app", bio: "On a gentle journey toward calmer days.", points: 1240, level: "Sage" };
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
      if (saved) return JSON.parse(saved);
    }
    return initialMoodHistory as MoodLog[];
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
    return [2]; // default saved quote
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("m2c_settings");
      if (saved) return JSON.parse(saved);
    }
    return {
      theme: "Light",
      fontSize: 16,
      compactMode: false,
      reduceAnimations: false,
      highContrast: false,
      defaultAnonymous: true,
      emailInsights: true,
      dailyReminder: "08:00",
    };
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("m2c_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("m2c_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("m2c_moodHistory", JSON.stringify(moodHistory));
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem("m2c_challenges", JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("m2c_communityPosts", JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem("m2c_savedQuotes", JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  useEffect(() => {
    localStorage.setItem("m2c_settings", JSON.stringify(settings));
    // Apply theme changes to document Element
    const root = document.documentElement;
    if (settings.theme === "Dark" || (settings.theme === "Auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings]);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...profile };
      // Dynamically calculate level based on points
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

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // Add points for completing task
          const pointsGained = t.priority === "high" ? 25 : t.priority === "medium" ? 15 : 10;
          updateProfile({ points: userProfile.points + pointsGained });
          
          // Also update linked challenge progress if any
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

  const logMood = (mood: Mood, intensity: number, tags: string[], note: string) => {
    const dateLabel = `Day ${moodHistory.length + 1}`;
    const newLog: MoodLog = {
      date: dateLabel,
      mood,
      note: note || (tags.length ? `Felt ${mood.label} (${tags.join(", ")})` : `Felt ${mood.label}`),
    };
    setMoodHistory((prev) => [newLog, ...prev]);
    // Log points for check-in
    updateProfile({ points: userProfile.points + 10 });
  };

  const toggleChallenge = (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.status === "available") {
            return { ...c, status: "active", progress: 0 };
          } else if (c.status === "active") {
            // progress completion
            return { ...c, status: "completed", progress: 100 };
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
    updateProfile({ points: userProfile.points + 5 }); // Points for sharing
  };

  const toggleLikePost = (id: number) => {
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
    setUserProfile({ name: "Aria Wells", email: "aria@mind2care.app", bio: "On a gentle journey toward calmer days.", points: 1240, level: "Sage" });
    setTasks(initialTasks as Task[]);
    setMoodHistory(initialMoodHistory as MoodLog[]);
    setChallenges(initialChallenges as Challenge[]);
    setCommunityPosts(initialCommunityPosts as CommunityPost[]);
    setSavedQuotes([2]);
    setSettings({
      theme: "Light",
      fontSize: 16,
      compactMode: false,
      reduceAnimations: false,
      highContrast: false,
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
