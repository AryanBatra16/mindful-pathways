import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, MessageCircleHeart, CalendarHeart, Quote, Trophy, ListTodo, Users, BarChart3, Sparkles, Settings, Menu, X, LogOut, PanelLeftClose, PanelLeftOpen, FlaskConical } from "lucide-react";
import { useState, useEffect } from "react";
import { BackgroundBlobs } from "./BackgroundBlobs";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/state";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "coral" },
  { to: "/chatbot", label: "AI Chatbot", icon: MessageCircleHeart, color: "pink" },
  { to: "/tracker", label: "Tracker", icon: CalendarHeart, color: "purple" },
  { to: "/quotes", label: "Quotes", icon: Quote, color: "blue" },
  { to: "/challenges", label: "Challenges", icon: Trophy, color: "turquoise" },
  { to: "/tasks", label: "Tasks", icon: ListTodo, color: "green" },
  { to: "/community", label: "Community", icon: Users, color: "coral" },
  { to: "/moods", label: "Moods", icon: BarChart3, color: "purple" },
  { to: "/growth", label: "Growth Map", icon: Sparkles, color: "turquoise" },
  { to: "/settings", label: "Settings", icon: Settings, color: "blue" },
] as const;

export function AppLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });
  const { userProfile, logout, tasks, isDemoMode } = useApp();

  const [showMissedModal, setShowMissedModal] = useState(false);
  const [missedTasks, setMissedTasks] = useState<string[]>([]);

  useEffect(() => {
    // Check if there are missed daily tasks in localStorage that need to be shown
    const stored = localStorage.getItem("missed_daily_tasks");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const acked = sessionStorage.getItem("missed_tasks_acknowledged") === "true";
          if (!acked) {
            setMissedTasks(parsed.map((item: any) => item.title || item));
            setShowMissedModal(true);
          }
        }
      } catch (e) {
        console.error("Failed to parse missed tasks:", e);
      }
    }
  }, [tasks]); // trigger when tasks list changes/syncs from DB

  const handleDismissMissedModal = () => {
    setShowMissedModal(false);
    sessionStorage.setItem("missed_tasks_acknowledged", "true");
  };

  const avatarValue = userProfile.avatar || "";
  const isPhoto = avatarValue.startsWith("data:");
  const isEmoji = avatarValue && !isPhoto;
  const userInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundBlobs />

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen z-50 glass border-r border-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cn("flex items-center p-6", isCollapsed ? "justify-center" : "justify-between")}>
          {isCollapsed ? (
            <button 
              onClick={() => {
                setIsCollapsed(false);
                localStorage.setItem("sidebar_collapsed", "false");
              }}
              className="p-2 rounded-xl hover:bg-muted cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Expand Menu"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          ) : (
            <>
              <button onClick={() => window.location.reload()} className="flex items-center gap-2 cursor-pointer text-left">
                <div className="h-9 w-9 rounded-xl gradient-primary shadow-glow flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-gradient">Mind2Care</span>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setIsCollapsed(true);
                    localStorage.setItem("sidebar_collapsed", "true");
                  }} 
                  className="hidden lg:flex p-1.5 rounded-lg hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  title="Collapse Menu"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

        <nav className="px-3 space-y-1 overflow-y-auto scrollbar-thin h-[calc(100vh-180px)]">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-colors relative group",
                    isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {active && (
                    <motion.div layoutId="active-pill" className="absolute inset-0 rounded-xl glass shadow-soft" style={{ background: `var(--${item.color})`, opacity: 0.4 }} />
                  )}
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center relative z-10 transition-transform group-hover:scale-110",
                  )} style={{ background: active ? `var(--${item.color})` : "transparent" }}>
                    <Icon className="h-4 w-4" style={{ color: active ? `var(--${item.color}-foreground)` : undefined }} />
                  </div>
                  {!isCollapsed && <span className="relative z-10">{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 group cursor-pointer">
          <div className="absolute bottom-full left-0 w-full pb-2 opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all z-50">
            <div className="glass rounded-2xl shadow-glow p-4">
              <div className="text-center mb-4">
                <p className="font-bold text-gradient text-lg">{userProfile.points} pts</p>
                {userProfile.email && <p className="text-xs text-muted-foreground mt-1 truncate">{userProfile.email}</p>}
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{userProfile.bio}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          </div>

          <div className={cn("glass rounded-2xl shadow-soft transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                {isPhoto ? (
                  <img src={avatarValue} alt="avatar" className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : isEmoji ? (
                  <div className="h-10 w-10 rounded-full gradient-coral-pink flex items-center justify-center text-xl shrink-0">{avatarValue}</div>
                ) : (
                  <div className="h-10 w-10 rounded-full gradient-coral-pink flex items-center justify-center font-semibold text-white shrink-0">{userInitial}</div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                {isPhoto ? (
                  <img src={avatarValue} alt="avatar" className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : isEmoji ? (
                  <div className="h-10 w-10 rounded-full gradient-coral-pink flex items-center justify-center text-xl shrink-0">{avatarValue}</div>
                ) : (
                  <div className="h-10 w-10 rounded-full gradient-coral-pink flex items-center justify-center font-semibold text-white shrink-0">{userInitial}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.level} Level</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Mobile-only top bar — just the hamburger menu */}
        <header className="sticky top-0 z-30 glass border-b border-border lg:hidden">
          <div className="flex items-center px-4 h-14">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-muted">
              <Menu className="h-5 w-5" />
            </button>
            <span className="ml-3 font-bold text-sm text-gradient">Mind2Care</span>
          </div>
        </header>

        <main className="p-4 lg:p-8 relative">
          {/* Demo mode banner */}
          {isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-primary/30 text-sm"
              style={{ background: "linear-gradient(to right, var(--purple)/10, var(--turquoise)/10)" }}
            >
              <FlaskConical className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-primary">Demo Mode</span>
              <span className="text-muted-foreground text-xs ml-1">— You're exploring with pre-filled sample data. No real account needed.</span>
            </motion.div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Missed Tasks Pop-up Modal */}
      <AnimatePresence>
        {showMissedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass max-w-md w-full rounded-3xl p-6 shadow-glow border border-border text-center relative overflow-hidden"
            >
              <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full opacity-20 bg-coral blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full opacity-20 bg-pink blur-3xl" />
              
              <div className="relative">
                <div className="mx-auto h-12 w-12 rounded-2xl gradient-coral-pink flex items-center justify-center mb-4">
                  <CalendarHeart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gradient mb-2">A Gentle Fresh Start</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We noticed some of yesterday's daily intentions weren't completed. That is completely okay! Every morning brings a fresh start. 🌿
                </p>

                <div className="glass rounded-2xl p-4 mb-6 text-left border border-border/50 max-h-36 overflow-y-auto scrollbar-thin">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Unfinished intentions:</div>
                  <ul className="space-y-2">
                    {missedTasks.map((t, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                        <span className="truncate">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleDismissMissedModal}
                  className="w-full py-3 rounded-2xl gradient-primary text-white font-semibold shadow-glow hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Got it, Fresh Start! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
