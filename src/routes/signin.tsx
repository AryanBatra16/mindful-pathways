import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthButton } from "@/components/AuthShell";
import { useState } from "react";
import { useApp } from "@/lib/state";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — Mind2Care" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const hasSession = document.cookie.includes("session=");
      if (hasSession) {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    </AuthShell>
  );
}
