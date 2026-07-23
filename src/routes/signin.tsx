import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthButton } from "@/components/AuthShell";
import { useState } from "react";
import { useApp } from "@/lib/state";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — Mind2Care" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const hasSession = document.cookie.includes("session_active=true");
      if (hasSession) {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate({ to: "/dashboard" });
      } else {
        setError(res.error || "Failed to sign in.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    setDemoLoading(true);
    // small delay for visual feedback
    setTimeout(() => {
      loginAsDemo();
    }, 300);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your wellness journey"
      footer={<>New here? <Link to="/signup" className="text-primary font-medium">Create an account</Link></>}
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}
      <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <AuthInput label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <div className="text-right -mt-2">
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
      </div>
      <AuthButton disabled={loading}>{loading ? "Signing in..." : "Sign In"}</AuthButton>

      {/* Demo mode separator */}
      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Try Demo Button */}
      <button
        id="try-demo-btn"
        type="button"
        onClick={handleDemo}
        disabled={demoLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border glass text-sm font-medium text-foreground hover:shadow-soft hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-70"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        {demoLoading ? "Loading demo..." : "Try Demo — No account needed"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        ✨ Explore all features with pre-filled demo data
      </p>
    </AuthShell>
  );
}
