import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, MessageCircleHeart, CalendarHeart, Quote, Trophy, ListTodo, Users, BarChart3, Sparkles, Settings, Menu, Bell, X, LogOut, CheckCircle, Heart, Flame } from "lucide-react";
import { useState } from "react";
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const { userProfile, moodHistory, challenges, logout } = useApp();

  const userInitial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "A";

  // Build dynamic notifications from state
  const notifications = [
    ...(moodHistory.length > 0
      ? [{
          id: "mood-latest",
          icon: Flame,
          color: "coral",
          title: "Mood logged!",
          desc: `Last entry: ${moodHistory[0].mood.label} ${moodHistory[0].mood.emoji}`,
          time: moodHistory[0].time || "recently",
        }]
      : [{
          id: "mood-reminder",
          icon: CalendarHeart,
          color: "purple",
          title: "Log your mood",
          desc: "You haven't logged today yet. How are you feeling?",
          time: "now",
        }]),
    ...challenges
      .filter((c) => c.status === "active" && c.progress >= 80)
      .slice(0, 2)
      .map((c) => ({
        id: `challenge-${c.id}`,
        icon: Trophy,
        color: c.color,
        title: "Challenge almost done!",
        desc: `"${c.title}" is at ${c.progress}% — keep going!`,
        time: "today",
      })),
    {
      id: "quote-daily",
      icon: Heart,
      color: "pink",
      title: "Daily quote ready",
      desc: "Your motivational quote for the day is waiting.",
      time: "today",
    },
    {
      id: "community-activity",
      icon: Users as typeof Flame,
      color: "turquoise",
      title: "Community is buzzing",
      desc: "New posts in your support groups today.",
      time: "1h ago",
    },
  ];

  const handleOpenNotif = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) setNotifRead(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundBlobs />

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Notification overlay close */}
      {notifOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-64 z-50 glass border-r border-border transition-transform duration-300",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">Mind2Care</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="px-3 space-y-1 overflow-y-auto scrollbar-thin h-[calc(100vh-180px)]">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div layoutId="active-pill" className="absolute inset-0 rounded-xl glass shadow-soft" style={{ background: `var(--${item.color})`, opacity: 0.4 }} />
                  )}
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center relative z-10 transition-transform group-hover:scale-110",
                  )} style={{ background: active ? `var(--${item.color})` : "transparent" }}>
                    <Icon className="h-4 w-4" style={{ color: active ? `var(--${item.color}-foreground)` : undefined }} />
                  </div>
                  <span className="relative z-10">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <div className="glass rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full gradient-coral-pink flex items-center justify-center font-semibold text-white shrink-0">{userInitial}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.level} Level · {userProfile.points} pts</p>
                </div>
              </div>
              <button 
                onClick={logout} 
                title="Sign Out" 
                className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 glass border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              <Menu className="h-5 w-5" />
            </button>

            {/* Page title placeholder — fills the space the search bar used to occupy */}
            <div className="hidden md:block" />

            <div className="flex items-center gap-3 relative">
              {/* Notification Bell */}
              <div className="relative z-30">
                <button
                  id="notification-bell"
                  onClick={handleOpenNotif}
                  className="relative p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {!notifRead && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-coral" />
                  )}
                </button>

                {/* Notification dropdown */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 w-80 glass rounded-2xl shadow-glow border border-border overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="font-semibold text-sm">Notifications</span>
                        <button
                          onClick={() => setNotifRead(true)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="divide-y divide-border max-h-72 overflow-y-auto scrollbar-thin">
                        {notifications.map((n) => {
                          const Icon = n.icon;
                          return (
                            <motion.div
                              key={n.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                            >
                              <div
                                className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: `var(--${n.color})` }}
                              >
                                <Icon className="h-4 w-4" style={{ color: `var(--${n.color}-foreground)` }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">{n.title}</div>
                                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</div>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="px-4 py-3 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-green" />
                          <span>You're all caught up!</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-xs font-medium text-muted-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
