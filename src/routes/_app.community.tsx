import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Heart, MessageCircle, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supportGroups } from "@/lib/mock-data";
import { useApp } from "@/lib/state";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/community")({
  head: () => ({ meta: [{ title: "Community — Mind2Care" }] }),
  component: Community,
});

const categories = ["all", "Gratitude", "Anxiety", "Wins", "Self-care"];

function Community() {
  const { communityPosts, userProfile, addPost, toggleLikePost } = useApp();
  const [tab, setTab] = useState<"feed" | "mine">("feed");
  const [cat, setCat] = useState("all");
  
  // Composer states
  const [newPostContent, setNewPostContent] = useState("");
  const [anon, setAnon] = useState(false);

  // Filter posts by category and tab
  const filteredPosts = communityPosts
    .filter((p) => cat === "all" || p.category.toLowerCase() === cat.toLowerCase())
    .filter((p) => tab === "feed" || p.author === userProfile.name);

  const handleSharePost = () => {
    if (!newPostContent.trim()) {
      toast.error("Please enter some text to share.");
      return;
    }
    addPost(newPostContent, anon);
    toast.success("Post shared successfully! Points awarded 💛");
    setNewPostContent("");
    setAnon(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Community" subtitle="A kind space, anonymous when you need it." accent="coral" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* Composer */}
          <div className="glass rounded-3xl p-5 shadow-card">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share something kind, brave, or true..."
              rows={2}
              className="w-full p-3 rounded-2xl bg-muted/40 border border-border focus:border-primary outline-none resize-none text-foreground"
            />
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                  className="accent-primary"
                /> Post anonymously
              </label>
              <button onClick={handleSharePost} className="px-5 py-2 rounded-xl gradient-primary text-white font-medium shadow-soft flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" /> Share Post
              </button>
            </div>
          </div>

          <div className="flex gap-2 glass rounded-2xl p-1.5 w-fit shadow-soft">
            {(["feed", "mine"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer ${tab === t ? "gradient-primary text-white shadow-soft" : "hover:bg-muted"}`}>
                {t === "feed" ? "Community Feed" : "My Posts"}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${cat === c ? "gradient-primary text-white shadow-soft" : "glass hover:shadow-soft"}`}>{c}</button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filteredPosts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2 }}
                className="glass rounded-3xl p-5 shadow-card hover:shadow-glow transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: `var(--${p.color})` }}>
                    {p.anon ? "?" : p.author[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p.anon ? "Anonymous" : p.author}</div>
                    <div className="text-xs text-muted-foreground">{p.time} · {p.category}</div>
                  </div>
                </div>
                <p className="text-base leading-relaxed">{p.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <button onClick={() => toggleLikePost(p.id)} className={`flex items-center gap-1.5 text-sm transition-colors group cursor-pointer ${p.liked ? "text-pink-foreground" : "text-muted-foreground hover:text-pink-foreground"}`}>
                    <Heart className={`h-4 w-4 group-hover:scale-125 transition-transform ${p.liked ? "fill-pink-foreground" : ""}`} /> {p.reactions}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => toast.info("Replies coming soon!")}>
                    <MessageCircle className="h-4 w-4" /> Reply
                  </button>
                </div>
              </motion.div>
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">No posts found in this section yet.</div>
            )}
          </div>
        </div>

        {/* Support groups */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="h-4 w-4" /> Support Groups</h3>
            <div className="space-y-2">
              {supportGroups.map((g) => (
                <motion.div whileHover={{ x: 4 }} key={g.id} className="p-3 rounded-2xl glass hover:shadow-soft cursor-pointer transition-all flex items-center gap-3" onClick={() => toast.success(`Joined ${g.name} chatroom!`)}>
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: `var(--${g.color})` }}>
                    <Users className="h-4 w-4" style={{ color: `var(--${g.color}-foreground)` }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{g.name}</div>
                    <div className="text-xs text-muted-foreground">{g.members.toLocaleString()} members</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-5 shadow-card" style={{ background: "var(--turquoise)", opacity: 0.95 }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--turquoise-foreground)" }}>Community Promise</h3>
            <p className="text-sm" style={{ color: "var(--turquoise-foreground)" }}>Be kind. Be brave. Hold space. We grow softer together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
