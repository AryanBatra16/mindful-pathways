import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, MessageCircleHeart, CalendarHeart, Quote, Trophy, ListTodo, Users, BarChart3, Sparkles, Settings, Menu, X, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });
  const { userProfile, logout } = useApp();

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
              <Link to="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl gradient-primary shadow-glow flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-gradient">Mind2Care</span>
              </Link>
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

        <div className="absolute bottom-4 left-3 right-3">
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
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground shrink-0 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
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
                    <p className="text-xs text-muted-foreground truncate">{userProfile.level} Level · {userProfile.points} pts</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground shrink-0 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
