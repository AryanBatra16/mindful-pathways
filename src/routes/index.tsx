import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Heart, MessageCircleHeart, Users, Trophy, BarChart3, Quote, ListTodo, Shield, ArrowRight, Star } from "lucide-react";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mind2Care — Modern Mental Wellness & Self-Care" },
      { name: "description", content: "Track moods, chat with an AI companion, complete wellness challenges and grow with a supportive community on Mind2Care." },
      { property: "og:title", content: "Mind2Care — Modern Mental Wellness & Self-Care" },
      { property: "og:description", content: "A calm, premium space for mood tracking, AI support, and personal growth." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Heart, title: "Mood Tracking", desc: "Daily check-ins with emoji moods, intensity sliders, and a beautiful calendar heatmap.", color: "coral" },
  { icon: MessageCircleHeart, title: "AI Companion", desc: "A judgment-free wellness companion that listens, reflects, and gently guides you.", color: "pink" },
  { icon: Users, title: "Community Support", desc: "Anonymous-friendly feed, support groups, and uplifting peer reactions.", color: "purple" },
  { icon: Trophy, title: "Wellness Challenges", desc: "Bite-sized challenges that build calmer habits, one day at a time.", color: "blue" },
  { icon: BarChart3, title: "Growth Map", desc: "See your progress as a living tree — badges, milestones and streaks.", color: "turquoise" },
  { icon: Quote, title: "Daily Quotes", desc: "Hand-picked reminders that meet you where you are, every day.", color: "green" },
  { icon: ListTodo, title: "Mindful Tasks", desc: "Small, intentional tasks linked to your challenges and goals.", color: "coral" },
  { icon: Sparkles, title: "Personal Insights", desc: "Gentle, AI-powered patterns from your moods and habits.", color: "purple" },
];

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <BackgroundBlobs />

      {/* Nav */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 cursor-pointer text-left">
            <div className="h-10 w-10 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">Mind2Care</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy</a>
            <Link to="/dashboard" className="hover:text-primary transition-colors">Demo</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/signin" className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors">Sign In</Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl text-sm font-medium gradient-primary text-white shadow-glow hover:shadow-soft transition-all">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm shadow-soft mb-8"
        >
          <Star className="h-4 w-4 text-coral-foreground" fill="currentColor" />
          <span>A calmer mind, one mindful day at a time</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]"
        >
          Your gentle companion for{" "}
          <span className="text-gradient">mental wellness</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Track moods, chat with an AI that truly listens, complete wellness challenges, and grow with a community that cares — all in one beautifully calm space.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/signup" className="group px-6 py-3.5 rounded-2xl gradient-primary text-white font-semibold shadow-glow hover:scale-[1.03] transition-transform flex items-center gap-2">
            Get Started Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dashboard" className="px-6 py-3.5 rounded-2xl glass font-semibold shadow-soft hover:scale-[1.03] transition-transform">
            Try Demo
          </Link>
          <Link to="/signin" className="px-6 py-3.5 rounded-2xl font-semibold hover:bg-muted transition-colors">
            Sign In
          </Link>
        </motion.div>

        {/* Floating mood orbs */}
        <div className="relative mt-20 h-72">
          {["coral", "pink", "purple", "blue", "turquoise", "green"].map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
              className="absolute animate-float glass rounded-full shadow-glow flex items-center justify-center text-2xl"
              style={{
                width: 80 + (i % 2) * 24,
                height: 80 + (i % 2) * 24,
                left: `${10 + i * 14}%`,
                top: `${(i % 3) * 30}%`,
                background: `linear-gradient(135deg, var(--${c}), var(--${c}) 60%, transparent)`,
                animationDelay: `${i * 0.7}s`,
              }}
            >
              {["💛", "💗", "💜", "💙", "🩵", "💚"][i]}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">Everything you need to feel <span className="text-gradient">a little lighter</span></h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Eight intentional tools, designed together to feel like one calm, supportive space.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="glass rounded-3xl p-6 shadow-card hover:shadow-glow transition-all group cursor-pointer"
              >
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-soft"
                  style={{ background: `var(--${f.color})` }}
                >
                  <Icon className="h-6 w-6" style={{ color: `var(--${f.color}-foreground)` }} />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-[2.5rem] p-10 md:p-16 shadow-glow text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-30" style={{ background: "var(--gradient-turquoise-green)", filter: "blur(60px)" }} />
          <div className="relative">
            <div className="inline-flex h-16 w-16 rounded-3xl gradient-turquoise-green items-center justify-center shadow-glow mb-6">
              <Shield className="h-8 w-8" style={{ color: "var(--turquoise-foreground)" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Your inner world stays <span className="text-gradient">yours</span></h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              End-to-end encryption, anonymous-by-default community, and zero data selling — ever. Your moods, journals, and conversations are private and protected.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
              {["End-to-End Encrypted", "Anonymous Friendly", "GDPR Compliant", "Export Anytime"].map((p) => (
                <span key={p} className="px-4 py-2 rounded-full glass shadow-soft">{p}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gradient">Mind2Care</span>
            </div>
            <p className="text-sm text-muted-foreground">A gentler way to care for your mind, every day.</p>
          </div>
          {[
            { title: "Product", links: ["Features", "Demo", "Pricing"] },
            { title: "Support", links: ["Help Center", "Crisis Resources", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          © 2026 Mind2Care · Made with care 💛
        </div>
      </footer>
    </div>
  );
}
