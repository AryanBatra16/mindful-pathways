import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { User, Bell, Shield, Palette, Download, Trash2 } from "lucide-react";
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm">{label}</span>
      <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-all ${checked ? "gradient-primary" : "bg-muted"} cursor-pointer`}>
        <motion.div animate={{ x: checked ? 22 : 2 }} className="h-5 w-5 rounded-full bg-white shadow-soft" />
      </button>
    </div>
  );
}

function Settings() {
  const [active, setActive] = useState<string>("profile");
  const { userProfile, settings, updateProfile, updateSettings, resetAllData } = useApp();

  // Profile Form States
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [bio, setBio] = useState(userProfile.bio);

  const handleSaveProfile = () => {
    updateProfile({ name, email, bio });
    toast.success("Profile updated successfully!");
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ userProfile, settings }));
    const downloadAnchor = document.createElement('a');
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
      // Reset local fields
      setName("Aria Wells");
      setEmail("aria@mind2care.app");
      setBio("On a gentle journey toward calmer days.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Customize Mind2Care to feel like home." accent="blue" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

        <div className="lg:col-span-3 glass rounded-3xl p-6 shadow-card">
          {active === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="font-semibold text-lg">Your profile</h3>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full gradient-coral-pink flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                  {name ? name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <button className="px-4 py-2 rounded-xl glass text-sm font-medium shadow-soft cursor-pointer">Change avatar</button>
                  <p className="text-xs text-muted-foreground mt-2">JPG or PNG, max 2MB</p>
                </div>
              </div>
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

          {active === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-border">
              <h3 className="font-semibold text-lg pb-4">Notification preferences</h3>
              <Toggle label="Daily mood reminder" checked={settings.dailyReminder !== ""} onChange={(val) => updateSettings({ dailyReminder: val ? "08:00" : "" })} />
              <Toggle label="Weekly insights email" checked={settings.emailInsights} onChange={(val) => updateSettings({ emailInsights: val })} />
            </motion.div>
          )}

          {active === "privacy" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="font-semibold text-lg">Privacy controls</h3>
              <div className="divide-y divide-border">
                <Toggle label="Default to anonymous in community" checked={settings.defaultAnonymous} onChange={(val) => updateSettings({ defaultAnonymous: val })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-4">
                <button onClick={handleExportData} className="px-4 py-3 rounded-xl glass shadow-soft flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer"><Download className="h-4 w-4" /> Export my data</button>
                <button onClick={handleDeleteAccount} className="px-4 py-3 rounded-xl bg-coral text-coral-foreground shadow-soft flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer"><Trash2 className="h-4 w-4" /> Reset All Data</button>
              </div>
            </motion.div>
          )}

          {active === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="font-semibold text-lg">Appearance</h3>
              <div>
                <div className="text-sm font-medium mb-2">Theme</div>
                <div className="grid grid-cols-3 gap-3">
                  {(["Light", "Dark", "Auto"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`p-4 rounded-2xl glass shadow-soft hover:shadow-glow transition-all cursor-pointer ${settings.theme === t ? "border-primary border-2" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Font size</div>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div className="divide-y divide-border">
                <Toggle label="Compact mode" checked={settings.compactMode} onChange={(val) => updateSettings({ compactMode: val })} />
                <Toggle label="Reduce animations" checked={settings.reduceAnimations} onChange={(val) => updateSettings({ reduceAnimations: val })} />
                <Toggle label="High contrast" checked={settings.highContrast} onChange={(val) => updateSettings({ highContrast: val })} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
