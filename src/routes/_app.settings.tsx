import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { User, Bell, Shield, Palette, Download, Trash2, Upload, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Mind2Care" }] }),
  component: Settings,
});

const sections = [
  { key: "profile", label: "Profile", icon: User, color: "coral" },
  { key: "notifications", label: "Notifications", icon: Bell, color: "purple" },
  { key: "privacy", label: "Privacy", icon: Shield, color: "blue" },
  { key: "appearance", label: "Appearance", icon: Palette, color: "turquoise" },
] as const;

// Preset avatar options — diverse emoji faces
const PRESET_AVATARS = [
  "🧘", "🌸", "🌻", "🦋", "🌈", "🌿",
  "🐻", "🦊", "🐼", "🦁", "🐬", "🦚",
  "🌙", "⭐", "🔮", "💎", "🎨", "🌊",
];

function Toggle({ label, checked, onChange, disabled = false, badge }: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className={`text-sm ${disabled ? "text-muted-foreground" : ""}`}>{label}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{badge}</span>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full transition-all ${checked && !disabled ? "gradient-primary" : "bg-muted"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <motion.div animate={{ x: checked ? 22 : 2 }} className="h-5 w-5 rounded-full bg-white shadow-soft" />
      </button>
    </div>
  );
}

function Settings() {
  const [active, setActive] = useState<string>("profile");
  const { userProfile, settings, updateProfile, updateSettings, resetAllData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form states
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [bio, setBio] = useState(userProfile.bio);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSaveProfile = () => {
    updateProfile({ name, email, bio });
    toast.success("Profile updated successfully!");
  };

  const handleSelectAvatar = (emoji: string) => {
    updateProfile({ avatar: emoji });
    setShowAvatarPicker(false);
    toast.success("Avatar updated! 🎉");
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateProfile({ avatar: dataUrl });
      setShowAvatarPicker(false);
      toast.success("Profile photo updated! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ userProfile, settings }));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mind2care_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Data exported successfully!");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      resetAllData();
      toast.success("All local data reset successfully!");
      setName("Aria Wells");
      setEmail("aria@mind2care.app");
      setBio("On a gentle journey toward calmer days.");
    }
  };

  // Render avatar preview
  const avatarValue = userProfile.avatar || "";
  const isPhoto = avatarValue.startsWith("data:");
  const isEmoji = avatarValue && !isPhoto;

  const avatarButtonLabel = isPhoto
    ? "Change Photo"
    : isEmoji
    ? "Change Avatar"
    : "Choose Avatar or Add Photo";

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Customize Mind2Care to feel like home." accent="blue" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar nav */}
        <div className="glass rounded-3xl p-3 shadow-card h-fit">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-sm font-medium transition-all ${isActive ? "shadow-soft" : "hover:bg-muted"} cursor-pointer`}
                style={isActive ? { background: `var(--${s.color})`, color: `var(--${s.color}-foreground)` } : {}}
              >
                <Icon className="h-4 w-4" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="lg:col-span-3 glass rounded-3xl p-6 shadow-card">

          {/* ── Profile ─────────────────────────────────────────────────────── */}
          {active === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="font-semibold text-lg">Your profile</h3>

              {/* Avatar section */}
              <div className="flex items-center gap-4">
                {/* Avatar display */}
                <div className="relative shrink-0">
                  {isPhoto ? (
                    <img
                      src={avatarValue}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover shadow-glow"
                    />
                  ) : isEmoji ? (
                    <div className="h-20 w-20 rounded-full gradient-coral-pink flex items-center justify-center text-4xl shadow-glow">
                      {avatarValue}
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full gradient-coral-pink flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                      {name ? name.charAt(0).toUpperCase() : "A"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowAvatarPicker((p) => !p)}
                    className="px-4 py-2 rounded-xl glass text-sm font-medium shadow-soft cursor-pointer hover:shadow-glow transition-all"
                  >
                    {avatarButtonLabel}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload photo (JPG/PNG, max 2MB)
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleUploadPhoto}
                    />
                  </div>
                </div>
              </div>

              {/* Avatar picker grid */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-3">Choose an avatar</p>
                      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                        {PRESET_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleSelectAvatar(emoji)}
                            className={`h-11 w-11 rounded-2xl text-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${avatarValue === emoji ? "shadow-glow scale-110 gradient-primary" : "glass hover:shadow-soft"}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name / Email / Bio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border outline-none focus:border-primary" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium">Bio</span>
                  <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5 w-full p-4 rounded-xl bg-muted/50 border border-border outline-none focus:border-primary resize-none" />
                </label>
              </div>
              <button onClick={handleSaveProfile} className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-glow cursor-pointer">Save changes</button>
            </motion.div>
          )}

          {/* ── Notifications ────────────────────────────────────────────────── */}
          {active === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-border">
              <h3 className="font-semibold text-lg pb-4">Notification preferences</h3>
              <Toggle
                label="Daily mood reminder"
                checked={settings.dailyReminder !== ""}
                onChange={(val) => updateSettings({ dailyReminder: val ? "08:00" : "" })}
              />
              <Toggle
                label="Weekly insights email"
                checked={false}
                onChange={() => {}}
                disabled={true}
                badge="Coming Soon"
              />
            </motion.div>
          )}

          {/* ── Privacy ──────────────────────────────────────────────────────── */}
          {active === "privacy" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="font-semibold text-lg">Privacy controls</h3>
              <div className="divide-y divide-border">
                <div>
                  <Toggle
                    label="Default to anonymous in community"
                    checked={settings.defaultAnonymous}
                    onChange={(val) => updateSettings({ defaultAnonymous: val })}
                  />
                  <div className="flex items-start gap-2 pb-3 -mt-1">
                    <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When enabled, your community posts will appear as <strong>"Anonymous"</strong> by default. You can still choose to post with your real name each time by toggling the option when composing a post.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-4">
                <button onClick={handleExportData} className="px-4 py-3 rounded-xl glass shadow-soft flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer"><Download className="h-4 w-4" /> Export my data</button>
                <button onClick={handleDeleteAccount} className="px-4 py-3 rounded-xl bg-coral text-coral-foreground shadow-soft flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer"><Trash2 className="h-4 w-4" /> Reset All Data</button>
              </div>
            </motion.div>
          )}

          {/* ── Appearance ───────────────────────────────────────────────────── */}
          {active === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="font-semibold text-lg">Appearance</h3>

              {/* Theme — Light / Dark only */}
              <div>
                <div className="text-sm font-medium mb-2">Theme</div>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  {(["Light", "Dark"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`p-4 rounded-2xl glass shadow-soft hover:shadow-glow transition-all cursor-pointer flex items-center justify-center gap-2 ${settings.theme === t ? "border-primary border-2" : ""}`}
                    >
                      <span>{t === "Light" ? "☀️" : "🌙"}</span>
                      <span className="text-sm font-medium">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Font size</div>
                  <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12" max="20"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span style={{ fontSize: "12px" }}>Small</span>
                  <span style={{ fontSize: "16px" }}>Default</span>
                  <span style={{ fontSize: "20px" }}>Large</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="divide-y divide-border">
                <Toggle
                  label="Compact mode"
                  checked={settings.compactMode}
                  onChange={(val) => updateSettings({ compactMode: val })}
                />
                <Toggle
                  label="Night contrast"
                  checked={settings.nightContrast}
                  onChange={(val) => updateSettings({ nightContrast: val })}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
