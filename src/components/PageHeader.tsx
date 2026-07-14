import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, Trophy, Heart, CalendarHeart, Users, CheckCircle, Flame } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/state";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
}

export function PageHeader({ title, subtitle, accent = "coral" }: PageHeaderProps) {
  const { userProfile, moodHistory, challenges, logout } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);

  // Build dynamic notifications
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
    <>
      {/* Overlay to close notification dropdown */}
      {notifOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Top row: badge label + notification + sign out */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: `var(--${accent})` }} />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Mind2Care</span>
          </div>

          {/* Right side: notification + sign out */}
          <div className="flex items-center gap-2 relative z-30">
            {/* Notification bell */}
            <div className="relative">
              <button
                id="notification-bell"
                onClick={handleOpenNotif}
                className="relative p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
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
                    className="absolute right-0 top-11 w-80 glass rounded-2xl shadow-glow border border-border overflow-hidden z-40"
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
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>You're all caught up!</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sign out */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-xs font-medium text-muted-foreground cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Page title + subtitle */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>}
      </motion.div>
    </>
  );
}
