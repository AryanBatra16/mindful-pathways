import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthButton } from "@/components/AuthShell";
import { useState } from "react";
import { useApp } from "@/lib/state";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — Mind2Care" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const hasSession = document.cookie.includes("session_active=true");
      if (hasSession) {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return;

    setLoading(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        navigate({ to: "/dashboard" });
      } else {
        setError(res.error || "Failed to create account.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Begin your journey"
      subtitle="A calmer mind starts with a single mindful step"
      footer={<>Already have an account? <Link to="/signin" className="text-primary font-medium">Sign in</Link></>}
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}
      <AuthInput label="Full name" placeholder="Aria Wells" value={name} onChange={(e) => setName(e.target.value)} required />
      <AuthInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <AuthInput label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <AuthButton disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</AuthButton>
    </AuthShell>
  );
}
